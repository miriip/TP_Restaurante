using Application.Models.Request.Order;
using Application.Models.Response.Order;

namespace Application.Interfaces.IOrderItem
{
    public interface IOrderItemStatusUpdateService
    {
        Task<OrderUpdateResponse> Execute(long orderId, long itemId, OrderItemUpdateRequest itemUpdateRequest);
    }
}
