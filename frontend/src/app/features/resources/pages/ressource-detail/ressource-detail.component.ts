import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Ressource, RessourceService } from '../../services/ressource.service';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-ressource-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ressource-detail.component.html',
  styleUrls: ['./ressource-detail.component.scss']
})
export class RessourceDetailComponent implements OnInit {
  ressource$!: Observable<Ressource | undefined>;

  constructor(
    private route: ActivatedRoute,
    private ressourceService: RessourceService
  ) { }

  ngOnInit(): void {
    this.ressource$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return this.ressourceService.getRessourceById(id);
      })
    );
  }
}
