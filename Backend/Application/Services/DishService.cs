using Application.Interfaces.IDish;
using Application.Models.Request;
using Application.Models.Response;
using Domain.Entities;
using Domain.Exceptions;


namespace Application.Services
{
    public class DishService : IDishService
    {
        private readonly DishCreationService _dishCreationService;
        private readonly DishSearchService _dishSearchService;
        private readonly DishUpdateService _dishUpdateService;

        public DishService(DishCreationService creationService, DishSearchService searchService, DishUpdateService updateService)
        {
            _dishCreationService = creationService;
            _dishSearchService = searchService;
            _dishUpdateService = updateService;
        }

        public async Task<DishResponse> CreateDish(DishRequest dishRequest)
        {
            return await _dishCreationService.CreateDish(dishRequest);
        }

        public async Task<IEnumerable<DishResponse>> SearchAsync(string? name, int? categoryId, string? priceOrder)
        {
            return await _dishSearchService.SearchAsync(name, categoryId, priceOrder);
        }

        public async Task<DishResponse> UpdateDish(Guid id, DishUpdateRequest dishUpdateRequest)
        {
            return await _dishUpdateService.UpdateDish(id, dishUpdateRequest);
        }
    }
}

