using Application.Interfaces.IOrder;
using Application.Models.Response.Order;
using Application.Models.Response;
using Application.Models.Response.Dish;
using Application.Exceptions;

namespace Application.Services.OrderServices
{
    public class OrderListService : IOrderListService
    {
        private readonly IOrderQuery _orderQuery;

        public OrderListService(IOrderQuery orderQuery)
        {
            _orderQuery = orderQuery;
        }

        public async Task<List<OrderDetailsResponse>> Execute(DateTime? from, DateTime? to, int? status)
        {
            // Validar rango de fechas
            if (from.HasValue && to.HasValue && from.Value > to.Value)
            {
                throw new InvalidDateRangeException();
            }

            // Validar parámetros de búsqueda
            if (from.HasValue && !to.HasValue)
            {
                throw new InvalidSearchParametersException("Debe especificar fecha de fin cuando se proporciona fecha de inicio");
            }

            if (!from.HasValue && to.HasValue)
            {
                throw new InvalidSearchParametersException("Debe especificar fecha de inicio cuando se proporciona fecha de fin");
            }

            // Validar estado inválido
            if (status.HasValue && (status.Value < 1 || status.Value > 5))
            {
                throw new InvalidSearchParametersException("El estado especificado no es válido. Debe ser un valor entre 1 y 5");
            }

            // Usar el método optimizado que filtra en la base de datos
            var orders = await _orderQuery.GetOrdersByFilters(from, to, status);

            return orders.Select(o => new OrderDetailsResponse
            {
                OrderNumber = o.OrderId,
                TotalAmount = o.Price,
                DeliveryTo = o.DeliveryTo,
                Notes = o.Notes,
                Status = new GenericResponse
                {
                    Id = o.OverallStatus,
                    Name = o.OverallStatusRef?.Name ?? "Desconocido"
                },
                DeliveryType = new GenericResponse
                {
                    Id = o.DeliveryType,
                    Name = o.DeliveryTypeRef?.Name ?? "Desconocido"
                },
                Items = o.OrderItems?.Select(oi => new OrderItemResponse
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
                CreatedAt = o.CreateDate,
                UpdatedAt = o.UpdateDate
            }).ToList();
        }
    }
}


