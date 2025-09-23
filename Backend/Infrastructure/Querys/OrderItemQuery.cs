using Application.Interfaces.IOrderItem;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Querys
{
    public class OrderItemQuery : IOrderItemQuery
    {
        private readonly AppDbContext _context;

        public OrderItemQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<OrderItem?> GetOrderItemById(long orderItemId)
        {
            return await _context.OrderItems
                .Include(i => i.DishRef)
                .Include(i => i.StatusRef)
                .FirstOrDefaultAsync(i => i.OrderItemId == orderItemId);
        }

        public async Task<List<OrderItem>> GetOrderItemsByOrderId(long orderId)
        {
            return await _context.OrderItems
                .Include(i => i.DishRef)
                .Include(i => i.StatusRef)
                .Where(i => i.Order == orderId)
                .ToListAsync();
        }
    }
}
