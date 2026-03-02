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
  type: 'article';
  visibilite: 'Publique' | 'Citoyens connectés' | 'Privée';
  statut: 'Brouillon' | 'En validation' | 'Publiée' | 'Rejetée' | 'Archivée';
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
    },
    {
      id: 6,
      title: 'Développer son intelligence émotionnelle',
      description: 'Un guide pour comprendre et améliorer votre intelligence émotionnelle.',
      content: 'L\'intelligence émotionnelle est la capacité à reconnaître, comprendre et maîtriser ses propres émotions et à composer avec les émotions des autres personnes. Cet article vous guidera à travers les 5 composantes de l\'intelligence émotionnelle et vous donnera des exercices pratiques.',
      author: 'Alice Dubois',
      category: 'Développement Personnel',
      createdAt: new Date('2024-01-15'),
      type: 'article',
      visibilite: 'Publique',
      statut: 'Publiée',
    },
    {
      id: 7,
      title: 'La communication non-violente (CNV)',
      description: 'Introduction aux principes de la CNV pour des relations plus harmonieuses.',
      content: 'La Communication Non-Violente (CNV) est un processus de communication élaboré par Marshall Rosenberg. L\'intention de la CNV est de créer une qualité de relation et d\'empathie, avec soi et avec les autres. Découvrez les 4 étapes de la CNV : Observation, Sentiment, Besoin, Demande.',
      author: 'Marc Petit',
      category: 'Communication',
      createdAt: new Date('2024-02-01'),
      type: 'article',
      visibilite: 'Citoyens connectés',
      statut: 'Publiée',
    },
    {
      id: 8,
      title: 'Gérer les conflits au travail',
      description: 'Stratégies et outils pour aborder et résoudre les conflits professionnels.',
      content: 'Les conflits font partie de la vie professionnelle. Mal gérés, ils peuvent nuire à la productivité et à l\'ambiance de travail. Cet article présente des méthodes pour identifier les sources de conflit, pour communiquer de manière constructive et pour trouver des solutions gagnant-gagnant.',
      author: 'Carole Martin',
      category: 'Vie Professionnelle',
      createdAt: new Date('2024-02-20'),
      type: 'article',
      visibilite: 'Publique',
      statut: 'En validation',
    },
    {
      id: 9,
      title: 'L\'art de donner et recevoir du feedback',
      description: 'Comment transformer le feedback en un outil de croissance.',
      content: 'Le feedback est essentiel pour le développement personnel et professionnel. Cet article explore comment formuler un feedback constructif et comment le recevoir avec ouverture, même lorsqu\'il est difficile à entendre.',
      author: 'Isabelle Moreau',
      category: 'Management',
      createdAt: new Date('2024-03-01'),
      type: 'article',
      visibilite: 'Citoyens connectés',
      statut: 'Publiée',
    },
    {
      id: 10,
      title: 'Booster sa confiance en soi',
      description: 'Exercices pratiques pour renforcer l\'estime de soi et la confiance en ses capacités.',
      content: 'La confiance en soi n\'est pas innée, elle se construit. Découvrez des techniques psychologiques et des exercices quotidiens pour sortir de votre zone de confort, célébrer vos succès et développer une image de soi positive.',
      author: 'Dr. David Lambert',
      category: 'Développement Personnel',
      createdAt: new Date('2024-03-10'),
      type: 'article',
      visibilite: 'Publique',
      statut: 'Publiée',
    },
    {
      id: 11,
      title: 'Introduction à la pensée critique',
      description: 'Apprenez à analyser l\'information de manière objective et à former des jugements éclairés.',
      content: 'À l\'ère de l\'information, la pensée critique est une compétence fondamentale. Cet article vous initie aux bases de la pensée critique : identifier les biais cognitifs, évaluer la crédibilité des sources et construire des arguments logiques.',
      author: 'Prof. Hélène Olivier',
      category: 'Compétences',
      createdAt: new Date('2024-03-15'),
      type: 'article',
      visibilite: 'Publique',
      statut: 'Publiée',
    },
    {
      id: 12,
      title: 'Le syndrome de l\'imposteur : le reconnaître et le surmonter',
      description: 'Ne laissez plus le sentiment d\'illégitimité freiner votre potentiel.',
      content: 'Beaucoup de personnes talentueuses souffrent du syndrome de l\'imposteur, attribuant leur succès à la chance plutôt qu\'à leurs compétences. Cet article vous aide à reconnaître les signes de ce syndrome et propose des stratégies pour le surmonter.',
      author: 'Sophie Dubois',
      category: 'Psychologie',
      createdAt: new Date('2024-03-20'),
      type: 'article',
      visibilite: 'Publique',
      statut: 'En validation',
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