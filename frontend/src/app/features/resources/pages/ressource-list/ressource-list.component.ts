import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';

import { Ressource, RessourceService } from '../../services/ressource.service';

@Component({
  selector: 'app-ressource-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ressource-list.component.html',
  styleUrls: ['./ressource-list.component.scss']
})
export class RessourceListComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  
  private allRessources$!: Observable<Ressource[]>;
  filteredRessources$!: Observable<Ressource[]>;
  
  private searchTerm$ = new Subject<string>();

  constructor(private ressourceService: RessourceService) { }

  ngOnInit(): void {
    this.allRessources$ = this.ressourceService.getRessources();

    const search$ = this.searchTerm$.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    );

    this.filteredRessources$ = combineLatest([this.allRessources$, search$]).pipe(
      map(([ressources, term]) => {
        // Filter by search term
        if (!term) {
          return ressources;
        }
        return ressources.filter(ressource =>
          (ressource.title?.toLowerCase().includes(term.toLowerCase()) ?? false)
        || (ressource.description?.toLowerCase().includes(term.toLowerCase()) ?? false)
        || (ressource.author?.toLowerCase().includes(term.toLowerCase()) ?? false)
        );
      })
    );

    this.setupScrollAnimations();
  }

  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm$.next(term);
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
