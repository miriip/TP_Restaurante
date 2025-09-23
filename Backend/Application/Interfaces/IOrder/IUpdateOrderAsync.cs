using Application.Models.Request.Order;
using Application.Models.Response.Order;

namespace Application.Interfaces.IOrder
{
    public interface IOrderUpdateService
    {
        Task<OrderUpdateResponse> Execute(long orderId, OrderUpdateRequest orderUpdateRequest);
    }
}


