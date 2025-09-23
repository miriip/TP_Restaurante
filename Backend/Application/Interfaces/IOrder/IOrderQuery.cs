using Domain.Entities;

namespace Application.Interfaces.IOrder
{
    public interface IOrderQuery
    {
        Task<Order?> GetOrderById(long id);
        Task<List<Order>> GetAllOrders();
        Task<List<Order>> GetOrdersByDateRange(DateTime from, DateTime to);
        Task<List<Order>> GetOrdersByStatus(int statusId);
        Task<List<Order>> GetOrdersByFilters(DateTime? from, DateTime? to, int? statusId);
    }
}
