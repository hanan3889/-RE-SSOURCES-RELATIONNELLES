using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RessourceRelationnel.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddInvitationsAndResourceDiscussion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "id_destinataire",
                table: "Message",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "id_ressource",
                table: "Message",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "statut_invitation",
                table: "Message",
                type: "varchar(30)",
                maxLength: 30,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "type_message",
                table: "Message",
                type: "varchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "direct")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Message_id_destinataire",
                table: "Message",
                column: "id_destinataire");

            migrationBuilder.CreateIndex(
                name: "IX_Message_id_ressource",
                table: "Message",
                column: "id_ressource");

            migrationBuilder.AddForeignKey(
                name: "FK_Message_Ressource_id_ressource",
                table: "Message",
                column: "id_ressource",
                principalTable: "Ressource",
                principalColumn: "IdRessource",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Message_Utilisateur_id_destinataire",
                table: "Message",
                column: "id_destinataire",
                principalTable: "Utilisateur",
                principalColumn: "IdUtilisateur",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Message_Ressource_id_ressource",
                table: "Message");

            migrationBuilder.DropForeignKey(
                name: "FK_Message_Utilisateur_id_destinataire",
                table: "Message");

            migrationBuilder.DropIndex(
                name: "IX_Message_id_destinataire",
                table: "Message");

            migrationBuilder.DropIndex(
                name: "IX_Message_id_ressource",
                table: "Message");

            migrationBuilder.DropColumn(
                name: "id_destinataire",
                table: "Message");

            migrationBuilder.DropColumn(
                name: "id_ressource",
                table: "Message");

            migrationBuilder.DropColumn(
                name: "statut_invitation",
                table: "Message");

            migrationBuilder.DropColumn(
                name: "type_message",
                table: "Message");
        }
    }
}
