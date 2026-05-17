# Todo-App (Migration MongoDB & Redis)

## Description du projet
Cette application est une gestion de tâches (Todo App) qui permet à des utilisateurs de s'inscrire, se connecter, et gérer leurs propres tâches avec une recherche intégrée. 
Initialement développée avec MySQL, l'application a été migrée pour utiliser **MongoDB** comme base de données principale (via Mongoose) et **Redis** comme système de cache pour optimiser les temps de réponse de l'API.

## Technologies utilisées
- **Frontend** : Vue 3, TypeScript, TailwindCSS
- **Backend** : Node.js (20+), Express.js, Mongoose, Redis (client npm `redis`)
- **Base de données** : MongoDB (via Docker)
- **Cache** : Redis Stack (via Docker)
- **Infrastructure** : Docker & Docker Compose

## Instructions de fonctionnement en local
Pour faire fonctionner le projet en local, assurez-vous d'avoir Docker, Node.js (v20+) et npm installés.

1. **Démarrer l'infrastructure (MongoDB & Redis)**
   À la racine du projet, exécutez la commande suivante :
   ```bash
   docker-compose up -d
   ```
   *Note : Au premier lancement, le script `mongo-init.js` configurera automatiquement la base de données et ses utilisateurs.*

2. **Démarrer le backend**
   Dans un terminal, placez-vous dans le dossier `backend/` :
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Démarrer le frontend**
   Dans un autre terminal, placez-vous dans le dossier `frontend/` :
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   L'application sera accessible sur l'URL indiquée par Vite (généralement `http://localhost:5173`).

## Utilisateurs MongoDB et Permissions (Point 2.1)
Un script `mongo-init.js` est monté dans le conteneur MongoDB pour créer 3 utilisateurs spécifiques lors de son initialisation :

1. **`app_backend`** : Utilisé par l'application Node.js. Il a les rôles `readWrite` et `dbAdmin` sur la base de données `db_todoapp`. Il peut faire le CRUD complet et modifier les index/collections.
2. **`admin_app`** : Administrateur de la base `db_todoapp`. Il possède les rôles `dbAdmin` et `userAdmin`. Il peut gérer les index, consulter les statistiques et créer des utilisateurs locaux sur la base.
3. **`backup_user`** : Créé dans la base `admin`, il possède le rôle global `backup`. Il a un accès en lecture seule global optimisé pour les opérations de type `mongodump` ou `mongoexport`.

## Sauvegarde et Restauration (Point 2.2)
Nous souhaitons réaliser une sauvegarde complète de la base de données qui prend le moins de place possible.

**Commande de sauvegarde (Backup) :**
```bash
docker exec mongo mongodump --authenticationDatabase admin -u backup_user -p password_backup -d db_todoapp --gzip --archive=/backupdb/db_todoapp_backup.gz
```
*Explication de la commande :*
- `docker exec mongo` : Exécute la commande à l'intérieur du conteneur `mongo`.
- `mongodump` : L'utilitaire MongoDB permettant de faire des exports de données binaires.
- `--authenticationDatabase admin -u backup_user -p password_backup` : Authentification via notre utilisateur dédié au backup (qui a le rôle `backup` sur `admin`).
- `-d db_todoapp` : Cible spécifiquement la base de données de l'application.
- `--gzip` : Compresse le flux de données pour que l'archive prenne un minimum de place (exigence du cahier des charges).
- `--archive=/backupdb/db_todoapp_backup.gz` : Produit un fichier d'archive compressé unique plutôt qu'un dossier de BSONs, écrit directement dans le volume partagé (qui est mappé sur `./data/mongo` côté hôte).

**Commande de restauration (Restore) :**
```bash
docker exec mongo mongorestore --authenticationDatabase admin -u app_backend -p password_app --gzip --archive=/backupdb/db_todoapp_backup.gz
```

## Usage de l'IA
Dans le cadre de ce projet, un assistant IA (Antigravity) a été utilisé pour :
- Identifier les portions de code nécessitant des modifications (passage des ID MySQL aux `_id` MongoDB et activation des `virtuals`).
- Implémenter l'interface Redis pour la mise en cache (vérification, set, invalidation).
- Écrire le script `mongo-init.js` et documenter les commandes d'administration MongoDB (mongodump avec compression GZIP).
L'IA a servi d'outil d'accélération et de vérification pour s'assurer que le cahier des charges était scrupuleusement respecté.

## Conclusion
L'application est désormais robuste, rapide (grâce à Redis) et sécurisée (grâce au principe de moindre privilège appliqué à MongoDB). L'utilisation de Mongoose simplifie grandement les interactions en remplaçant l'ancien système basé sur MySQL.
