using Application.Models.Response;

namespace Application.Interfaces.IStatus
{
    public interface IStatusListService
    {
        Task<List<GenericResponse>> GetStatusesAsync();
    }
}
