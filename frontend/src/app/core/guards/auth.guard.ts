import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const requiredRole = route.data?.['role'];
    const allowedRoles = route.data?.['allowedRoles'] as string[] | undefined;

    if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !this.authService.hasAnyRole(allowedRoles)) {
      this.router.navigate(['/home']);
      return false;
    }

    if (requiredRole === 'admin' && !this.authService.isAdmin()) {
      this.router.navigate(['/home']);
      return false;
    }

    return true;
  }
}
