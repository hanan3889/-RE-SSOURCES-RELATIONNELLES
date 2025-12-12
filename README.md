# -RE-SSOURCES-RELATIONNELLES - GitFlow


### Règles Absolues

### ❌ Ne JAMAIS faire :

```bash
# ❌ Push direct sur main ou develop
git checkout main
git push origin main

# ❌ Merge sans PR
git checkout develop
git merge feat/ma-branche
git push origin develop

# ❌ Créer une branche depuis main
git checkout main
git checkout -b feat/nouvelle-fonctionnalite
```
---

## Procédure Complète

### Créer une Nouvelle Branche de Fonctionnalité

**Toujours partir de `develop` à jour :**

```bash
# Se placer sur develop
git checkout develop

# Récupérer les dernières modifications
git pull origin develop

# Créer la branche de fonctionnalité
git checkout -b feat/nom-de-ma-fonctionnalite
```

### 2. Développer et Commiter

```bash
# Ajouter les fichiers modifiés
git add .

# Commiter avec un message clair
git commit -m "feat: ajout du dashboard utilisateur avec historique diagnostics"

# Pousser la branche sur GitHub
git push origin feat/dashboard-utilisateur
```

### 3. Créer une Pull Request vers `develop`

1. **Aller sur GitHub** → onglet "Pull Requests"
2. **Cliquer sur "New Pull Request"**
3. **Sélectionner :**
   - Base : `develop`
   - Compare : `feat/votre-branche`
4. **Remplir le template de PR :**

### 4. Après le Merge dans `develop`

```bash
# Revenir sur develop
git checkout develop

# Récupérer les modifications
git pull origin develop

# Supprimer la branche locale 
git branch -d feat/dashboard-utilisateur

# Supprimer la branche distante
git push origin --delete feat/dashboard-utilisateur
```

### 5. Mise en Production (`develop` → `main`)

1. **Créer une PR de `develop` vers `main`**
2. **Titre de la PR :** `Release v1.0.0 - 
3. **Description :**
4. **Créer un tag de version**

```bash
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release v1.0.0: Dashboard et diagnostic"
git push origin v1.0.0
```

---



