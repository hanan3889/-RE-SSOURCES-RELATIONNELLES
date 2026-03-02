import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { Ressource, RessourceService } from '../../services/ressource.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ressource-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputTextModule, RouterModule],
  templateUrl: './ressource-list.component.html',
  styleUrl: './ressource-list.component.scss'
})
export class RessourceListComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  ressources$!: Observable<Ressource[]>;
  filteredRessources$!: Observable<Ressource[]>;
  
  private searchTerm$ = new Subject<string>();

  constructor(private ressourceService: RessourceService) { }

  ngOnInit(): void {
    this.ressources$ = this.ressourceService.getRessources();

    this.filteredRessources$ = this.searchTerm$.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.filterRessources(term))
    );
  }

  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm$.next(term);
  }

  private filterRessources(term: string): Observable<Ressource[]> {
    return this.ressources$.pipe(
      map(ressources => {
        if (!term) {
          return ressources;
        }
        return ressources.filter(ressource =>
          ressource.title.toLowerCase().includes(term.toLowerCase())
        );
      })
    );
  }
}