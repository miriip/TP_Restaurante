using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TerceraMigracion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderItem_Dish_DishId",
                table: "OrderItem");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItem_Dish_DishId",
                table: "OrderItem",
                column: "DishId",
                principalTable: "Dish",
                principalColumn: "DishId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderItem_Dish_DishId",
                table: "OrderItem");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItem_Dish_DishId",
                table: "OrderItem",
                column: "DishId",
                principalTable: "Dish",
                principalColumn: "DishId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
