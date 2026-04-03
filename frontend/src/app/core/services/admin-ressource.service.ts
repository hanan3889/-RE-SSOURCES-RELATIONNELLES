import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AdminCreateRessourcePayload,
  AdminRessource,
  AdminUpdateRessourcePayload
} from '../models/admin-ressource.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminRessourceService {
  private readonly adminApiUrl = `${environment.apiUrl}/admin/ressources`;
  private readonly ressourcesApiUrl = `${environment.apiUrl}/ressources`;

  constructor(private readonly http: HttpClient) {}

  getAll(statut?: string): Observable<AdminRessource[]> {
    let params = new HttpParams();
    if (statut && statut.trim().length > 0) {
      params = params.set('statut', statut.trim());
    }

    return this.http.get<AdminRessource[]>(this.adminApiUrl, { params });
  }

  create(payload: AdminCreateRessourcePayload): Observable<AdminRessource> {
    return this.http.post<AdminRessource>(this.ressourcesApiUrl, payload);
  }

  update(idRessource: number, payload: AdminUpdateRessourcePayload): Observable<AdminRessource> {
    return this.http.put<AdminRessource>(`${this.ressourcesApiUrl}/${idRessource}`, payload);
  }

  delete(idRessource: number): Observable<void> {
    return this.http.delete<void>(`${this.ressourcesApiUrl}/${idRessource}`);
  }
}
