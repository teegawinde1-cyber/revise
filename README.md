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

Le dépôt est initialisé. Les fonctionnalités seront ajoutées progressivement et testées avant d'être déclarées terminées.

## Développement local

Les instructions d'installation seront complétées avec la première version exécutable du client et du serveur.

## Sécurité

Ne jamais publier de mot de passe, clé API, jeton d'accès ou fichier `.env`. Utiliser `.env.example` pour documenter les variables nécessaires.
