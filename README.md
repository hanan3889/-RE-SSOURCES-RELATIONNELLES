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





