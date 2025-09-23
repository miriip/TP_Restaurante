using Domain.Entities;

namespace Application.Interfaces.IOrderItem
{
    public interface IOrderItemQuery
    {
        Task<OrderItem?> GetOrderItemById(long orderItemId);
        Task<List<OrderItem>> GetOrderItemsByOrderId(long orderId);
    }
}
