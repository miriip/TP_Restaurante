using Application.Models.Response;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces.IDish
{
    public interface ISearchDishesService
    {
        Task<IEnumerable<DishResponse>> SearchAsync(string? name, int? categoryId, string? priceOrder);
    }
}


