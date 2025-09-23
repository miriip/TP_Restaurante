using Domain.Entities;

namespace Application.Interfaces.IStatus
{
    public interface IStatusQuery
    {
        Task<Status?> GetStatusByIdAsync(int statusId);
        Task<Status?> GetStatusByNameAsync(string name);
        Task<List<Status>> GetAllStatusesAsync();
    }
}
