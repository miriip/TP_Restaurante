using System;

namespace Application.Exceptions
{
    // NotFound / Conflict / Validation exceptions (flujo/casos de uso)
    public class DishNotFoundException : Exception
    {
        public DishNotFoundException(string message) : base(message) { }
        public DishNotFoundException(Guid id) : base("Plato no encontrado") { }
    }

    public class DishNameAlreadyExistsException : Exception
    {
        public DishNameAlreadyExistsException(string name) : base("Ya existe un plato con ese nombre") { }
    }

    public class InvalidDishDataException : Exception
    {
        public InvalidDishDataException(string message) : base(message) { }
    }

    public class CategoryNotFoundException : Exception
    {
        public CategoryNotFoundException(int categoryId) : base($"Categoría con ID {categoryId} no encontrada") { }
    }

    public class CategoryNameNotFoundException : Exception
    {
        public CategoryNameNotFoundException(string categoryName) : base($"No existe una categoría con el nombre '{categoryName}'") { }
    }

    public class InvalidPriceException : Exception
    {
        public InvalidPriceException() : base("El precio debe ser mayor a cero") { }
    }

    public class InvalidSortOrderException : Exception
    {
        public InvalidSortOrderException() : base("Parámetros de ordenamiento inválidos") { }
    }

    public class InvalidDishNameException : Exception
    {
        public InvalidDishNameException(string name) : base($"El nombre del plato '{name}' no puede estar vacío o contener solo espacios") { }
    }

    public class InvalidDishDescriptionException : Exception
    {
        public InvalidDishDescriptionException() : base("La descripción del plato no puede exceder los 500 caracteres") { }
    }

    public class InvalidImageUrlException : Exception
    {
        public InvalidImageUrlException(string url) : base($"La URL de imagen '{url}' no tiene un formato válido") { }
    }

    public class DishNameTooLongException : Exception
    {
        public DishNameTooLongException(string name) : base($"El nombre del plato '{name}' excede el límite de 100 caracteres") { }
    }

    public class InvalidCategoryIdException : Exception
    {
        public InvalidCategoryIdException(int categoryId) : base($"El ID de categoría {categoryId} debe ser un número positivo") { }
    }

    public class NoDishesFoundException : Exception
    {
        public NoDishesFoundException(string searchTerm) : base($"No se encontraron platos que coincidan con '{searchTerm}'") { }
    }

    public class NoDishesInCategoryException : Exception
    {
        public NoDishesInCategoryException(int categoryId) : base($"No se encontraron platos en la categoría con ID {categoryId}") { }
    }

    public class NoDishesInCategoryByNameException : Exception
    {
        public NoDishesInCategoryByNameException(string categoryName) : base($"No se encontraron platos en la categoría '{categoryName}'") { }
    }

    public class InvalidDishIdFormatException : Exception
    {
        public InvalidDishIdFormatException() : base("Formato de ID inválido") { }
    }

    public class DishHasDependenciesException : Exception
    {
        public DishHasDependenciesException() : base("No se puede eliminar el plato porque tiene dependencias que impiden su eliminación") { }
        public DishHasDependenciesException(string message) : base(message) { }
    }
}


