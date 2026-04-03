using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RessourceRelationnel.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMotifsRefus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "motifs_refus",
                table: "Ressource");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "motifs_refus",
                table: "Ressource",
                type: "varchar(1000)",
                maxLength: 1000,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
