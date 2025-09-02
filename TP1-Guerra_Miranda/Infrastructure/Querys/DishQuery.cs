using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;
using Application.Interfaces.IDish;


namespace Infrastructure.Querys
{
    public class DishQuery:IDishQuery
    {
        private readonly AppDbContext _context;
        public DishQuery(AppDbContext context)
        {
            _context = context;
        }
        public async Task<List<Dish>> GetAllDishes()
        {
            return await _context.Dishes.ToListAsync();
        }
        public async Task<Dish?> GetDishById(Guid id)
        {
            return await _context.Dishes.FindAsync(id).AsTask();
        }

        public async Task<IReadOnlyList<Domain.Entities.Dish>> SearchAsync(string? name, int? categoryId, string? priceOrder)
        {
            var query = _context.Dishes.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(d => d.Name.Contains(name));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(d => d.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(priceOrder))
            {
                var normalized = priceOrder.Trim().ToUpperInvariant();
                if (normalized == "ASC")
                {
                    query = query.OrderBy(d => d.Price);
                }
                else if (normalized == "DESC")
                {
                    query = query.OrderByDescending(d => d.Price);
                }
            }

            return await query.ToListAsync();
        }
    }
}
