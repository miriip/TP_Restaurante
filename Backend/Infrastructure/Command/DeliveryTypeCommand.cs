using Application.Interfaces.IDeliveryType;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Command
{
    public class DeliveryTypeCommand : IDeliveryTypeCommand
    {
        private readonly AppDbContext _context;

        public DeliveryTypeCommand(AppDbContext context)
        {
            _context = context;
        }

        public async Task CreateDeliveryTypeAsync(DeliveryType deliveryType)
        {
            _context.DeliveryTypes.Add(deliveryType);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateDeliveryTypeAsync(DeliveryType deliveryType)
        {
            _context.DeliveryTypes.Update(deliveryType);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteDeliveryTypeAsync(int deliveryTypeId)
        {
            var deliveryType = await _context.DeliveryTypes.FindAsync(deliveryTypeId);
            if (deliveryType != null)
            {
                _context.DeliveryTypes.Remove(deliveryType);
                await _context.SaveChangesAsync();
            }
        }
    }
}
