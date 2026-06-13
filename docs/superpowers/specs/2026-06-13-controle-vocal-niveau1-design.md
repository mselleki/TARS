# Contrôle vocal TARS — Niveau 1 (parseur déterministe)

Date : 2026-06-13
Statut : validé en brainstorming

## Objectif

Étendre la capture vocale existante en **contrôle vocal** : reconnaître des commandes (naviguer, cocher/terminer, reporter une échéance) et répondre à des requêtes parlées, le tout sans backend ni LLM — uniquement Web Speech API (reconnaissance) + SpeechSynthesis API (synthèse). Mode mains-libres léger : la session vocale enchaîne plusieurs commandes.

## Décisions de cadrage

| Sujet | Décision |
|---|---|
| Familles de commandes | Navigation, Cocher/terminer, Reporter une échéance |
| Hors périmètre | Suppression vocale (irréversible), création de projet/ticket par commande (la capture existante suffit) |
| Ciblage d'une tâche | Par numéro (liste affichée) **et** par titre flou ; si ambigu → on redemande |
| Session d'écoute | Enchaînée : la modale reste ouverte et réécoute après chaque commande |
| Retour vocal (TTS) | Requêtes **et** confirmations courtes |
| Infra | Aucune : déterministe, côté client, gratuit |

## Architecture

Toute l'interprétation vit dans des modules **purs et testables** ; l'exécution reste centralisée dans `App.jsx`. Le `quickParse` existant ne change pas et devient le *fallback capture*.

### `src/utils/voiceCommands.js`

`interpretCommand(transcript, ctx)` → une **intention** :

- `{ kind: 'navigate', view }`
- `{ kind: 'complete', taskId }`
- `{ kind: 'snooze', taskId, dueDate }`
- `{ kind: 'query', query }` où `query ∈ { 'today', 'overdue', 'next' }`
- `{ kind: 'ambiguous', action, candidates }` (action = 'complete' | 'snooze', candidates = tâches)
- `{ kind: 'capture', parsed }` (fallback `quickParse`)
- `{ kind: 'unknown' }`

Ordre : patterns de commande d'abord (navigation, complete, snooze, query), sinon délègue à `quickParse` → `capture`. Pour `snooze`, la date est extraite via la logique de dates déjà présente dans `quickParse`.

`ctx` fournit : `numberedTasks` (les tâches du bloc « Maintenant » du cockpit, dans l'ordre affiché, pour le ciblage par numéro), `activeTasks` (toutes les tâches non terminées du contexte courant, pour le ciblage par titre), `view` (vue courante).

### `src/utils/taskMatch.js`

`matchTask(query, { numberedTasks, activeTasks })` → `{ status: 'one', task } | { status: 'many', candidates } | { status: 'none' }`.

- **Numéro** : « la 1 », « la première » … « la huitième », « numéro 2 », « tâche 3 » → index dans `numberedTasks`.
- **Titre flou** : normalisation (minuscules, sans accents), score de recouvrement des mots significatifs entre la cible et le titre ; meilleur score net = match unique ; scores proches = `many` (≤ 3 candidats) ; aucun mot commun = `none`.

### `src/hooks/useSpeak.js`

Wrapper `window.speechSynthesis` : `speak(text)` en `fr-FR`, `cancel()`. `supported` = `false` si l'API manque (no-op). Coupe toute parole en cours avant d'en démarrer une nouvelle.

### `src/hooks/useSpeech.js` (extension additive)

Ajout d'une option `continuous` (défaut `false`, comportement actuel inchangé). En mode session vocale, `continuous: true` : la reconnaissance ne s'arrête pas après une phrase finale.

### `src/components/QuickCapture.jsx` (évolution)

Deux modes coexistent :

- **Saisie clavier** : comportement actuel (capture d'un item, aperçu d'interprétation, validation).
- **Session vocale** : activer le micro entre en écoute continue. À chaque phrase finale → `interpretCommand` → `handleVoiceCommand` (passé en prop) → confirmation parlée + une ligne dans un **journal de session** visible (ex. « ✓ Ouvert Tickets », « ✓ Terminé payer le loyer », « 🔎 5 choses aujourd'hui », « ⚠️ Quelle tâche ? »). Puis réécoute. Sortie : bouton « Terminer », Échap, ou clic sur le micro.

### `src/App.jsx`

`handleVoiceCommand(intent)` exécute :

- `navigate` → `setView(view)` + confirmation parlée
- `complete` → `toggleTaskStatus(taskId)` + confirmation
- `snooze` → `updateTask(taskId, { dueDate })` + confirmation
- `query` → construit la phrase de réponse à partir de l'état et la fait lire (TTS)
- `ambiguous` → fait lire « Laquelle : … ? » ; la prochaine phrase est interprétée comme la réponse (numéro ou titre) dans le contexte des candidats
- `capture` → `handleQuickCapture(parsed)` existant
- `unknown` → confirmation parlée courte « Je n'ai pas compris »

Le retour de `handleVoiceCommand` alimente le journal et le TTS (chaîne de feedback : `{ ok, message, speak }`).

### `src/components/CockpitView.jsx`

Numéroter les tâches du bloc « Maintenant » (1 à 8) avec un indicateur discret, pour rendre « la 2 » utilisable.

## Requêtes couvertes

| Formulation (exemples) | query | Réponse parlée |
|---|---|---|
| « qu'est-ce que j'ai aujourd'hui », « ma journée », « mes tâches » | today | nombre + titres des tâches « Maintenant » |
| « combien en retard », « mes retards » | overdue | nombre de tâches/tickets en retard |
| « prochaine échéance », « c'est quoi la prochaine » | next | titre + compte à rebours de la 1ʳᵉ échéance |

## Grammaire des commandes (déterministe, FR)

- **Navigation** : `(va|aller|ouvre|montre|affiche)` + nom de module (cockpit/accueil, tâches, projets, tickets, rituels, notes, agenda, cours).
- **Cocher/terminer** : `(termine|terminer|coche|cocher|fais|fait|marque ... fait|valide)` + cible.
- **Reporter** : `(reporte|reporter|décale|repousse|déplace)` + cible + date (réutilise les règles de dates de `quickParse`).
- **Cible** : numéro (« la 1ʳᵉ », « numéro 2 ») ou bout de titre.

## Tests

- Vitest sur `voiceCommands` : chaque famille (navigation tous modules, complete par numéro et par titre, snooze avec date, les 3 requêtes, fallback capture, unknown), insensibilité accents/casse.
- Vitest sur `taskMatch` : numéro (cardinaux + ordinaux), titre unique, ambiguïté (`many`), absence (`none`).
- `useSpeak` / mode continu / QuickCapture session / CockpitView : vérification manuelle (APIs navigateur).

## Risques & limites

- **iOS** : l'écoute continue se coupe ; la session enchaînée sera dégradée sur iPhone (acceptable, la voix est un bonus).
- **Matching flou** : faux positifs possibles → on préfère redemander (`ambiguous`/`none`) plutôt que d'agir au hasard. Jamais d'action destructive (pas de suppression).
- **TTS qui se chevauche** : `speak()` annule la parole précédente avant d'en lancer une nouvelle.
- **Reconnaissance ≠ hors-ligne** : nécessite le réseau (cloud du navigateur).

## Hors périmètre (itérations futures)

- Wake word / écoute permanente hors modale.
- Assistant LLM conversationnel (niveau 3).
- Suppression et création de projets/tickets par commande vocale.
