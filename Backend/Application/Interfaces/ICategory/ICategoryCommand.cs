using Domain.Entities;

namespace Application.Interfaces.ICategory
{
    public interface ICategoryCommand
    {
        Task CreateCategoryAsync(Category category);
        Task UpdateCategoryAsync(Category category);
        Task DeleteCategoryAsync(int categoryId);
    }
}
