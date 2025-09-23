using Application.Interfaces.IDish;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Infrastructure.Command
{
    public class DishCommand : IDishCommand
    {
        private readonly AppDbContext _context;
        
        public DishCommand(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Dish> CreateDish(Dish dish)
        {
            _context.Dishes.Add(dish);
            await _context.SaveChangesAsync();
            return dish;
        }

        public async Task<Dish> UpdateDish(Dish dish)
        {
            _context.Dishes.Update(dish);
            await _context.SaveChangesAsync();
            return dish;
        }

        public async Task<bool> DeleteDish(Guid id)
        {
            var dish = await _context.Dishes.FindAsync(id);
            if (dish == null)
                return false;
            
            _context.Dishes.Remove(dish);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
