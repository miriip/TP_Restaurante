using System;

namespace Domain.Exceptions
{
    // Excepciones de REGLAS DE NEGOCIO del Dominio (no de validación de entrada)
    // Para futuro.

    public class InvalidOrderStatusTransitionException : Exception
    {
        public InvalidOrderStatusTransitionException(string fromStatus, string toStatus)
            : base($"Transición de estado inválida: '{fromStatus}' → '{toStatus}'") { }
    }

    public class EmptyOrderItemsNotAllowedException : Exception
    {
        public EmptyOrderItemsNotAllowedException() : base("No se puede confirmar una orden sin ítems") { }
    }
}


