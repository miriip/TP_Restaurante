using Domain.Entities;

namespace Application.Interfaces.IOrder
{
    public interface IOrderCommand
    {
        Task CreateOrderAsync(Order order);
        Task UpdateOrderAsync(Order order);
        Task DeleteOrderAsync(long orderNumber);
    }
}
