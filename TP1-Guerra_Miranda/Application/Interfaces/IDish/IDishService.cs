using Application.Models.Request;
using Application.Models.Response;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.IDish
{
    public interface IDishService
    {
        // List
        Task<List<DishResponse>> GetAllDishesAsync();

        // Create
        Task<DishResponse> CreateDish(DishRequest dishRequest);

        // Update
        Task<DishResponse> UpdateDish(Guid id, DishRequest dishRequest);

        // Delete
        Task<DishResponse> DeleteDish(Guid id);

        // Queries
        Task<DishResponse> GetDishById(Guid id);

        // Search
        Task<IReadOnlyList<DishResponse>> SearchAsync(string? name, int? categoryId, string? priceOrder);


    }
}
