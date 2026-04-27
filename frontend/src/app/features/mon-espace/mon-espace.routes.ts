import { Routes } from '@angular/router';

export const MON_ESPACE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/mon-espace/mon-espace.component').then(m => m.MonEspaceComponent),
    title: 'Mon espace - Ressources Relationnelles'
  }
];
