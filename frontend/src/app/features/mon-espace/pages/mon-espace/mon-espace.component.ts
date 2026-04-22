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
  stats: ProgressionStats = { nbFavoris: 0, nbMesRessources: 0, nbPubliees: 0, nbEnAttente: 0, nbExploitees: 0, nbSauvegardees: 0, nbActivitesDemarrees: 0 };
  favoris: Ressource[] = [];
  mesRessources: Ressource[] = [];
  exploitedRessourceIds = new Set<number>();
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
      next: (data) => {
        this.mesRessources = data;
        this.loadExploitationStatuses();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private loadExploitationStatuses(): void {
    this.exploitedRessourceIds.clear();
    for (const ressource of this.mesRessources) {
      this.favorisService.getExploitationStatus(ressource.idRessource).subscribe({
        next: (status) => {
          if (status.exploitee) {
            this.exploitedRessourceIds.add(ressource.idRessource);
          }
        },
        error: () => {}
      });
    }
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

  isExploitee(ressourceId: number): boolean {
    return this.exploitedRessourceIds.has(ressourceId);
  }

  toggleExploitation(ressourceId: number): void {
    const nextValue = !this.isExploitee(ressourceId);
    this.favorisService.setExploitationStatus(ressourceId, nextValue).subscribe({
      next: () => {
        if (nextValue) {
          this.exploitedRessourceIds.add(ressourceId);
          this.stats.nbExploitees += 1;
        } else {
          this.exploitedRessourceIds.delete(ressourceId);
          this.stats.nbExploitees = Math.max(0, this.stats.nbExploitees - 1);
        }
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

  canEditRessource(statut: string): boolean {
    const normalized = (statut ?? '').toLowerCase();
    return normalized === 'brouillon' || normalized === 'rejetee';
  }

  logout(): void {
    this.authService.logout();
  }
}
