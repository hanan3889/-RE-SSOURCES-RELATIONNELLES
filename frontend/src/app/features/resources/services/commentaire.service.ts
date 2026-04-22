import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Commentaire {
  idCommentaire: number;
  idCommentaireParent?: number | null;
  contenu: string;
  dateCreation: string;
  idUtilisateur: number;
  nomAuteur: string;
  prenomAuteur: string;
  idRessource: number;
}

export interface MesCommentaire {
  idCommentaire: number;
  idRessource: number;
  titreRessource: string;
  contenu: string;
  dateCreation: string;
}

interface CreateCommentaireDto {
  contenu: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentaireService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getByRessource(ressourceId: number): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.apiUrl}/ressources/${ressourceId}/commentaires`);
  }

  getMine(): Observable<MesCommentaire[]> {
    return this.http.get<MesCommentaire[]>(`${this.apiUrl}/commentaires/mes`);
  }

  create(ressourceId: number, contenu: string): Observable<Commentaire> {
    const payload: CreateCommentaireDto = { contenu };
    return this.http.post<Commentaire>(`${this.apiUrl}/ressources/${ressourceId}/commentaires`, payload);
  }

  createReply(commentaireParentId: number, contenu: string): Observable<Commentaire> {
    const payload: CreateCommentaireDto = { contenu };
    return this.http.post<Commentaire>(`${this.apiUrl}/commentaires/${commentaireParentId}/reponses`, payload);
  }

  delete(commentaireId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/commentaires/${commentaireId}`);
  }
}
