using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RessourceRelationnel.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFavoris : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "favori",
                columns: table => new
                {
                    IdUtilisateur = table.Column<long>(type: "bigint", nullable: false),
                    IdRessource = table.Column<long>(type: "bigint", nullable: false),
                    date_ajout = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_favori", x => new { x.IdUtilisateur, x.IdRessource });
                    table.ForeignKey(
                        name: "FK_favori_Ressource_IdRessource",
                        column: x => x.IdRessource,
                        principalTable: "Ressource",
                        principalColumn: "IdRessource",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_favori_Utilisateur_IdUtilisateur",
                        column: x => x.IdUtilisateur,
                        principalTable: "Utilisateur",
                        principalColumn: "IdUtilisateur",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_favori_IdRessource",
                table: "favori",
                column: "IdRessource");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "favori");
        }
    }
}
