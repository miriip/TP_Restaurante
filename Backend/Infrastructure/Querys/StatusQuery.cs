using Application.Interfaces.IStatus;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Querys
{
    public class StatusQuery : IStatusQuery
    {
        private readonly AppDbContext _context;

        public StatusQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Status?> GetStatusByIdAsync(int statusId)
        {
            return await _context.Statuses.FindAsync(statusId);
        }

        public async Task<Status?> GetStatusByNameAsync(string name)
        {
            return await _context.Statuses
                .FirstOrDefaultAsync(s => s.Name == name);
        }

        public async Task<List<Status>> GetAllStatusesAsync()
        {
            return await _context.Statuses
                .OrderBy(s => s.Id)
                .ToListAsync();
        }
    }
}
