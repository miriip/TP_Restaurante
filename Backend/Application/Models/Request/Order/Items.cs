using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Application.Models.Request.Order
{
    public class Items
    {
        [Required(ErrorMessage = "El ID del plato es requerido")]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "La cantidad es requerida")]
        [Range(1, 100, ErrorMessage = "La cantidad debe estar entre 1 y 100")]
        [JsonPropertyName("quantity")]
        public int Quantity { get; set; } = 1;

        public string? Notes { get; set; }
    }
}
