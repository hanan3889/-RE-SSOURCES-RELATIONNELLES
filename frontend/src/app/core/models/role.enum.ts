/**
 * Rôles utilisateurs de la plateforme (Re)ssources Relationnelles
 * Correspond à la table `role` de la base de données
 */
export enum Role {
  CITOYEN = 'citoyen',
  MODERATEUR = 'moderateur',
  ADMINISTRATEUR = 'administrateur',
  SUPER_ADMINISTRATEUR = 'super_administrateur'
}
