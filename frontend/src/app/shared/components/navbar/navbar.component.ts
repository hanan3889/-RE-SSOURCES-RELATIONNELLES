import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  isModerator = false;
  userName = '';
  menuOpen = false;
  hideNavbar = false;

  private hiddenRoutes = ['/auth/login', '/auth/register'];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.updateState();

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.updateState();
      this.hideNavbar = this.hiddenRoutes.some(r => e.urlAfterRedirects.startsWith(r));
      this.menuOpen = false;
    });

    // init on first load
    this.hideNavbar = this.hiddenRoutes.some(r => this.router.url.startsWith(r));
  }

  private updateState(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    this.isModerator = this.authService.hasRole('moderateur');
    const user = this.authService.getCurrentUser();
    this.userName = user ? `${user.prenom} ${user.nom}` : '';
  }

  logout(): void {
    this.authService.logout();
  }
}
