# Assistant vocal LLM (niveau 3) — Design

Date : 2026-06-13
Statut : validé en brainstorming

## Objectif

Remplacer le parseur vocal déterministe par un assistant **Claude (Haiku 4.5)** qui comprend le langage naturel libre et agit sur l'app via *tool use*. Mêmes capacités qu'aujourd'hui (créer, cocher, reporter, naviguer, répondre aux questions) mais sans formulations rigides, et avec plusieurs actions possibles en une phrase.

## Décisions de cadrage

| Sujet | Décision |
|---|---|
| Modèle | Claude Haiku 4.5 (latence + coût) |
| Capacités | Iso (create/complete/snooze/navigate/answer) en langage libre + multi-actions |
| Repli déterministe | **Aucun** : sans clé / hors-ligne / erreur API → vocal indisponible (la capture texte clavier continue de marcher) |
| Exécution | Directe (actions réversibles, pas de suppression vocale) |
| Reconnaissance / voix | Inchangées (Web Speech + SpeechSynthesis) ; seul le « cerveau » passe au LLM |
| Sécurité / coût | Route publique (app sans auth) protégée par une limite de débit Upstash |

## Architecture

### Backend — `api/assistant.js` (nouvelle route serverless)

Même format `fetch` handler que `api/state.js`.

- **Entrée** : `POST { transcript, context, snapshot }`.
  - `snapshot` : instantané **en lecture seule** envoyé par le client —
    `{ tasks: [{ id, title, status, dueDate, doToday }], reqTickets: [{ id, summary, status, dueAt }], view, today }`,
    limité aux tâches du `context` courant et tronqué (ex. 60 tâches max) pour borner les tokens.
- **Limite de débit** : compteur Upstash par IP (ex. 30 requêtes / 5 min) → `429` si dépassé. Garde aussi une longueur max de `transcript`.
- **Appel LLM** : Claude Haiku 4.5 en *tool use*, `tool_choice: auto`, multi-outils autorisés. Le system prompt cadre le rôle (assistant d'organisation francophone), injecte `snapshot` (avec les `id` des tâches pour le ciblage) et la date du jour.
- **Outils exposés** :
  - `create_item({ target: 'task'|'ticket'|'note', title, dueDate?, dueTime? })`
  - `complete_task({ taskId })`
  - `snooze_task({ taskId, dueDate })`
  - `navigate({ view })` (cockpit/tasks/projects/tickets/rituals/notes/agenda/courses)
  - `answer({ text })` (réponse parlée à une question ou demande de précision)
- **Sortie** : `{ actions: [{ type, ...args }], speech }`.
  - `actions` : les *tool calls* normalisés (sauf `answer`).
  - `speech` : la phrase à lire — le texte d'`answer` si présent, sinon le bloc texte final de Claude (confirmation courte).
- **Erreurs** : clé absente / quota / réseau → `5xx` avec `{ error }` ; le client le signale (pas de repli déterministe).

### Front — session vocale

- `useVoiceSession` : au lieu d'`interpretCommand` local, **POST** la transcription + `snapshot` à `/api/assistant`, reçoit `{ actions, speech }`.
- Applique chaque action via les effets existants (`addTask`, `toggleTaskStatus`, `updateTask`, `addReqTicket`, `setMeetingSheet` pour les notes, `setView`).
- Lit `speech` (TTS) et l'ajoute au journal.
- **Half-duplex préservé** : le micro est fermé pendant l'appel réseau + la réponse parlée, puis ré-armé.
- **Indicateur** : pendant l'appel, état « 🧠 Réflexion… » dans le dock.
- Le `snapshot` est construit côté client à partir du store (sélecteurs cockpit + tâches actives du contexte).

### Code retiré

- `src/utils/voiceCommands.js` + `voiceCommands.test.js`
- `src/utils/taskMatch.js` + `taskMatch.test.js`

(Le LLM assure l'interprétation et le matching de tâches.)

### Code conservé

`quickParse` (utilisé par la modale de capture texte), `deadlines`, `cockpit` (sélecteurs, pour bâtir le snapshot), `useSpeech`, `useSpeak`, `VoiceDock`, `QuickCapture`.

## Configuration

- Variable d'environnement Vercel pour l'accès au modèle (clé Anthropic ou AI Gateway — SDK exact figé au plan selon la doc Vercel/Anthropic). **À configurer par l'utilisateur** dans Vercel → Settings → Environment Variables ; documenté dans `.env.example`.
- `@upstash/redis` déjà présent (réutilisé pour la limite de débit).

## Modèle de données

Inchangé. Le `snapshot` est en lecture seule ; toutes les écritures passent par le store/reducer existant et la sync Upstash habituelle.

## Tests

- Backend : tester la **normalisation des tool calls → actions** et la construction de la réponse (`{ actions, speech }`) par une fonction pure `buildResponse(llmContent)`, sans appeler le réseau (mock du contenu LLM). Tester aussi la limite de débit (fonction pure de fenêtre/compteur).
- Front : tester la construction du `snapshot` (fonction pure) et le mapping `action → effet` (réducteur d'actions pur). L'appel réseau et l'audio : vérification manuelle.

## Risques & limites

- **Dépendance totale à l'API** (choix assumé) : pas de vocal sans clé / hors-ligne / panne. La capture texte reste disponible.
- **Coût** : chaque commande = un appel Haiku. La limite de débit borne l'emballement, pas le coût nominal d'un usage normal.
- **Latence** : un aller-retour réseau + LLM s'ajoute (~1–2 s). Acceptable pour Haiku ; l'indicateur « Réflexion… » couvre l'attente.
- **Route publique** : protégée par la limite de débit uniquement (app sans auth). Risque résiduel accepté pour un usage perso.
- **Hallucination d'`id`** : le backend ignore toute action dont l'`taskId` n'existe pas dans le `snapshot` (filtrage défensif) et renvoie un `speech` du type « je n'ai pas trouvé cette tâche ».

## Hors périmètre

- Capacités « copilote » étendues (renommer, planifier la semaine, résumer) — itération future.
- Streaming de la réponse.
- Authentification de la route.
- Conversation multi-tours avec mémoire (chaque commande est indépendante ; l'historique de session n'est pas envoyé).
