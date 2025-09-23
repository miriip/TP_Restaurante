using Application.Interfaces.IOrder;
using Application.Interfaces.IOrderItem;
using Application.Models.Request.Order;
using Application.Models.Response.Order;
using Domain.Entities;
using Application.Interfaces.IDish;
using Application.Exceptions;

namespace Application.Services.OrderServices
{
    public class OrderCreationService : IOrderCreationService
    {
        private readonly IOrderCommand _orderCommand;
        private readonly IDishQuery _dishQuery;
        private readonly IOrderItemCommand _orderItemCommand;

        public OrderCreationService(IOrderCommand orderCommand, IDishQuery dishQuery, IOrderItemCommand orderItemCommand)
        {
            _orderCommand = orderCommand;
            _dishQuery = dishQuery;
            _orderItemCommand = orderItemCommand;
        }

        public async Task<OrderCreateResponse> Execute(OrderRequest orderRequest)
        {
            // Validar que la orden tenga items
            if (orderRequest.Items == null || !orderRequest.Items.Any())
            {
                throw new EmptyOrderItemsException();
            }

            // Validar tipo de entrega
            if (orderRequest.Delivery == null || orderRequest.Delivery.Id <= 0)
            {
                throw new InvalidDeliveryTypeException(orderRequest.Delivery?.Id ?? 0);
            }

            // Validar que todos los platos existan y estén activos
            decimal totalAmount = 0;
            foreach (var item in orderRequest.Items)
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

            var order = new Order
            {
                DeliveryType = orderRequest.Delivery.Id,
                DeliveryTo = orderRequest.Delivery.To,
                OverallStatus = 1,
                Notes = orderRequest.Notes,
                Price = totalAmount,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow
            };

            await _orderCommand.CreateOrderAsync(order);

            foreach (var item in orderRequest.Items)
            {
                var orderItem = new OrderItem
                {
                    Order = order.OrderId,
                    Quantity = item.Quantity,
                    Notes = item.Notes,
                    Dish = item.Id,
                    Status = 1,
                    CreateDate = DateTime.UtcNow
                };
                await _orderItemCommand.CreateOrderItemAsync(orderItem);
            }

            return new OrderCreateResponse
            {
                OrderNumber = order.OrderId,
                TotalAmount = totalAmount,
                CreatedAt = order.CreateDate
            };
        }
    }
}


