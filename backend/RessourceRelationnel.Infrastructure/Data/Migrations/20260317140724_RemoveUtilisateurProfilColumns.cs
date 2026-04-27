using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RessourceRelationnel.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUtilisateurProfilColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                name: "date_naissance",
                table: "Utilisateur");

            migrationBuilder.DropColumn(
                name: "pays",
                table: "Utilisateur");

            migrationBuilder.DropColumn(
                name: "photo_url",
                table: "Utilisateur");

            migrationBuilder.DropColumn(
                name: "ville",
                table: "Utilisateur");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
                name: "date_naissance",
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
                name: "ville",
                table: "Utilisateur",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
