import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { FavorisService, Ressource, ProgressionStats } from 'src/app/core/services/favoris.service';

@Component({
  selector: 'app-mon-espace',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mon-espace.component.html',
  styleUrl: './mon-espace.component.scss'
})
export class MonEspaceComponent implements OnInit {
  currentUser = null as ReturnType<AuthService['getCurrentUser']>;
  stats: ProgressionStats = { nbFavoris: 0, nbMesRessources: 0, nbPubliees: 0, nbEnAttente: 0 };
  favoris: Ressource[] = [];
  mesRessources: Ressource[] = [];
  activeTab: 'favoris' | 'mes-ressources' = 'favoris';
  loading = true;

  constructor(
    private authService: AuthService,
    private favorisService: FavorisService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadAll();
    }
  }

  loadAll(): void {
    this.loading = true;
    this.favorisService.getProgression().subscribe({
      next: (data) => { this.stats = data; },
      error: () => {}
    });
    this.favorisService.getMesFavoris().subscribe({
      next: (data) => { this.favoris = data; },
      error: () => {}
    });
    this.favorisService.getMesRessources().subscribe({
      next: (data) => { this.mesRessources = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  setTab(tab: 'favoris' | 'mes-ressources'): void {
    this.activeTab = tab;
  }

  retirerFavori(ressourceId: number): void {
    this.favorisService.retirerFavori(ressourceId).subscribe({
      next: () => {
        this.favoris = this.favoris.filter(f => f.idRessource !== ressourceId);
        this.stats.nbFavoris = Math.max(0, this.stats.nbFavoris - 1);
      },
      error: () => {}
    });
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      'Publiee': 'badge-success',
      'EnValidation': 'badge-warning',
      'Brouillon': 'badge-secondary',
      'Rejetee': 'badge-danger'
    };
    return map[statut] ?? 'badge-secondary';
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      'Publiee': 'Publiée',
      'EnValidation': 'En attente',
      'Brouillon': 'Brouillon',
      'Rejetee': 'Refusée'
    };
    return map[statut] ?? statut;
  }

  logout(): void {
    this.authService.logout();
  }
}
