import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User, UserUpdate } from '../models/user.model';
import { Role } from '../models/role.enum';
import { environment } from 'src/environments/environment';

interface UserApiDto {
  idUtilisateur: number;
  email: string;
  nom?: string;
  prenom?: string;
  nomRole?: string | null;
  idRole: number;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

export interface CreatePrivilegedUserDto {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  idRole: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http
      .get<UserApiDto[]>(this.apiUrl)
      .pipe(map((users) => users.map((user) => this.mapUser(user))));
  }

  getUserById(id: number): Observable<User> {
    return this.http
      .get<UserApiDto>(`${this.apiUrl}/${id}`)
      .pipe(map((user) => this.mapUser(user)));
  }

  updateUser(id: number, userData: UserUpdate & { role?: string; isActive?: boolean }): Observable<User> {
    const payload: any = {
      nom: userData.nom,
      prenom: userData.prenom
    };

    if (userData.role) {
      payload.idRole = this.roleToId(userData.role);
    }

    if (typeof userData.isActive === 'boolean') {
      payload.isActive = userData.isActive;
    }

    return this.http
      .put<UserApiDto>(`${this.apiUrl}/${id}`, payload)
      .pipe(map((user) => this.mapUser(user)));
  }

  resetUserPassword(id: number, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/reset-password`, { newPassword });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  createPrivilegedUser(dto: CreatePrivilegedUserDto): Observable<User> {
    return this.http
      .post<UserApiDto>(`${environment.apiUrl}/superadmin/utilisateurs`, dto)
      .pipe(map((user) => this.mapUser(user)));
  }

  private mapUser(user: UserApiDto): User {
    return {
      id: user.idUtilisateur,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: this.roleFromApi(user.nomRole),
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined
    };
  }

  private roleFromApi(role?: string | null): Role {
    switch (role) {
      case 'moderateur':
        return Role.MODERATEUR;
      case 'administrateur':
        return Role.ADMINISTRATEUR;
      case 'super_administrateur':
        return Role.SUPER_ADMINISTRATEUR;
      default:
        return Role.CITOYEN;
    }
  }

  private roleToId(role: string): number {
    switch (role) {
      case Role.MODERATEUR:
      case 'moderateur':
        return 2;
      case Role.ADMINISTRATEUR:
      case 'administrateur':
        return 3;
      case Role.SUPER_ADMINISTRATEUR:
      case 'super_administrateur':
        return 4;
      default:
        return 1;
    }
  }
}
