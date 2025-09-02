using Application.Interfaces.IDish;
using Application.Models.Request;
using Application.Models.Response;
using Domain.Entities;
using Domain.Exceptions;


namespace Application.Services
{
    public class DishService : IDishService
    {
        private readonly IDishCommand _dishcommand;
        private readonly IDishQuery _dishquery;

        public DishService(IDishCommand command, IDishQuery query)
        {
            _dishcommand = command;
            _dishquery = query;
        }

        public async Task<DishResponse> CreateDish(DishRequest dishRequest)
        {
            // Validar que no exista un plato con el mismo nombre
            var existingDish = await _dishquery.GetDishByName(dishRequest.Name);
            if (existingDish != null)
            {
                throw new DishNameAlreadyExistsException(dishRequest.Name);
            }

            // Validar que la categoría exista
            var category = await _dishquery.GetCategoryById(dishRequest.Category);
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
                CategoryId = dishRequest.Category
            };

            await _dishcommand.InsertDish(dish);

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

        public async Task<IEnumerable<DishResponse>> SearchAsync(string? name, int? category, string? sortByPrice)
        {
            if (!string.IsNullOrWhiteSpace(sortByPrice))
            {
                var normalized = sortByPrice.Trim().ToLowerInvariant();
                if (normalized != "asc" && normalized != "desc")
                {
                    throw new InvalidSortOrderException();
                }
            }

            var list = await _dishquery.GetAllAsync(name, category, sortByPrice);


            // Las excepciones se manejarán en el controlador después de aplicar filtros
            return list.Select(dish => new DishResponse
            {
                Id = dish.DishId,
                Name = dish.Name,
                Description = dish.Description,
                Price = dish.Price,
                Category = new GenericResponse { Id = dish.CategoryId, Name = dish.Category?.Name },
                Image = dish.ImageUrl,
                IsActive = dish.Available,
                CreatedAt = dish.CreateDate,
                UpdatedAt = dish.UpdateDate
            }).ToList();
        }

        public async Task<DishResponse> UpdateDish(Guid id, DishUpdateRequest dishUpdateRequest)
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

            var existingDish = await _dishquery.GetDishById(id);
            if (existingDish == null)
            {
                throw new DishNotFoundException(id);
            }

            // Validar que no exista otro plato con el mismo nombre (excluyendo el actual)
            var dishWithSameName = await _dishquery.GetDishByName(dishUpdateRequest.Name);
            if (dishWithSameName != null && dishWithSameName.DishId != id)
            {
                throw new DishNameAlreadyExistsException(dishUpdateRequest.Name);
            }

            // Validar que la categoría exista
            var category = await _dishquery.GetCategoryById(dishUpdateRequest.Category);
            if (category == null)
            {
                throw new CategoryNotFoundException(dishUpdateRequest.Category);
            }

            existingDish.Name = dishUpdateRequest.Name.Trim();
            existingDish.Description = dishUpdateRequest.Description?.Trim();
            existingDish.Price = dishUpdateRequest.Price;
            existingDish.ImageUrl = dishUpdateRequest.Image;
            existingDish.CategoryId = dishUpdateRequest.Category;
            existingDish.Available = dishUpdateRequest.IsActive;
            existingDish.UpdateDate = DateTime.UtcNow;

            await _dishcommand.UpdateDish(existingDish);

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

