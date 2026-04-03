using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RessourceRelationnel.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTelephone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "telephone",
                table: "Utilisateur");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "telephone",
                table: "Utilisateur",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
