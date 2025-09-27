using Application.Interfaces.IOrder;
using Application.Interfaces.IOrderItem;
using Application.Models.Request.Order;
using Application.Models.Response.Order;
using Application.Models.Response;
using Application.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace TPindv_Proyecto_Guerra.Controller
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderCreationService _createOrderService;
        private readonly IOrderListService _getOrdersService;
        private readonly IOrderDetailsService _getOrderByIdService;
        private readonly IOrderUpdateService _updateOrderService;
        private readonly IOrderItemStatusUpdateService _updateOrderItemStatusService;

        public OrderController(
            IOrderCreationService createOrderService,
            IOrderListService getOrdersService,
            IOrderDetailsService getOrderByIdService,
            IOrderUpdateService updateOrderService,
            IOrderItemStatusUpdateService updateOrderItemStatusService)
        {
            _createOrderService = createOrderService;
            _getOrdersService = getOrdersService;
            _getOrderByIdService = getOrderByIdService;
            _updateOrderService = updateOrderService;
            _updateOrderItemStatusService = updateOrderItemStatusService;
        }

        /// <summary>
        /// Crear nueva orden
        /// </summary>
        /// <remarks>
        /// Crea una nueva orden con los platos solicitados por el cliente.
        /// </remarks>
        /// <response code="201">Orden creada exitosamente</response>
        /// <response code="400">Datos de orden inválidos</response>
        [HttpPost]
        [ProducesResponseType(typeof(OrderCreateResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOrder([FromBody] OrderRequest orderRequest)
        {
            var createdOrder = await _createOrderService.Execute(orderRequest);
            return CreatedAtAction(nameof(GetOrderById), new { id = createdOrder.OrderNumber }, createdOrder);
        }

        /// <summary>
        /// Buscar órdenes
        /// </summary>
        /// <remarks>
        /// Obtiene una lista de órdenes con filtros opcionales.
        /// </remarks>
        /// <param name="from">Fecha y hora de inicio para filtrar órdenes</param>
        /// <param name="to">Fecha y hora de fin para filtrar órdenes</param>
        /// <param name="status">Filtrar por estado de la orden (1=Pendiente, 2=En preparación, 3=Listo, 4=Entregado, 5=Cancelado)</param>
        /// <response code="200">Lista de órdenes obtenida exitosamente</response>
        /// <response code="400">Parámetros de búsqueda inválidos</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<OrderDetailsResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SearchOrders(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] int? status)
        {
            var orders = await _getOrdersService.Execute(from, to, status);
            return Ok(orders);
        }

        /// <summary>
        /// Obtener orden por número
        /// </summary>
        /// <remarks>
        /// Obtiene los detalles de una orden específica por su número.
        /// </remarks>
        /// <param name="id">Número de orden único</param>
        /// <response code="200">Orden encontrada exitosamente</response>
        /// <response code="404">Orden no encontrada</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(OrderDetailsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOrderById(long id)
        {
            var order = await _getOrderByIdService.Execute(id);
            return Ok(order);
        }

        /// <summary>
        /// Actualizar orden existente
        /// </summary>
        /// <remarks>
        /// Actualiza los items de una orden existente.
        /// </remarks>
        /// <param name="id">Número de orden a actualizar</param>
        /// <param name="orderUpdateRequest">Items actualizados de la orden</param>
        /// <response code="200">Orden actualizada exitosamente</response>
        /// <response code="400">Datos de actualización inválidos</response>
        /// <response code="404">Orden no encontrada</response>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(OrderUpdateResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOrder(long id, [FromBody] OrderUpdateRequest orderUpdateRequest)
        {
            var updatedOrder = await _updateOrderService.Execute(id, orderUpdateRequest);
            return Ok(updatedOrder);
        }

        /// <summary>
        /// Actualizar estado de item individual
        /// </summary>
        /// <remarks>
        /// Actualiza el estado de un item específico dentro de una orden.
        /// </remarks>
        /// <param name="id">Número de orden</param>
        /// <param name="itemId">ID del item dentro de la orden</param>
        /// <param name="itemUpdateRequest">Nuevo estado para el item</param>
        /// <response code="200">Estado del item actualizado exitosamente</response>
        /// <response code="400">Estado inválido o transición no permitida</response>
        /// <response code="404">Orden o item no encontrado</response>
        [HttpPatch("{id}/item/{itemId}")]
        [ProducesResponseType(typeof(OrderUpdateResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiError), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOrderItemStatus(long id, long itemId, [FromBody] OrderItemUpdateRequest itemUpdateRequest)
        {
            var updatedOrder = await _updateOrderItemStatusService.Execute(id, itemId, itemUpdateRequest);
            return Ok(updatedOrder);
        }
    }
}
