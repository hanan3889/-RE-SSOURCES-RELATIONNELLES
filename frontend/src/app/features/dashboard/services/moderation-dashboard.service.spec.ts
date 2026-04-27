import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ModerationDashboardService } from './moderation-dashboard.service';
import { environment } from 'src/environments/environment';

const mockAdminDto = {
  idRessource: 1,
  titre: 'Test resource',
  description: 'Desc',
  format: 'Article',
  visibilite: 'Publique',
  statut: 'EnValidation',
  dateCreation: '2026-01-01T00:00:00Z',
  idUtilisateur: 1,
  nomAuteur: 'Dupont',
  prenomAuteur: 'Alice',
  idCategorie: 1,
  nomCategorie: 'Couple',
};

const mockComment = {
  idCommentaire: 1,
  contenu: 'Commentaire test',
  dateCreation: '2026-01-01T00:00:00Z',
  idUtilisateur: 1,
  nomAuteur: 'Dupont',
  prenomAuteur: 'Alice',
  idRessource: 1,
  titreRessource: 'Test resource',
};

describe('ModerationDashboardService', () => {
  let service: ModerationDashboardService;
  let httpMock: HttpTestingController;
  const api = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ModerationDashboardService],
    });
    service = TestBed.inject(ModerationDashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // CT-MOD-001 — File de modération
  it('getModerationQueue() devrait appeler GET /moderateur/ressources', () => {
    service.getModerationQueue().subscribe((resources) => {
      expect(resources.length).toBe(1);
      expect(resources[0].title).toBe('Test resource');
      expect(resources[0].statut).toBe('En validation');
    });

    const req = httpMock.expectOne(`${api}/moderateur/ressources`);
    expect(req.request.method).toBe('GET');
    req.flush([mockAdminDto]);
  });

  // CT-MOD-002 — Valider une ressource
  it('approveResource() devrait envoyer PATCH /moderateur/ressources/:id/valider', () => {
    service.approveResource(1).subscribe();

    const req = httpMock.expectOne(`${api}/moderateur/ressources/1/valider`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });

  // CT-MOD-003 — Refuser une ressource
  it('rejectResource() devrait envoyer PATCH /moderateur/ressources/:id/refuser', () => {
    service.rejectResource(1).subscribe();

    const req = httpMock.expectOne(`${api}/moderateur/ressources/1/refuser`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });

  it('getAdminResources() devrait appeler GET /admin/ressources sans filtre', () => {
    service.getAdminResources().subscribe((resources) => {
      expect(resources.length).toBe(1);
    });

    const req = httpMock.expectOne((r) => r.url === `${api}/admin/ressources`);
    expect(req.request.method).toBe('GET');
    req.flush([mockAdminDto]);
  });

  it('getAdminResources() devrait passer les filtres en query params', () => {
    service.getAdminResources({ statut: 'EnValidation', format: 'Article' }).subscribe();

    const req = httpMock.expectOne((r) =>
      r.url === `${api}/admin/ressources` &&
      r.params.get('statut') === 'EnValidation' &&
      r.params.get('format') === 'Article'
    );
    req.flush([]);
  });

  // CT-MOD-004 — Supprimer un commentaire
  it('deleteModerationComment() devrait envoyer DELETE /moderateur/commentaires/:id', () => {
    service.deleteModerationComment(1).subscribe();

    const req = httpMock.expectOne(`${api}/moderateur/commentaires/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getModerationComments() devrait appeler GET /moderateur/commentaires', () => {
    service.getModerationComments().subscribe((comments) => {
      expect(comments.length).toBe(1);
    });

    const req = httpMock.expectOne((r) => r.url === `${api}/moderateur/commentaires`);
    expect(req.request.method).toBe('GET');
    req.flush([mockComment]);
  });

  it('suspendResource() devrait envoyer PATCH /admin/ressources/:id/suspendre', () => {
    service.suspendResource(1).subscribe();

    const req = httpMock.expectOne(`${api}/admin/ressources/1/suspendre`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });

  it('mapResource() doit mapper correctement le statut EnValidation', () => {
    service.getModerationQueue().subscribe((resources) => {
      expect(resources[0].statut).toBe('En validation');
    });
    httpMock.expectOne(`${api}/moderateur/ressources`).flush([mockAdminDto]);
  });

  it('mapResource() doit mapper correctement la visibilite Privee', () => {
    service.getAdminResources().subscribe((resources) => {
      expect(resources[0].visibilite).toBe('Privée');
    });
    httpMock.expectOne((r) => r.url.includes('admin/ressources')).flush([
      { ...mockAdminDto, visibilite: 'Privee' }
    ]);
  });
});
