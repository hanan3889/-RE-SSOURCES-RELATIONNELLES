# 🗂️ (RE)SOURCES RELATIONNELLES — Priorités de développement

> **Jalon 2 : 23 janvier 2026** — Livraison app web (Front Office + Back Office)  
> Stack : Angular 19 · .NET 8 · MySQL 8.0 · Docker

---

## ✅ P1 — Essentielles (à livrer absolument)

### 🔐 Authentification & Gestion des comptes

- [ ] **Inscription citoyen** (Front Office)
  - Formulaire : nom, prénom, email, password
  - Validation côté client (Angular) + côté serveur (.NET)
  - Hash du mot de passe (bcrypt)
  - Retour d'erreur si email déjà utilisé

- [ ] **Connexion / Déconnexion**
  - JWT stocké côté client
  - Garde de route Angular par rôle (`canActivate`)
  - Pattern Singleton pour le service d'authentification

- [ ] **Gestion des rôles** (middleware .NET)
  - Visiteur · Citoyen · Modérateur · Administrateur · Super-admin
  - Attribut `[Authorize(Roles = "...")]` sur les endpoints

---

### 📚 Accès aux ressources (Front Office — tous utilisateurs)

- [ ] **Liste des ressources publiques**
  - Composant Angular avec `@for` (syntaxe Angular 19)
  - Appel `GET /api/ressources?statut=publiee&visibilite=publique`

- [ ] **Filtres & tri**
  - Par catégorie, format, type de relation
  - Tri par date, popularité
  - Temps de réponse < 2s (exigence non fonctionnelle)

- [ ] **Page de détail d'une ressource**
  - Titre, description, format, auteur, date
  - Accès conditionnel selon rôle (visiteur = lecture seule)

---

### ✍️ Contribution citoyens (Front Office — citoyen connecté)

- [ ] **Créer une ressource**
  - Champs : titre, description, format, visibilité (privée / partagée / publique)
  - Statut initial : `en_attente` (validation modérateur requise)
  - Upload de fichier (HTML, PDF, MP4, MP3)

- [ ] **Éditer sa propre ressource**
  - Uniquement si statut `brouillon` ou `refusée`
  - Repasse en `en_attente` après modification

---

### 📊 Tableau de bord progression (Front Office — citoyen connecté)

- [ ] **Dashboard personnel**
  - Ressources consultées
  - Ressources marquées "exploitée" ou "mise de côté"
  - Compteurs simples (pas de graphiques requis en P1)

---

### 🛡️ Sécurité & conformité RGPD (transversal)

- [ ] **Chiffrement des données sensibles** (email, password)
- [ ] **Anonymisation** dans les exports et statistiques
- [ ] **Protection failles courantes** : injection SQL, XSS, CSRF
- [ ] **HTTPS** en environnement de dev/staging Docker

---

## 🟡 P2 — Importantes (à viser pour le Jalon 2)

### 🗃️ Gestion du catalogue (Back Office — Administrateur)

- [ ] **CRUD Ressources**
  - Ajouter, éditer, suspendre, supprimer une ressource
  - Endpoint : `POST/PUT/DELETE /api/admin/ressources`

- [ ] **CRUD Catégories**
  - Ajouter, éditer, supprimer une catégorie
  - Endpoint : `POST/PUT/DELETE /api/admin/categories`

- [ ] **Liste Back Office avec filtres**
  - Vue paginée de toutes les ressources (tous statuts)

---

### 👮 Modération (Back Office — Modérateur)

- [ ] **File de validation**
  - Liste des ressources `en_attente`
  - Action : valider → `publiee` / refuser → `refusee` (avec motif)

- [ ] **Modération des commentaires**
  - Supprimer un commentaire inapproprié

---

### 👤 Gestion des comptes utilisateurs (Back Office — Admin)

- [ ] **Désactiver / réactiver un compte citoyen**
  - Endpoint : `PATCH /api/admin/utilisateurs/:id/statut`

- [ ] **Créer comptes modérateur / admin / super-admin**
  - Réservé au Super-admin uniquement
  - Endpoint : `POST /api/superadmin/utilisateurs`

---

### 💬 Commentaires (Front Office — citoyen connecté)

- [ ] **Ajouter un commentaire** sur une ressource publiée
- [ ] **Afficher les commentaires** d'une ressource (lecture pour tous)

---

### 🔖 Suivi personnel (Front Office — citoyen connecté)

- [ ] **Marquer une ressource** comme `exploitee` / `mise_de_cote` / `non_exploitee`
- [ ] **Favoris** — ajouter / retirer une ressource de ses favoris

---

### ⚙️ Non fonctionnel P2

- [ ] Temps de chargement pages < 3s pour 90% des requêtes
- [ ] Design responsive (web + mobile)
- [ ] Compatibilité Chrome, Firefox, Safari, Edge (dernières versions)
- [ ] Disponibilité 99,5% (SLA)

---

## 🔵 P3 — Optionnelles (post-Jalon 2 / Jalon 3)

### 📈 Statistiques (Back Office — Administrateur)

- [ ] Tableau de bord : consultations, recherches, exploitations, créations
- [ ] Filtres par période, catégorie, zone géographique
- [ ] Export des statistiques (CSV / Excel)

### 🎮 Activités interactives

- [ ] Démarrer une activité/jeu inclus dans une ressource
- [ ] Inviter des participants à une activité
- [ ] Messagerie interne à une ressource (entre participants)

### 🔁 Interactions avancées

- [ ] Répondre à un commentaire (thread)
- [ ] Partager une ressource (lien public)
- [ ] Modération automatique des commentaires

### 🔒 Sécurité avancée

- [ ] Authentification via **FranceConnect**
- [ ] Gestion fine des autorisations (RBAC complet)
- [ ] Journalisation des actions critiques (audit log)
- [ ] Export intégral des données utilisateur (réversibilité RGPD)

### ♿ Accessibilité

- [ ] Conformité **RGAA** (Référentiel Général d'Amélioration de l'Accessibilité)

---

## 📦 Livrables Jalon 2 (23 janvier 2026)

| Livrable | Statut |
|---|---|
| Code source Front Office (Angular 19) | 🔄 En cours |
| Code source Back Office (Angular 19) | 🔄 En cours |
| API REST (.NET 8) — endpoints P1 + P2 | 🔄 En cours |
| Base de données MySQL — schéma complet | 🔄 En cours |
| Docker Compose (front + back + db) | 🔄 En cours |
| Présentation orale de l'avancée | ⏳ À préparer |

---

## 🗄️ Endpoints API à implémenter (référence rapide)

```
AUTH
POST   /api/auth/register          Inscription citoyen
POST   /api/auth/login             Connexion (retourne JWT)
POST   /api/auth/logout            Déconnexion

RESSOURCES
GET    /api/ressources             Liste publique (filtres en query params)
GET    /api/ressources/:id         Détail d'une ressource
POST   /api/ressources             Créer une ressource (citoyen connecté)
PUT    /api/ressources/:id         Modifier sa ressource
DELETE /api/ressources/:id         Supprimer sa ressource

BACK OFFICE — ADMIN
GET    /api/admin/ressources       Toutes ressources (tous statuts)
PUT    /api/admin/ressources/:id   Modifier une ressource
DELETE /api/admin/ressources/:id   Supprimer une ressource
GET    /api/admin/categories       Liste catégories
POST   /api/admin/categories       Créer catégorie
PUT    /api/admin/categories/:id   Modifier catégorie
DELETE /api/admin/categories/:id   Supprimer catégorie

MODÉRATION
GET    /api/moderateur/ressources  File d'attente (statut=en_attente)
PATCH  /api/moderateur/ressources/:id/valider   Valider
PATCH  /api/moderateur/ressources/:id/refuser   Refuser (+ motif)

UTILISATEURS
GET    /api/admin/utilisateurs     Liste citoyens
PATCH  /api/admin/utilisateurs/:id/statut   Activer/désactiver
POST   /api/superadmin/utilisateurs         Créer compte privilégié

PROGRESSION
GET    /api/progression            Dashboard citoyen connecté
PATCH  /api/ressources/:id/statut  Marquer exploitée/mise de côté
POST   /api/ressources/:id/favoris Ajouter aux favoris
DELETE /api/ressources/:id/favoris Retirer des favoris

COMMENTAIRES
GET    /api/ressources/:id/commentaires        Liste
POST   /api/ressources/:id/commentaires        Ajouter
DELETE /api/commentaires/:id                   Supprimer (modérateur)
```

---

## 🏗️ Ordre de développement recommandé

```
1. BDD + migrations MySQL
2. Auth (.NET) → JWT + rôles
3. CRUD Ressources (API) + Catégories
4. Angular — module Auth (login/register)
5. Angular — module Ressources (liste + détail)
6. Angular — module Contribution (créer/éditer ressource)
7. Angular — Back Office (catalogue + modération)
8. Angular — Dashboard progression citoyen
9. Commentaires
10. Tests + Docker Compose final
```

---

*Dernière mise à jour : mars 2026 — Jalon 2 en cours*