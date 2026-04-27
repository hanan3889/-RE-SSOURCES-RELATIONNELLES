// ─── JWT helpers ─────────────────────────────────────────────────────────────

function toBase64Url(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function makeJwt(payload: Record<string, unknown>): string {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = toBase64Url(
    JSON.stringify({ exp: 9_999_999_999, iat: 1_700_000_000, ...payload })
  );
  return `${header}.${body}.e2e_fake_signature`;
}

// ─── Simulated users ──────────────────────────────────────────────────────────

export type MockUser = {
  idUtilisateur: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  token: string;
};

function makeUser(
  id: number,
  email: string,
  nom: string,
  prenom: string,
  role: string
): MockUser {
  const token = makeJwt({ nameid: String(id), email, role });
  return { idUtilisateur: id, email, nom, prenom, role, token };
}

export const CITOYEN = makeUser(1, 'citoyen@test.com', 'Dupont', 'Marie', 'citoyen');
export const ADMINISTRATEUR = makeUser(2, 'admin@test.com', 'Admin', 'Super', 'administrateur');
export const MODERATEUR = makeUser(3, 'moderateur@test.com', 'Robin', 'Thibault', 'moderateur');

// ─── Mock categories ──────────────────────────────────────────────────────────

export const MOCK_CATEGORIES = [
  { idCategorie: 1, nomCategorie: 'Couple' },
  { idCategorie: 2, nomCategorie: 'Famille' },
  { idCategorie: 3, nomCategorie: 'Communication' },
];

// ─── Mock resource DTOs (raw API format before frontend mapping) ───────────────

export const MOCK_RESSOURCES_DTO = [
  {
    idRessource: 1,
    titre: 'Guide de communication bienveillante',
    description: 'Un guide complet pour améliorer votre communication au quotidien.',
    format: 'Article',
    visibilite: 'Publique',
    statut: 'Publiee',
    dateCreation: '2026-01-15T10:00:00Z',
    idUtilisateur: 1,
    nomAuteur: 'Dupont',
    prenomAuteur: 'Marie',
    idCategorie: 3,
    nomCategorie: 'Communication',
  },
  {
    idRessource: 2,
    titre: 'Atelier gestion des conflits familiaux',
    description: 'Techniques pratiques pour résoudre les conflits en famille.',
    format: 'Vidéo',
    visibilite: 'Publique',
    statut: 'Publiee',
    dateCreation: '2026-02-10T14:30:00Z',
    idUtilisateur: 2,
    nomAuteur: 'Martin',
    prenomAuteur: 'Jean',
    idCategorie: 2,
    nomCategorie: 'Famille',
  },
  {
    idRessource: 3,
    titre: 'Exercice de pleine conscience en couple',
    description: 'Méditation guidée pour renforcer le lien de couple.',
    format: 'Article',
    visibilite: 'Connectes',
    statut: 'Publiee',
    dateCreation: '2026-03-05T09:15:00Z',
    idUtilisateur: 3,
    nomAuteur: 'Leclerc',
    prenomAuteur: 'Sophie',
    idCategorie: 1,
    nomCategorie: 'Couple',
  },
];

export const MOCK_MODERATION_QUEUE_DTO = [
  {
    idRessource: 10,
    titre: 'Ressource en attente de validation',
    description: 'Description de la ressource soumise par un citoyen pour validation.',
    format: 'Article',
    visibilite: 'Publique',
    statut: 'EnValidation',
    dateCreation: '2026-04-01T08:00:00Z',
    idUtilisateur: 1,
    nomAuteur: 'Dupont',
    prenomAuteur: 'Marie',
    idCategorie: 1,
    nomCategorie: 'Couple',
  },
];

export const MOCK_CREATED_RESSOURCE_DTO = {
  idRessource: 99,
  titre: 'Ma nouvelle ressource E2E',
  description: 'Description de test pour E2E.',
  format: 'Article',
  visibilite: 'Publique',
  statut: 'EnValidation',
  dateCreation: '2026-04-27T10:00:00Z',
  idUtilisateur: 1,
  nomAuteur: 'Dupont',
  prenomAuteur: 'Marie',
  idCategorie: 1,
  nomCategorie: 'Couple',
};

// ─── API base URL ─────────────────────────────────────────────────────────────

export const API_BASE = 'http://localhost:8080/api';
