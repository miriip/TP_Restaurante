using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Application.Models.Request.Dish
{
    public class DishRequest
    {
        [Required(ErrorMessage = "El nombre del plato es obligatorio")]
        [MaxLength(100, ErrorMessage = "El nombre no puede exceder los 100 caracteres")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500, ErrorMessage = "La descripción no puede exceder los 500 caracteres")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "El precio es obligatorio")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a cero")]
        public decimal Price { get; set; }
        
        [Required(ErrorMessage = "La categoría es obligatoria")]
        public int Category { get; set; }
        public string? Image { get; set; }
    }
}
