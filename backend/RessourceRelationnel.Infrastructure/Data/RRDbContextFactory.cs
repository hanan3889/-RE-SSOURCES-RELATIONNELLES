using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace RessourceRelationnel.Infrastructure.Data;

public class RRDbContextFactory : IDesignTimeDbContextFactory<RRDbContext>
{
    public RRDbContext CreateDbContext(string[] args)
    {
        // En Docker, ConnectionStrings__Default est injecté via les variables d'environnement
        // En local, on utilise la valeur par défaut
        var cs = Environment.GetEnvironmentVariable("ConnectionStrings__Default")
                 ?? "Server=localhost;Port=3307;Database=rr;User=root;Password=root_pass;";

        var options = new DbContextOptionsBuilder<RRDbContext>()
            .UseMySql(cs, new MySqlServerVersion(new Version(8, 0, 0)),
                mySqlOpt => mySqlOpt.EnableRetryOnFailure(
                    maxRetryCount: 10,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorNumbersToAdd: null))
            .Options;

        return new RRDbContext(options);
    }
}
