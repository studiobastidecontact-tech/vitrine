# Espace client — Studio Bastide

Système de livraison Drive-only avec **trois types de prestations** :
- **Payante** avec workflow preview/HD débloqué après paiement
- **Payante déjà réglée** (HD débloqués direct)
- **Gratuite** avec contrepartie tag réseaux sociaux

## Architecture

- **`livraisons/index.html`** — page publique (`/livraisons/?p=<slug>`)
- **`livraisons/admin.html`** — admin (`/livraisons/admin.html`, auth Google)
- **`firestore.rules`** — règles Firestore (à fusionner avec tes règles)
- **Pas de Firebase Storage** — tout sur Google Drive

## Modèle de données

```js
// Firestore : collection "deliveries", doc id = slug
{
  clientName: "Lucile Adam",
  projectName: "Clip La Reine des larmes",
  codeHash, codeSalt, codeDisplayed,
  status: "preview" | "paid" | "free",
  amount: 750,                    // € HT (0 si free)
  taggingRequirement: "...",      // si free, message affiché au client
  files: [
    {
      name: "Clip_Final.mp4",
      type: "video",              // video|audio|photo|archive
      previewDriveId: "1AbC...",  // version watermarkée (optionnelle)
      previewSize: 80_000_000,
      hdDriveId: "1XyZ...",        // version HD (optionnelle)
      hdSize: 1_500_000_000,
    }
  ],
  expiresAt: Timestamp | null,
  createdAt, updatedAt: Timestamp,
  downloadCount: 0,
  lastAccessAt: Timestamp,
}
```

## Workflow type — Prestation PAYANTE

### 1. Tu prépares les fichiers
Deux versions par livrable :
- **Aperçu** = qualité validation + watermark
  - Vidéo : 720p ou 1080p, ton logo en bas à droite ou filigrane diagonal
  - Audio : MP3 128k avec tag vocal "Studio Bastide Production" toutes les 20-30s
  - Photo : 1500px max + watermark texte ou logo
- **HD** = version finale sans watermark
  - Vidéo : ProRes/H.265 master
  - Audio : WAV 24bit / stems
  - Photo : pleine résolution retouchée

### 2. Upload sur Drive
Compte `studiobastide.contact@gmail.com`, dossier maître :
```
Mon Drive/
└── Livraisons clients/
    └── Lucile Adam — Clip La Reine des larmes/
        ├── Clip_PREVIEW.mp4   (80 Mo, watermark)
        └── Clip_HD.mov        (15 Go, master)
```
Pour chaque fichier : clic-droit → **Partager** → "Tout utilisateur disposant du lien" → Lecteur. Copie l'ID :
```
https://drive.google.com/file/d/1AbCdEf...XYZ/view
                                └─────┬─────┘
                                  ID Drive
```

### 3. Création dans l'admin
1. `/livraisons/admin.html`, connexion Google.
2. Type : **"Prestation payante"** (par défaut).
3. Remplis client / projet / montant / fichiers.
4. Statut paiement sur "Non payé" par défaut.
5. Clic "Créer" → modale avec lien + code + bouton "Copier le mail".

### 4. Client valide les previews
Voit toutes les previews avec watermark + bandeau orange "Versions HD en attente de paiement (750 €)".

### 5. Tu débloques
R�ception du règlement → dans l'admin, ligne du projet, clic **"Marquer payé"** → bandeau client passe au vert, boutons HD actifs.

## Workflow type — Prestation GRATUITE

Tu es invité à un événement, tu shootes, tu livres en échange de visibilité sur les réseaux.

### 1. Tu uploades les fichiers sur Drive
Pour le gratuit, en général **pas besoin de double export preview/HD**. Tu mets juste les HD en `hdDriveId` (ou en `previewDriveId` si tu préfères, peu importe car tout est débloqué).

### 2. Création dans l'admin
1. Type : **"Prestation gratuite"**.
2. Le champ "Contrepartie réseaux sociaux" pré-rempli avec ton message standard :
   > *Identifiez @stud_bastide sur vos publications Instagram et TikTok, ou @studiobastide sur YouTube.*
   Personnalisable au cas par cas (ex. tu peux ajouter @soleil_solal_ si c'est un projet plus perso de L'Enfant Soleil).
3. Pas de montant, pas de toggle paiement.
4. Clic "Créer" → mail copié contient automatiquement la mention contrepartie.

### 3. Client reçoit
Voit immédiatement tous les fichiers en HD, avec bandeau violet "★ Prestation offerte par Studio Bastide. Identifiez @stud_bastide..." au-dessus.

## Installation

### 1. Déploie les fichiers
Drop le dossier `livraisons/` dans ton repo `vitrine`.

### 2. Déploie les rules Firestore
Firebase Console → Firestore → Règles → coller `firestore.rules` → Publier.

(Plus besoin de Storage rules.)

### 3. Index Firestore
Au premier `orderBy('createdAt')` sur la liste admin, Firebase peut demander un index. Clique le lien donné, ça se crée en 1 min.

## Sécurité

- **Code hashé** PBKDF2 100k iter SHA-256, salt par projet, jamais en clair
- **Slugs UUID-like** : impossible de deviner les autres projets
- **Firestore rules** : `get` autorisé par ID, `list` réservé admin
- **Liens Drive privés** : jamais exposés avant validation du code
- **Statut paiement / gratuit / tagging** : seul l'admin peut modifier (rules)

## Tag audio à enregistrer une fois

Pour les previews audio, le standard de l'industrie c'est un tag vocal récurrent toutes les 20-30s. Maël peut t'enregistrer ça en 30 minutes :

> "Studio Bastide Production"

→ WAV 1-2 sec, importable en bus parallèle ou en automation sur tes exports preview.

C'est ce que font Universal Production Music, Epidemic Sound : un tag récurrent qui rend le morceau inutilisable en commercial mais audible pour validation.

## V3 si tu veux durcir

Pour un client paranoïaque (gros budget, brut non-divulguable) :
1. **Cloud Functions** générant des URLs Drive temporaires via l'API Drive
2. **Lien unique par téléchargement** valide 1h
3. **Watermark dynamique** par client (steganographie traçable)

~200 lignes de Node + Service Account Drive + Firebase Blaze (gratuit en pratique).
