export interface AdminRessource {
  idRessource: number;
  titre: string;
  description: string;
  format: string;
  visibilite: string;
  statut: string;
  dateCreation: string;
  idUtilisateur: number;
  nomAuteur: string;
  prenomAuteur: string;
  idCategorie: number;
  nomCategorie: string;
}

export interface AdminCreateRessourcePayload {
  titre: string;
  description: string;
  format: string;
  visibilite: number;
  idCategorie: number;
}

export interface AdminUpdateRessourcePayload {
  titre?: string;
  description?: string;
  format?: string;
  visibilite?: number;
  idCategorie?: number;
}

export interface VisibiliteOption {
  value: number;
  label: string;
}
