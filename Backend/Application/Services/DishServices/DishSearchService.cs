using Application.Interfaces.IDish;
using Application.Models.Response.Dish;
using Application.Models.Response;
using Application.Exceptions;
using System;
using System.Linq;

namespace Application.Services.DishServices
{
    public class DishSearchService : ISearchDishesService
    {
        private readonly IDishQuery _dishQuery;

        public DishSearchService(IDishQuery query)
        {
            _dishQuery = query;
        }

        public async Task<IEnumerable<DishResponse>> SearchAsync(string? name, int? categoryId, string? priceOrder, bool? onlyActive)
        {
            if (!string.IsNullOrWhiteSpace(priceOrder))
            {
                var normalized = priceOrder.Trim().ToLowerInvariant();
                if (normalized != "asc" && normalized != "desc")
                {
                    throw new InvalidSortOrderException();
                }
            }

            // Pasar onlyActive (true: solo activos; false: todos; null: por defecto true)
            var effectiveOnlyActive = onlyActive ?? true;
            var list = await _dishQuery.GetAllAsync(name, categoryId, priceOrder, effectiveOnlyActive);

            return list.Select(dish => new DishResponse
            {
                Id = dish.DishId,
                Name = dish.Name,
                Description = dish.Description,
                Price = dish.Price,
                Category = new GenericResponse { Id = dish.Category, Name = dish.CategoryRef?.Name },
                Image = dish.ImageUrl,
                IsActive = dish.Available,
                CreatedAt = dish.CreateDate,
                UpdatedAt = dish.UpdateDate
            }).ToList();
        }
    }
}
