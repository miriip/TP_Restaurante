using Application.Interfaces.IStatus;
using Application.Models.Response;

namespace Application.Services.StatusServices
{
    public class StatusListService : IStatusListService
    {
        private readonly IStatusQuery _statusQuery;

        public StatusListService(IStatusQuery statusQuery)
        {
            _statusQuery = statusQuery;
        }

        public async Task<List<GenericResponse>> GetStatusesAsync()
        {
            var statuses = await _statusQuery.GetAllStatusesAsync();
            return statuses.Select(s => new GenericResponse
            {
                Id = s.Id,
                Name = s.Name
            }).ToList();
        }
    }
}
