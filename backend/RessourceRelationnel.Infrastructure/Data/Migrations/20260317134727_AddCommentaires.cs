using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RessourceRelationnel.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCommentaires : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "commentaire",
                columns: table => new
                {
                    IdCommentaire = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    contenu = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    date_creation = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    id_utilisateur = table.Column<long>(type: "bigint", nullable: false),
                    id_ressource = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_commentaire", x => x.IdCommentaire);
                    table.ForeignKey(
                        name: "FK_commentaire_Ressource_id_ressource",
                        column: x => x.id_ressource,
                        principalTable: "Ressource",
                        principalColumn: "IdRessource",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_commentaire_Utilisateur_id_utilisateur",
                        column: x => x.id_utilisateur,
                        principalTable: "Utilisateur",
                        principalColumn: "IdUtilisateur",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_commentaire_id_ressource",
                table: "commentaire",
                column: "id_ressource");

            migrationBuilder.CreateIndex(
                name: "IX_commentaire_id_utilisateur",
                table: "commentaire",
                column: "id_utilisateur");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "commentaire");
        }
    }
}
