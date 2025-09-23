using System.ComponentModel.DataAnnotations;

namespace Application.Models.Request.Order
{
    public class OrderItemUpdateRequest
    {
        [Required(ErrorMessage = "El estado es requerido")]
        [Range(1, 5, ErrorMessage = "El estado debe estar entre 1 y 5")]
        public int Status { get; set; }
    }
}
