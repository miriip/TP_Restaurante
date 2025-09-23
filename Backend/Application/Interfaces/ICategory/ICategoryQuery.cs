using Domain.Entities;

namespace Application.Interfaces.ICategory
{
    public interface ICategoryQuery
    {
        Task<Category?> GetCategoryByIdAsync(int categoryId);
        Task<Category?> GetCategoryByNameAsync(string name);
        Task<List<Category>> GetAllCategoriesAsync();
    }
}
