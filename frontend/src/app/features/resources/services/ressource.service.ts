import { Injectable } from '@angular/core';
import { of } from 'rxjs';

export interface Ressource {
  id: number;
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class RessourceService {

  private ressources: Ressource[] = [
    { id: 1, title: 'Gestion du stress au quotidien', description: 'Apprenez des techniques simples pour réduire le stress et l\'anxiété.' },
    { id: 2, title: 'Introduction à la méditation de pleine conscience', description: 'Découvrez les bienfaits de la méditation pour votre bien-être mental.' },
    { id: 3, title: 'Améliorer la qualité de son sommeil', description: 'Conseils et astuces pour un sommeil réparateur et une meilleure santé.' },
    { id: 4, title: 'Comprendre et gérer l\'anxiété sociale', description: 'Des stratégies pour surmonter la peur des interactions sociales.' },
    { id: 5, title: 'L\'importance de l\'activité physique pour la santé mentale', description: 'Comment le sport peut être un allié contre la dépression.' }
  ];

  constructor() { }

  getRessources() {
    return of(this.ressources);
  }
}