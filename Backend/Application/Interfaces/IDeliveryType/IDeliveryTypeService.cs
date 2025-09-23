using Application.Models.Response;

namespace Application.Interfaces.IDeliveryType
{
    public interface IDeliveryTypeListService
    {
        Task<List<GenericResponse>> GetDeliveryTypesAsync();
    }
}
