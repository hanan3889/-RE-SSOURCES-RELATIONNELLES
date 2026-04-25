import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface MessageItem {
  idMessage: number;
  contenu: string;
  dateCreation: string;
  typeMessage: string;
  statutInvitation?: string | null;
  idRessource?: number | null;
  titreRessource?: string | null;
  idAuteur: number;
  nomAuteur: string;
  prenomAuteur: string;
  idDestinataire?: number | null;
  nomDestinataire?: string | null;
  prenomDestinataire?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly apiUrl = `${environment.apiUrl}/messages`;

  constructor(private readonly http: HttpClient) {}

  getMine(): Observable<MessageItem[]> {
    return this.http.get<MessageItem[]>(this.apiUrl);
  }

  getInbox(): Observable<MessageItem[]> {
    return this.http.get<MessageItem[]>(`${this.apiUrl}/inbox`);
  }

  getDiscussion(ressourceId: number): Observable<MessageItem[]> {
    return this.http.get<MessageItem[]>(`${this.apiUrl}/ressources/${ressourceId}/discussion`);
  }

  inviteParticipant(ressourceId: number, cible: string, message?: string): Observable<MessageItem> {
    return this.http.post<MessageItem>(`${this.apiUrl}/ressources/${ressourceId}/inviter`, { cible, message });
  }

  setInvitationStatus(messageId: number, acceptee: boolean): Observable<MessageItem> {
    return this.http.put<MessageItem>(`${this.apiUrl}/${messageId}/invitation`, { acceptee });
  }

  sendDirectMessage(cible: string, contenu: string): Observable<MessageItem> {
    return this.http.post<MessageItem>(this.apiUrl, { cible, contenu });
  }

  sendDiscussionMessage(ressourceId: number, contenu: string): Observable<MessageItem> {
    return this.http.post<MessageItem>(`${this.apiUrl}/ressources/${ressourceId}/discussion`, { contenu });
  }
}
