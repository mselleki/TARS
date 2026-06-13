# Dock vocal non-modal — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sortir la session vocale du modal vers une barre flottante non-modale en bas, l'app restant visible pendant les commandes.

**Architecture:** Extraire la machine à états vocale de `QuickCapture` dans un hook `useVoiceSession`. Nouveau composant de présentation `VoiceDock` (barre fixe en bas, non-modale). `QuickCapture` redevient une modale de saisie texte. `App` gère deux déclencheurs séparés (micro→dock, Capturer→modale). `Header` reçoit un bouton micro.

**Tech Stack:** React 19, Vite, Tailwind 4. Logique d'interprétation déjà testée (65 tests) — inchangée, déplacée.

**Spec:** `docs/superpowers/specs/2026-06-13-voice-dock-ux-design.md`

**Conventions :** un commit par tâche, messages sans attribution IA. Formateur après écriture (attendu). `npm run build` + `npm test` (65) verts avant chaque commit.

---

### Task 1 : Hook `useVoiceSession`

**Files:**
- Create: `src/hooks/useVoiceSession.js`

Extrait la logique vocale half-duplex aujourd'hui dans `QuickCapture` (sans changement de comportement).

- [ ] **Step 1 : Créer `src/hooks/useVoiceSession.js`**

```js
import { useState, useRef, useCallback, useEffect } from 'react'
import { useSpeech } from './useSpeech'
import { useSpeak } from './useSpeak'
import { interpretCommand, resolveAmbiguous } from '../utils/voiceCommands'

const TRANSIENT_ERRORS = new Set(['no-speech', 'aborted'])

export function useVoiceSession({ voiceContext = {}, onVoiceCommand }) {
  const [journal, setJournal] = useState([])
  const [error, setError] = useState(null)
  const [active, setActive] = useState(false)
  const sessionRef = useRef(false)
  const speakingRef = useRef(false)
  const pendingRef = useRef(null)
  const voiceRef = useRef(voiceContext)
  const cmdRef = useRef(onVoiceCommand)
  const speechRef = useRef(null)

  useEffect(() => {
    voiceRef.current = voiceContext
  })
  useEffect(() => {
    cmdRef.current = onVoiceCommand
  })

  const { speak, cancel } = useSpeak()

  const reArm = useCallback(() => {
    if (sessionRef.current && !speakingRef.current) speechRef.current?.start()
  }, [])

  const onResult = useCallback(
    (transcript) => {
      if (!transcript) return
      const intent = pendingRef.current
        ? resolveAmbiguous(transcript, pendingRef.current)
        : interpretCommand(transcript, voiceRef.current)
      pendingRef.current = null
      const result = cmdRef.current?.(intent) ?? { message: '' }
      if (result.pending) pendingRef.current = result.pending
      if (result.message) {
        setJournal((j) => [...j, result.message].slice(-6))
        speakingRef.current = true
        speak(result.message, () => {
          speakingRef.current = false
          reArm()
        })
      }
    },
    [speak, reArm]
  )

  const onEnd = useCallback(() => {
    reArm()
  }, [reArm])

  const onError = useCallback((err) => {
    if (TRANSIENT_ERRORS.has(err)) return
    sessionRef.current = false
    speakingRef.current = false
    setActive(false)
    setError(err)
  }, [])

  const { supported, listening, interim, start: recStart, stop: recStop } = useSpeech({
    onResult,
    onEnd,
    onError,
  })

  useEffect(() => {
    speechRef.current = { start: recStart, stop: recStop }
  }, [recStart, recStop])

  const start = useCallback(() => {
    setError(null)
    setJournal([])
    sessionRef.current = true
    setActive(true)
    recStart()
  }, [recStart])

  const stop = useCallback(() => {
    sessionRef.current = false
    speakingRef.current = false
    pendingRef.current = null
    setActive(false)
    cancel()
    recStop()
  }, [cancel, recStop])

  return { supported, active, listening, interim, journal, error, start, stop }
}
```

- [ ] **Step 2 : Build** — Run: `npm run build` — Expected: OK (le hook n'est pas encore importé).

- [ ] **Step 3 : Commit**

```bash
git add src/hooks/useVoiceSession.js
git commit -m "feat: extract half-duplex voice session into a hook"
```

---

### Task 2 : Composant `VoiceDock`

**Files:**
- Create: `src/components/VoiceDock.jsx`

Barre flottante non-modale, pilotée par `useVoiceSession`. Démarre au montage, arrête au démontage.

- [ ] **Step 1 : Créer `src/components/VoiceDock.jsx`**

```jsx
import { useEffect } from 'react'
import { useVoiceSession } from '../hooks/useVoiceSession'

export function VoiceDock({ onClose, voiceContext, onVoiceCommand }) {
  const { active, listening, interim, journal, error, start, stop } = useVoiceSession({
    voiceContext,
    onVoiceCommand,
  })

  useEffect(() => {
    start()
    return () => stop()
  }, [start, stop])

  const lastTwo = journal.slice(-2)

  return (
    <div
      className="fixed inset-x-0 z-30 px-3 pb-2 panel-slide-in"
      style={{
        bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
      }}
      role="status"
      aria-live="polite"
    >
      <div
        className="mx-auto flex max-w-2xl flex-col gap-1.5 rounded-[var(--radius-xl)] px-4 py-3"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm${listening ? ' pulse-glow' : ''}`}
            style={{
              background: listening ? 'var(--accent)' : 'var(--surface-2)',
              color: listening ? '#fff' : 'var(--text-secondary)',
            }}
            aria-hidden
          >
            {listening ? '🎙' : '🔊'}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm" style={{ color: 'var(--text)' }}>
            {interim
              ? interim
              : listening
                ? 'À l\'écoute… dites une commande'
                : active
                  ? 'Réponse en cours…'
                  : 'Session vocale'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
            style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
            aria-label="Terminer la session vocale"
            title="Terminer"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <p className="text-xs" style={{ color: 'var(--danger)' }}>
            Dictée indisponible ({error}). Fermez et réessayez, ou tapez via « Capturer ».
          </p>
        )}

        {lastTwo.length > 0 && (
          <ul className="flex flex-col gap-0.5 text-xs" style={{ color: 'var(--muted)' }}>
            {lastTwo.map((line, i) => (
              <li key={i} className="truncate">↳ {line}</li>
            ))}
          </ul>
        )}

        {!error && journal.length === 0 && (
          <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
            « va aux tickets » · « termine la 1 » · « reporte X à demain » · « qu'est-ce que j'ai aujourd'hui »
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2 : Build** — Run: `npm run build` — Expected: OK (pas encore monté). `panel-slide-in` existe déjà dans `index.css` (vérifier sa présence ; sinon utiliser `fade-in`).

- [ ] **Step 3 : Commit**

```bash
git add src/components/VoiceDock.jsx
git commit -m "feat: non-modal voice dock bar"
```

---

### Task 3 : Simplifier `QuickCapture` en modale texte

**Files:**
- Modify (full replace): `src/components/QuickCapture.jsx`

Retire tout le vocal (useSpeech/useSpeak/useVoiceSession, journal, micro, session). Garde la saisie texte + l'aperçu d'interprétation.

- [ ] **Step 1 : Remplacer entièrement `src/components/QuickCapture.jsx`**

```jsx
import { useState, useEffect, useRef } from 'react'
import { Modal } from './Modal'
import { parseQuickInput } from '../utils/quickParse'
import { formatCountdown, daysUntil } from '../utils/deadlines'

const TARGET_LABELS = { task: 'Tâche', ticket: 'Ticket', note: 'Note' }
const TARGET_COLORS = { task: 'tasks', ticket: 'tickets', note: 'notes' }

export function QuickCapture({ isOpen, onClose, onSubmit }) {
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
    setText('')
  }, [isOpen])

  const handleClose = () => {
    setText('')
    onClose?.()
  }

  const parsed = parseQuickInput(text)
  const canSubmit = parsed.title.length > 0

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!canSubmit) return
    onSubmit?.(parsed)
    setText('')
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Capture rapide">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'Ex. « payer le loyer demain », « ticket : relancer X vendredi »'}
          className="w-full rounded-[var(--radius-lg)] border px-4 py-3 text-base outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          aria-label="Capture rapide"
        />

        {canSubmit && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className="rounded-full px-2.5 py-1 font-semibold"
              style={{ background: `var(--mod-${TARGET_COLORS[parsed.target]}-bg)`, color: `var(--mod-${TARGET_COLORS[parsed.target]})` }}
            >
              {TARGET_LABELS[parsed.target]}
            </span>
            <span className="font-medium" style={{ color: 'var(--text)' }}>{parsed.title}</span>
            {parsed.dueDate && parsed.target !== 'note' && (
              <span className="rounded-full px-2.5 py-1" style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                📅 {formatCountdown(daysUntil(parsed.dueDate))}
              </span>
            )}
            {parsed.dueTime && parsed.target !== 'note' && (
              <span className="rounded-full px-2.5 py-1" style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                🕐 {parsed.dueTime}
              </span>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm font-medium transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            Fermer
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-[var(--radius-lg)] px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-40"
            style={{ background: 'var(--accent)' }}
          >
            Ajouter
          </button>
        </div>
      </form>
    </Modal>
  )
}
```

- [ ] **Step 2 : Build** — Run: `npm run build` — Expected: OK (App passe encore `voiceContext`/`onVoiceCommand` à QuickCapture — props ignorées, sans erreur ; corrigé en Task 4).

- [ ] **Step 3 : Commit**

```bash
git add src/components/QuickCapture.jsx
git commit -m "refactor: QuickCapture becomes a text-only capture modal"
```

---

### Task 4 : Câblage `App` + bouton micro `Header`

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Header.jsx`

- [ ] **Step 1 : `src/App.jsx` — état + imports**

Ajouter l'import du dock et du flag de support :

```js
import { VoiceDock } from './components/VoiceDock'
import { speechSupported } from './hooks/useSpeech'
```

Ajouter l'état (près de `showQuickCapture`) :

```js
  const [voiceOpen, setVoiceOpen] = useState(false)
```

- [ ] **Step 2 : `src/App.jsx` — Header + QuickCapture + VoiceDock**

1. Au rendu du `<Header …>`, ajouter les props : `onOpenVoice={() => setVoiceOpen((v) => !v)}` et `voiceSupported={speechSupported}`.

2. Le rendu `<QuickCapture …>` : retirer `voiceContext` et `onVoiceCommand`, ne garder que :

```jsx
      <QuickCapture
        isOpen={showQuickCapture}
        onClose={() => setShowQuickCapture(false)}
        onSubmit={(parsed) => {
          handleQuickCapture(parsed)
          setShowQuickCapture(false)
        }}
      />
```

3. Juste après le `<QuickCapture …/>`, ajouter le dock (monté seulement si ouvert) :

```jsx
      {voiceOpen && (
        <VoiceDock
          onClose={() => setVoiceOpen(false)}
          voiceContext={voiceContext}
          onVoiceCommand={handleVoiceCommand}
        />
      )}
```

(`voiceContext` et `handleVoiceCommand` existent déjà dans `App`.)

- [ ] **Step 3 : `src/components/Header.jsx` — bouton micro**

1. Ajouter `onOpenVoice` et `voiceSupported = false` aux props déstructurées de `Header`.

2. Remplacer l'icône du bouton « Capturer » (actuellement un micro) par un « + » (puisque le micro devient le bouton vocal). Dans le bouton « Capturer », remplacer son `<svg>…</svg>` par :

```jsx
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
```

3. Juste **avant** le bouton « Capturer », insérer le bouton micro (affiché seulement si `voiceSupported`) :

```jsx
            {/* Commande vocale */}
            {voiceSupported && (
              <button
                type="button"
                onClick={onOpenVoice}
                className="flex min-h-[36px] min-w-[36px] touch-manipulation items-center justify-center rounded-[var(--radius-md)] p-2 transition-all"
                style={{ color: 'var(--muted)' }}
                aria-label="Commande vocale"
                title="Commande vocale"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
```

- [ ] **Step 4 : Build + lint + tests**

Run: `npm run build` puis `npm run lint` puis `npm test`
Expected: build OK ; aucun **nouveau** problème lint ; 65 tests verts.

- [ ] **Step 5 : Vérification manuelle (dev server)**

Run: `npm run dev`. Sur Chrome :
- Clic micro (Header) → la barre apparaît en bas, l'app reste visible. Autoriser le micro.
- « va aux tickets » → la vue Tickets s'affiche **derrière** le dock, confirmation parlée + ligne au journal.
- Enchaîner « qu'est-ce que j'ai aujourd'hui », « termine la 1 ». Vérifier que la barre ne chevauche pas la bottom nav (mode mobile, DevTools responsive).
- ✕ ou re-clic micro → la barre disparaît, le micro s'arrête.
- Bouton « Capturer » / `N` → modale texte (sans micro) : taper « payer le loyer demain » → Ajouter crée la tâche et ferme.

- [ ] **Step 6 : Commit**

```bash
git add src/App.jsx src/components/Header.jsx
git commit -m "feat: separate voice dock and text capture triggers"
```

---

## Couverture spec → tâches

| Exigence spec | Tâche |
|---|---|
| Hook `useVoiceSession` (logique extraite, half-duplex préservé) | Task 1 |
| `VoiceDock` barre non-modale, au-dessus de la nav, journal/interim/erreur | Task 2 |
| `QuickCapture` modale texte pure | Task 3 |
| Déclencheurs séparés (micro→dock, Capturer/N→modale) | Task 4 |
| Bouton micro Header (masqué si non supporté) | Task 4 |
| `App` état `voiceOpen` + montage conditionnel du dock | Task 4 |
| Logique d'interprétation inchangée (65 tests) | toutes (aucun module pur modifié) |
