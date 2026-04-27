import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategorieService, Categorie, SaveCategorieDto } from './categorie.service';
import { environment } from 'src/environments/environment';

const mockCategorie: Categorie = { idCategorie: 1, nomCategorie: 'Couple' };

describe('CategorieService', () => {
  let service: CategorieService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/admin/categories`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategorieService],
    });
    service = TestBed.inject(CategorieService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // CT-ADM-001 — Lister les catégories
  it('getCategories() devrait retourner la liste des categories', () => {
    service.getCategories().subscribe((cats: Categorie[]) => {
      expect(cats.length).toBe(1);
      expect(cats[0].nomCategorie).toBe('Couple');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([mockCategorie]);
  });

  // CT-ADM-001 — Créer une catégorie
  it('createCategory() devrait envoyer POST et retourner la categorie creee', () => {
    const dto: SaveCategorieDto = { nomCategorie: 'Famille' };

    service.createCategory(dto).subscribe((cat: Categorie) => {
      expect(cat.nomCategorie).toBe('Couple');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockCategorie);
  });

  // CT-ADM-002 — Modifier une catégorie
  it('updateCategory() devrait envoyer PUT avec le bon id', () => {
    const dto: SaveCategorieDto = { nomCategorie: 'Couple modifie' };

    service.updateCategory(1, dto).subscribe((cat: Categorie) => {
      expect(cat.idCategorie).toBe(1);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockCategorie);
  });

  // CT-ADM-003 — Supprimer une catégorie
  it('deleteCategory() devrait envoyer DELETE avec le bon id', () => {
    service.deleteCategory(1).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getCategories() devrait retourner une liste vide si API retourne []', () => {
    service.getCategories().subscribe((cats: Categorie[]) => {
      expect(cats.length).toBe(0);
    });

    const req = httpMock.expectOne(apiUrl);
    req.flush([]);
  });
});
