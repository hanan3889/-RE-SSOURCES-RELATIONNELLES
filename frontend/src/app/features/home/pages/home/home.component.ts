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
  
  // Statistiques
  stats = [
    { label: 'Ressources disponibles', value: '500+', icon: '📚' },
    { label: 'Utilisateurs actifs', value: '2,500+', icon: '👥' },
    { label: 'Catégories', value: '15+', icon: '🏷️' },
    { label: 'Taux de satisfaction', value: '98%', icon: '⭐' }
  ];

  // Fonctionnalités principales
  features = [
    {
      icon: '🎯',
      title: 'Ressources Personnalisées',
      description: 'Accédez à des contenus adaptés à vos besoins en développement personnel et professionnel.',
      color: 'blue'
    },
    {
      icon: '📊',
      title: 'Suivi de Progression',
      description: 'Suivez votre évolution et mesurez vos progrès avec des tableaux de bord intuitifs.',
      color: 'green'
    },
    {
      icon: '👨‍🏫',
      title: 'Contenu Certifié',
      description: 'Toutes nos ressources sont validées par des experts en relations humaines.',
      color: 'purple'
    },
    {
      icon: '💬',
      title: 'Communauté Active',
      description: 'Échangez avec d\'autres utilisateurs et partagez vos expériences.',
      color: 'orange'
    },
    {
      icon: '📱',
      title: 'Accessible Partout',
      description: 'Accédez à vos ressources depuis n\'importe quel appareil, à tout moment.',
      color: 'cyan'
    }
  ];

  // Catégories populaires
  categories = [
    {
      name: 'Communication',
      description: 'Améliorer ses compétences relationnelles',
      icon: '💬',
      resourceCount: 85,
      color: 'bg-blue-600'
    },
    {
      name: 'Leadership',
      description: 'Développer ses capacités de leader',
      icon: '👑',
      resourceCount: 62,
      color: 'bg-green-600'
    },
    {
      name: 'Gestion des Émotions',
      description: 'Comprendre et maîtriser ses émotions',
      icon: '🧘',
      resourceCount: 78,
      color: 'bg-purple-600'
    },
    {
      name: 'Résolution de Conflits',
      description: 'Gérer les situations difficiles',
      icon: '🤝',
      resourceCount: 54,
      color: 'bg-red-600'
    },
    {
      name: 'Intelligence Émotionnelle',
      description: 'Développer son QE',
      icon: '🧠',
      resourceCount: 91,
      color: 'bg-yellow-600'
    },
    {
      name: "Travail d'Équipe",
      description: 'Collaborer efficacement',
      icon: '👥',
      resourceCount: 67,
      color: 'bg-indigo-600'
    }
  ];

  // Témoignages
  testimonials = [
    {
      name: 'Sophie Martin',
      role: 'Manager RH',
      avatar: '👩‍💼',
      content: 'Cette plateforme m\'a vraiment aidée à améliorer mes relations professionnelles. Les ressources sont claires et pratiques.',
      rating: 5
    },
    {
      name: 'Thomas Dubois',
      role: 'Coach professionnel',
      avatar: '👨‍🏫',
      content: 'Je recommande vivement ! Les contenus sont de qualité et le suivi de progression est très motivant.',
      rating: 5
    },
    {
      name: 'Marie Lefebvre',
      role: 'Entrepreneur',
      avatar: '👩‍💻',
      content: 'Grâce à ces ressources, j\'ai pu transformer ma manière de communiquer avec mon équipe. Résultats visibles en quelques semaines.',
      rating: 5
    }
  ];

  // Plans (si tu veux ajouter une section pricing plus tard)
  plans = [
    {
      name: 'Gratuit',
      price: '0',
      period: 'mois',
      features: [
        'Accès à 50 ressources',
        'Suivi basique de progression',
        'Accès communauté',
        'Support par email'
      ],
      highlighted: false,
      cta: 'Commencer gratuitement'
    },
    {
      name: 'Premium',
      price: '9.99',
      period: 'mois',
      features: [
        'Accès illimité aux ressources',
        'Suivi avancé de progression',
        'Accès prioritaire aux nouveautés',
        'Certificats de complétion',
        'Support prioritaire',
        'Contenu exclusif'
      ],
      highlighted: true,
      cta: 'Essayer 30 jours gratuits'
    },
    {
      name: 'Entreprise',
      price: 'Sur mesure',
      period: '',
      features: [
        'Tout du plan Premium',
        'Espace dédié entreprise',
        'Gestion d\'équipe',
        'Rapports personnalisés',
        'Formation sur site',
        'Account manager dédié'
      ],
      highlighted: false,
      cta: 'Nous contacter'
    }
  ];

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

  /**
   * Génère un tableau d'étoiles pour le rating
   */
  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}
