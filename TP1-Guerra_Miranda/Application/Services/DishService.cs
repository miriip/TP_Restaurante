using Application.Interfaces.IDish;
using Application.Models.Request;
using Application.Models.Response;
using Domain.Entities;
using System.Threading;




namespace Application.Services
{
    public class DishService: IDishService
    {
        private readonly IDishCommand _command;
        private readonly IDishQuery _query;
        public DishService(IDishCommand command, IDishQuery query)
        {
            _command = command;
            _query = query;
        }
        public async Task<DishResponse> CreateDish(DishRequest dishRequest)
        {
            //validaciones
            var dish = new Dish
            {
                DishId = Guid.NewGuid(),
                Name = dishRequest.Name,
                Description = dishRequest.Description,
                Price = dishRequest.Price,
                Available = dishRequest.Available,
                ImageUrl = dishRequest.ImageUrl,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                CategoryId = dishRequest.CategoryId
            };
            await _command.InsertDish(dish);
            return new DishResponse
            {
                Id = dish.DishId,
                Name = dish.Name,
                Description = dish.Description,
                Price = dish.Price,
                Available = dish.Available,
                ImageUrl = dish.ImageUrl,
                CreateDate = dish.CreateDate,
                UpdateDate = dish.UpdateDate
            };
        }

        public Task<DishResponse> DeleteDish(Guid id)
        {
            throw new NotImplementedException();
        }

        public async Task<List<DishResponse>> GetAllDishesAsync()
        {
            var dishes = await _query.GetAllDishes();

            return dishes.Select(dishes => new DishResponse
            {
                Id = dishes.DishId,
                Name = dishes.Name,
                Description = dishes.Description,
                Price = dishes.Price,
                Available = dishes.Available,
                ImageUrl = dishes.ImageUrl,
                CreateDate = dishes.CreateDate,
                UpdateDate = dishes.UpdateDate
            }).ToList();
        }

        public async Task<DishResponse> GetDishById(Guid id)
        {
            var dish = await _query.GetDishById(id);
            if (dish == null)
            {
                throw new Exception("Dish not found");
            }
            return new DishResponse
            {
                Id = dish.DishId,
                Name = dish.Name,
                Description = dish.Description,
                Price = dish.Price,
                Available = dish.Available,
                ImageUrl = dish.ImageUrl,
                CreateDate = dish.CreateDate,
                UpdateDate = dish.UpdateDate
            };
        }

        public async Task<DishResponse> UpdateDish(Guid id, DishRequest dishRequest)
        {
            var existingDish = await _query.GetDishById(id);

            if (existingDish == null)
            {
                throw new Exception("Dish not found");
            }
            existingDish.Name = dishRequest.Name;
            existingDish.Description = dishRequest.Description;
            existingDish.Price = dishRequest.Price;
            existingDish.Available = dishRequest.Available;
            existingDish.ImageUrl = dishRequest.ImageUrl;
            existingDish.UpdateDate = DateTime.UtcNow;

            await _command.UpdateDish(existingDish);

            return new DishResponse
            {
                Id = existingDish.DishId,
                Name = existingDish.Name,
                Description = existingDish.Description,
                Price = existingDish.Price,
                Available = existingDish.Available,
                ImageUrl = existingDish.ImageUrl,
                CreateDate = existingDish.CreateDate,
                UpdateDate = existingDish.UpdateDate
            };
        }

        public async Task<IReadOnlyList<DishResponse>> SearchAsync(string? name, int? categoryId, string? priceOrder)
        {
            if (!string.IsNullOrWhiteSpace(priceOrder))
            {
                var normalized = priceOrder.Trim().ToUpperInvariant();
                if (normalized != "ASC" && normalized != "DESC")
                {
                    throw new ArgumentException("Invalid order. Use ASC or DESC.");
                }
            }

            var list = await _query.SearchAsync(name, categoryId, priceOrder);
            return list.Select(dishes => new DishResponse
            {
                Id = dishes.DishId,
                Name = dishes.Name,
                Description = dishes.Description,
                Price = dishes.Price,
                Available = dishes.Available,
                ImageUrl = dishes.ImageUrl,
                CreateDate = dishes.CreateDate,
                UpdateDate = dishes.UpdateDate
            }).ToList();
        }

        
    }
}
