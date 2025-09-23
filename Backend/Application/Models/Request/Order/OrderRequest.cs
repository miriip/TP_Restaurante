using System.ComponentModel.DataAnnotations;

namespace Application.Models.Request.Order
{
    public class OrderRequest
    {
        [Required(ErrorMessage = "Los items de la orden son requeridos")]
        public List<Items> Items { get; set; } = new List<Items>();

        [Required(ErrorMessage = "La información de entrega es requerida")]
        public Delivery Delivery { get; set; } = new Delivery();

        public string? Notes { get; set; }
    }
}
