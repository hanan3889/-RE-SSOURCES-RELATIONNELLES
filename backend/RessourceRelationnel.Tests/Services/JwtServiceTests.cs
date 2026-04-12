using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Tests.Helpers;
using Xunit;

namespace RessourceRelationnel.Tests.Services;

/// <summary>
/// Tests unitaires pour JwtService
/// </summary>
public class JwtServiceTests
{
    // ─── Token généré n'est pas vide ─────────────────────────────────────────────
    [Fact]
    public void GenerateToken_ValidUser_ReturnsNonEmptyString()
    {
        var jwt = JwtTestHelper.CreateJwtService();
        var user = new Utilisateur
        {
            IdUtilisateur = 1,
            Nom = "Dupont",
            Prenom = "Alice",
            Email = "alice@example.com",
            Role = new Role { NomRole = "citoyen" }
        };

        var token = jwt.GenerateToken(user);

        Assert.NotEmpty(token);
    }

    // ─── Token contient les claims attendus ──────────────────────────────────────
    [Fact]
    public void GenerateToken_ContainsExpectedClaims()
    {
        var jwt = JwtTestHelper.CreateJwtService();
        var user = new Utilisateur
        {
            IdUtilisateur = 42,
            Nom = "Dupont",
            Prenom = "Alice",
            Email = "alice@example.com",
            Role = new Role { NomRole = "moderateur" }
        };

        var token = jwt.GenerateToken(user);
        var handler = new JwtSecurityTokenHandler();
        var parsed = handler.ReadJwtToken(token);

        Assert.Equal("42", parsed.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
        Assert.Equal("alice@example.com", parsed.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value);
        Assert.Equal("moderateur", parsed.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value);
    }

    // ─── Rôle null → "citoyen" par défaut ────────────────────────────────────────
    [Fact]
    public void GenerateToken_NullRole_DefaultsToCitoyen()
    {
        var jwt = JwtTestHelper.CreateJwtService();
        var user = new Utilisateur
        {
            IdUtilisateur = 1,
            Nom = "Test",
            Prenom = "User",
            Email = "test@example.com",
            Role = null
        };

        var token = jwt.GenerateToken(user);
        var handler = new JwtSecurityTokenHandler();
        var parsed = handler.ReadJwtToken(token);

        Assert.Equal("citoyen", parsed.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value);
    }

    // ─── Token valide syntaxiquement ─────────────────────────────────────────────
    [Fact]
    public void GenerateToken_IsValidJwtFormat()
    {
        var jwt = JwtTestHelper.CreateJwtService();
        var user = new Utilisateur
        {
            IdUtilisateur = 1,
            Nom = "Test",
            Prenom = "User",
            Email = "test@example.com",
            Role = new Role { NomRole = "citoyen" }
        };

        var token = jwt.GenerateToken(user);
        var handler = new JwtSecurityTokenHandler();

        Assert.True(handler.CanReadToken(token));
    }

    // ─── Token différent pour deux utilisateurs ──────────────────────────────────
    [Fact]
    public void GenerateToken_DifferentUsers_ReturnsDifferentTokens()
    {
        var jwt = JwtTestHelper.CreateJwtService();
        var u1 = new Utilisateur { IdUtilisateur = 1, Nom = "A", Prenom = "B", Email = "a@b.com", Role = new Role { NomRole = "citoyen" } };
        var u2 = new Utilisateur { IdUtilisateur = 2, Nom = "C", Prenom = "D", Email = "c@d.com", Role = new Role { NomRole = "citoyen" } };

        var t1 = jwt.GenerateToken(u1);
        var t2 = jwt.GenerateToken(u2);

        Assert.NotEqual(t1, t2);
    }
}
