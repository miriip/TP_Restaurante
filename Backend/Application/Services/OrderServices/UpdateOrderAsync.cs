using Application.Interfaces.IOrder;
using Application.Interfaces.IOrderItem;
using Application.Interfaces.IDish;
using Application.Models.Request.Order;
using Application.Models.Response.Order;
using Domain.Entities;
using Application.Exceptions;

namespace Application.Services.OrderServices
{
    public class OrderUpdateService : IOrderUpdateService
    {
        private readonly IOrderCommand _orderCommand;
        private readonly IOrderQuery _orderQuery;
        private readonly IOrderItemCommand _orderItemCommand;
        private readonly IOrderItemQuery _orderItemQuery;
        private readonly IDishQuery _dishQuery;

        public OrderUpdateService(IOrderCommand orderCommand, IOrderQuery orderQuery, IOrderItemCommand orderItemCommand, IOrderItemQuery orderItemQuery, IDishQuery dishQuery)
        {
            _orderCommand = orderCommand;
            _orderQuery = orderQuery;
            _orderItemCommand = orderItemCommand;
            _orderItemQuery = orderItemQuery;
            _dishQuery = dishQuery;
        }

        public async Task<OrderUpdateResponse> Execute(long orderId, OrderUpdateRequest orderUpdateRequest)
        {
            // Validar que la orden tenga items
            if (orderUpdateRequest.Items == null || !orderUpdateRequest.Items.Any())
            {
                throw new EmptyOrderItemsException();
            }

            var order = await _orderQuery.GetOrderById(orderId);
            if (order == null)
            {
                throw new OrderNotFoundException(orderId);
            }
            if (order.OverallStatus == 5)
            {
                throw new OrderClosedException();
            }
            if (order.OverallStatus > 1)
            {
                throw new OrderInProgressException();
            }

            // Validar que todos los platos existan y estén activos
            decimal totalAmount = 0;
            foreach (var item in orderUpdateRequest.Items)
            {
                var dish = await _dishQuery.GetDishById(item.Id);
                if (dish == null)
                {
                    throw new DishNotAvailableException(item.Id);
                }
                if (!dish.Available)
                {
                    throw new DishNotAvailableException($"El plato '{dish.Name}' no está disponible");
                }
                if (item.Quantity <= 0)
                {
                    throw new InvalidOrderItemQuantityException($"La cantidad debe ser mayor a 0 para el plato '{dish.Name}'");
                }
                
                totalAmount += dish.Price * item.Quantity;
            }

            var existingItems = await _orderItemQuery.GetOrderItemsByOrderId(order.OrderId);

            // Indexar ítems existentes por Dish para merge sin duplicados
            var dishIdToExistingItem = existingItems.ToDictionary(oi => oi.Dish, oi => oi);

            foreach (var item in orderUpdateRequest.Items)
            {
                if (dishIdToExistingItem.TryGetValue(item.Id, out var existing))
                {
                    // Sobrescribir cantidad y notas del ítem existente
                    existing.Quantity = item.Quantity;
                    existing.Notes = item.Notes;
                    await _orderItemCommand.UpdateOrderItemAsync(existing);
                }
                else
                {
                    // Agregar nuevo ítem para platos no presentes
                    var newItem = new OrderItem
                    {
                        Order = order.OrderId,
                        Quantity = item.Quantity,
                        Notes = item.Notes,
                        Dish = item.Id,
                        Status = 1,
                        CreateDate = DateTime.UtcNow
                    };
                    await _orderItemCommand.CreateOrderItemAsync(newItem);
                }
            }

            // Recalcular el precio total con todos los ítems actuales
            var mergedItems = await _orderItemQuery.GetOrderItemsByOrderId(order.OrderId);
            decimal recalculatedTotal = 0;
            foreach (var oi in mergedItems)
            {
                var dish = await _dishQuery.GetDishById(oi.Dish);
                if (dish != null)
                {
                    recalculatedTotal += dish.Price * oi.Quantity;
                }
            }
            order.Price = recalculatedTotal;

            order.UpdateDate = DateTime.UtcNow;
            await _orderCommand.UpdateOrderAsync(order);

            return new OrderUpdateResponse
            {
                OrderNumber = orderId,
                TotalAmount = order.Price,
                UpdateAt = order.UpdateDate
            };
        }
    }
}


