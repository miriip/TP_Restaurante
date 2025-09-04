using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Domain.Entities
{
    public class OrderItem
    {
        public long OrderItemId { get; set; }

        public long Order { get; set; } //FK
        public Order? OrderRef { get; set; }

        public int Quantity { get; set; }
        public string? Notes { get; set; }

        public Guid Dish { get; set; } //FK
        public Dish? DishRef { get; set; }

        public int Status { get; set; } //FK
        public Status? StatusRef { get; set; }

        public DateTime CreateDate { get; set; }


    }
}
