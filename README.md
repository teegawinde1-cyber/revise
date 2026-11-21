# RéviseBac

Application francophone de révision scolaire (Seconde, Première et Terminale), développée avec React/Vite et Node/Express.

## Fonctionnalités présentes

- Accès sans compte obligatoire, identifiant local de l'appareil (pseudonyme, **pas une authentification sécurisée**).
- Matières, cours, fiches de révision et historique QCM sauvegardés via l'API/Firestore si le serveur est configuré.
- QCM à partir du cours, avec difficulté et corrections. Une génération de QCM de secours basée sur l'extraction de mots du cours existe sans fournisseur IA.
- Analyse IA des cours (résumé, points essentiels, fiches) et tuteur IA conversationnel lorsque le fournisseur est configuré.
- Compteurs de génération quotidiens côté serveur.
- Interface responsive et support de l'installation PWA. Le shell de l'application peut être mis en cache; les appels API et données ne sont **pas** disponibles hors connexion.

## Prérequis

- Node.js LTS récent et npm.
- Projet Firebase avec Firestore.
- Un adulte responsable doit vérifier les conditions d'âge et d'utilisation du fournisseur IA avant d'activer ce service. Ne partage jamais de clé API dans le chat, dans le navigateur, ou dans GitHub.

## Démarrage local (Windows)

1. Extraire le ZIP du dépôt.
2. À la racine du dossier, ouvrir un terminal.
3. Installer les dépendances une fois : `npm install`.
4. Copier `server/.env.example` vers `server/.env`.
5. Configurer le service Firebase Admin dans `server/.env` (chemin de fichier privé ou variable JSON).
6. Garder `CLIENT_ORIGIN=http://localhost:5173`.
7. Lancer `npm run dev`.
8. Ouvrir `http://localhost:5173`.

Si les dépendances sont déjà installées et n'ont pas changé, il n'est pas nécessaire de relancer `npm install` pour chaque ZIP source.

## Variables serveur

- `PORT`: port API (4000 par défaut).
- `CLIENT_ORIGIN`: origine du navigateur (dev : localhost:5173).
- `FIREBASE_SERVICE_ACCOUNT_PATH` ou `FIREBASE_SERVICE_ACCOUNT_JSON`: compte de service privé.
- `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`: fournisseur compatible OpenAI. La clé reste côté serveur. N'active pas l'IA tant que les conditions d'âge, les règles de confidentialité et l'autorisation d'utilisation dans une application destinée aux élèves ne sont pas confirmées.

## Déploiement

Le déploiement public nécessite un hébergement HTTPS du frontend et un hébergement Node pour l'API, une configuration Firebase, des règles anti-abus, des limites de coûts et une vraie authentification si des données personnelles ou une synchronisation inter-appareils sont proposées. L'identifiant d'appareil actuel est une pseudonymisation et peut être usurpé; il ne doit pas être considéré comme une protection de compte.

## Hors connexion

La PWA met en cache le shell et quelques ressources statiques. Les fonctions dépendant de Firestore ou de l'API ne fonctionnent pas hors ligne. Les données locales constituent un cache et ne remplacent pas une sauvegarde fiable.

## Contrôle avant publication

- `npm run build`
- Tester création/suppression de matière, cours, QCM, fiches et historique.
- Tester avec et sans connexion.
- Vérifier les paramètres Firebase et les règles.
- Vérifier les limites et conditions du fournisseur IA.
- Ne jamais committer de fichiers `.env`, clés privées ou clés API.
