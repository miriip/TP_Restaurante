using Application.Models.Request.Dish;
using Application.Models.Response.Dish;
using System;
using System.Threading.Tasks;

namespace Application.Interfaces.IDish
{
    public interface IUpdateDishService
    {
        Task<DishResponse> UpdateDish(Guid id, UpdateDishRequest dishUpdateRequest);
    }
}


