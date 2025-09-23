using Domain.Entities;
using System;
using System.Threading.Tasks;

namespace Application.Interfaces.IDish
{
    public interface IDishCommand
    {
        Task<Dish> CreateDish(Dish dish);
        Task<Dish> UpdateDish(Dish dish);
        Task<bool> DeleteDish(Guid id);
    }
}
