using Application.Interfaces.IOrder;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Querys
{
    public class OrderQuery : IOrderQuery
    {
        private readonly AppDbContext _context;

        public OrderQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Order?> GetOrderById(long id)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.DishRef)
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.StatusRef)
                .Include(o => o.OverallStatusRef)
                .Include(o => o.DeliveryTypeRef)
                .FirstOrDefaultAsync(o => o.OrderId == id);
        }

        public async Task<List<Order>> GetAllOrders()
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.DishRef)
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.StatusRef)
                .Include(o => o.OverallStatusRef)
                .Include(o => o.DeliveryTypeRef)
                .OrderByDescending(o => o.CreateDate)
                .ToListAsync();
        }

        public async Task<List<Order>> GetOrdersByDateRange(DateTime from, DateTime to)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.DishRef)
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.StatusRef)
                .Include(o => o.OverallStatusRef)
                .Include(o => o.DeliveryTypeRef)
                .Where(o => o.CreateDate >= from && o.CreateDate <= to)
                .OrderByDescending(o => o.CreateDate)
                .ToListAsync();
        }

        public async Task<List<Order>> GetOrdersByStatus(int statusId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.DishRef)
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.StatusRef)
                .Include(o => o.OverallStatusRef)
                .Include(o => o.DeliveryTypeRef)
                .Where(o => o.OverallStatus == statusId)
                .OrderByDescending(o => o.CreateDate)
                .ToListAsync();
        }

        public async Task<List<Order>> GetOrdersByFilters(DateTime? from, DateTime? to, int? statusId)
        {
            var query = _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.DishRef)
                .Include(o => o.OrderItems)
                    .ThenInclude(i => i.StatusRef)
                .Include(o => o.OverallStatusRef)
                .Include(o => o.DeliveryTypeRef)
                .AsQueryable();

            // Aplicar filtros en la base de datos
            if (from.HasValue)
            {
                query = query.Where(o => o.CreateDate >= from.Value);
            }

            if (to.HasValue)
            {
                query = query.Where(o => o.CreateDate <= to.Value);
            }

            if (statusId.HasValue)
            {
                query = query.Where(o => o.OverallStatus == statusId.Value);
            }

            return await query
                .OrderByDescending(o => o.CreateDate)
                .ToListAsync();
        }

    }
}
