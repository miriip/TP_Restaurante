using Application.Models.Response.Category;
using Application.Models.Response;
using Application.Interfaces.ICategory;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace TPindv_Proyecto_Guerra.Controller
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryListService _categoryService;

        public CategoryController(ICategoryListService categoryService)
        {
            _categoryService = categoryService;
        }

        /// <summary>
        /// Obtener categorías de platos
        /// </summary>
        /// <remarks>
        /// Obtiene todas las categorías disponibles para clasificar platos.
        /// </remarks>
        /// <response code="200">Lista de categorías obtenida exitosamente</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<CategoryResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _categoryService.GetCategoriesAsync();
            return Ok(categories);
        }
    }
}
