using Application.Interfaces.IDish;
using Application.Models.Request;
using Application.Models.Response;
using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;



namespace Infrastructure.Querys
{
    public class DishQuery : IDishQuery
    {
        private readonly AppDbContext _context;
        public DishQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Dish>> GetAllAsync(string? name = null, int? category = null, string? sortByPrice = null)
        {
            var query = _context.Dishes
                .Include(d => d.CategoryRef)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(d => d.Name.Contains(name));
            }

            if (category.HasValue)
            {
                query = query.Where(d => d.Category == category.Value);
            }

            if (!string.IsNullOrWhiteSpace(sortByPrice))
            {
                var normalized = sortByPrice.Trim().ToLowerInvariant();
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
            return await _context.Dishes
                .Include(d => d.Category)
                .FirstOrDefaultAsync(d => d.DishId == id);
        }

        public async Task<Dish?> GetDishByName(string name)
        {
            return await _context.Dishes
                .Include(d => d.CategoryRef)
                .FirstOrDefaultAsync(d => d.Name == name);
        }

        public async Task<Category?> GetCategoryById(int categoryId)
        {
            return await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == categoryId);
        }
    }
}
