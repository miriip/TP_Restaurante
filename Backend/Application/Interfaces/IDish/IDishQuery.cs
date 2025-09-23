using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces.IDish
{
    public interface IDishQuery
    {
        Task<Dish?> GetDishById(Guid id);
        Task<Dish?> GetDishByName(string name);
        Task<Category?> GetCategoryById(int categoryId);
        Task<IEnumerable<Dish>> GetAllAsync(string? name = null, int? categoryId = null, string? priceOrder = null, bool? onlyActive = true);
    }
}
