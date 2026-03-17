import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Ressource {
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

  constructor(private http: HttpClient) {}

  getMesFavoris(): Observable<Ressource[]> {
    return this.http.get<Ressource[]>(`${this.apiUrl}/ressources/favoris`);
  }

  getMesRessources(): Observable<Ressource[]> {
    return this.http.get<Ressource[]>(`${this.apiUrl}/ressources/mes-ressources`);
  }

  getProgression(): Observable<ProgressionStats> {
    return this.http.get<ProgressionStats>(`${this.apiUrl}/progression`);
  }

  ajouterFavori(ressourceId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/ressources/${ressourceId}/favoris`, {});
  }

  retirerFavori(ressourceId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ressources/${ressourceId}/favoris`);
  }
}
