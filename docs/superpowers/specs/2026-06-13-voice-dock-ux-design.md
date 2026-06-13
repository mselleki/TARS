# Session vocale TARS — UX dock non-modal

Date : 2026-06-13
Statut : validé en brainstorming

## Problème

La session vocale vit dans la modale `QuickCapture`, qui affiche un fond sombre plein écran et masque l'app. Résultat : dire « va aux tickets » change la vue *derrière* la modale, mais on ne la voit pas — le contrôle vocal de navigation est inutile, et la modale prend trop de place.

## Objectif

Sortir la session vocale du modal vers une **barre flottante non-modale** ancrée en bas, pour que l'app reste visible et utilisable pendant les commandes vocales. Séparer clairement les deux entrées : micro = vocal (dock), « Capturer »/`N` = saisie texte (modale).

## Décisions de cadrage

| Sujet | Décision |
|---|---|
| Forme | Barre fine pleine largeur, ancrée en bas, au-dessus de la bottom nav mobile |
| Modalité | Non-modale : pas de backdrop, app visible et cliquable derrière |
| Déclencheur vocal | Bouton micro dans le Header → ouvre le dock directement (pas de modale) |
| Déclencheur texte | « Capturer » / touche `N` / FAB mobile → modale texte (inchangée) |
| Logique vocale | Inchangée fonctionnellement (half-duplex), déplacée du composant vers un hook |

## Architecture

### `src/hooks/useVoiceSession.js` (nouveau)

Encapsule toute la machine à états half-duplex aujourd'hui dans `QuickCapture` :
`useSpeech` (écoute une phrase) + `useSpeak` (TTS), re-armement du micro après la fin de la parole / sur silence, gestion d'erreur fatale vs transitoire, `interpretCommand`/`resolveAmbiguous`, journal et ambiguïté en attente.

Signature : `useVoiceSession({ voiceContext, onVoiceCommand })` →
`{ supported, active, listening, interim, journal, error, start, stop }`.

- `active` : session en cours (micro+TTS en va-et-vient).
- `listening` : micro réellement ouvert à cet instant (false pendant la parole).
- `interim` : transcription partielle en direct.
- `journal` : 6 dernières lignes de feedback (`["Ouvert les tickets", …]`).
- `start()` / `stop()` : démarrer / terminer la session.

Le hook ne rend rien ; il porte les invariants critiques (micro fermé pendant le TTS) déjà validés.

### `src/components/VoiceDock.jsx` (nouveau)

Barre flottante de présentation, pilotée par `useVoiceSession`.

- Position : `fixed inset-x-0`, ancrée en bas, **au-dessus de la bottom nav** sur mobile (`bottom: calc(64px + safe-area)`), `bottom: 0` sur desktop. `z-index` au-dessus du contenu mais cohérent avec la nav. Pas de backdrop.
- Animation : glissement vers le haut à l'ouverture (réutiliser une keyframe existante ou simple translate).
- Contenu (compact, 2 lignes) :
  - Ligne 1 : pastille d'état animée (`🎙 À l'écoute…` quand `listening`, `🔊 Réponse…` sinon) + `interim` en direct + bouton ✕ (appelle `stop` + ferme).
  - Ligne 2 : les 1–2 dernières entrées du `journal` (`↳ …`). En cas d'ambiguïté, la ligne « Laquelle ? 1… 2… » provient du journal (le message renvoyé par `handleVoiceCommand`).
  - Si `error` fatale (permission refusée) : message court invitant à réessayer/taper.
- Props : `{ isOpen, onClose, voiceContext, onVoiceCommand }`. Démonté quand `!isOpen` (et `useVoiceSession` arrête tout au démontage / via effet sur `isOpen`).

### `src/components/QuickCapture.jsx` (simplifié)

Redevient une **modale de saisie texte uniquement** :
champ texte, aperçu d'interprétation (`parseQuickInput` : pastille cible + titre + 📅/🕐), boutons Fermer/Ajouter. On retire `useSpeech`, `useSpeak`, `useVoiceSession`, le journal, le bouton micro et tout l'état de session. Props : `{ isOpen, onClose, onSubmit }`.

### `src/App.jsx`

- Nouvel état `voiceOpen` (dock), distinct de `showQuickCapture` (modale texte).
- `voiceContext` et `handleVoiceCommand` existants : inchangés, passés à `VoiceDock` au lieu de `QuickCapture`.
- Rendu `<VoiceDock isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} voiceContext={voiceContext} onVoiceCommand={handleVoiceCommand} />`.
- `<QuickCapture>` : retirer `voiceContext`/`onVoiceCommand`, ne garder que `isOpen/onClose/onSubmit`.
- Bouton micro (via Header) → `setVoiceOpen(true)`.

### `src/components/Header.jsx`

Ajouter un bouton micro (🎙) à côté de « Capturer », appelant `onOpenVoice`. « Capturer » continue d'ouvrir la modale texte. Sur mobile, le micro est une icône seule pour économiser la place.

### `src/components/BottomNav.jsx`

Inchangé : le FAB central reste la capture texte (`onOpenQuickCapture`). (Le micro est accessible via le Header, présent aussi sur mobile.)

## Comportement

1. Clic micro → le dock glisse depuis le bas, la session démarre (micro ouvert).
2. « va aux tickets » → la vue Tickets s'affiche **derrière** le dock (app visible), confirmation parlée + ligne au journal.
3. On enchaîne (half-duplex : micro coupé pendant la réponse, ré-armé après).
4. ✕ ou re-clic micro → la session s'arrête, le dock disparaît.

## Risques & limites

- **Chevauchement bottom nav (mobile)** : le dock doit se caler au-dessus de la nav ; vérifier sur petit écran et appareils à encoche (safe-area).
- **Logique vocale** : déplacée, pas réécrite — risque de régression dans l'extraction. Vérifier que les invariants half-duplex (micro fermé pendant TTS, re-armement, ambiguïté, arrêt à la fermeture) sont préservés à l'identique.
- **Pas de test automatisé** possible sur l'audio navigateur ; vérification manuelle (la couverture des 65 tests sur les modules purs reste le garde-fou de la logique d'interprétation).

## Hors périmètre

- Déplacement/redimensionnement du dock par l'utilisateur.
- Raccourci clavier dédié au vocal (le micro suffit).
- Barge-in (interrompre la réponse en parlant).
