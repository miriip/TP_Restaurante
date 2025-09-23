using Application.Models.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Application.Interfaces.IDeliveryType;

namespace TPindv_Proyecto_Guerra.Controller
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class DeliveryTypeController : ControllerBase
    {
        private readonly IDeliveryTypeListService _deliveryTypeService;

        public DeliveryTypeController(IDeliveryTypeListService deliveryTypeService)
        {
            _deliveryTypeService = deliveryTypeService;
        }

        /// <summary>
        /// Obtener tipos de entrega
        /// </summary>
        /// <remarks>
        /// </remarks>
        /// <response code="200">Lista de tipos de entrega obtenida exitosamente</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<GenericResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDeliveryTypes()
        {
            var deliveryTypes = await _deliveryTypeService.GetDeliveryTypesAsync();
            return Ok(deliveryTypes);
        }
    }
}
