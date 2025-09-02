using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Application.Interfaces.IDish
{
    public interface IDishCommand
    {
        Task InsertDish(Dish dish);
        Task UpdateDish(Dish dish);
        Task RemoveDish(Dish dish);
    }
}
