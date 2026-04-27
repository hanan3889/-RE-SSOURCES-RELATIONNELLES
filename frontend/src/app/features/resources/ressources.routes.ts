import { Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';

export const RESSOURCES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/ressource-list/ressource-list.component').then(m => m.RessourceListComponent)
    },
    {
        path: 'creer',
        loadComponent: () => import('./pages/ressource-create/ressource-create.component').then(m => m.RessourceCreateComponent),
        canActivate: [AuthGuard]
    },
    {
        path: ':id/editer',
        loadComponent: () => import('./pages/ressource-create/ressource-create.component').then(m => m.RessourceCreateComponent),
        canActivate: [AuthGuard]
    },
    {
        path: ':id',
        loadComponent: () => import('./pages/ressource-detail/ressource-detail.component').then(m => m.RessourceDetailComponent)
    }
];