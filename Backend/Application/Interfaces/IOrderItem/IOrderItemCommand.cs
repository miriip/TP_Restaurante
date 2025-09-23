using Domain.Entities;

namespace Application.Interfaces.IOrderItem
{
    public interface IOrderItemCommand
    {
        Task CreateOrderItemAsync(OrderItem orderItem);
        Task UpdateOrderItemAsync(OrderItem orderItem);
        Task DeleteOrderItemAsync(long orderItemId);
    }
}
