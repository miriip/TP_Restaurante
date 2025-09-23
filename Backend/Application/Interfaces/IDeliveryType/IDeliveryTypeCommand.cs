using Domain.Entities;

namespace Application.Interfaces.IDeliveryType
{
    public interface IDeliveryTypeCommand
    {
        Task CreateDeliveryTypeAsync(DeliveryType deliveryType);
        Task UpdateDeliveryTypeAsync(DeliveryType deliveryType);
        Task DeleteDeliveryTypeAsync(int deliveryTypeId);
    }
}
