using Microsoft.Extensions.Configuration;
using RessourceRelationnel.Api.Services;

namespace RessourceRelationnel.Tests.Helpers;

public static class JwtTestHelper
{
    public static JwtService CreateJwtService()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "super-secret-key-for-tests-minimum-32-chars!!",
                ["Jwt:Issuer"] = "test-issuer",
                ["Jwt:Audience"] = "test-audience",
                ["Jwt:ExpirationHours"] = "24"
            })
            .Build();

        return new JwtService(config);
    }
}
