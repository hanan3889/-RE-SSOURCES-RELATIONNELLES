import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Categorie {
  idCategorie: number;
  nomCategorie: string;
}

export interface SaveCategorieDto {
  nomCategorie: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private readonly apiUrl = `${environment.apiUrl}/admin/categories`;

  constructor(private readonly http: HttpClient) { }

  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.apiUrl);
  }

  createCategory(dto: SaveCategorieDto): Observable<Categorie> {
    return this.http.post<Categorie>(this.apiUrl, dto);
  }

  updateCategory(id: number, dto: SaveCategorieDto): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.apiUrl}/${id}`, dto);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
