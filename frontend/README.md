# (Re)sources Relationnelles — Frontend

Application Angular 19 de la plateforme nationale de développement des compétences relationnelles.

## Prérequis

- Node.js >= 18
- npm >= 9
- Angular CLI 19 (`npm install -g @angular/cli`)

---

## Démarrage du serveur de développement

```bash
npm install
npm start
# ou : ng serve
```

L'application est accessible sur `http://localhost:4200/`.  
Le rechargement à chaud est activé automatiquement.

---

## Build

```bash
# Build de développement
npm run build

# Build de production (optimisé)
ng build --configuration production
```

Les artefacts sont générés dans `dist/`.

---

## Tests

### Tests unitaires — Jasmine / Karma

Exécutent les tests de composants, services, guards et intercepteurs Angular.

```bash
# Mode interactif (watch)
npm test

# Exécution unique (CI)
npm test -- --watch=false --browsers=ChromeHeadless
```

Couverture : 139 tests unitaires + 7 tests d'accessibilité (axe-core WCAG 2A/2AA) + 16 tests responsive.

---

### Tests E2E — Playwright

Testent les parcours utilisateurs complets dans un vrai navigateur avec l'API mockée.

#### Installation (première fois)

```bash
npm install
npx playwright install          
```

#### Commandes

```bash
# Tous les tests, tous les navigateurs (mode CI)
npm run test:e2e

# Mode fenêtre visible (debug)
npm run test:e2e:headed

# Interface interactive Playwright UI
npm run test:e2e:ui

# Ouvrir le rapport HTML après exécution
npm run test:e2e:report

# Un seul fichier de test
npx playwright test e2e/auth.spec.ts

# Un seul test par nom
npx playwright test -g "CT-E2E-AUTH-004"

# Navigateur spécifique
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=mobile-chrome
```

#### Suites disponibles

| Fichier | Scénarios couverts | Tests |
|---|---|---|
| `e2e/auth.spec.ts` | Connexion, inscription, déconnexion, validation | 11 |
| `e2e/resources.spec.ts` | Liste, filtres, recherche, création de ressource | 8 |
| `e2e/navigation.spec.ts` | Redirections, navbar, guards, menu mobile | 8 |
| `e2e/dashboard.spec.ts` | Modération, validation/refus, droits par rôle | 7 |

> L'application Angular doit être démarrée (`npm start`) avant de lancer les tests E2E,  
> ou la config Playwright la démarre automatiquement via `webServer`.

---

### Tests backend — xUnit (.NET 8)

```bash
cd ../backend/RessourceRelationnel.Tests
dotnet test
```

Couverture : 74 tests fonctionnels + 14 tests de sécurité + 8 tests de performance.

---

```bash
ng generate component nom-du-composant
ng generate service nom-du-service
ng generate --help
```

---

## Ressources

- [Angular CLI](https://angular.dev/tools/cli)
- [Playwright Test](https://playwright.dev/docs/intro)
- [Jasmine](https://jasmine.github.io/)
- [axe-core](https://github.com/dequelabs/axe-core)
