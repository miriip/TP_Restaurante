using System.ComponentModel.DataAnnotations;

namespace Application.Models.Request.Order
{
    public class OrderUpdateRequest
    {
        [Required(ErrorMessage = "Los items de la orden son requeridos")]
        public List<Items> Items { get; set; } = new List<Items>();
    }
}
