using Application.Interfaces.IStatus;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Command
{
    public class StatusCommand : IStatusCommand
    {
        private readonly AppDbContext _context;

        public StatusCommand(AppDbContext context)
        {
            _context = context;
        }

        public async Task CreateStatusAsync(Status status)
        {
            _context.Statuses.Add(status);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateStatusAsync(Status status)
        {
            _context.Statuses.Update(status);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteStatusAsync(int statusId)
        {
            var status = await _context.Statuses.FindAsync(statusId);
            if (status != null)
            {
                _context.Statuses.Remove(status);
                await _context.SaveChangesAsync();
            }
        }
    }
}
