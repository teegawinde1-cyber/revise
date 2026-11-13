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
- Authentification : jetons JWT signés
- Stockage privé des fichiers de cours
- IA : fournisseur configurable côté serveur, sans clé secrète dans le navigateur

## État du projet

La base du projet comprend l'interface React, l'API Express, l'authentification PostgreSQL, les matières, les leçons, les flashcards, l'historique des QCM et un adaptateur IA compatible OpenAI. Quand les variables IA sont renseignées, les routes d'analyse de leçon produisent un résumé, des points essentiels, des flashcards et des QCM de difficulté choisie. Sans clé IA, le QCM simple par extraction reste disponible.

## Développement local

### Installation

1. Installer Node.js LTS et PostgreSQL.
2. À la racine du dépôt : `npm install`.
3. Créer une base PostgreSQL vide.
4. Pour une base neuve, exécuter tout le fichier `server/schema.sql`. Pour une base déjà utilisée par la première version, exécuter plutôt `server/migrations/001_ai_notes.sql`.
5. Copier `server/.env.example` vers `server/.env`, puis renseigner `DATABASE_URL` et un `JWT_SECRET` long et aléatoire.
7. Pour activer l'IA, renseigner `AI_BASE_URL`, `AI_API_KEY` et `AI_MODEL` dans `server/.env`. Le format attendu est l'API Chat Completions compatible OpenAI. Exemple OpenRouter : `AI_BASE_URL=https://openrouter.ai/api/v1`. La clé doit rester côté serveur et ne jamais être placée dans le dossier `client`.
8. `AI_DAILY_LIMIT` règle le nombre maximal d'appels IA par compte sur 24 heures (30 par défaut).
9. Lancer `npm run dev` à la racine.
10. Ouvrir l'adresse locale affichée par Vite (habituellement `http://localhost:5173`).

Pour héberger l'application, il faudra ensuite déployer séparément le client, l'API et PostgreSQL, puis définir `VITE_API_URL` sur l'URL publique de l'API.

### QCM actuel

Sans configuration IA, le générateur de secours extrait des phrases du cours et peut produire des questions moins pertinentes. Avec une clé IA valide, les QCM sont générés par le modèle configuré, puis contrôlés côté serveur pour vérifier quatre choix et un index de réponse valide. Les contenus générés doivent toujours être relus par l'élève. Les résultats sont enregistrés dans PostgreSQL.

## Sécurité

Ne jamais publier de mot de passe, clé API, jeton d'accès ou fichier `.env`. Utiliser `.env.example` pour documenter les variables nécessaires.
