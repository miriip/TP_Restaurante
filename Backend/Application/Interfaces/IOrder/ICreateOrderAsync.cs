using Application.Models.Request.Order;
using Application.Models.Response.Order;

namespace Application.Interfaces.IOrder
{
    public interface IOrderCreationService
    {
        Task<OrderCreateResponse> Execute(OrderRequest orderRequest);
    }
}


