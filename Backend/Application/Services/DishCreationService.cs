using Application.Interfaces.IDish;
using Application.Models.Request;
using Application.Models.Response;
using Domain.Entities;
using Domain.Exceptions;
using System;
using System.Linq;

namespace Application.Services
{
    public class DishCreationService
    {
        private readonly IDishCommand _dishCommand;
        private readonly IDishQuery _dishQuery;

        public DishCreationService(IDishCommand command, IDishQuery query)
        {
            _dishCommand = command;
            _dishQuery = query;
        }

        public async Task<DishResponse> CreateDish(DishRequest dishRequest)
        {
            // Validar que no exista un plato con el mismo nombre
            var existingDish = await _dishQuery.GetDishByName(dishRequest.Name);
            if (existingDish != null)
            {
                throw new DishNameAlreadyExistsException(dishRequest.Name);
            }

            // Validar que la categoría exista
            var category = await _dishQuery.GetCategoryById(dishRequest.Category);
            if (category == null)
            {
                throw new CategoryNotFoundException(dishRequest.Category);
            }

            var dish = new Dish
            {
                DishId = Guid.NewGuid(),
                Name = dishRequest.Name,
                Description = dishRequest.Description,
                Price = dishRequest.Price,
                Available = true, // Por defecto activo
                ImageUrl = dishRequest.Image,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                Category = dishRequest.Category
            };

            await _dishCommand.InsertDish(dish);

            return new DishResponse
            {
                Id = dish.DishId,
                Name = dish.Name,
                Description = dish.Description,
                Price = dish.Price,
                Category = new GenericResponse { Id = category.Id, Name = category.Name },
                Image = dish.ImageUrl,
                IsActive = dish.Available,
                CreatedAt = dish.CreateDate,
                UpdatedAt = dish.UpdateDate
            };
        }
    }
}
