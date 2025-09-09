using Application.Exceptions;
using Application.Interfaces.IDish;
using Application.Models.Request;
using Application.Models.Response;
using System;

namespace Application.Services.DishServices
{
    public class DishUpdateService : IUpdateDishService
    {
        private readonly IDishCommand _dishCommand;
        private readonly IDishQuery _dishQuery;

        public DishUpdateService(IDishCommand command, IDishQuery query)
        {
            _dishCommand = command;
            _dishQuery = query;
        }

        public async Task<DishResponse> UpdateDish(Guid id, UpdateDishRequest dishUpdateRequest)
        {
            // Validar que el nombre no esté vacío o contenga solo espacios
            if (string.IsNullOrWhiteSpace(dishUpdateRequest.Name))
            {
                throw new InvalidDishNameException(dishUpdateRequest.Name ?? "");
            }

            // Validar que el nombre no exceda el límite
            if (dishUpdateRequest.Name.Length > 100)
            {
                throw new DishNameTooLongException(dishUpdateRequest.Name);
            }

            // Validar que la descripción no exceda el límite
            if (!string.IsNullOrEmpty(dishUpdateRequest.Description) && dishUpdateRequest.Description.Length > 500)
            {
                throw new InvalidDishDescriptionException();
            }

            // Validar que el precio sea mayor a cero
            if (dishUpdateRequest.Price <= 0)
            {
                throw new InvalidPriceException();
            }

            // Validar que el ID de categoría sea positivo
            if (dishUpdateRequest.Category <= 0)
            {
                throw new InvalidCategoryIdException(dishUpdateRequest.Category);
            }

            var existingDish = await _dishQuery.GetDishById(id);
            if (existingDish == null)
            {
                throw new DishNotFoundException(id);
            }

            // Validar que no exista otro plato con el mismo nombre (excluyendo el actual)
            var dishWithSameName = await _dishQuery.GetDishByName(dishUpdateRequest.Name);
            if (dishWithSameName != null && dishWithSameName.DishId != id)
            {
                throw new DishNameAlreadyExistsException(dishUpdateRequest.Name);
            }

            // Validar que la categoría exista
            var category = await _dishQuery.GetCategoryById(dishUpdateRequest.Category);
            if (category == null)
            {
                throw new CategoryNotFoundException(dishUpdateRequest.Category);
            }

            existingDish.Name = dishUpdateRequest.Name.Trim();
            existingDish.Description = dishUpdateRequest.Description?.Trim();
            existingDish.Price = dishUpdateRequest.Price;
            existingDish.ImageUrl = dishUpdateRequest.Image;
            existingDish.Category = dishUpdateRequest.Category;
            existingDish.Available = dishUpdateRequest.IsActive;
            existingDish.UpdateDate = DateTime.UtcNow;

            await _dishCommand.UpdateDish(existingDish);

            return new DishResponse
            {
                Id = existingDish.DishId,
                Name = existingDish.Name,
                Description = existingDish.Description,
                Price = existingDish.Price,
                Category = new GenericResponse { Id = category.Id, Name = category.Name },
                Image = existingDish.ImageUrl,
                IsActive = existingDish.Available,
                CreatedAt = existingDish.CreateDate,
                UpdatedAt = existingDish.UpdateDate
            };
        }
    }

}
