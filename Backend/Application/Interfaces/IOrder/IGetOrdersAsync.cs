using Application.Models.Response.Order;

namespace Application.Interfaces.IOrder
{
    public interface IOrderListService
    {
        Task<List<OrderDetailsResponse>> Execute(DateTime? from, DateTime? to, int? status);
    }
}


