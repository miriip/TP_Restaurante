using Application.Models.Request;
using Application.Models.Response;
using System.Threading.Tasks;

namespace Application.Interfaces.IDish
{
    public interface ICreateDishService
    {
        Task<DishResponse> CreateDish(CreateDishRequest dishRequest);
    }
}


