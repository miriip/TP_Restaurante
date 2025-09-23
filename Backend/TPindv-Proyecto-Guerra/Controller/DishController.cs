using Application.Interfaces.IDish;
using Application.Models.Request.Dish;
using Application.Models.Response.Dish;
using Application.Models.Response;
using Application.Enums;
using Application.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using DishResponse = Application.Models.Response.Dish.DishResponse;

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
        private readonly IDishQuery _dishQuery;
        private readonly IDeleteDishService _deleteDishService;
        
        public DishController(
            ICreateDishService createDishService, 
            ISearchDishesService searchDishesService, 
            IUpdateDishService updateDishService, 
            IDishQuery dishQuery, 
            IDeleteDishService deleteDishService)
        {
            _createDishService = createDishService;
            _searchDishesService = searchDishesService;
            _updateDishService = updateDishService;
            _dishQuery = dishQuery;
            _deleteDishService = deleteDishService;
        }

        // POST
        /// <summary>
        /// Crear nuevo plato
        /// </summary>
        /// <remarks>
        /// Crea un nuevo plato en el menú del restaurante.
        /// 
        /// **IMPORTANTE**: Para el campo `isActive`, use `true` o `false` (minúsculas), no `True` o `False`.
        /// </remarks>
        /// <response code="201">Plato creado exitosamente</response>
        /// <response code="400">Datos de entrada inválidos</response>
        /// <response code="409">Ya existe un plato con el mismo nombre</response>
        /// <response code="409">Ya existe un plato con el mismo nombre </response>
        [HttpPost]
        [ProducesResponseType(typeof(Application.Models.Response.Dish.DishResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status409Conflict)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateDish([FromBody] DishRequest dishRequest)
        {
            var createdDish = await _createDishService.CreateDish(dishRequest);
            return CreatedAtAction(nameof(Search), new { id = createdDish.Id }, createdDish);
        }

        // GET
        /// <summary>
        /// Buscar platos
        /// </summary>
        /// <remarks>
        /// Obtiene una lista de platos del menú con opciones de filtrado y ordenamiento.
        /// 
        /// </remarks>
        /// <param name="name">Buscar platos por nombre (búsqueda parcial)</param>
        /// <param name="category">Filtrar por categoría de plato</param>
        /// <param name="sortByPrice">Ordenar por precio ("ascendente" o "descendente")</param>
        /// <param name="onlyActive">Filtrar solo platos activos</param>
        /// <response code="200">Lista de platos obtenida exitosamente</response>
        /// <response code="400">Parámetros de búsqueda inválidos</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Application.Models.Response.Dish.DishResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Search(
            [FromQuery] string? name,
            [FromQuery(Name = "category")] int? category,
            [FromQuery(Name = "sortByPrice")] OrderPrice? sortByPrice = null,
            [FromQuery] bool onlyActive = true)
        {
            // Convertir enum a string para el servicio
            string? priceOrder = sortByPrice?.ToString().ToLowerInvariant();
            
            // Aceptar alias "orderPrice" si no se especificó sortByPrice
            if (string.IsNullOrWhiteSpace(priceOrder))
            {
                var alias = HttpContext.Request.Query["orderPrice"].FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(alias) && Enum.TryParse<OrderPrice>(alias, true, out var parsed))
                {
                    priceOrder = parsed.ToString().ToLowerInvariant();
                }
            }
            
            var result = await _searchDishesService.SearchAsync(name, category, priceOrder, onlyActive);
            return Ok(result);
        }

        // PUT
        /// <summary>
        /// Actualizar plato existente
        /// </summary>
        /// <remarks>
        /// Actualiza todos los campos de un plato existente en el menú.
        /// 
        /// **IMPORTANTE**: Para el campo `isActive`, use `true` o `false` (minúsculas), no `True` o `False`.
        ///     
        /// </remarks>
        /// <response code="200">Plato actualizado exitosamente</response>
        /// <response code="400">Datos de entrada inválidos</response>
        /// <response code="404">Plato no encontrado</response>
        /// <response code="409">Conflicto - nombre duplicado</response>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(Application.Models.Response.Dish.DishResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> UpdateDish(Guid id, [FromBody] UpdateDishRequest dishUpdateRequest)
        {
            if (dishUpdateRequest == null)
            {
                return BadRequest(new ApiError("Los datos del plato son requeridos"));
            }

            var updatedDish = await _updateDishService.UpdateDish(id, dishUpdateRequest);
            return Ok(updatedDish);
        }

        // GET by ID
        /// <summary>
        /// Obtener plato por ID
        /// </summary>
        /// <remarks>
        /// Obtiene los detalles completos de un plato específico.
        ///  
        /// </remarks>
        /// <param name="id">ID único del plato</param>
        /// <response code="200">Plato encontrado exitosamente</response>
        /// <response code="400">ID de plato inválido</response>
        /// <response code="404">Plato no encontrado</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Application.Models.Response.Dish.DishResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetDishById(string id)
        {
            // Validar formato de GUID
            if (!Guid.TryParse(id, out Guid dishId))
            {
                throw new InvalidDishIdFormatException();
            }

            var dish = await _dishQuery.GetDishById(dishId);
            
            if (dish == null)
            {
                return NotFound(new ApiError("Plato no encontrado"));
            }

            var dishResponse = new DishResponse
            {
                Id = dish.DishId,
                Name = dish.Name,
                Description = dish.Description,
                Price = dish.Price,
                Category = new GenericResponse
                {
                    Id = dish.Category,
                    Name = dish.CategoryRef?.Name ?? "Desconocido"
                },
                Image = dish.ImageUrl,
                IsActive = dish.Available,
                CreatedAt = dish.CreateDate,
                UpdatedAt = dish.UpdateDate
            };

            return Ok(dishResponse);
        }

        // DELETE
        /// <summary>
        /// Eliminar plato
        /// </summary>
        /// <remarks>
        /// Elimina un plato del menú del restaurante.
        /// </remarks>
        /// <param name="id">ID único del plato a eliminar</param>
        /// <response code="200">Plato eliminado exitosamente</response>
        /// <response code="404">Plato no encontrado</response>
        /// <response code="409">No se puede eliminar - plato en uso</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(Application.Models.Response.Dish.DishResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> DeleteDish(Guid id)
        {
            var deletedDish = await _deleteDishService.DeleteDishAsync(id);
            return Ok(deletedDish);
        }
    }
}
