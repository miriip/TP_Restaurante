using Application.Interfaces.IDish;
using Application.Models.Response;
using Domain.Exceptions;
using System;
using System.Linq;

namespace Application.Services
{
    public class DishSearchService
    {
        private readonly IDishQuery _dishQuery;

        public DishSearchService(IDishQuery query)
        {
            _dishQuery = query;
        }

        public async Task<IEnumerable<DishResponse>> SearchAsync(string? name, int? categoryId, string? priceOrder)
        {
            if (!string.IsNullOrWhiteSpace(priceOrder))
            {
                var normalized = priceOrder.Trim().ToLowerInvariant();
                if (normalized != "asc" && normalized != "desc")
                {
                    throw new InvalidSortOrderException();
                }
            }

            var list = await _dishQuery.GetAllAsync(name, categoryId, priceOrder);
            
            // Verificar si se encontraron resultados
            if (!list.Any())
            {
                if (!string.IsNullOrWhiteSpace(name) && categoryId.HasValue)
                {
                    // Buscar por nombre y categoría
                    var category = await _dishQuery.GetCategoryById(categoryId.Value);
                    if (category != null)
                    {
                        throw new NoDishesInCategoryByNameException(category.Name);
                    }
                    else
                    {
                        throw new NoDishesInCategoryException(categoryId.Value);
                    }
                }
                else if (!string.IsNullOrWhiteSpace(name))
                {
                    // Buscar solo por nombre
                    throw new NoDishesFoundException(name);
                }
                else if (categoryId.HasValue)
                {
                    // Buscar solo por categoría
                    var category = await _dishQuery.GetCategoryById(categoryId.Value);
                    if (category != null)
                    {
                        throw new NoDishesInCategoryException(categoryId.Value);
                    }
                    else
                    {
                        throw new NoDishesInCategoryException(categoryId.Value);
                    }
                }
                // Si no hay filtros, no lanzar excepción (puede ser que no haya platos en la base)
            }

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
