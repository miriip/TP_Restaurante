using Domain.Entities;

namespace Application.Interfaces.IDeliveryType
{
    public interface IDeliveryTypeQuery
    {
        Task<DeliveryType?> GetDeliveryTypeByIdAsync(int deliveryTypeId);
        Task<DeliveryType?> GetDeliveryTypeByNameAsync(string name);
        Task<List<DeliveryType>> GetAllDeliveryTypesAsync();
    }
}
