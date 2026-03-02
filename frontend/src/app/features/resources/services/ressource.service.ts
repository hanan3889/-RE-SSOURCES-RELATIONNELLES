import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Ressource {
  id: number;
  title: string;
  description: string;
  content: string;
  author: string;
  category: string;
  createdAt: Date;
  type: 'video' | 'article' | 'podcast';
  visibilite: 'Publique' | 'Citoyens connectés' | 'Privée';
  statut: 'Brouillon' | 'En validation' | 'Publiée' | 'Rejetée' | 'Archivée';
  duration?: number; // in minutes for video/podcast
}

@Injectable({
  providedIn: 'root'
})
export class RessourceService {

  private ressources: Ressource[] = [
    { 
      id: 1, 
      title: 'Gestion du stress au quotidien', 
      description: 'Apprenez des techniques simples pour réduire le stress et l\'anxiété dans votre vie de tous les jours.', 
      content: `Le stress est une réaction naturelle de l'organisme face à une situation difficile. Cependant, lorsqu'il devient chronique, il peut avoir des effets néfastes sur notre santé physique et mentale. Dans cet article, nous explorerons plusieurs techniques de gestion du stress que vous pouvez intégrer facilement dans votre routine quotidienne. De la respiration profonde à la méditation, en passant par l'activité physique et une alimentation équilibrée, découvrez comment reprendre le contrôle et retrouver un état de bien-être. `,
      author: 'Dr. Sophie Martin',
      category: 'Santé Mentale',
      createdAt: new Date('2023-10-26'),
      type: 'article',
      visibilite: 'Publique',
      statut: 'Publiée',
    },
    { 
      id: 2, 
      title: 'Introduction à la méditation de pleine conscience', 
      description: 'Découvrez les bienfaits de la méditation pour votre bien-être mental et comment débuter.', 
      content: `La méditation de pleine conscience est une pratique qui consiste à porter son attention sur le moment présent, sans jugement. Cette vidéo guidée de 15 minutes est parfaite pour les débutants. Elle vous aidera à vous familiariser avec les sensations de votre corps et le flot de vos pensées, vous menant vers un état de calme et de clarté mentale. Aucun équipement n'est nécessaire, juste un endroit tranquille où vous ne serez pas dérangé.`,
      author: 'Julien Lecomte',
      category: 'Méditation',
      createdAt: new Date('2023-11-05'),
      type: 'video',
      duration: 15,
      visibilite: 'Publique',
      statut: 'Publiée',
    },
    { 
      id: 3, 
      title: 'Améliorer la qualité de son sommeil', 
      description: 'Conseils et astuces pour un sommeil réparateur et une meilleure santé globale.', 
      content: `Un bon sommeil est crucial pour la santé. Dans ce podcast, nous discutons avec le Dr. Alain Dubois, spécialiste du sommeil, des dernières recherches sur le sujet. Vous apprendrez à créer une routine de coucher optimale, à identifier les perturbateurs de sommeil courants (comme les écrans ou la caféine) et à mettre en place des stratégies efficaces pour vaincre l'insomnie. Préparez-vous à transformer vos nuits et à vous réveiller plein d'énergie.`,
      author: 'Dr. Alain Dubois',
      category: 'Sommeil',
      createdAt: new Date('2023-11-12'),
      type: 'podcast',
      duration: 25,
      visibilite: 'Publique',
      statut: 'Publiée',
    },
    { 
      id: 4, 
      title: 'Comprendre et gérer l\'anxiété sociale', 
      description: 'Des stratégies pour surmonter la peur des interactions sociales et gagner en confiance.', 
      content: `L'anxiété sociale peut être un véritable handicap au quotidien. Cet article explore les racines de ce trouble et propose des exercices pratiques issus des thérapies cognitivo-comportementales (TCC) pour y faire face. Apprenez à défier vos pensées négatives, à vous exposer progressivement aux situations redoutées et à développer des compétences sociales solides pour des interactions plus sereines et authentiques.`,
      author: 'Claire Bernard',
      category: 'Psychologie',
      createdAt: new Date('2023-11-20'),
      type: 'article',
      visibilite: 'Publique',
      statut: 'Publiée',
    },
    { 
      id: 5, 
      title: 'L\'importance de l\'activité physique pour la santé mentale', 
      description: 'Comment le sport peut être un allié puissant contre la dépression et l\'anxiété.', 
      content: `Le lien entre le corps et l'esprit n'est plus à prouver. L'activité physique régulière est l'un des outils les plus efficaces pour améliorer l'humeur et réduire les symptômes de la dépression et de l'anxiété. Cette ressource détaille les mécanismes neurochimiques en jeu (production d'endorphines, régulation des neurotransmetteurs) et vous donne des conseils pour choisir une activité qui vous plaît et vous motiver à long terme.`,
      author: 'Coach David Roche',
      category: 'Sport & Bien-être',
      createdAt: new Date('2023-12-01'),
      type: 'article',
      visibilite: 'Publique',
      statut: 'Publiée',
    }
  ];

  constructor() { }

  getRessources(): Observable<Ressource[]> {
    return of(this.ressources);
  }

  getRessourceById(id: number): Observable<Ressource | undefined> {
    const ressource = this.ressources.find(r => r.id === id);
    return of(ressource);
  }
}