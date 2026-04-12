import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Ressource, RessourceService } from '../../services/ressource.service';
import { FavorisService } from 'src/app/core/services/favoris.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SafeHtmlPipe } from '../../../../core/pipes/safe-html.pipe';

@Component({
  selector: 'app-ressource-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  templateUrl: './ressource-detail.component.html',
  styleUrls: ['./ressource-detail.component.scss']
})
export class RessourceDetailComponent implements OnInit {
  ressource?: Ressource;
  isFavori = false;
  loadingFavori = false;
  userLoggedIn = false;

  loading = true;
  errorMessage?: string;

  private favorisSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private ressourceService: RessourceService,
    private favorisService: FavorisService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userLoggedIn = this.authService.isLoggedIn();

    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        this.loading = true;
        this.errorMessage = undefined;
        return this.ressourceService.getRessourceById(id);
      })
    ).subscribe({
      next: (ressource) => {
        this.loading = false;
        if (!ressource) {
          this.errorMessage = 'Ressource introuvable ou inaccessible.';
          this.ressource = undefined;
          return;
        }

        this.ressource = ressource;
        this.refreshFavoriState();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Erreur lors du chargement de la ressource.';
      }
    });

    this.favorisSub = this.favorisService.favorisChanged$.subscribe(() => {
      this.refreshFavoriState();
    });
  }

  ngOnDestroy(): void {
    this.favorisSub?.unsubscribe();
  }

  private getResourceId(): number | undefined {
    if (!this.ressource) {
      return undefined;
    }
    return (this.ressource as any).idRessource ?? (this.ressource as any).id;
  }

  private refreshFavoriState(): void {
    if (!this.ressource) {
      this.isFavori = false;
      return;
    }

    const currentId = this.getResourceId();
    if (!currentId || !this.userLoggedIn) {
      this.isFavori = false;
      return;
    }

    this.favorisService.getMesFavoris().subscribe({
      next: favoris => {
        this.isFavori = favoris.some(f => {
          const favId = (f as any).idRessource ?? (f as any).id;
          return favId === currentId;
        });
      },
      error: () => {
        this.isFavori = false;
      }
    });
  }

  toggleFavori(): void {
    if (!this.ressource) { return; }

    const currentId = this.getResourceId();
    if (!currentId) { return; }

    if (!this.userLoggedIn) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadingFavori = true;
    const action$ = this.isFavori
      ? this.favorisService.retirerFavori(currentId)
      : this.favorisService.ajouterFavori(currentId);

    action$.subscribe({
      next: () => {
        this.isFavori = !this.isFavori;
        this.loadingFavori = false;
        alert(this.isFavori ? 'Ressource ajoutée aux favoris ✅' : 'Ressource retirée des favoris ✅');
      },
      error: () => {
        this.loadingFavori = false;
        alert('Une erreur est survenue lors de la mise à jour de vos favoris.');
      }
    });
  }
}
