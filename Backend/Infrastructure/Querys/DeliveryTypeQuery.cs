using Application.Interfaces.IDeliveryType;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Querys
{
    public class DeliveryTypeQuery : IDeliveryTypeQuery
    {
        private readonly AppDbContext _context;

        public DeliveryTypeQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DeliveryType?> GetDeliveryTypeByIdAsync(int deliveryTypeId)
        {
            return await _context.DeliveryTypes.FindAsync(deliveryTypeId);
        }

        public async Task<DeliveryType?> GetDeliveryTypeByNameAsync(string name)
        {
            return await _context.DeliveryTypes
                .FirstOrDefaultAsync(dt => dt.Name == name);
        }

        public async Task<List<DeliveryType>> GetAllDeliveryTypesAsync()
        {
            return await _context.DeliveryTypes
                .OrderBy(dt => dt.Id)
                .ToListAsync();
        }
    }
}
