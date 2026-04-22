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
  nbExploitees: number;
  nbSauvegardees: number;
  nbActivitesDemarrees: number;
}

export interface ExploitationStatus {
  ressourceId: number;
  exploitee: boolean;
}

export interface SauvegardeStatus {
  ressourceId: number;
  sauvegardee: boolean;
}

export interface DemarrageStatus {
  ressourceId: number;
  demarree: boolean;
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

  getExploitationStatus(ressourceId: number): Observable<ExploitationStatus> {
    return this.http.get<ExploitationStatus>(`${this.apiUrl}/progression/ressources/${ressourceId}/exploitation`);
  }

  setExploitationStatus(ressourceId: number, exploitee: boolean): Observable<ExploitationStatus> {
    return this.http.put<ExploitationStatus>(`${this.apiUrl}/progression/ressources/${ressourceId}/exploitation`, { exploitee });
  }

  getSauvegardeStatus(ressourceId: number): Observable<SauvegardeStatus> {
    return this.http.get<SauvegardeStatus>(`${this.apiUrl}/progression/ressources/${ressourceId}/sauvegarde`);
  }

  setSauvegardeStatus(ressourceId: number, sauvegardee: boolean): Observable<SauvegardeStatus> {
    return this.http.put<SauvegardeStatus>(`${this.apiUrl}/progression/ressources/${ressourceId}/sauvegarde`, { sauvegardee });
  }

  getDemarrageStatus(ressourceId: number): Observable<DemarrageStatus> {
    return this.http.get<DemarrageStatus>(`${this.apiUrl}/progression/ressources/${ressourceId}/demarrage`);
  }

  setDemarrageStatus(ressourceId: number, demarree: boolean): Observable<DemarrageStatus> {
    return this.http.put<DemarrageStatus>(`${this.apiUrl}/progression/ressources/${ressourceId}/demarrage`, { demarree });
  }
}
