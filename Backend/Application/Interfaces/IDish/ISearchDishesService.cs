using Application.Models.Response.Dish;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces.IDish
{
    public interface ISearchDishesService
    {
        Task<IEnumerable<DishResponse>> SearchAsync(string? name, int? categoryId, string? priceOrder, bool? onlyActive);
    }
}


