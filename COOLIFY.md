# Déployer Boutiko avec Coolify

## Prérequis
- Un serveur avec Coolify installé (auto-hosted ou Coolify Cloud)
- Un compte GitHub avec le dépôt Boutiko

## Configuration Coolify

### 1. Créer un nouveau service
- Dans Coolify → **New Service** → **Public Repository**
- Sélectionnez le dépôt GitHub de Boutiko
- Branch: `main`

### 2. Configuration du Build
| Option | Valeur |
|--------|--------|
| **Build Type** | `Nixpacks` ou `Dockerfile` |
| **Dockerfile Path** | `Dockerfile` (si Dockerfile) |

### 3. Variables d'environnement
Ajoutez ces variables dans **Environment** :

```env
DATABASE_URL=file:./db/boutiko.db
PORT=3000
HOSTNAME=0.0.0.0
NODE_ENV=production
```

> Optionnel : `Z_AI_API_KEY=your-key` pour les fonctionnalités IA

### 4. Domaine
- Dans **Domains** → Ajoutez votre domaine (ex: `boutiko.pro`)
- Coolify configure automatiquement le SSL avec Let's Encrypt

### 5. Persistance des données (⚠️ TRÈS IMPORTANT !)
Deux dossiers doivent être persistés via des volumes. Sans ça, **toutes les images et la base de données sont supprimées** à chaque redémarrage du container !

Dans **Volumes** → Ajoutez **deux volumes** :

| Volume | Container Path | Host Path |
|--------|---------------|-----------|
| Base de données | `/app/db` | `/data/boutiko/db` |
| **Images uploadées** | `/app/uploads` | `/data/boutiko/uploads` |

> ⚠️ Si `/app/uploads` n'est pas en volume, les images disparaîtront à chaque redéploiement/restart du container.

### 6. Commandes de démarrage
Le Dockerfile utilise : `bun server.js`
- Coolify détecte automatiquement le `EXPOSE 3000`
- Le health check vérifie `http://localhost:3000/`

### 7. Post-déploiement
Après le premier déploiement, initialiser la base :
```bash
# Exécuter dans le terminal du service Coolify
bunx prisma db push
bunx prisma db seed   # si disponible
```

## Structure du projet
```
boutiko/
├── Dockerfile              # Build multi-stage optimisé
├── .dockerignore           # Fichiers exclus du build
├── .env.production.example # Template de variables production
├── .env.example            # Template de variables dev
├── next.config.ts          # output: "standalone" (requis)
├── prisma/
│   └── schema.prisma        # Schéma SQLite
├── src/                    # Code source Next.js
├── public/                 # Assets statiques
└── db/                     # Base SQLite (persisté)
```

## Notes importantes
- Le projet utilise `output: "standalone"` dans next.config.ts (requis pour Docker)
- La base SQLite est persistée via le volume `/app/db`
- Le port par défaut est 3000
- Pas besoin de base de données externe (SQLite inclus)
- Compatible ARM et x86_64 (images `oven/bun`)
