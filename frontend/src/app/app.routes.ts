import { Routes } from '@angular/router';

export const routes: Routes = [
  // Redirection racine vers home
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  
  // Route Home
  {
    path: 'home',
    loadComponent: () => import('./features/home/pages/home/home.component').then(m => m.HomeComponent),
    title: 'Accueil - Ressources Relationnelles'
  },
  
  // Routes Auth
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // Route par défaut (404)
  {
    path: '**',
    redirectTo: 'home'
  }
];