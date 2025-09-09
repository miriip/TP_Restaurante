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
    public class DishQuery : IDishQuery
    {
        private readonly AppDbContext _context;
        public DishQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Dish>> GetAllAsync(string? name = null, int? categoryId = null, string? priceOrder = null)
        {
            var query = _context.Dishes
                .Include(d => d.CategoryRef)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(d => d.Name.Contains(name));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(d => d.Category == categoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(priceOrder))
            {
                var normalized = priceOrder.Trim().ToLowerInvariant();
                if (normalized == "asc")
                {
                    query = query.OrderBy(d => d.Price);
                }
                else if (normalized == "desc")
                {
                    query = query.OrderByDescending(d => d.Price);
                }
            }

            return await query.ToListAsync();
        }

        public async Task<Dish?> GetDishById(Guid id)
        {
            var dish = await _context.Dishes
                .FirstOrDefaultAsync(d => d.DishId == id);

            if (dish != null)
            {
                // Cargar la categoría por separado
                dish.CategoryRef = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == dish.Category);
            }

            return dish;
        }

        public async Task<Dish?> GetDishByName(string name)
        {
            var dish = await _context.Dishes
                .FirstOrDefaultAsync(d => d.Name == name);

            if (dish != null)
            {
                // Cargar la categoría por separado
                dish.CategoryRef = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == dish.Category);
            }

            return dish;
        }

        public async Task<Category?> GetCategoryById(int categoryId)
        {
            return await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == categoryId);
        }
    }
}

