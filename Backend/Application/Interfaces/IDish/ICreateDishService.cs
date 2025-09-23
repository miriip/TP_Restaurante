using Application.Models.Request.Dish;
using Application.Models.Response.Dish;
using System.Threading.Tasks;

namespace Application.Interfaces.IDish
{
    public interface ICreateDishService
    {
        Task<DishResponse> CreateDish(DishRequest dishRequest);
    }
}


