import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminCategorie, AdminCategoriePayload } from '../models/admin-categorie.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminCategorieService {
  private readonly apiUrl = `${environment.apiUrl}/admin/categories`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<AdminCategorie[]> {
    return this.http.get<AdminCategorie[]>(this.apiUrl);
  }

  create(payload: AdminCategoriePayload): Observable<AdminCategorie> {
    return this.http.post<AdminCategorie>(this.apiUrl, payload);
  }

  update(idCategorie: number, payload: AdminCategoriePayload): Observable<AdminCategorie> {
    return this.http.put<AdminCategorie>(`${this.apiUrl}/${idCategorie}`, payload);
  }

  delete(idCategorie: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idCategorie}`);
  }
}
