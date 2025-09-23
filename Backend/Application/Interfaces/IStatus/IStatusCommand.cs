using Domain.Entities;

namespace Application.Interfaces.IStatus
{
    public interface IStatusCommand
    {
        Task CreateStatusAsync(Status status);
        Task UpdateStatusAsync(Status status);
        Task DeleteStatusAsync(int statusId);
    }
}
