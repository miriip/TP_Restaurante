using Application.Models.Request;
using Application.Models.Response;
using System;
using System.Threading.Tasks;

namespace Application.Interfaces.IDish
{
    public interface IUpdateDishService
    {
        Task<DishResponse> UpdateDish(Guid id, UpdateDishRequest dishUpdateRequest);
    }
}


