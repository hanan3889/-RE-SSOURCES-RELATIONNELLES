import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  type: 'article';
  visibilite: 'Publique' | 'Citoyens connectés' | 'Privée';
  statut: 'Brouillon' | 'En validation' | 'Publiée' | 'Rejetée' | 'Archivée';
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

  getRessources(): Observable<Ressource[]> {
    return this.http
      .get<ApiRessourceDto[]>(this.apiUrl)
      .pipe(map((items) => items.map((item) => this.mapDtoToRessource(item))));
  }

  getRessourceById(id: number): Observable<Ressource | undefined> {
    return this.http
      .get<ApiRessourceDto>(`${this.apiUrl}/${id}`)
      .pipe(map((item) => this.mapDtoToRessource(item)));
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
}