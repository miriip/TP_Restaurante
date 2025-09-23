using Application.Models.Response;
using Application.Interfaces.IStatus;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace TPindv_Proyecto_Guerra.Controller
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class StatusController : ControllerBase
    {
        private readonly IStatusListService _statusService;

        public StatusController(IStatusListService statusService)
        {
            _statusService = statusService;
        }

        /// <summary>
        /// Obtener estados de órdenes
        /// </summary>
        /// <remarks>
        /// Obtiene todos los estados posibles para las órdenes y sus items.
        /// 
        /// </remarks>
        /// <response code="200">Lista de estados obtenida exitosamente</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<GenericResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetStatuses()
        {
            var statuses = await _statusService.GetStatusesAsync();
            return Ok(statuses);
        }
    }
}
