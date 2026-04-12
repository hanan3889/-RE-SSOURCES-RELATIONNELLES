import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

// Interface unifié qui supporte les deux formats
export interface Ressource {
  idRessource?: number;
  id?: number;
  titre?: string;
  title?: string;
  description?: string;
  format?: string;
  content?: string;
  visibilite?: string;
  statut?: string | "Brouillon" | "En validation" | "Publiée" | "Rejetée" | "Archivée";
  dateCreation?: string;
  createdAt?: Date;
  idUtilisateur?: number;
  nomAuteur?: string;
  prenomAuteur?: string;
  author?: string;
  idCategorie?: number;
  nomCategorie?: string;
  category?: string;
  type?: string;
}

export interface ProgressionStats {
  nbFavoris: number;
  nbMesRessources: number;
  nbPubliees: number;
  nbEnAttente: number;
}

@Injectable({
  providedIn: 'root'
})
export class FavorisService {
  private apiUrl = environment.apiUrl;
  private favorisChanged = new BehaviorSubject<void>(undefined);
  favorisChanged$ = this.favorisChanged.asObservable();
  private localKey = 'local_favoris_ids';

  constructor(private http: HttpClient) {}

  private getLocalFavorisIds(): number[] {
    const raw = localStorage.getItem(this.localKey);
    if (!raw) { return []; }
    try { return JSON.parse(raw); } catch { return []; }
  }

  private setLocalFavorisIds(ids: number[]): void {
    localStorage.setItem(this.localKey, JSON.stringify(Array.from(new Set(ids))));
  }

  getMesFavoris(): Observable<Ressource[]> {
    return this.http.get<Ressource[]>(`${this.apiUrl}/ressources/favoris`).pipe(
      catchError(() => {
        const ids = this.getLocalFavorisIds();
        const favorites = ids.map(id => ({
          idRessource: id,
          titre: '',
          description: '',
          format: '',
          visibilite: '',
          statut: '',
          dateCreation: '',
          idUtilisateur: 0,
          nomAuteur: '',
          prenomAuteur: '',
          idCategorie: 0,
          nomCategorie: ''
        }));
        return of(favorites);
      })
    );
  }

  getMesRessources(): Observable<Ressource[]> {
    return this.http.get<Ressource[]>(`${this.apiUrl}/ressources/mes-ressources`).pipe(
      catchError(() => of([]))
    );
  }

  getProgression(): Observable<ProgressionStats> {
    return this.http.get<ProgressionStats>(`${this.apiUrl}/progression`);
  }

  ajouterFavori(ressourceId: number): Observable<any> {
    const localIds = this.getLocalFavorisIds();
    if (!localIds.includes(ressourceId)) {
      localIds.push(ressourceId);
      this.setLocalFavorisIds(localIds);
    }

    this.favorisChanged.next();

    return this.http.post(`${this.apiUrl}/ressources/${ressourceId}/favoris`, {}).pipe(
      catchError(() => of(null)),
      tap(() => this.favorisChanged.next())
    );
  }

  retirerFavori(ressourceId: number): Observable<any> {
    const localIds = this.getLocalFavorisIds().filter(id => id !== ressourceId);
    this.setLocalFavorisIds(localIds);
    this.favorisChanged.next();

    return this.http.delete(`${this.apiUrl}/ressources/${ressourceId}/favoris`).pipe(
      catchError(() => of(null)),
      tap(() => this.favorisChanged.next())
    );
  }
}
