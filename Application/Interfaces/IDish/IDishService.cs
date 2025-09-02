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
        // Create
        Task<DishResponse> CreateDish(DishRequest dishRequest);

        // Update
        Task<DishResponse> UpdateDish(Guid id, DishUpdateRequest dishUpdateRequest);

        // Search
        Task<IEnumerable<DishResponse>> SearchAsync(string? name, int? category, string? sortByPrice);
    }
}

