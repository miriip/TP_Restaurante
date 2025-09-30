using Application.Interfaces.IOrderItem;
using Application.Interfaces.IOrder;
using Application.Models.Request.Order;
using Application.Models.Response.Order;
using Application.Exceptions;
using Domain.Entities;

namespace Application.Services.OrderItemServices
{
    public class OrderItemStatusUpdateService : IOrderItemStatusUpdateService
    {
        private readonly IOrderCommand _orderCommand;
        private readonly IOrderQuery _orderQuery;
        private readonly IOrderItemCommand _orderItemCommand;
        private readonly IOrderItemQuery _orderItemQuery;

        public OrderItemStatusUpdateService(
            IOrderCommand orderCommand, 
            IOrderQuery orderQuery,
            IOrderItemCommand orderItemCommand,
            IOrderItemQuery orderItemQuery)
        {
            _orderCommand = orderCommand;
            _orderQuery = orderQuery;
            _orderItemCommand = orderItemCommand;
            _orderItemQuery = orderItemQuery;
        }

        public async Task<OrderUpdateResponse> Execute(long orderId, long itemId, OrderItemUpdateRequest itemUpdateRequest)
        {
            var order = await _orderQuery.GetOrderById(orderId);
            if (order == null)
            {
                throw new OrderNotFoundException(orderId);
            }
            if (order.OverallStatus == 5)
            {
                throw new OrderClosedException();
            }

            var item = await _orderItemQuery.GetOrderItemById(itemId);
            if (item == null || item.Order != orderId)
            {
                throw new OrderItemNotFoundException(itemId);
            }

            // Validar estado
            if (itemUpdateRequest.Status < 1 || itemUpdateRequest.Status > 5)
            {
                throw new InvalidOrderStatusException(itemUpdateRequest.Status);
            }

            // Validar transición de estado
            if (item.Status == 4 && itemUpdateRequest.Status != 4) // De "Entregado" solo se puede mantener "Entregado"
            {
                throw new InvalidOrderStatusTransitionException("Entregado", GetStatusName(itemUpdateRequest.Status));
            }

            // Validar que no se pueda cambiar de "Cancelado" a otro estado
            if (item.Status == 5 && itemUpdateRequest.Status != 5)
            {
                throw new InvalidOrderStatusTransitionException("Cancelado", GetStatusName(itemUpdateRequest.Status));
            }

            item.Status = itemUpdateRequest.Status;
            await _orderItemCommand.UpdateOrderItemAsync(item);

            // Actualizar el estado general de la orden basado en todos los items
            await UpdateOverallOrderStatus(order);

            order.UpdateDate = DateTime.UtcNow;
            await _orderCommand.UpdateOrderAsync(order);

            return new OrderUpdateResponse
            {
                OrderNumber = orderId,
                TotalAmount = order.Price,
                UpdateAt = order.UpdateDate
            };
        }

        private string GetStatusName(int status)
        {
            return status switch
            {
                1 => "Pendiente",
                2 => "En preparación",
                3 => "Listo",
                4 => "Entregado",
                5 => "Cancelado",
                _ => "Desconocido"
            };
        }

        private async Task UpdateOverallOrderStatus(Order order)
        {
            // Obtener todos los items de la orden
            var orderItems = await _orderItemQuery.GetOrderItemsByOrderId(order.OrderId);
            
            if (!orderItems.Any())
            {
                return; // No hay items, mantener estado actual
            }


            var hasCancelledItems = orderItems.Any(item => item.Status == 5);
            if (hasCancelledItems)
            {
                order.OverallStatus = 5; // Cancelado
                return;
            }

            var allItemsDelivered = orderItems.All(item => item.Status == 4);
            if (allItemsDelivered)
            {
                order.OverallStatus = 4; // Entregado
                return;
            }

            var allItemsReady = orderItems.All(item => item.Status == 3);
            if (allItemsReady)
            {
                order.OverallStatus = 3; // Listo
                return;
            }

            var hasItemsInPreparation = orderItems.Any(item => item.Status == 2);
            if (hasItemsInPreparation)
            {
                order.OverallStatus = 2; // En preparación
                return;
            }

            // Si llegamos aquí, todos los items están pendientes
            order.OverallStatus = 1; // Pendiente
        }
    }
}
