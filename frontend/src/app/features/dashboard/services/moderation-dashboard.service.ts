import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Ressource } from 'src/app/features/resources/services/ressource.service';

export interface AdminResourceFilters {
  statut?: string;
  categorie?: string;
  format?: string;
  visibilite?: string;
  auteur?: string;
  recherche?: string;
}

export interface ModerationComment {
  idCommentaire: number;
  idCommentaireParent?: number | null;
  contenu: string;
  dateCreation: string;
  idUtilisateur: number;
  nomAuteur: string;
  prenomAuteur: string;
  idRessource: number;
  titreRessource: string;
}

export interface AdminStatisticsFilters {
  dateDebut?: string;
  dateFin?: string;
  categorie?: string;
  format?: string;
  visibilite?: string;
}

export interface StatisticsSummary {
  totalRessources: number;
  ressourcesPubliees: number;
  ressourcesEnValidation: number;
  ressourcesArchivees: number;
  totalUtilisateurs: number;
  utilisateursActifs: number;
  comptesCreesPeriode: number;
  favoris: number;
  commentaires: number;
  exploitations: number;
  sauvegardes: number;
  activitesDemarrees: number;
  invitationsEnvoyees: number;
  invitationsAcceptees: number;
  messagesDiscussion: number;
}

export interface StatisticsBreakdown {
  label: string;
  value: number;
}

export interface AdminStatisticsResponse {
  resume: StatisticsSummary;
  creationsParCategorie: StatisticsBreakdown[];
  creationsParFormat: StatisticsBreakdown[];
  repartitionVisibilite: StatisticsBreakdown[];
  filtres: {
    dateDebut?: string | null;
    dateFin?: string | null;
    categorie?: string | null;
    format?: string | null;
    visibilite?: string | null;
  };
}

interface AdminApiRessourceDto {
  idRessource: number;
  titre: string;
  description: string;
  format: string;
  visibilite: string;
  statut: string;
  dateCreation: string;
  idUtilisateur: number;
  nomAuteur: string;
  prenomAuteur: string;
  idCategorie: number;
  nomCategorie: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModerationDashboardService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getAdminResources(filters?: AdminResourceFilters): Observable<Ressource[]> {
    let params = new HttpParams();

    if (filters?.statut) {
      params = params.set('statut', filters.statut);
    }

    if (filters?.categorie) {
      params = params.set('categorie', filters.categorie);
    }

    if (filters?.format) {
      params = params.set('format', filters.format);
    }

    if (filters?.visibilite) {
      params = params.set('visibilite', filters.visibilite);
    }

    if (filters?.auteur) {
      params = params.set('auteur', filters.auteur);
    }

    if (filters?.recherche) {
      params = params.set('recherche', filters.recherche);
    }

    return this.http
      .get<AdminApiRessourceDto[]>(`${this.apiUrl}/admin/ressources`, { params })
      .pipe(map((items) => items.map((item) => this.mapResource(item))));
  }

  getModerationQueue(): Observable<Ressource[]> {
    return this.http
      .get<AdminApiRessourceDto[]>(`${this.apiUrl}/moderateur/ressources`)
      .pipe(map((items) => items.map((item) => this.mapResource(item))));
  }

  approveResource(resourceId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/moderateur/ressources/${resourceId}/valider`, {});
  }

  rejectResource(resourceId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/moderateur/ressources/${resourceId}/refuser`, {});
  }

  getModerationComments(resourceId?: number): Observable<ModerationComment[]> {
    let params = new HttpParams();

    if (resourceId) {
      params = params.set('ressourceId', resourceId);
    }

    return this.http.get<ModerationComment[]>(`${this.apiUrl}/moderateur/commentaires`, { params });
  }

  deleteModerationComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/moderateur/commentaires/${commentId}`);
  }

  suspendResource(resourceId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/admin/ressources/${resourceId}/suspendre`, {});
  }

  deleteResource(resourceId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/ressources/${resourceId}`);
  }

  getStatistics(filters?: AdminStatisticsFilters): Observable<AdminStatisticsResponse> {
    let params = new HttpParams();

    if (filters?.dateDebut) {
      params = params.set('dateDebut', filters.dateDebut);
    }

    if (filters?.dateFin) {
      params = params.set('dateFin', filters.dateFin);
    }

    if (filters?.categorie) {
      params = params.set('categorie', filters.categorie);
    }

    if (filters?.format) {
      params = params.set('format', filters.format);
    }

    if (filters?.visibilite) {
      params = params.set('visibilite', filters.visibilite);
    }

    return this.http.get<AdminStatisticsResponse>(`${this.apiUrl}/admin/statistiques`, { params });
  }

  exportStatistics(filters?: AdminStatisticsFilters): Observable<Blob> {
    let params = new HttpParams();

    if (filters?.dateDebut) {
      params = params.set('dateDebut', filters.dateDebut);
    }

    if (filters?.dateFin) {
      params = params.set('dateFin', filters.dateFin);
    }

    if (filters?.categorie) {
      params = params.set('categorie', filters.categorie);
    }

    if (filters?.format) {
      params = params.set('format', filters.format);
    }

    if (filters?.visibilite) {
      params = params.set('visibilite', filters.visibilite);
    }

    return this.http.get(`${this.apiUrl}/admin/statistiques/export`, {
      params,
      responseType: 'blob'
    });
  }

  private mapResource(dto: AdminApiRessourceDto): Ressource {
    return {
      id: dto.idRessource,
      title: dto.titre,
      description: dto.description,
      content: dto.description,
      author: `${dto.prenomAuteur} ${dto.nomAuteur}`.trim(),
      category: dto.nomCategorie,
      createdAt: new Date(dto.dateCreation),
      format: dto.format,
      type: 'article',
      visibilite: this.mapVisibilite(dto.visibilite),
      statut: this.mapStatut(dto.statut)
    };
  }

  private mapVisibilite(value: string): Ressource['visibilite'] {
    const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    if (normalized.includes('connect')) {
      return 'Citoyens connectés';
    }

    if (normalized.includes('prive')) {
      return 'Privée';
    }

    return 'Publique';
  }

  private mapStatut(value: string): Ressource['statut'] {
    const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    switch (normalized) {
      case 'brouillon':
        return 'Brouillon';
      case 'envalidation':
      case 'en validation':
        return 'En validation';
      case 'rejetee':
      case 'rejeté':
        return 'Rejetée';
      case 'archivee':
      case 'archive':
        return 'Archivée';
      default:
        return 'Publiée';
    }
  }
}