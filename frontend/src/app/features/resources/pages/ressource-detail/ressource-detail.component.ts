import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Ressource, RessourceService } from '../../services/ressource.service';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SafeHtmlPipe } from '../../../../core/pipes/safe-html.pipe';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-ressource-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  templateUrl: './ressource-detail.component.html',
  styleUrls: ['./ressource-detail.component.scss']
})
export class RessourceDetailComponent implements OnInit {
  ressource$!: Observable<Ressource | undefined>;
  isLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    private ressourceService: RessourceService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.ressource$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return this.ressourceService.getRessourceById(id);
      })
    );
  }

  addToFavorites(ressourceId: number): void {
    if (!this.isLoggedIn) {
      alert('Veuillez vous connecter pour ajouter une ressource à vos favoris.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.ressourceService.addFavori(ressourceId).subscribe({
      next: () => alert('Ressource ajoutée à vos favoris.'),
      error: (err) => {
        const message = err?.error?.message || 'Impossible d\'ajouter ce favori.';
        alert(message);
      }
    });
  }
}
