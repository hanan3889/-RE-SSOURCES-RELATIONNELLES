# (Re)sources Relationnelles

Plateforme web de partage et de gestion de ressources pour le bien-être relationnel.


---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Angular 19 (standalone components) |
| Backend | .NET 8 — ASP.NET Core Web API |
| Base de données | MySQL 8.0 |
| Authentification | JWT (BCrypt pour les mots de passe) |
| Conteneurisation | Docker + Docker Compose |
| Style | Tailwind CSS + Bootstrap 5 + PrimeNG |

---

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (mode Linux containers)
- Ports disponibles sur la machine :

| Port | Service |
|---|---|
| `4200` | Frontend Angular (mode dev) |
| `8080` | API .NET |
| `8081` | Frontend nginx (mode prod) |
| `3307` | MySQL (accès local) |

---

## Démarrage rapide

### Mode développement

Lance tous les services :

```bash
docker compose --profile dev up --build
```

| URL | Description |
|---|---|
| `http://localhost:4200` | Application Angular |
| `http://localhost:8080/swagger` | Documentation API interactive |

### Mode prod (nginx)

```bash
docker compose --profile prod up --build
```

| URL | Description |
|---|---|
| `http://localhost:8081` | Application (build optimisé) |
| `http://localhost:8080/swagger` | Documentation API |

### Arrêter les services

```bash
# Arrêter sans supprimer les données
docker compose --profile dev down

# Arrêter ET supprimer la base de données 
docker compose --profile dev down -v
```

---

## Tests

### Frontend — Tests unitaires (Karma / Jasmine)

Depuis le dossier `frontend/` :

```bash
# Lancer les tests unitaires (mode watch, navigateur Chrome)
npm test

# Lancer les tests unitaires une seule fois (sans watch)
ng test --watch=false

# Lancer les tests avec couverture de code
ng test --watch=false --code-coverage
```

---

### Frontend — Tests E2E (Playwright)

Depuis le dossier `frontend/` :

> Le serveur Angular (`http://localhost:4200`) doit être lancé ou sera démarré automatiquement par Playwright.

```bash
# Lancer tous les tests E2E (headless, tous navigateurs)
npm run test:e2e

# Lancer les tests E2E avec interface graphique Playwright
npm run test:e2e:ui

# Lancer les tests E2E en mode visible (headed)
npm run test:e2e:headed

# Afficher le dernier rapport HTML
npm run test:e2e:report
```

Les navigateurs ciblés par défaut : **Chromium**, **Firefox**, **Mobile Chrome (Pixel 5)**.

---

### Backend — Tests unitaires (xUnit / .NET)

**Prérequis : ouvrir la solution dans Visual Studio**

1. Ouvrir **Visual Studio** (2022 recommandé)
2. Fichier → Ouvrir → Projet/Solution → sélectionner `backend\RessourceRelationnel.sln`
3. Attendre la restauration des packages NuGet

**Lancer les tests depuis Visual Studio :**

1. Menu **Test** → **Exécuter tous les tests** (ou `Ctrl+R, A`)
2. L'explorateur de tests s'ouvre et affiche les résultats du projet `RessourceRelationnel.Tests`

> Pour cibler uniquement `RessourceRelationnel.Tests` : clic droit sur le projet dans
> l'**Explorateur de solutions** → **Exécuter les tests**

**Ou depuis PowerShell (dans `backend\`) :**

```powershell
cd backend
dotnet test RessourceRelationnel.Tests\RessourceRelationnel.Tests.csproj
```

Les tests couvrent : `AuthController`, `CategoriesController`, `CommentairesController`,
`FavorisController`, `ModerationController`, `ProgressionController`, `RessourcesController`,
`UtilisateursController`, `JwtService` — 107 tests au total.

---


