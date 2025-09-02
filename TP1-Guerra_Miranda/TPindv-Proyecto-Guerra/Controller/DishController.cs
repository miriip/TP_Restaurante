using Application.Interfaces.IDish;
using Application.Models.Request;
using Application.Models.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace TPindv_Proyecto_Guerra.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class DishController : ControllerBase
    {
        private readonly IDishService _dishService;
        public DishController(IDishService dishService)
        {
            _dishService = dishService;
        }

        // POST
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateDish([FromBody] DishRequest dishRequest)
        {
            if (dishRequest == null || string.IsNullOrWhiteSpace(dishRequest.Name) || dishRequest.Price <= 0)
            {
                return BadRequest("Invalid dish data.");
            }
            var createdDish = await _dishService.CreateDish(dishRequest);
            return new JsonResult(createdDish);
        }


        // GETs
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<DishResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Search([FromQuery] string? name, [FromQuery] int? categoryId, [FromQuery] string? orderPrice)
        {
            try
            {
                var list = await _dishService.SearchAsync(name, categoryId, orderPrice);
                return Ok(list);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetDishById(Guid id)
        {
            var dish = await _dishService.GetDishById(id);
            if (dish == null)
            {
                return NotFound($"Dish with ID {id} not found.");
            }
            return new JsonResult(dish);
        }

      

        // PUT
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateDish(Guid id, [FromBody] DishRequest dishRequest)
        {
            if (dishRequest == null || string.IsNullOrWhiteSpace(dishRequest.Name) || dishRequest.Price <= 0)
            {
                return BadRequest("Invalid dish data.");
            }
            var updatedDish = await _dishService.UpdateDish(id, dishRequest);
            if (updatedDish == null)
            {
                return NotFound($"Dish with ID {id} not found.");
            }
            return new JsonResult(updatedDish);
        }
    }
}
