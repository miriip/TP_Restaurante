using Application.Interfaces.IDish;
using Application.Interfaces.IOrder;
using Application.Models.Response.Dish;
using Application.Models.Response;
using Domain.Entities;
using Application.Exceptions;
using System.Linq;

namespace Application.Services.DishServices
{
    public class DishDeleteService : IDeleteDishService
    {
        private readonly IDishQuery _dishQuery;
        private readonly IDishCommand _dishCommand;
        private readonly IOrderQuery _orderQuery;

        public DishDeleteService(IDishQuery query, IDishCommand command, IOrderQuery orderQuery)
        {
            _dishQuery = query;
            _dishCommand = command;
            _orderQuery = orderQuery;
        }

        public async Task<DishResponse> DeleteDishAsync(Guid id)
        {
            var dish = await _dishQuery.GetDishById(id);

            if (dish == null)
            {
                throw new DishNotFoundException(id);
            }

            // Verificar si el plato está en órdenes activas (Pendiente = 1, En preparación = 2)
            var allOrders = await _orderQuery.GetAllOrders();
            var isInActiveOrders = allOrders.Any(o =>
                (o.OverallStatus == 1 || o.OverallStatus == 2) &&
                (o.OrderItems != null && o.OrderItems.Any(oi => oi.Dish == id))
            );

            if (isInActiveOrders)
            {
                throw new OrderCannotBeDeletedException();
            }

            // Verificar dependencias adicionales: si existen referencias en OrderItems (históricas)
            var hasOtherDependencies = allOrders.Any(o => o.OrderItems != null && o.OrderItems.Any(oi => oi.Dish == id));
            if (hasOtherDependencies)
            {
                throw new DishHasDependenciesException();
            }

            // Marcar como inactivo en lugar de eliminar físicamente
            dish.Available = false;
            dish.UpdateDate = DateTime.UtcNow;

            await _dishCommand.UpdateDish(dish);

            return new DishResponse
            {
                Id = dish.DishId,
                Name = dish.Name,
                Description = dish.Description,
                Price = dish.Price,
                Category = new GenericResponse
                {
                    Id = dish.Category,
                    Name = dish.CategoryRef?.Name ?? "Desconocido"
                },
                Image = dish.ImageUrl,
                IsActive = dish.Available,
                CreatedAt = dish.CreateDate,
                UpdatedAt = dish.UpdateDate
            };
        }
    }
}
