using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.IDish
{
    public interface IDishQuery
    {
        Task<Dish?> GetDishById(Guid id);
        Task<List<Dish>> GetAllDishes();
        Task<IReadOnlyList<Domain.Entities.Dish>> SearchAsync(string? name, int? categoryId, string? priceOrder);
    }
}

