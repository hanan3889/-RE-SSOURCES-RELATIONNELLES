// src/app/features/home/pages/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  dernieresRessources: any[] = [];
  loadingRessources = true;
  
  // Fonctionnalités principales
  features = [
    {
      icon: '',
      title: 'Ressources Personnalisées',
      description: 'Accédez à des contenus adaptés à vos besoins en développement personnel et professionnel.',
      color: 'blue'
    },
    {
      icon: '',
      title: 'Suivi de Progression',
      description: 'Suivez votre évolution et mesurez vos progrès avec des tableaux de bord intuitifs.',
      color: 'green'
    },
    {
      icon: '',
      title: 'Contenu Certifié',
      description: 'Toutes nos ressources sont validées par des experts en relations humaines.',
      color: 'purple'
    },
    {
      icon: '',
      title: 'Communauté Active',
      description: 'Échangez avec d\'autres utilisateurs et partagez vos expériences.',
      color: 'orange'
    },
    {
      icon: '',
      title: 'Accessible Partout',
      description: 'Accédez à vos ressources depuis n\'importe quel appareil, à tout moment.',
      color: 'cyan'
    }
  ];

  categories: any[] = [];
  loadingCategories = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.setupScrollAnimations();
    this.http.get<any[]>(`${environment.apiUrl}/ressources`).subscribe({
      next: (data) => {
        this.dernieresRessources = data.slice(0, 6);
        this.loadingRessources = false;
      },
      error: () => { this.loadingRessources = false; }
    });
    this.http.get<any[]>(`${environment.apiUrl}/admin/categories`).subscribe({
      next: (data) => {
        this.categories = data;
        this.loadingCategories = false;
      },
      error: () => { this.loadingCategories = false; }
    });
  }

  /**
   * Configuration des animations au scroll
   */
  private setupScrollAnimations(): void {
    if (typeof window !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-fade-in');
            }
          });
        },
        { threshold: 0.1 }
      );

      // Observer tous les éléments avec la classe 'scroll-animation'
      setTimeout(() => {
        const elements = document.querySelectorAll('.scroll-animation');
        elements.forEach(el => observer.observe(el));
      }, 100);
    }
  }

  /**
   * Scroll vers une section
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

}
