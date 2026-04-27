import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RessourceService, Ressource } from './ressource.service';
import { environment } from 'src/environments/environment';

const mockApiRessource = {
  idRessource: 1,
  titre: 'Guide communication couple',
  description: 'Apprendre a communiquer',
  format: 'article',
  visibilite: 'Publique',
  statut: 'Publiee',
  dateCreation: '2026-01-01T00:00:00Z',
  idUtilisateur: 42,
  nomAuteur: 'Dupont',
  prenomAuteur: 'Alice',
  idCategorie: 3,
  nomCategorie: 'Couple',
};

describe('RessourceService', () => {
  let service: RessourceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RessourceService],
    });

    service = TestBed.inject(RessourceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // CT-RES-001 — Lister les ressources publiques
  it('getRessources() devrait retourner une liste de ressources mappees', () => {
    service.getRessources().subscribe((ressources: Ressource[]) => {
      expect(ressources.length).toBe(1);
      expect(ressources[0].title).toBe('Guide communication couple');
      expect(ressources[0].author).toBe('Alice Dupont');
      expect(ressources[0].category).toBe('Couple');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ressources`);
    expect(req.request.method).toBe('GET');
    req.flush([mockApiRessource]);
  });

  it('getRessources() devrait mapper le statut "Publiee" -> "Publi\u00e9e"', () => {
    service.getRessources().subscribe((ressources: Ressource[]) => {
      expect(ressources[0].statut).toBe('Publi\u00e9e');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ressources`);
    req.flush([mockApiRessource]);
  });

  it('getRessources() devrait mapper le statut "EnValidation" -> "En validation"', () => {
    service.getRessources().subscribe((ressources: Ressource[]) => {
      expect(ressources[0].statut).toBe('En validation');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ressources`);
    req.flush([{ ...mockApiRessource, statut: 'EnValidation' }]);
  });

  it('getRessources() devrait mapper le statut "Rejetee" -> "Rejetee"', () => {
    service.getRessources().subscribe((ressources: Ressource[]) => {
      expect(ressources[0].statut).toBe('Rejet\u00e9e');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ressources`);
    req.flush([{ ...mockApiRessource, statut: 'Rejetee' }]);
  });

  it('getRessources() devrait mapper la visibilite "Privee" -> "Privee"', () => {
    service.getRessources().subscribe((ressources: Ressource[]) => {
      expect(ressources[0].visibilite).toBe('Priv\u00e9e');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ressources`);
    req.flush([{ ...mockApiRessource, visibilite: 'Privee' }]);
  });

  it('getRessources() devrait mapper la visibilite "Connectes" -> "Citoyens connectes"', () => {
    service.getRessources().subscribe((ressources: Ressource[]) => {
      expect(ressources[0].visibilite).toBe('Citoyens connect\u00e9s');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ressources`);
    req.flush([{ ...mockApiRessource, visibilite: 'Connectes' }]);
  });

  it('getRessourceById() devrait retourner la ressource correspondante', () => {
    service.getRessourceById(1).subscribe((ressource) => {
      expect(ressource).toBeDefined();
      expect(ressource!.id).toBe(1);
      expect(ressource!.title).toBe('Guide communication couple');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ressources/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockApiRessource);
  });

  it('getRessources() devrait retourner une liste vide si l\'API retourne []', () => {
    service.getRessources().subscribe((ressources: Ressource[]) => {
      expect(ressources.length).toBe(0);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ressources`);
    req.flush([]);
  });

  it('getRessources() devrait mapper dateCreation en objet Date', () => {
    service.getRessources().subscribe((ressources: Ressource[]) => {
      expect(ressources[0].createdAt).toBeInstanceOf(Date);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ressources`);
    req.flush([mockApiRessource]);
  });
});
