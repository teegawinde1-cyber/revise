# RéviseBac

Application francophone de révision scolaire pour les élèves de Seconde, Première et Terminale.

## Architecture actuelle

- Interface : React + Vite.
- API : Node.js + Express.
- Authentification : Firebase Authentication (e-mail et mot de passe).
- Base de données : Cloud Firestore, accessible uniquement par l'API serveur.
- IA : fournisseur compatible OpenAI, appelé uniquement depuis le serveur.
- Quotas : 150 images et 100 générations par compte et par jour, remis à zéro à minuit, heure du Burkina Faso (Africa/Ouagadougou).

## Fonctionnalités actuellement reliées

- Création de compte et connexion Firebase.
- Matières et leçons enregistrées dans Firestore.
- Flashcards et suivi des révisions.
- Historique des QCM.
- Analyse IA des leçons, résumés et points essentiels.
- QCM IA avec choix de difficulté.
- Compteurs quotidiens et contrôle serveur des quotas.

## 1. Créer le projet Firebase

1. Ouvrir https://console.firebase.google.com/ et créer un projet nommé RéviseBac.
2. Dans Authentication > Sign-in method, activer « E-mail/Mot de passe ».
3. Dans Firestore Database, créer une base en mode production.
4. Dans les paramètres du projet, ajouter une application Web et relever apiKey, authDomain, projectId, appId et storageBucket.
5. Dans Firestore > Rules, publier le contenu du fichier `firestore.rules` de ce dépôt. Les accès directs du navigateur sont bloqués : les données transitent par notre API authentifiée.

## 2. Configurer le client

1. Copier `client/.env.example` vers `client/.env`.
2. Remplir les variables `VITE_FIREBASE_*` avec les valeurs de l'application Web Firebase.
3. Garder `VITE_API_URL=http://localhost:4000/api` pour le développement local.

## 3. Configurer le serveur

1. Dans Firebase Console > Project settings > Service accounts, générer une clé privée pour le compte de service.
2. Copier `server/.env.example` vers `server/.env`.
3. Définir `FIREBASE_SERVICE_ACCOUNT_JSON` avec le JSON complet du compte de service sur une seule ligne (ou le configurer comme variable secrète sur l'hébergeur).
4. Définir `CLIENT_ORIGIN` avec l'adresse du client.
5. Pour activer l'IA, définir `AI_BASE_URL`, `AI_API_KEY` et `AI_MODEL`. La clé IA reste exclusivement côté serveur.

**Sécurité :** ne jamais envoyer ni publier la clé privée Firebase, la clé IA ou un fichier `.env`. Ne pas les placer dans le dossier client ou sur GitHub.

## 4. Démarrer en local

À la racine du dépôt :

```bash
npm install
npm run dev
```

Le client Vite est normalement disponible sur http://localhost:5173 et l'API sur http://localhost:4000.

## Quotas quotidiens

Chaque compte dispose de :
- 150 images par jour.
- 100 générations par jour (résumés, QCM, flashcards et autres fonctions IA).

Le quota est vérifié côté serveur avec une transaction Firestore, afin que deux requêtes simultanées ne puissent pas dépasser la limite. La journée est calculée dans le fuseau `Africa/Ouagadougou`. Une génération qui échoue libère sa réservation. Le point d'entrée de consommation des images est prêt ; le flux d'envoi et de stockage des photos doit encore être raccordé avant que le compteur image soit utilisé par une vraie fonction d'import.

## Déploiement

Le serveur doit être déployé sur un hébergeur Node.js et le client sur un hébergement web. Le PC personnel n'aura alors pas besoin de rester allumé. Ajouter les variables secrètes Firebase Admin et IA dans les réglages de l'hébergeur, jamais dans GitHub.
