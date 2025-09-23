using Application.Models.Response.Category;

namespace Application.Interfaces.ICategory
{
    public interface ICategoryListService
    {
        Task<List<CategoryResponse>> GetCategoriesAsync();
    }
}
