import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { AuthService } from 'src/app/core/services/auth.service';
import { Categorie, CategorieService } from '../../services/categorie.service';
import { Ressource, RessourceFilters, RessourceService } from '../../services/ressource.service';

@Component({
  selector: 'app-ressource-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ressource-list.component.html',
  styleUrls: ['./ressource-list.component.scss']
})
export class RessourceListComponent implements OnInit, OnDestroy {
  currentYear: number = new Date().getFullYear();
  isLoggedIn = false;
  showRestrictedOnly = false;
  isLoading = true;
  errorMessage = '';
  categories: Categorie[] = [];
  ressources: Ressource[] = [];
  selectedCategory = '';
  selectedFormat = '';
  selectedSort: RessourceFilters['tri'] = 'date';
  searchTerm = '';
  readonly formatOptions = ['Article', 'Vidéo', 'PDF', 'Audio', 'Activité'];

  private readonly searchTerm$ = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(
    private ressourceService: RessourceService,
    private router: Router,
    private authService: AuthService,
    private categorieService: CategorieService
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();

    this.categorieService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: () => {
        this.categories = [];
      }
    });

    this.searchSubscription = this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((term) => {
      this.searchTerm = term;
      this.loadRessources();
    });

    this.loadRessources();

    this.setupScrollAnimations();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  onCreateResource(): void {
    this.router.navigate(['/ressources/creer']);
  }

  onCardClick(ressourceId: number): void {
    if (ressourceId && !isNaN(ressourceId)) {
      this.router.navigate(['/ressources', ressourceId]);
    }
  }


  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm = term;
    this.searchTerm$.next(term);
  }

  onCategoryChange(value: string): void {
    this.selectedCategory = value;
    this.loadRessources();
  }

  onFormatChange(value: string): void {
    this.selectedFormat = value;
    this.loadRessources();
  }

  onSortChange(value: string): void {
    const sort = value === 'popularite' ? 'popularite' : 'date';
    this.selectedSort = sort;
    this.loadRessources();
  }

  onToggleRestricted(showRestricted: boolean): void {
    if (!this.isLoggedIn) {
      return;
    }

    this.showRestrictedOnly = showRestricted;
    this.loadRessources();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedFormat = '';
    this.selectedSort = 'date';

    if (this.isLoggedIn && this.showRestrictedOnly) {
      this.showRestrictedOnly = false;
    }

    this.loadRessources();
  }

  get activeModeLabel(): string {
    return this.showRestrictedOnly ? 'Ressources restreintes' : 'Ressources publiques';
  }

  private loadRessources(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filters: RessourceFilters = {
      recherche: this.searchTerm || undefined,
      categorie: this.selectedCategory || undefined,
      format: this.selectedFormat || undefined,
      tri: this.selectedSort
    };

    const request$ = this.showRestrictedOnly && this.isLoggedIn
      ? this.ressourceService.getRestrictedRessources(filters)
      : this.ressourceService.getRessources(filters);

    request$.subscribe({
      next: (ressources) => {
        this.ressources = ressources;
        this.isLoading = false;
      },
      error: () => {
        this.ressources = [];
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger les ressources pour le moment.';
      }
    });
  }

  /**
   * Configuration des animations au scroll
   */
  private setupScrollAnimations(): void {
    if (typeof window !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-fade-in');
            }
          });
        },
        { threshold: 0.1 }
      );

      // Observer tous les éléments avec la classe 'scroll-animation'
      setTimeout(() => {
        const elements = document.querySelectorAll('.scroll-animation');
        elements.forEach(el => observer.observe(el));
      }, 500);
    }
  }
}
