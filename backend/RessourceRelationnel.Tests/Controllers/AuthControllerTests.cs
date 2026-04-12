using Microsoft.AspNetCore.Mvc;
using RessourceRelationnel.Api.Controllers;
using RessourceRelationnel.Domain.DTOs.AuthDto;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Tests.Helpers;
using Xunit;

namespace RessourceRelationnel.Tests.Controllers;

/// <summary>
/// Tests pour AuthController
/// CT-AUTH-001 à CT-AUTH-011
/// </summary>
public class AuthControllerTests
{
    // ─── CT-AUTH-001 ────────────────────────────────────────────────────────────
    [Fact]
    public async Task Register_WithValidData_ReturnsCreated()
    {
        using var context = TestDbContextFactory.Create(nameof(Register_WithValidData_ReturnsCreated));
        TestDbContextFactory.SeedRoles(context);
        var jwt = JwtTestHelper.CreateJwtService();
        var controller = new AuthController(context, jwt);

        var dto = new RegisterDto { Nom = "Dupont", Prenom = "Alice", Email = "alice@example.com", Password = "Password@123" };
        var result = await controller.Register(dto);

        var created = Assert.IsType<CreatedResult>(result);
        var response = Assert.IsType<AuthResponseDto>(created.Value);
        Assert.Equal("alice@example.com", response.Email);
        Assert.Equal("citoyen", response.Role);
        Assert.NotEmpty(response.Token);
    }

    // ─── CT-AUTH-002 ────────────────────────────────────────────────────────────
    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsConflict()
    {
        using var context = TestDbContextFactory.Create(nameof(Register_WithDuplicateEmail_ReturnsConflict));
        TestDbContextFactory.SeedRoles(context);
        TestDbContextFactory.CreateUtilisateur(context, email: "alice@example.com");
        var jwt = JwtTestHelper.CreateJwtService();
        var controller = new AuthController(context, jwt);

        var dto = new RegisterDto { Nom = "Dupont", Prenom = "Alice", Email = "alice@example.com", Password = "Password@123" };
        var result = await controller.Register(dto);

        Assert.IsType<ConflictObjectResult>(result);
    }

    // ─── CT-AUTH-003 — Inscription avec données multiples simultanées ─────────────
    [Fact]
    public async Task Register_WithSeedDataPresent_RoleIsAssignedToCitoyen()
    {
        // EF Core InMemory applique HasData automatiquement : le rôle citoyen (id=1) est toujours seedé
        using var context = TestDbContextFactory.Create(nameof(Register_WithSeedDataPresent_RoleIsAssignedToCitoyen));
        var jwt = JwtTestHelper.CreateJwtService();
        var controller = new AuthController(context, jwt);

        var dto = new RegisterDto { Nom = "Martin", Prenom = "Bob", Email = "bob@example.com", Password = "Password@123" };
        var result = await controller.Register(dto);

        var created = Assert.IsType<CreatedResult>(result);
        var response = Assert.IsType<AuthResponseDto>(created.Value);
        Assert.Equal("citoyen", response.Role);
        // Vérifier que l'utilisateur est bien en base
        Assert.True(context.Utilisateurs.Any(u => u.Email == "bob@example.com"));
    }

    // ─── CT-AUTH-010 ────────────────────────────────────────────────────────────
    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOkWithToken()
    {
        using var context = TestDbContextFactory.Create(nameof(Login_WithValidCredentials_ReturnsOkWithToken));
        TestDbContextFactory.SeedRoles(context);
        TestDbContextFactory.CreateUtilisateur(context, email: "alice@example.com");
        var jwt = JwtTestHelper.CreateJwtService();
        var controller = new AuthController(context, jwt);

        var dto = new LoginDto { Email = "alice@example.com", Password = "Password@123" };
        var result = await controller.Login(dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<AuthResponseDto>(ok.Value);
        Assert.NotEmpty(response.Token);
        Assert.Equal("alice@example.com", response.Email);
    }

    // ─── CT-AUTH-011 — mot de passe incorrect ───────────────────────────────────
    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorized()
    {
        using var context = TestDbContextFactory.Create(nameof(Login_WithWrongPassword_ReturnsUnauthorized));
        TestDbContextFactory.SeedRoles(context);
        TestDbContextFactory.CreateUtilisateur(context, email: "alice@example.com");
        var jwt = JwtTestHelper.CreateJwtService();
        var controller = new AuthController(context, jwt);

        var dto = new LoginDto { Email = "alice@example.com", Password = "WrongPassword" };
        var result = await controller.Login(dto);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    // ─── CT-AUTH-011b — email inexistant ────────────────────────────────────────
    [Fact]
    public async Task Login_WithUnknownEmail_ReturnsUnauthorized()
    {
        using var context = TestDbContextFactory.Create(nameof(Login_WithUnknownEmail_ReturnsUnauthorized));
        TestDbContextFactory.SeedRoles(context);
        var jwt = JwtTestHelper.CreateJwtService();
        var controller = new AuthController(context, jwt);

        var dto = new LoginDto { Email = "nobody@example.com", Password = "Password@123" };
        var result = await controller.Login(dto);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    // ─── Compte désactivé ───────────────────────────────────────────────────────
    [Fact]
    public async Task Login_WithDisabledAccount_ReturnsUnauthorized()
    {
        using var context = TestDbContextFactory.Create(nameof(Login_WithDisabledAccount_ReturnsUnauthorized));
        TestDbContextFactory.SeedRoles(context);
        TestDbContextFactory.CreateUtilisateur(context, email: "disabled@example.com", isActive: false);
        var jwt = JwtTestHelper.CreateJwtService();
        var controller = new AuthController(context, jwt);

        var dto = new LoginDto { Email = "disabled@example.com", Password = "Password@123" };
        var result = await controller.Login(dto);

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        dynamic? value = unauthorized.Value;
        Assert.NotNull(value);
    }

    // ─── Connexion met à jour LastLoginAt ───────────────────────────────────────
    [Fact]
    public async Task Login_ValidCredentials_UpdatesLastLoginAt()
    {
        using var context = TestDbContextFactory.Create(nameof(Login_ValidCredentials_UpdatesLastLoginAt));
        TestDbContextFactory.SeedRoles(context);
        var user = TestDbContextFactory.CreateUtilisateur(context, email: "alice@example.com");
        Assert.Null(user.LastLoginAt);
        var jwt = JwtTestHelper.CreateJwtService();
        var controller = new AuthController(context, jwt);

        await controller.Login(new LoginDto { Email = "alice@example.com", Password = "Password@123" });

        var updated = context.Utilisateurs.First(u => u.Email == "alice@example.com");
        Assert.NotNull(updated.LastLoginAt);
    }
}
