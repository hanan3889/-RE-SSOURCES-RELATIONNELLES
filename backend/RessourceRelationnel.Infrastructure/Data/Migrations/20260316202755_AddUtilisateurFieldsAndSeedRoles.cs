using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace RessourceRelationnel.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUtilisateurFieldsAndSeedRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "adresse",
                table: "Utilisateur",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "bio",
                table: "Utilisateur",
                type: "varchar(1000)",
                maxLength: 1000,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "code_postal",
                table: "Utilisateur",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "Utilisateur",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "date_naissance",
                table: "Utilisateur",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "Utilisateur",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_email_verified",
                table: "Utilisateur",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_login_at",
                table: "Utilisateur",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "pays",
                table: "Utilisateur",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "photo_url",
                table: "Utilisateur",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "telephone",
                table: "Utilisateur",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "Utilisateur",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "ville",
                table: "Utilisateur",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "format",
                table: "Ressource",
                type: "varchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "Ressource",
                type: "varchar(2000)",
                maxLength: 2000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "date_creation",
                table: "Ressource",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "motifs_refus",
                table: "Ressource",
                type: "varchar(1000)",
                maxLength: 1000,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "statut",
                table: "Ressource",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "visibilite",
                table: "Ressource",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "contenu",
                table: "Message",
                type: "varchar(2000)",
                maxLength: 2000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "role",
                columns: new[] { "IdRole", "nom_role" },
                values: new object[,]
                {
                    { 1L, "citoyen" },
                    { 2L, "moderateur" },
                    { 3L, "administrateur" },
                    { 4L, "super_administrateur" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "role",
                keyColumn: "IdRole",
                keyValue: 1L);

            migrationBuilder.DeleteData(
                table: "role",
                keyColumn: "IdRole",
                keyValue: 2L);

            migrationBuilder.DeleteData(
                table: "role",
                keyColumn: "IdRole",
                keyValue: 3L);

            migrationBuilder.DeleteData(
                table: "role",
                keyColumn: "IdRole",
                keyValue: 4L);

            migrationBuilder.DropColumn(
                name: "adresse",
                table: "Utilisateur");

            migrationBuilder.DropColumn(
                name: "bio",
                table: "Utilisateur");

            migrationBuilder.DropColumn(
                name: "code_postal",
                table: "Utilisateur");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "Utilisateur");

            migrationBuilder.DropColumn(
                name: "date_naissance",
                table: "Utilisateur");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "Utilisateur");

            migrationBuilder.DropColumn(
                name: "is_email_verified",
                table: "Utilisateur");

            migrationBuilder.DropColumn(
                name: "last_login_at",
                table: "Utilisateur");

            migrationBuilder.DropColumn(
                name: "pays",
                table: "Utilisateur");

            migrationBuilder.DropColumn(
                name: "photo_url",
                table: "Utilisateur");

            migrationBuilder.DropColumn(
                name: "telephone",
                table: "Utilisateur");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "Utilisateur");

            migrationBuilder.DropColumn(
                name: "ville",
                table: "Utilisateur");

            migrationBuilder.DropColumn(
                name: "date_creation",
                table: "Ressource");

            migrationBuilder.DropColumn(
                name: "motifs_refus",
                table: "Ressource");

            migrationBuilder.DropColumn(
                name: "statut",
                table: "Ressource");

            migrationBuilder.DropColumn(
                name: "visibilite",
                table: "Ressource");

            migrationBuilder.AlterColumn<string>(
                name: "format",
                table: "Ressource",
                type: "varchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 100)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "Ressource",
                type: "varchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(2000)",
                oldMaxLength: 2000)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "contenu",
                table: "Message",
                type: "varchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(2000)",
                oldMaxLength: 2000)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }
    }
}
