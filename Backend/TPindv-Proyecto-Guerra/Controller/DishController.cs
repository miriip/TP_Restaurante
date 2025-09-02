using Application.Interfaces.IDish;
using Application.Models.Request;
using Application.Models.Response;
using Domain.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace TPindv_Proyecto_Guerra.Controller
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class DishController : ControllerBase
    {
        private readonly IDishService _dishService;

        public DishController(IDishService dishService)
        {
            _dishService = dishService;
        }

        // POST
        /// <summary>
        /// Crear nuevo plato.
        /// </summary>
        /// <remarks>
        /// Crea un nuevo plato en el menú del restaurante.
        /// </remarks>
        [HttpPost]
        [ProducesResponseType(typeof(DishResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status409Conflict)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateDish([FromBody] DishRequest dishRequest)
        {
            try
            {
                // Validaciones adicionales 
                if (dishRequest == null)
                {
                    return BadRequest(new ApiError("Los datos del plato son requeridos"));
                }
                if (string.IsNullOrWhiteSpace(dishRequest.Name))
                {
                    return BadRequest(new ApiError("El nombre del plato es obligatorio"));
                }
                if (dishRequest.Category == 0)
                {
                    return BadRequest(new ApiError("La categoría es obligatoria"));
                }
                if (dishRequest.Price <= 0)
                {
                    return BadRequest(new ApiError("El precio debe ser mayor a cero"));
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiError("Datos de entrada inválidos"));
                }

                var createdDish = await _dishService.CreateDish(dishRequest);
                return CreatedAtAction(nameof(Search), new { id = createdDish.Id }, createdDish);
            }
            catch (DishNameAlreadyExistsException ex)
            {
                return Conflict(new ApiError(ex.Message));
            }
            catch (CategoryNotFoundException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
            catch (Exception ex)
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
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<DishResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Search(
            [FromQuery] string? name,
            [FromQuery] int? category,
            [FromQuery] string? sortByPrice,
            [FromQuery] bool onlyActive = true)
        {
            try
            {
                var list = await _dishService.SearchAsync(name, category, sortByPrice);

                // Aplicar filtro de estado activo ANTES de verificar resultados
                if (onlyActive)
                {
                    list = list.Where(d => d.IsActive);
                }

                // Verificar si se encontraron resultados DESPUÉS de aplicar filtros
                if (list == null || !list.Any())
                {

                    string message = "No se encontraron platos";
                    if (!string.IsNullOrWhiteSpace(name) && category.HasValue)
                    {
                        message = $"No se encontraron platos con el nombre '{name}' en la categoría especificada";
                    }
                    else if (!string.IsNullOrWhiteSpace(name))
                    {
                        message = $"No se encontraron platos con el nombre '{name}'";
                    }
                    else if (category.HasValue)
                    {
                        message = "No se encontraron platos en la categoría especificada";
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
            catch (Exception ex)
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
        /// </remarks>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(DishResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> UpdateDish(Guid id, [FromBody] DishUpdateRequest dishUpdateRequest)
        {
            try
            {
                // Validaciones adicionales 
                if (dishUpdateRequest == null)
                {
                    return BadRequest(new ApiError("Los datos del plato son requeridos"));
                }
                if (string.IsNullOrWhiteSpace(dishUpdateRequest.Name))
                {
                    return BadRequest(new ApiError("El nombre del plato es obligatorio"));
                }
                if (dishUpdateRequest.Category == 0)
                {
                    return BadRequest(new ApiError("La categoría es obligatoria"));
                }
                if (dishUpdateRequest.Price <= 0)
                {
                    return BadRequest(new ApiError("El precio debe ser mayor a cero"));
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiError("Datos de entrada inválidos"));
                }

                var updatedDish = await _dishService.UpdateDish(id, dishUpdateRequest);
                return Ok(updatedDish);
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
                return BadRequest(new ApiError(ex.Message));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiError("Error interno del servidor"));
            }
        }
    }
}