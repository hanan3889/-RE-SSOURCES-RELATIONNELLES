using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RessourceRelationnel.Domain.DTOs.CategorieDto;
using RessourceRelationnel.Domain.Models;
using RessourceRelationnel.Infrastructure.Data;

namespace RessourceRelationnel.Api.Controllers;

[ApiController]
[Route("api/admin/categories")]
[Authorize(Roles = "administrateur,super_administrateur")]
public class CategoriesController : ControllerBase
{
    private readonly RRDbContext _context;

    public CategoriesController(RRDbContext context)
    {
        _context = context;
    }

    // GET /api/admin/categories
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _context.Categories
            .Select(c => new CategorieDto { IdCategorie = c.IdCategorie, NomCategorie = c.NomCategorie })
            .ToListAsync();

        return Ok(categories);
    }

    // POST /api/admin/categories
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategorieDto dto)
    {
        var categorie = new Categorie { NomCategorie = dto.NomCategorie };
        _context.Categories.Add(categorie);
        await _context.SaveChangesAsync();

        return Created("", new CategorieDto { IdCategorie = categorie.IdCategorie, NomCategorie = categorie.NomCategorie });
    }

    // PUT /api/admin/categories/{id}
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] CreateCategorieDto dto)
    {
        var categorie = await _context.Categories.FindAsync(id);
        if (categorie == null) return NotFound();

        categorie.NomCategorie = dto.NomCategorie;
        await _context.SaveChangesAsync();

        return Ok(new CategorieDto { IdCategorie = categorie.IdCategorie, NomCategorie = categorie.NomCategorie });
    }

    // DELETE /api/admin/categories/{id}
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        var categorie = await _context.Categories.FindAsync(id);
        if (categorie == null) return NotFound();

        _context.Categories.Remove(categorie);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
