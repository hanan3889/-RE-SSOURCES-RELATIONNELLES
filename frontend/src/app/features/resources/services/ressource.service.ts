import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Ressource {
  id: number;
  title: string;
  description: string;
  content: string;
  author: string;
  category: string;
  createdAt: Date;
  format: string;
  type: 'article';
  visibilite: 'Publique' | 'Citoyens connectés' | 'Privée';
  statut: 'Brouillon' | 'En validation' | 'Publiée' | 'Rejetée' | 'Archivée';
}

export interface CreateRessourceDto {
  titre: string;
  description: string;
  format: string;
  visibilite: number | 'Publique' | 'Connectes' | 'Privee';
  idCategorie: number;
}

export interface EditableRessourceDto extends CreateRessourceDto {
  idRessource: number;
}

export interface RessourceFilters {
  categorie?: string;
  format?: string;
  recherche?: string;
  tri?: 'date' | 'popularite';
}

interface ApiRessourceDto {
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
export class RessourceService {
  private readonly apiUrl = `${environment.apiUrl}/ressources`;

  constructor(private readonly http: HttpClient) { }

  getRessources(filters?: RessourceFilters): Observable<Ressource[]> {
    return this.fetchRessources(this.apiUrl, filters);
  }

  getRestrictedRessources(filters?: RessourceFilters): Observable<Ressource[]> {
    return this.fetchRessources(`${this.apiUrl}/restreintes`, filters);
  }

  getRessourceById(id: number): Observable<Ressource | undefined> {
    return this.http
      .get<ApiRessourceDto>(`${this.apiUrl}/${id}`)
      .pipe(map((item) => this.mapDtoToRessource(item)));
  }

  createRessource(dto: CreateRessourceDto): Observable<Ressource> {
    return this.http
      .post<ApiRessourceDto>(this.apiUrl, dto)
      .pipe(map((item) => this.mapDtoToRessource(item)));
  }

  updateRessource(id: number, dto: CreateRessourceDto): Observable<Ressource> {
    return this.http
      .put<ApiRessourceDto>(`${this.apiUrl}/${id}`, dto)
      .pipe(map((item) => this.mapDtoToRessource(item)));
  }

  getRessourceForEdit(id: number): Observable<EditableRessourceDto> {
    return this.http
      .get<ApiRessourceDto>(`${this.apiUrl}/${id}`)
      .pipe(
        map((item) => ({
          idRessource: item.idRessource,
          titre: item.titre,
          description: item.description,
          format: item.format,
          visibilite: this.mapVisibiliteToNumber(item.visibilite),
          idCategorie: item.idCategorie
        }))
      );
  }

  addFavori(ressourceId: number) {
    return this.http.post(`${this.apiUrl}/${ressourceId}/favoris`, {});
  }

  private fetchRessources(url: string, filters?: RessourceFilters): Observable<Ressource[]> {
    let params = new HttpParams();

    if (filters?.categorie) {
      params = params.set('categorie', filters.categorie);
    }

    if (filters?.format) {
      params = params.set('format', filters.format);
    }

    if (filters?.recherche) {
      params = params.set('recherche', filters.recherche);
    }

    if (filters?.tri) {
      params = params.set('tri', filters.tri);
    }

    return this.http
      .get<ApiRessourceDto[]>(url, { params })
      .pipe(map((items) => items.map((item) => this.mapDtoToRessource(item))));
  }

  private mapDtoToRessource(dto: ApiRessourceDto): Ressource {
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
    const normalized = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    if (normalized.includes('connect')) {
      return 'Citoyens connectés';
    }

    if (normalized.includes('prive')) {
      return 'Privée';
    }

    return 'Publique';
  }

  private mapStatut(value: string): Ressource['statut'] {
    const normalized = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    switch (normalized) {
      case 'brouillon':
        return 'Brouillon';
      case 'envalidation':
      case 'en validation':
        return 'En validation';
      case 'rejetee':
      case 'rejeté':
      case 'rejetee ': 
        return 'Rejetée';
      case 'archivee':
      case 'archive':
        return 'Archivée';
      default:
        return 'Publiée';
    }
  }

  private mapVisibiliteToNumber(value: string): number {
    const normalized = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    if (normalized.includes('connect')) {
      return 1;
    }

    if (normalized.includes('prive')) {
      return 2;
    }

    return 0;
  }
}