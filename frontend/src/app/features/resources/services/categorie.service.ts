import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Categorie {
  idCategorie: number;
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
}
