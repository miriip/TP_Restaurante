using Application.Interfaces.IDeliveryType;
using Application.Models.Response;

namespace Application.Services.DeliveryTypeServices
{
    public class DeliveryTypeListService : IDeliveryTypeListService
    {
        private readonly IDeliveryTypeQuery _deliveryTypeQuery;

        public DeliveryTypeListService(IDeliveryTypeQuery deliveryTypeQuery)
        {
            _deliveryTypeQuery = deliveryTypeQuery;
        }

        public async Task<List<GenericResponse>> GetDeliveryTypesAsync()
        {
            var deliveryTypes = await _deliveryTypeQuery.GetAllDeliveryTypesAsync();
            return deliveryTypes.Select(dt => new GenericResponse
            {
                Id = dt.Id,
                Name = dt.Name
            }).ToList();
        }
    }
}
