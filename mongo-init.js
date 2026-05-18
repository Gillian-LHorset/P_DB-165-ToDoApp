db = db.getSiblingDB("db_todoapp");

//test
db.createCollection("init");
db.init.drop();

// Utilisateur 1: app_backend
// Accès limité à la base de l’application (CRUD + création de collections/indexes)
db.createUser({
  user: "app_backend",
  pwd: "password_app", // En production, utiliser une variable d'environnement ou un secret
  roles: [
    { role: "readWrite", db: "db_todoapp" },
    { role: "dbAdmin", db: "db_todoapp" },
  ],
});

// Utilisateur 2: admin_app
// Administrateur limité à la DB (création d'index, stats, création d'utilisateurs locaux)
db.createUser({
  user: "admin_app",
  pwd: "password_admin",
  roles: [
    { role: "dbAdmin", db: "db_todoapp" },
    { role: "userAdmin", db: "db_todoapp" },
  ],
});

// Basculer sur la base admin pour l'utilisateur de backup global
db = db.getSiblingDB("admin");

// Utilisateur 3: backup_user
// Accès lecture seule global, optimisé pour mongodump (rôle 'backup')
db.createUser({
  user: "backup_user",
  pwd: "password_backup",
  roles: [{ role: "backup", db: "admin" }],
});
