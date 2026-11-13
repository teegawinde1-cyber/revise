# RéviseBac

Plateforme francophone de révision scolaire, reconstruite indépendamment de Base44.

## Objectif

Aider les élèves de Seconde, Première et Terminale à organiser leurs cours, comprendre les notions importantes et s'entraîner avec des QCM et des fiches de mémorisation.

## Fonctionnalités prévues

- Comptes élèves et authentification
- Matières et leçons personnelles
- Résumés et points essentiels des cours
- QCM avec correction immédiate et historique des résultats
- Flashcards et suivi des notions à retravailler
- Import de photos de cours et analyse assistée par IA
- Assistant pédagogique, lecture vocale et dictée
- Progression, calendrier et mode hors connexion (PWA)

## Architecture cible

- Frontend : React + Vite
- API : Node.js + Express
- Base de données : PostgreSQL
- Authentification : sessions sécurisées
- Stockage privé des fichiers de cours
- IA : fournisseur configurable côté serveur, sans clé secrète dans le navigateur

## État du projet

La base du projet comprend l'interface React, l'API Express, l'authentification, les matières, les leçons, les flashcards et un premier QCM extrait du texte des cours. Les fonctions avancées restent à développer et à tester.

## Développement local

### Installation

1. Installer Node.js LTS et PostgreSQL.
2. À la racine du dépôt : `npm install`.
3. Créer une base PostgreSQL vide.
4. Exécuter tout le fichier `server/schema.sql` sur cette base (il crée aussi les tables de flashcards et de résultats).
5. Copier `server/.env.example` vers `server/.env`, puis renseigner `DATABASE_URL` et un `JWT_SECRET` long et aléatoire.
6. Lancer `npm run dev` à la racine.
7. Ouvrir l'adresse locale affichée par Vite (habituellement `http://localhost:5173`).

Pour héberger l'application, il faudra ensuite déployer séparément le client, l'API et PostgreSQL, puis définir `VITE_API_URL` sur l'URL publique de l'API.

### QCM actuel

Le premier générateur est une extraction automatique côté serveur : il repère des phrases et des termes présents dans la leçon, puis construit des questions à trous avec quatre choix. Ce n'est pas encore une IA pédagogique : les distracteurs peuvent être peu pertinents et les questions doivent être relues. Une leçon trop courte ou pauvre en phrases peut ne pas produire de QCM. Les résultats sont enregistrés dans l'historique du compte.

## Sécurité

Ne jamais publier de mot de passe, clé API, jeton d'accès ou fichier `.env`. Utiliser `.env.example` pour documenter les variables nécessaires.
