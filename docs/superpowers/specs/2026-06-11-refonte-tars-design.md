# Refonte TARS — Design

Date : 2026-06-11
Statut : validé en brainstorming

## Objectif

Refondre TARS (organizer personnel : tâches, projets, tickets, rituels, cours, notes, agenda) pour en faire un cockpit de monitoring moderne, clair et rapide, utilisable à égalité sur desktop et mobile (PWA), avec capture vocale de tâches.

## Décisions de cadrage

| Sujet | Décision |
|---|---|
| Périmètre | Refonte design + UX + fonctionnalités ; stack et données conservées |
| Stack | React 19, Vite, Tailwind 4, PWA, sync Upstash Redis via `/api/state` (inchangé) |
| Modules | Tous conservés, réorganisés autour d'un cockpit central |
| Direction visuelle | Clair et chaleureux : fond crème, cartes blanches arrondies, pastilles colorées (style Things 3) |
| Layout | « Hub & rayons » : cockpit dashboard d'accueil + sidebar desktop / bottom nav mobile |
| Voix | Capture vocale simple via Web Speech API (`fr-FR`), sans backend |
| Rappels | Alertes in-app uniquement (badges, retards, tri par urgence) — pas de Web Push |
| Approche | Refonte progressive : UI réécrite vue par vue, store/sync conservés, app fonctionnelle à chaque étape |

## Architecture

### Shell (`AppShell`)

- **Desktop (≥1024px)** : sidebar fixe (Cockpit, Tâches, Projets, Tickets, Rituels, Notes, Agenda, Cours) + topbar légère (recherche, micro, « + Ajouter ») + zone de contenu.
- **Mobile** : bottom nav 4 entrées (Cockpit, Tâches, Projets, Plus → panneau des modules secondaires) + bouton flottant central **+ / micro** (tap = ajout rapide, appui long = dictée).
- Navigation : état `currentView` dans le store existant. Pas de router.

### Conservé tel quel

`useStore`, `store/reducer.js` (étendu, jamais cassé), `utils/storage.js`, `utils/remoteSync.js`, `hooks/usePWA`, `api/state.js`. Les données existantes restent lisibles sans migration destructive.

### Supprimé / fusionné

- `design-system.css` actuel → remplacé par le nouveau.
- `TodayPanel`, `TodayQuickPanel`, `CockpitFocusColumn` → fusionnés dans le nouveau cockpit.
- Les composants de vue actuels sont remplacés au fur et à mesure.

## Cockpit (page d'accueil)

Blocs cliquables menant chacun à son module :

1. **En-tête** : salutation, date, compteur du jour, bandeau rituel/standup du matin si non fait.
2. **Maintenant** : tâches du jour triées par urgence — en retard (badge orange) > heure > reste. Cochage direct.
3. **Échéances** : les 5 prochaines deadlines agrégées depuis les tâches et tickets (`dueDate`) et les événements d'agenda existants, avec compte à rebours (« demain », « J-12 »).
4. **Tuiles modules** : Rituels (progression 2/3), Projets (actifs + prochaine action), Agenda (prochains RDV), Tickets (ouverts), Notes, Cours.

## Modules

Chaque module garde sa vue dédiée, re-skinnée à iso-fonctionnalité : cartes blanches arrondies, badges d'état colorés, filtres en pilules. La logique métier existante (kanban projets, capture tickets, standup, agenda perso) n'est pas réécrite.

## Modèle de données — échéances

Seule extension du modèle : champ `dueDate` (ISO date) et `dueTime` (optionnel) uniformes sur tâches et tickets. Alimente le bloc Échéances, les badges « en retard » et le tri par urgence. Nouvelles actions reducer dédiées ; rétro-compatible avec les items sans échéance.

## Capture rapide & voix (`QuickCapture`)

- Modal unique accessible via : bouton « + », raccourci clavier `N`, bouton micro.
- Dictée : Web Speech API (`SpeechRecognition`, `fr-FR`).
- Parseur léger en français : dates/heures naturelles (« demain », « vendredi 18h », « dans 3 jours ») et cible (« ticket : … », « note : … » ; défaut = tâche). Le texte interprété est montré avant validation (correction possible).
- Fallback : navigateurs sans Web Speech API (Firefox) → bouton micro masqué, capture texte intacte.

## Design system

Nouveau `design-system.css` à base de tokens :

- Fond `#faf9f7` (crème), cartes `#fff` rayon 14px, ombres douces.
- Couleur d'accent par module (violet projets, vert rituels, ambre cours, etc.).
- Typo system-ui/Inter ; badges en pilules ; états : retard = orange, fait = barré + pastille verte.
- Mode sombre conservé en option, décliné dans la même palette chaleureuse.

## Risques

- **Web Speech API** : absente sur Firefox, inégale sur iOS → fallback masquage micro ; la voix est un bonus, jamais le seul chemin.
- **Fusion des panneaux « today »** : trois composants à fusionner sans perdre de logique (focus, quick actions) — à inventorier avant suppression.
- **Pas de tests existants** : vérification manuelle de chaque vue à iso-fonctionnalité avant suppression de l'ancienne version.
- **Sync** : le format d'état envoyé à Upstash ne doit pas changer de structure de manière incompatible (les nouveaux champs sont additifs).

## Vérification

- Chaque étape de la refonte laisse l'app buildable (`npm run build`) et utilisable.
- Test manuel desktop + mobile (responsive) à chaque vue remplacée.
- Test de la dictée sur Chrome desktop + Android ; vérification du fallback sur Firefox.
- Vérification que les données existantes (localStorage + Redis) se chargent sans migration.

## Hors périmètre

- Notifications Web Push (itération future possible).
- Assistant vocal LLM.
- Statistiques / graphiques de progression.
- Migration de stack (Next.js, TypeScript généralisé, router).
