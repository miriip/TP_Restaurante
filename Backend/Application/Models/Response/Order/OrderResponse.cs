using Application.Models.Response.Dish;

namespace Application.Models.Response.Order
{
    public class OrderCreateResponse
    {
        public long OrderNumber { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class OrderUpdateResponse
    {
        public long OrderNumber { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime UpdateAt { get; set; }
    }

    public class OrderDetailsResponse
    {
        public long OrderNumber { get; set; }
        public decimal TotalAmount { get; set; }
        public string? DeliveryTo { get; set; }
        public string? Notes { get; set; }
        public GenericResponse Status { get; set; } = new GenericResponse();
        public GenericResponse DeliveryType { get; set; } = new GenericResponse();
        public List<OrderItemResponse> Items { get; set; } = new List<OrderItemResponse>();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class OrderItemResponse
    {
        public long Id { get; set; }
        public int Quantity { get; set; }
        public string? Notes { get; set; }
        public GenericResponse Status { get; set; } = new GenericResponse();
        public DishShortResponse Dish { get; set; } = new DishShortResponse();
    }
}
