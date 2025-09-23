using Application.Interfaces.IOrder;
using Application.Models.Response.Order;
using Application.Models.Response;
using Application.Models.Response.Dish;
using Application.Exceptions;

namespace Application.Services.OrderServices
{
    public class OrderDetailsService : IOrderDetailsService
    {
        private readonly IOrderQuery _orderQuery;

        public OrderDetailsService(IOrderQuery orderQuery)
        {
            _orderQuery = orderQuery;
        }

        public async Task<OrderDetailsResponse> Execute(long orderId)
        {
            var order = await _orderQuery.GetOrderById(orderId);

            if (order == null)
            {
                throw new OrderNotFoundException(orderId);
            }

            return new OrderDetailsResponse
            {
                OrderNumber = order.OrderId,
                TotalAmount = order.Price,
                DeliveryTo = order.DeliveryTo,
                Notes = order.Notes,
                Status = new GenericResponse
                {
                    Id = order.OverallStatus,
                    Name = order.OverallStatusRef?.Name ?? "Desconocido"
                },
                DeliveryType = new GenericResponse
                {
                    Id = order.DeliveryType,
                    Name = order.DeliveryTypeRef?.Name ?? "Desconocido"
                },
                Items = order.OrderItems?.Select(oi => new OrderItemResponse
                {
                    Id = oi.OrderItemId,
                    Quantity = oi.Quantity,
                    Notes = oi.Notes,
                    Status = new GenericResponse
                    {
                        Id = oi.Status,
                        Name = oi.StatusRef?.Name ?? "Desconocido"
                    },
                    Dish = new DishShortResponse
                    {
                        Id = oi.Dish,
                        Name = oi.DishRef?.Name ?? "Desconocido",
                        Image = oi.DishRef?.ImageUrl
                    }
                }).ToList() ?? new List<OrderItemResponse>(),
                CreatedAt = order.CreateDate,
                UpdatedAt = order.UpdateDate
            };
        }
    }
}


