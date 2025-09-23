using Application.Models.Response.Order;

namespace Application.Interfaces.IOrder
{
    public interface IOrderDetailsService
    {
        Task<OrderDetailsResponse> Execute(long orderId);
    }
}


