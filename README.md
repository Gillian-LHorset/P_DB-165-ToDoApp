# Todo-App (Migration MongoDB & Redis)

## Description du projet

Cette application est une application de gestion de taches (Todo) qui permet de gérer des tâches avec une recherche.
C'était un application développée avec MySQL qui a été migrée pour utiliser **MongoDB** comme base de données principale, avec Mongoose, et **Redis** pour le cache pour optimiser les temps de réponse de l'API.

## Technologies utilisées

- **Backend** : Node.js, Express.js, Mongoose, Redis
- **Base de données** : MongoDB (Docker)
- **Cache** : Redis (Docker)
- **Gestionnaire de DB** : Docker

## Mise en place de l'application en local

1. **Démarrer les DB**  
   À executer à la racine du projet :

   ```bash
   docker-compose up -d
   ```

   Au premier lancement, le script `mongo-init.js` configurera automatiquement la base de données et ses utilisateurs

2. **Démarrer le backend**
   Dans un terminal, placez-vous dans le dossier `backend/` :

   ```bash
   cd backend
   npm install
   ```

   Chagez le .env.exemple en .env et entrez y le mot de passe, le nom d'utilisateur, le port, le serveur et/ou la base de données d'identification, si besoin.

   ```bash
   npm run dev
   ```

3. **Démarrer le frontend**
   Dans un autre terminal, placez-vous dans le dossier `frontend/` :
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

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

_Explication de la commande :_

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

_Le password et le user est défini dans le fichier `mongo-init.js` qui s'execute au lancement_

## Utilisation de l'IA

L'IA à été utiliser avec partimonnie afin de gagne du temps. L'utilisation de l'IA à servi à :

- Aide à la rédaction du README (explication commande backup, explications user et permission)
- Conclusion
- Génération du ficher mongo-init.js

## Conclusion

L'application est désormais robuste, rapide (grâce à Redis) et sécurisée (grâce au principe de moindre privilège appliqué à MongoDB). L'utilisation de Mongoose simplifie grandement les interactions en remplaçant l'ancien système basé sur MySQL.
