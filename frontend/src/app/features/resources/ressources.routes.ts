import { Routes } from '@angular/router';

export const RESSOURCES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/ressource-list/ressource-list.component').then(m => m.RessourceListComponent)
    },
    {
        path: ':id',
        loadComponent: () => import('./pages/ressource-detail/ressource-detail.component').then(m => m.RessourceDetailComponent)
    }
];