import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RessourceService, Ressource, CreateRessourceDto } from './ressource.service';
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

  // CT-RES-010 — Créer une ressource
  it('createRessource() devrait envoyer POST et retourner la ressource créée', () => {
    const dto: CreateRessourceDto = {
      titre: 'Nouveau guide',
      description: 'Description',
      format: 'Article',
      visibilite: 0,
      idCategorie: 1
    };

    service.createRessource(dto).subscribe((ressource: Ressource) => {
      expect(ressource.title).toBe('Guide communication couple');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ressources`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(mockApiRessource);
  });

  // CT-RES-012 — Modifier une ressource
  it('updateRessource() devrait envoyer PUT avec les champs modifiés', () => {
    const dto: CreateRessourceDto = {
      titre: 'Guide modifié',
      description: 'Nouvelle description',
      format: 'PDF',
      visibilite: 1,
      idCategorie: 2
    };

    service.updateRessource(1, dto).subscribe((ressource: Ressource) => {
      expect(ressource.id).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ressources/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockApiRessource);
  });

  it('getRestrictedRessources() devrait appeler le bon endpoint', () => {
    service.getRestrictedRessources().subscribe((ressources: Ressource[]) => {
      expect(ressources.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ressources/restreintes`);
    expect(req.request.method).toBe('GET');
    req.flush([mockApiRessource]);
  });

  it('getRessourceForEdit() devrait retourner le DTO éditable', () => {
    service.getRessourceForEdit(1).subscribe((dto) => {
      expect(dto.idRessource).toBe(1);
      expect(dto.titre).toBe('Guide communication couple');
      expect(dto.idCategorie).toBe(3);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/ressources/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockApiRessource);
  });

  it('addFavori() devrait envoyer POST sur le bon endpoint', () => {
    service.addFavori(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/ressources/1/favoris`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
