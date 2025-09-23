using System.ComponentModel.DataAnnotations;

namespace Application.Models.Request.Order
{
    public class Delivery
    {
        [Required(ErrorMessage = "El tipo de entrega es requerido")]
        public int Id { get; set; }

        public string? To { get; set; }
    }
}
