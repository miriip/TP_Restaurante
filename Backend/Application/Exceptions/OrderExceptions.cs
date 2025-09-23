using System;

namespace Application.Exceptions
{
    // Excepciones específicas para órdenes
    public class OrderNotFoundException : Exception
    {
        public OrderNotFoundException(long orderNumber) : base("Orden no encontrada") { }
        public OrderNotFoundException(string message) : base(message) { }
    }

    public class OrderItemNotFoundException : Exception
    {
        public OrderItemNotFoundException(long itemId) : base("Item no encontrado en la orden") { }
        public OrderItemNotFoundException(string message) : base(message) { }
    }

    public class InvalidOrderDataException : Exception
    {
        public InvalidOrderDataException(string message) : base(message) { }
    }

    public class InvalidOrderStatusException : Exception
    {
        public InvalidOrderStatusException(int status) : base("El estado especificado no es válido") { }
        public InvalidOrderStatusException(string message) : base(message) { }
    }

    public class InvalidOrderStatusTransitionException : Exception
    {
        public InvalidOrderStatusTransitionException(string fromStatus, string toStatus) 
            : base($"No se puede cambiar de '{fromStatus}' a '{toStatus}'") { }
        public InvalidOrderStatusTransitionException(string message) : base(message) { }
    }

    public class OrderInProgressException : Exception
    {
        public OrderInProgressException() : base("No se puede modificar una orden que ya está en preparación") { }
        public OrderInProgressException(string message) : base(message) { }
    }

    public class OrderClosedException : Exception
    {
        public OrderClosedException() : base("No se puede modificar una orden cerrada") { }
        public OrderClosedException(string message) : base(message) { }
    }

    public class InvalidOrderItemQuantityException : Exception
    {
        public InvalidOrderItemQuantityException() : base("La cantidad debe ser mayor a 0") { }
        public InvalidOrderItemQuantityException(string message) : base(message) { }
    }

    public class DishNotAvailableException : Exception
    {
        public DishNotAvailableException(Guid dishId) : base("El plato especificado no existe o no está disponible") { }
        public DishNotAvailableException(string message) : base(message) { }
    }

    public class InvalidDeliveryTypeException : Exception
    {
        public InvalidDeliveryTypeException(int deliveryTypeId) : base("Debe especificar un tipo de entrega válido") { }
        public InvalidDeliveryTypeException(string message) : base(message) { }
    }

    public class EmptyOrderItemsException : Exception
    {
        public EmptyOrderItemsException() : base("La orden debe contener al menos un item") { }
        public EmptyOrderItemsException(string message) : base(message) { }
    }

    public class InvalidOrderIdFormatException : Exception
    {
        public InvalidOrderIdFormatException() : base("Formato de ID de orden inválido") { }
        public InvalidOrderIdFormatException(string message) : base(message) { }
    }

    public class InvalidOrderItemIdFormatException : Exception
    {
        public InvalidOrderItemIdFormatException() : base("Formato de ID de item inválido") { }
        public InvalidOrderItemIdFormatException(string message) : base(message) { }
    }

    public class OrderCannotBeDeletedException : Exception
    {
        public OrderCannotBeDeletedException() : base("No se puede eliminar el plato porque está incluido en órdenes activas") { }
        public OrderCannotBeDeletedException(string message) : base(message) { }
    }

    public class InvalidDateRangeException : Exception
    {
        public InvalidDateRangeException() : base("Rango de fechas inválido") { }
        public InvalidDateRangeException(string message) : base(message) { }
    }

    public class InvalidSearchParametersException : Exception
    {
        public InvalidSearchParametersException() : base("Parámetros de búsqueda inválidos") { }
        public InvalidSearchParametersException(string message) : base(message) { }
    }

    public class InvalidOrderNumberFormatException : Exception
    {
        public InvalidOrderNumberFormatException() : base("Formato de número de orden inválido") { }
        public InvalidOrderNumberFormatException(string message) : base(message) { }
    }
}
