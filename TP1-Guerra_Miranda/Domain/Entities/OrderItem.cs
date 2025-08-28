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
        
        public int Quantity { get; set; }
        public string Notes { get; set; }
        public DateTime CreateDate { get; set; }

        public Guid DishId { get; set; } //FK
        public Dish Dish { get; set; }

        public long OrderId { get; set; }
        public Order Order { get; set; }

        public int StatusId { get; set; } //FK
        public Status Status { get; set; }


    }
}
