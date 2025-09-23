using Application.Models.Response.Dish;

namespace Application.Interfaces.IDish
{
    public interface IDeleteDishService
    {
        Task<DishResponse> DeleteDishAsync(Guid id);
    }
}
