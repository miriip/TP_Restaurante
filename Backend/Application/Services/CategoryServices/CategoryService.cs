using Application.Interfaces.ICategory;
using Application.Models.Response.Category;


namespace Application.Services.CategoryServices
{
    public class CategoryListService : ICategoryListService
    {
        private readonly ICategoryQuery _categoryQuery;

        public CategoryListService(ICategoryQuery categoryQuery)
        {
            _categoryQuery = categoryQuery;
        }

        public async Task<List<CategoryResponse>> GetCategoriesAsync()
        {
            var categories = await _categoryQuery.GetAllCategoriesAsync();
            return categories.Select(c => new CategoryResponse
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Order = c.Order
            }).ToList();
        }
    }
}