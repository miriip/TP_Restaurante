using Application.Interfaces.IDish;
using Application.Models.Request;
using Application.Models.Response;
using Application.Enums;
using Application.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace TPindv_Proyecto_Guerra.Controller
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class DishController : ControllerBase
    {
        private readonly ICreateDishService _createDishService;
        private readonly ISearchDishesService _searchDishesService;
        private readonly IUpdateDishService _updateDishService;
        
        public DishController(ICreateDishService createDishService, ISearchDishesService searchDishesService, IUpdateDishService updateDishService)
        {
            _createDishService = createDishService;
            _searchDishesService = searchDishesService;
            _updateDishService = updateDishService;
        }

        // POST
        /// <summary>
        /// Crear nuevo plato.
        /// </summary>
        /// <remarks>
        /// Crea un nuevo plato en el menú del restaurante.
        /// 
        /// **IMPORTANTE**: Para el campo `isActive`, use `true` o `false` (minúsculas), no `True` o `False`.
        /// </remarks>
        /// <response code="201">Plato creado exitosamente</response>
        /// <response code="400">Datos de entrada inválidos </response>
        /// <response code="409">Ya existe un plato con el mismo nombre </response>
        [HttpPost]
        [ProducesResponseType(typeof(DishResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status409Conflict)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateDish([FromBody] CreateDishRequest dishRequest)
        {
            try
            {
                if (dishRequest == null)
                {
                    return BadRequest(new ApiError("Los datos del plato son requeridos"));
                }

                var createdDish = await _createDishService.CreateDish(dishRequest);
                return CreatedAtAction(nameof(Search), new { id = createdDish.Id }, createdDish);
            }
            catch (InvalidDishNameException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
            catch (InvalidPriceException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
            catch (InvalidCategoryIdException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
            catch (DishNameAlreadyExistsException ex)
            {
                return Conflict(new ApiError(ex.Message));
            }
            catch (CategoryNotFoundException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
            catch (Exception)
            {
                return BadRequest(new ApiError("Error interno del servidor"));
            }
        }

        // GET
        /// <summary>
        /// Busca platos.
        /// </summary>
        /// <remarks>
        /// Obtiene una lista de platos del menú con opciones de filtrado y ordenamiento.
        /// </remarks>
        /// <param name="name">Buscar platos por nombre (búsqueda parcial)</param>
        /// <param name="category">Filtrar por categoría de plato</param>
        /// <param name="sortByPrice">Ordenar por precio: ASC (ascendente) o DESC (descendente)</param>
        /// <param name="onlyActive">Filtrar por estado: true para solo platos disponibles, false para todos</param>
        /// <response code="200">Lista de platos obtenida exitosamente</response>
        /// <response code="400">Parámetros de búsqueda inválidos </response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<DishResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Search(
            [FromQuery] string? name, 
            [FromQuery(Name = "category")] int? category,
            [FromQuery(Name = "sortByPrice")] OrderPrice? sortByPrice = null,
            [FromQuery] bool onlyActive = true)
        {
            try
            {
                var effectiveCategoryId = category;
                // Usar sortByPrice (enum). Aceptar alias "orderPrice" manualmente sin exponerlo en Swagger
                string? priceOrder = sortByPrice?.ToString().ToLowerInvariant();
                if (string.IsNullOrWhiteSpace(priceOrder))
                {
                    var alias = HttpContext.Request.Query["orderPrice"].FirstOrDefault();
                    if (!string.IsNullOrWhiteSpace(alias) && Enum.TryParse<OrderPrice>(alias, true, out var parsed))
                    {
                        priceOrder = parsed.ToString().ToLowerInvariant();
                    }
                }
                var list = await _searchDishesService.SearchAsync(name, effectiveCategoryId, priceOrder);
                
                // Aplicar filtro de estado activo ANTES de verificar resultados
                if (onlyActive)
                {
                    list = list.Where(d => d.IsActive);
                }
                
                // Verificar si se encontraron resultados DESPUÉS de aplicar filtros
                if (list == null || !list.Any())
                {
                    // Mensaje más específico según los filtros aplicados
                    string message = "No se encontraron platos";
                    if (!string.IsNullOrWhiteSpace(name) && effectiveCategoryId.HasValue)
                    {
                        message = $"No se encontraron platos con el nombre '{name}' en la categoría especificada";
                        if (onlyActive) message += " que estén activos";
                    }
                    else if (!string.IsNullOrWhiteSpace(name))
                    {
                        message = $"No se encontraron platos con el nombre '{name}'";
                        if (onlyActive) message += " que estén activos";
                    }
                    else if (effectiveCategoryId.HasValue)
                    {
                        message = "No se encontraron platos en la categoría especificada";
                        if (onlyActive) message += " que estén activos";
                    }
                    else if (onlyActive)
                    {
                        message = "No se encontraron platos activos";
                    }
                    
                    return NotFound(new ApiError(message));
                }
                
                return Ok(list);
            }
            catch (InvalidSortOrderException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
            catch (NoDishesFoundException ex)
            {
                return NotFound(new ApiError(ex.Message));
            }
            catch (NoDishesInCategoryException ex)
            {
                return NotFound(new ApiError(ex.Message));
            }
            catch (Exception)
            {
                return BadRequest(new ApiError("Error interno del servidor"));
            }
        }

        // PUT
        /// <summary>
        /// Actualizar plato existente.
        /// </summary>
        /// <remarks>
        /// Actualiza todos los campos de un plato existente en el menú.
        /// 
        /// **IMPORTANTE**: Para el campo `isActive`, use `true` o `false` (minúsculas), no `True` o `False`.
        /// 
        /// </remarks>
        /// <response code="200">Plato actualizado exitosamente</response>
        /// <response code="400">Datos de entrada inválidos </response>
        /// <response code="404">Plato no encontrado </response>
        /// <response code="409">Conflicto - nombre duplicado </response>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(DishResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> UpdateDish(Guid id, [FromBody] UpdateDishRequest dishUpdateRequest)
        {
            try
            {
                 if (dishUpdateRequest == null)
                {
                    return BadRequest(new ApiError("Los datos del plato son requeridos"));
                }

                var updatedDish = await _updateDishService.UpdateDish(id, dishUpdateRequest);
                return Ok(updatedDish);
            }
            catch (InvalidDishNameException ex)
            {
                return Conflict(new ApiError(ex.Message));
            }
            catch (DishNameTooLongException ex)
            {
                return Conflict(new ApiError(ex.Message));
            }
            catch (InvalidDishDescriptionException ex)
            {
                return Conflict(new ApiError(ex.Message));
            }
            catch (InvalidPriceException ex)
            {
                return Conflict(new ApiError(ex.Message));
            }
            catch (InvalidCategoryIdException ex)
            {
                return Conflict(new ApiError(ex.Message));
            }
            catch (DishNotFoundException ex)
            {
                return NotFound(new ApiError(ex.Message));
            }
            catch (DishNameAlreadyExistsException ex)
            {
                return Conflict(new ApiError(ex.Message));
            }
            catch (CategoryNotFoundException ex)
            {
                return NotFound(new ApiError(ex.Message));
            }
            catch (Exception ex)
            {
                // Log para debugging (en producción usar ILogger)
                Console.WriteLine($"Error en UpdateDish: {ex.GetType().Name} - {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return BadRequest(new ApiError($"Error interno del servidor: {ex.Message}"));
            }
        }
    }
}
