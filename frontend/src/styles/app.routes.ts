import { Routes } from '@angular/router';

export const routes: Routes = [
{
    path: '',
    loadChildren: () => import('../app/features/home/home.routes').then(m => m.HOME_ROUTES)
},
  {
    path: 'auth',
    loadChildren: () => import('../app/features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'resources',
    loadChildren: () => import('../app/features/resources/resources.routes').then(m => m.RESOURCES_ROUTES)
  },
  
]