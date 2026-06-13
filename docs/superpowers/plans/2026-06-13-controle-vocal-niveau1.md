# Contrôle vocal Niveau 1 — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer la capture vocale en contrôle vocal mains-libres : commandes (naviguer, cocher/terminer, reporter) + requêtes à réponse parlée, en déterministe (Web Speech + SpeechSynthesis), sans backend.

**Architecture:** Toute l'interprétation est dans des modules **purs et testables** (`text.js`, `taskMatch.js`, `voiceCommands.js`, `cockpit.js`) ; l'exécution est centralisée dans un `handleVoiceCommand` d'`App.jsx`. `quickParse` ne change pas (devient le fallback capture). `QuickCapture` gagne un mode session (écoute continue, journal, TTS). `useSpeech` reçoit une option `continuous` additive ; `useSpeak` est un nouveau hook TTS.

**Tech Stack:** React 19, Vite 7, Vitest, Web Speech API, SpeechSynthesis API.

**Spec:** `docs/superpowers/specs/2026-06-13-controle-vocal-niveau1-design.md`

**Conventions :** un commit par tâche, messages sans aucune attribution IA. Un formateur reformate après écriture (guillemets doubles, points-virgules) — attendu. `npm run build` doit passer avant chaque commit. Le store/sync ne change jamais de structure.

---

### Task 1 : `text.js` + `taskMatch.js` (TDD)

**Files:**
- Create: `src/utils/text.js`
- Create: `src/utils/taskMatch.js`
- Test: `src/utils/taskMatch.test.js`

`text.js` factorise la normalisation (minuscule, sans accents) ; `taskMatch` désigne une tâche par numéro ou titre flou.

- [ ] **Step 1 : Créer `src/utils/text.js`**

```js
export function normalize(s) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}
```

- [ ] **Step 2 : Écrire les tests `src/utils/taskMatch.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { matchTask } from './taskMatch'

const numberedTasks = [
  { id: 'a', title: 'Payer le loyer' },
  { id: 'b', title: 'Réviser chapitre 4' },
  { id: 'c', title: 'Appeler la banque' },
]
const activeTasks = [
  ...numberedTasks,
  { id: 'd', title: 'Appeler maman' },
  { id: 'e', title: 'Ranger le bureau' },
]

describe('matchTask — numéro', () => {
  it('matches a bare digit', () => {
    expect(matchTask('2', { numberedTasks, activeTasks })).toEqual({ status: 'one', task: numberedTasks[1] })
  })
  it('matches "la 3"', () => {
    expect(matchTask('la 3', { numberedTasks, activeTasks }).task.id).toBe('c')
  })
  it('matches "numéro 1"', () => {
    expect(matchTask('numéro 1', { numberedTasks, activeTasks }).task.id).toBe('a')
  })
  it('matches ordinal "la première"', () => {
    expect(matchTask('la première', { numberedTasks, activeTasks }).task.id).toBe('a')
  })
  it('matches ordinal "deuxième"', () => {
    expect(matchTask('deuxième', { numberedTasks, activeTasks }).task.id).toBe('b')
  })
  it('returns none for out-of-range number', () => {
    expect(matchTask('9', { numberedTasks, activeTasks })).toEqual({ status: 'none' })
  })
})

describe('matchTask — titre flou', () => {
  it('matches a unique title fragment', () => {
    expect(matchTask('le loyer', { numberedTasks, activeTasks }).task.id).toBe('a')
  })
  it('ignores accents and case', () => {
    expect(matchTask('REVISER chapitre', { numberedTasks, activeTasks }).task.id).toBe('b')
  })
  it('returns many on ambiguous fragment', () => {
    const r = matchTask('appeler', { numberedTasks, activeTasks })
    expect(r.status).toBe('many')
    expect(r.candidates.map((t) => t.id).sort()).toEqual(['c', 'd'])
  })
  it('returns none when no word matches', () => {
    expect(matchTask('xyz introuvable', { numberedTasks, activeTasks })).toEqual({ status: 'none' })
  })
  it('does not treat a number inside a title as a numeric ref', () => {
    expect(matchTask('chapitre 4', { numberedTasks, activeTasks }).task.id).toBe('b')
  })
})
```

- [ ] **Step 3 : Vérifier l'échec** — Run: `npm test` — Expected: FAIL (`taskMatch` absent).

- [ ] **Step 4 : Implémenter `src/utils/taskMatch.js`**

```js
import { normalize } from './text'

const ORDINALS = {
  premier: 1, premiere: 1,
  deuxieme: 2, deux: 2, second: 2, seconde: 2,
  troisieme: 3, trois: 3,
  quatrieme: 4, quatre: 4,
  cinquieme: 5, cinq: 5,
  sixieme: 6, six: 6,
  septieme: 7, sept: 7,
  huitieme: 8, huit: 8,
}

const STOP = new Set(['les', 'des', 'une', 'mon', 'mes', 'ton', 'tes', 'ses', 'nos', 'vos', 'leur', 'pour', 'avec', 'tache', 'taches'])

function numberFromTarget(norm) {
  const t = norm.trim()
  const m = /^(?:la\s+|le\s+|l['’]\s*|numero\s+|tache\s+|n[°o]\s*|#\s*)?(\d{1,2})$/.exec(t)
  if (m) return Number(m[1])
  for (const word of Object.keys(ORDINALS)) {
    if (new RegExp(`\\b${word}\\b`).test(t)) return ORDINALS[word]
  }
  return null
}

export function matchTask(query, { numberedTasks = [], activeTasks = [] }) {
  const norm = normalize(query)

  const n = numberFromTarget(norm)
  if (n != null) {
    const task = numberedTasks[n - 1]
    return task ? { status: 'one', task } : { status: 'none' }
  }

  const words = norm.split(/\s+/).filter((w) => w.length >= 3 && !STOP.has(w))
  if (!words.length) return { status: 'none' }

  const scored = activeTasks
    .map((task) => {
      const titleNorm = normalize(task.title)
      const score = words.filter((w) => titleNorm.includes(w)).length
      return { task, score }
    })
    .filter((s) => s.score > 0)

  if (!scored.length) return { status: 'none' }

  const max = Math.max(...scored.map((s) => s.score))
  const top = scored.filter((s) => s.score === max)
  if (top.length === 1) return { status: 'one', task: top[0].task }
  return { status: 'many', candidates: top.slice(0, 3).map((s) => s.task) }
}
```

- [ ] **Step 5 : Vérifier que tout passe** — Run: `npm test` — Expected: PASS.

- [ ] **Step 6 : Commit**

```bash
git add src/utils/text.js src/utils/taskMatch.js src/utils/taskMatch.test.js
git commit -m "feat: task matching by number and fuzzy title"
```

---

### Task 2 : Sélecteurs cockpit `cockpit.js` (TDD) + refactor CockpitView

**Files:**
- Create: `src/utils/cockpit.js`
- Test: `src/utils/cockpit.test.js`
- Modify: `src/components/CockpitView.jsx`

Extrait la logique « Maintenant » dans un sélecteur pur partagé entre `CockpitView` (affichage + numérotation) et `App` (contexte vocal), sans changer le comportement existant.

- [ ] **Step 1 : Écrire les tests `src/utils/cockpit.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { selectNowTasks, selectActiveTasks } from './cockpit'

const REF = '2026-06-13'
const tasks = [
  { id: 'over', title: 'En retard', context: 'pro', status: 'backlog', dueDate: '2026-06-10' },
  { id: 'today', title: 'Du jour', context: 'pro', status: 'backlog', dueDate: '2026-06-13', dueTime: '09:00' },
  { id: 'focus', title: 'Focus', context: 'pro', status: 'backlog', dueDate: '', doToday: true },
  { id: 'future', title: 'Plus tard', context: 'pro', status: 'backlog', dueDate: '2026-06-30' },
  { id: 'done', title: 'Faite', context: 'pro', status: 'done', dueDate: '2026-06-13' },
  { id: 'perso', title: 'Perso', context: 'perso', status: 'backlog', doToday: true },
]

describe('selectNowTasks', () => {
  it('keeps overdue/today/doToday of the context, overdue first, excludes done/future/other-context', () => {
    const r = selectNowTasks(tasks, 'pro', { focusTaskIds: [] }, REF)
    expect(r.map((t) => t.id)).toEqual(['over', 'today', 'focus'])
  })
  it('includes focus tasks from the daily plan', () => {
    const r = selectNowTasks(tasks, 'pro', { focusTaskIds: ['future'] }, REF)
    expect(r.map((t) => t.id)).toContain('future')
  })
  it('caps at 8 items', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ id: `t${i}`, title: `T${i}`, context: 'pro', status: 'backlog', doToday: true }))
    expect(selectNowTasks(many, 'pro', { focusTaskIds: [] }, REF)).toHaveLength(8)
  })
})

describe('selectActiveTasks', () => {
  it('returns non-done tasks of the context only', () => {
    expect(selectActiveTasks(tasks, 'pro').map((t) => t.id).sort()).toEqual(['focus', 'future', 'over', 'today'])
  })
})
```

- [ ] **Step 2 : Vérifier l'échec** — Run: `npm test` — Expected: FAIL.

- [ ] **Step 3 : Implémenter `src/utils/cockpit.js`**

```js
import { today } from './date'

export function selectActiveTasks(tasks = [], context) {
  return tasks.filter((t) => t.context === context && t.status !== 'done')
}

export function selectNowTasks(tasks = [], context, todayPlan, ref = today()) {
  const focusIds = todayPlan?.focusTaskIds ?? []
  const isNow = (t) =>
    t.status !== 'done' &&
    (t.doToday || focusIds.includes(t.id) || (t.dueDate && String(t.dueDate).slice(0, 10) <= ref))
  const rank = (t) => {
    if (t.dueDate && String(t.dueDate).slice(0, 10) < ref) return 0
    if (t.doToday || focusIds.includes(t.id)) return 1
    return 2
  }
  return tasks
    .filter((t) => t.context === context)
    .filter(isNow)
    .sort((a, b) => rank(a) - rank(b) || String(a.dueTime ?? '').localeCompare(String(b.dueTime ?? '')))
    .slice(0, 8)
}
```

- [ ] **Step 4 : Vérifier que tout passe** — Run: `npm test` — Expected: PASS.

- [ ] **Step 5 : Refactor `CockpitView.jsx` pour utiliser le sélecteur + numéroter**

Dans `src/components/CockpitView.jsx` :

1. Ajouter l'import : `import { selectNowTasks } from '../utils/cockpit'`
2. Remplacer le `useMemo` de `nowTasks` (le bloc qui définit `isNow`/`rank` et fait `.slice(0, 8)`) par :

```jsx
  const nowTasks = useMemo(
    () => selectNowTasks(tasks, context, todayPlan, todayStr),
    [tasks, context, todayPlan, todayStr]
  )
```

3. Passer l'index à `NowRow` dans le `.map` : `{nowTasks.map((t, i) => (<NowRow key={t.id} index={i + 1} task={t} onToggle={onToggleTask} />))}`
4. Dans `NowRow({ task, onToggle })` → `NowRow({ index, task, onToggle })`, insérer juste après le bouton de complétion (avant le `<span>` du titre) :

```jsx
      <span
        className="shrink-0 text-[11px] font-semibold tabular-nums"
        style={{ color: 'var(--muted-2)', minWidth: '1.1em' }}
        aria-hidden
      >
        {index}
      </span>
```

- [ ] **Step 6 : Build + tests** — Run: `npm run build` puis `npm test` — Expected: OK, comportement du cockpit inchangé hormis les numéros visibles.

- [ ] **Step 7 : Commit**

```bash
git add src/utils/cockpit.js src/utils/cockpit.test.js src/components/CockpitView.jsx
git commit -m "feat: shared cockpit selectors + numbered now-tasks"
```

---

### Task 3 : `voiceCommands.js` (TDD)

**Files:**
- Create: `src/utils/voiceCommands.js`
- Test: `src/utils/voiceCommands.test.js`

Interprète une transcription en intention. Stateless. Réutilise `parseQuickInput` (dates + fallback capture) et `matchTask`.

- [ ] **Step 1 : Écrire les tests `src/utils/voiceCommands.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { interpretCommand, resolveAmbiguous } from './voiceCommands'

const REF = '2026-06-13' // samedi
const numberedTasks = [
  { id: 'a', title: 'Payer le loyer' },
  { id: 'b', title: 'Réviser chapitre 4' },
]
const activeTasks = [
  ...numberedTasks,
  { id: 'c', title: 'Appeler la banque' },
  { id: 'd', title: 'Appeler maman' },
]
const ctx = { numberedTasks, activeTasks, view: 'cockpit', refISO: REF }

describe('navigation', () => {
  it('va aux tickets', () => expect(interpretCommand('va aux tickets', ctx)).toEqual({ kind: 'navigate', view: 'tickets' }))
  it('ouvre le cockpit', () => expect(interpretCommand('ouvre le cockpit', ctx)).toEqual({ kind: 'navigate', view: 'cockpit' }))
  it('montre les rituels', () => expect(interpretCommand('montre les rituels', ctx)).toEqual({ kind: 'navigate', view: 'rituals' }))
  it('affiche l\'agenda', () => expect(interpretCommand("affiche l'agenda", ctx)).toEqual({ kind: 'navigate', view: 'agenda' }))
})

describe('complete', () => {
  it('by title', () => expect(interpretCommand('termine le loyer', ctx)).toEqual({ kind: 'complete', taskId: 'a' }))
  it('by number', () => expect(interpretCommand('coche la 2', ctx)).toEqual({ kind: 'complete', taskId: 'b' }))
  it('ambiguous → candidates', () => {
    const r = interpretCommand('termine appeler', ctx)
    expect(r.kind).toBe('ambiguous')
    expect(r.action).toBe('complete')
    expect(r.candidates.map((t) => t.id).sort()).toEqual(['c', 'd'])
  })
  it('not found → ambiguous with empty candidates', () => {
    expect(interpretCommand('termine introuvable', ctx)).toEqual({ kind: 'ambiguous', action: 'complete', candidates: [] })
  })
})

describe('snooze', () => {
  it('reporte X à demain', () => {
    expect(interpretCommand('reporte le loyer à demain', ctx)).toEqual({ kind: 'snooze', taskId: 'a', dueDate: '2026-06-14' })
  })
  it('décale la 2 à lundi', () => {
    const r = interpretCommand('décale la 2 à lundi', ctx)
    expect(r).toMatchObject({ kind: 'snooze', taskId: 'b', dueDate: '2026-06-15' })
  })
  it('without a date → unknown', () => {
    expect(interpretCommand('reporte le loyer', ctx)).toEqual({ kind: 'unknown' })
  })
})

describe('queries', () => {
  it('today', () => expect(interpretCommand("qu'est-ce que j'ai aujourd'hui", ctx)).toEqual({ kind: 'query', query: 'today' }))
  it('overdue', () => expect(interpretCommand('combien en retard', ctx)).toEqual({ kind: 'query', query: 'overdue' }))
  it('next', () => expect(interpretCommand("c'est quoi la prochaine échéance", ctx)).toEqual({ kind: 'query', query: 'next' }))
})

describe('capture fallback', () => {
  it('plain phrase → capture (not a query despite the date word)', () => {
    const r = interpretCommand('réviser le cours aujourd\'hui', ctx)
    expect(r.kind).toBe('capture')
    expect(r.parsed.dueDate).toBe('2026-06-13')
    expect(r.parsed.title).toBe('réviser le cours')
  })
  it('ticket capture by prefix', () => {
    const r = interpretCommand('ticket : relancer le fournisseur', ctx)
    expect(r.kind).toBe('capture')
    expect(r.parsed.target).toBe('ticket')
  })
})

describe('resolveAmbiguous', () => {
  it('resolves complete by number among candidates', () => {
    const pending = { action: 'complete', candidates: [{ id: 'c', title: 'Appeler la banque' }, { id: 'd', title: 'Appeler maman' }] }
    expect(resolveAmbiguous('la 2', pending)).toEqual({ kind: 'complete', taskId: 'd' })
  })
  it('resolves snooze keeping the pending date', () => {
    const pending = { action: 'snooze', dueDate: '2026-06-15', candidates: [{ id: 'c', title: 'Appeler la banque' }, { id: 'd', title: 'Appeler maman' }] }
    expect(resolveAmbiguous('la banque', pending)).toEqual({ kind: 'snooze', taskId: 'c', dueDate: '2026-06-15' })
  })
  it('returns unknown when still unresolved', () => {
    const pending = { action: 'complete', candidates: [{ id: 'c', title: 'Appeler la banque' }, { id: 'd', title: 'Appeler maman' }] }
    expect(resolveAmbiguous('appeler', pending)).toEqual({ kind: 'unknown' })
  })
})
```

- [ ] **Step 2 : Vérifier l'échec** — Run: `npm test` — Expected: FAIL.

- [ ] **Step 3 : Implémenter `src/utils/voiceCommands.js`**

```js
import { parseQuickInput } from './quickParse'
import { matchTask } from './taskMatch'
import { normalize } from './text'

const NAV_VERB = /\b(va|vas|aller|ouvre|ouvrir|montre|montrer|affiche|afficher|retour)\b/
const MODULES = [
  { re: /\b(cockpit|accueil|tableau de bord)\b/, view: 'cockpit' },
  { re: /\b(taches?|todo|a faire)\b/, view: 'tasks' },
  { re: /\b(projets?)\b/, view: 'projects' },
  { re: /\b(tickets?)\b/, view: 'tickets' },
  { re: /\b(rituels?|habitudes?)\b/, view: 'rituals' },
  { re: /\b(notes?)\b/, view: 'notes' },
  { re: /\b(agenda|calendrier)\b/, view: 'agenda' },
  { re: /\b(cours)\b/, view: 'courses' },
]
const COMPLETE_VERB = /\b(termine[rs]?|coche[rs]?|finis|finir|valide[rs]?|faite?)\b/
const SNOOZE_VERB = /\b(reporte[rs]?|decale[rs]?|repousse[rs]?|deplace[rs]?)\b/
const TARGET_FILLERS = /\b(la|le|les|l|ma|mon|mes|a|au|aux|de|du)\b/g
const QUERY_RULES = [
  { re: /(qu['’ ]?est[- ]?ce que j['’ ]?ai|qu['’ ]?ai[- ]?je|ma journee|mes taches du jour|quoi a faire)/, query: 'today' },
  { re: /(combien.*retard|mes retards|quoi.*en retard|qu['’ ]?est[- ]?ce qui est en retard)/, query: 'overdue' },
  { re: /(prochaine echeance|la prochaine|ma prochaine|quoi de prochain)/, query: 'next' },
]

function stripFillers(norm) {
  return norm.replace(TARGET_FILLERS, ' ').replace(/\s{2,}/g, ' ').trim()
}

export function interpretCommand(transcript, ctx = {}) {
  const { numberedTasks = [], activeTasks = [], refISO } = ctx
  const raw = String(transcript ?? '').trim()
  const norm = normalize(raw)
  const matchCtx = { numberedTasks, activeTasks }

  // 1. Navigation (verbe + module)
  if (NAV_VERB.test(norm)) {
    for (const m of MODULES) {
      if (m.re.test(norm)) return { kind: 'navigate', view: m.view }
    }
  }

  // 2. Cocher / terminer
  if (COMPLETE_VERB.test(norm)) {
    const target = stripFillers(norm.replace(COMPLETE_VERB, ' '))
    const r = matchTask(target, matchCtx)
    if (r.status === 'one') return { kind: 'complete', taskId: r.task.id }
    if (r.status === 'many') return { kind: 'ambiguous', action: 'complete', candidates: r.candidates }
    return { kind: 'ambiguous', action: 'complete', candidates: [] }
  }

  // 3. Reporter
  if (SNOOZE_VERB.test(norm)) {
    const afterVerb = norm.replace(SNOOZE_VERB, ' ').trim()
    const parsed = parseQuickInput(afterVerb, refISO)
    if (!parsed.dueDate) return { kind: 'unknown' }
    const target = stripFillers(normalize(parsed.title))
    const r = matchTask(target, matchCtx)
    if (r.status === 'one') return { kind: 'snooze', taskId: r.task.id, dueDate: parsed.dueDate }
    if (r.status === 'many') return { kind: 'ambiguous', action: 'snooze', candidates: r.candidates, dueDate: parsed.dueDate }
    return { kind: 'ambiguous', action: 'snooze', candidates: [], dueDate: parsed.dueDate }
  }

  // 4. Requêtes
  for (const q of QUERY_RULES) {
    if (q.re.test(norm)) return { kind: 'query', query: q.query }
  }

  // 5. Fallback capture
  return { kind: 'capture', parsed: parseQuickInput(raw, refISO) }
}

export function resolveAmbiguous(transcript, pending) {
  const candidates = pending.candidates ?? []
  const r = matchTask(transcript, { numberedTasks: candidates, activeTasks: candidates })
  if (r.status !== 'one') return { kind: 'unknown' }
  if (pending.action === 'snooze') return { kind: 'snooze', taskId: r.task.id, dueDate: pending.dueDate }
  return { kind: 'complete', taskId: r.task.id }
}
```

- [ ] **Step 4 : Vérifier que tout passe** — Run: `npm test` — Expected: PASS. Si un test de requête vs capture échoue, ajuster les regex `QUERY_RULES` (ne jamais modifier les attentes des tests).

- [ ] **Step 5 : Commit**

```bash
git add src/utils/voiceCommands.js src/utils/voiceCommands.test.js
git commit -m "feat: deterministic voice command interpreter (nav, complete, snooze, query)"
```

---

### Task 4 : `useSpeak` + extension `useSpeech` (continuous)

**Files:**
- Create: `src/hooks/useSpeak.js`
- Modify: `src/hooks/useSpeech.js`

Pas de test automatisé (APIs navigateur) — vérification manuelle en Task 6.

- [ ] **Step 1 : Créer `src/hooks/useSpeak.js`**

```js
import { useCallback } from 'react'

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
export const speakSupported = Boolean(synth)

export function useSpeak({ lang = 'fr-FR' } = {}) {
  const speak = useCallback(
    (text) => {
      if (!synth || !text) return
      synth.cancel()
      const utterance = new SpeechSynthesisUtterance(String(text))
      utterance.lang = lang
      synth.speak(utterance)
    },
    [lang]
  )
  const cancel = useCallback(() => synth?.cancel(), [])
  return { supported: speakSupported, speak, cancel }
}
```

- [ ] **Step 2 : Remplacer `src/hooks/useSpeech.js` par la version avec `continuous` + auto-restart**

```js
import { useState, useRef, useCallback, useEffect } from 'react'

const SpeechRecognitionImpl =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined

export const speechSupported = Boolean(SpeechRecognitionImpl)

export function useSpeech({ lang = 'fr-FR', onResult, continuous = false } = {}) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const wantRef = useRef(false)
  const onResultRef = useRef(onResult)

  useEffect(() => {
    onResultRef.current = onResult
  })

  const launch = useCallback(() => {
    const recognition = new SpeechRecognitionImpl()
    recognition.lang = lang
    recognition.interimResults = true
    recognition.continuous = continuous

    recognition.onresult = (event) => {
      let finalText = ''
      let interimText = ''
      for (const result of event.results) {
        if (result.isFinal) finalText += result[0].transcript
        else interimText += result[0].transcript
      }
      setInterim(interimText)
      if (finalText) onResultRef.current?.(finalText.trim())
    }
    recognition.onerror = (event) => {
      setError(event.error)
      wantRef.current = false
      setListening(false)
      recognitionRef.current = null
    }
    recognition.onend = () => {
      recognitionRef.current = null
      setInterim('')
      if (continuous && wantRef.current) {
        launch()
      } else {
        setListening(false)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }, [lang, continuous])

  const start = useCallback(() => {
    if (!SpeechRecognitionImpl || recognitionRef.current) return
    setError(null)
    setInterim('')
    wantRef.current = true
    launch()
  }, [launch])

  const stop = useCallback(() => {
    wantRef.current = false
    recognitionRef.current?.stop()
  }, [])

  useEffect(() => {
    return () => {
      wantRef.current = false
      recognitionRef.current?.abort()
    }
  }, [])

  return { supported: speechSupported, listening, interim, error, start, stop }
}
```

- [ ] **Step 3 : Build** — Run: `npm run build` — Expected: OK. (QuickCapture utilise encore l'ancien appel `useSpeech({ onResult })` — compatible car `continuous` a une valeur par défaut.)

- [ ] **Step 4 : Commit**

```bash
git add src/hooks/useSpeak.js src/hooks/useSpeech.js
git commit -m "feat: TTS hook + continuous listening option for speech recognition"
```

---

### Task 5 : Mode session vocale dans `QuickCapture` + `handleVoiceCommand` dans `App`

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/QuickCapture.jsx`

Intégration finale : `App` fournit le contexte vocal et l'exécuteur ; `QuickCapture` pilote la session (écoute continue, journal, TTS, désambiguïsation).

- [ ] **Step 1 : `App.jsx` — construire le contexte vocal et l'exécuteur**

1. Imports à ajouter :

```js
import { selectNowTasks, selectActiveTasks } from './utils/cockpit'
import { collectDeadlines, formatCountdown, daysUntil } from './utils/deadlines'
```

(`today` est déjà importé.)

2. Après les hooks du store, calculer le contexte vocal (recalculé à chaque rendu, peu coûteux) :

```js
  const voiceContext = {
    numberedTasks: selectNowTasks(state.tasks, context, todayPlan, today()),
    activeTasks: selectActiveTasks(state.tasks, context),
    view,
    refISO: today(),
  }
```

3. Ajouter l'exécuteur `handleVoiceCommand`. Il applique l'effet et renvoie `{ message, pending }` (`pending` non nul seulement pour une désambiguïsation) :

```js
  const handleVoiceCommand = useCallback(
    (intent) => {
      const titleOf = (id) => state.tasks.find((t) => t.id === id)?.title ?? 'la tâche'
      switch (intent.kind) {
        case 'navigate': {
          const labels = { cockpit: 'le cockpit', tasks: 'les tâches', projects: 'les projets', tickets: 'les tickets', rituals: 'les rituels', notes: 'les notes', agenda: "l'agenda", courses: 'les cours' }
          setView(intent.view)
          return { message: `Ouvert ${labels[intent.view] ?? intent.view}` }
        }
        case 'complete': {
          const title = titleOf(intent.taskId)
          toggleTaskStatus(intent.taskId)
          return { message: `Terminé : ${title}` }
        }
        case 'snooze': {
          const title = titleOf(intent.taskId)
          updateTask(intent.taskId, { dueDate: intent.dueDate, doToday: intent.dueDate === today() })
          return { message: `Reporté ${title} à ${formatCountdown(daysUntil(intent.dueDate))}` }
        }
        case 'query': {
          if (intent.query === 'today') {
            const now = voiceContext.numberedTasks
            if (!now.length) return { message: "Rien d'urgent aujourd'hui." }
            return { message: `Tu as ${now.length} chose${now.length > 1 ? 's' : ''} : ${now.map((t) => t.title).join(', ')}.` }
          }
          if (intent.query === 'overdue') {
            const n = collectDeadlines({ tasks: voiceContext.activeTasks, reqTickets: state.reqTickets ?? [] }).filter((d) => d.overdue).length
            return { message: n ? `${n} chose${n > 1 ? 's' : ''} en retard.` : 'Rien en retard, bravo.' }
          }
          const next = collectDeadlines({ tasks: voiceContext.activeTasks, reqTickets: state.reqTickets ?? [] })[0]
          return { message: next ? `Prochaine échéance : ${next.title}, ${next.label}.` : 'Aucune échéance à venir.' }
        }
        case 'ambiguous': {
          if (!intent.candidates.length) return { message: "Je n'ai pas trouvé cette tâche." }
          const list = intent.candidates.map((t, i) => `${i + 1}. ${t.title}`).join(' — ')
          return { message: `Laquelle ? ${list}`, pending: { action: intent.action, candidates: intent.candidates, dueDate: intent.dueDate } }
        }
        case 'capture': {
          handleQuickCapture(intent.parsed)
          const label = intent.parsed.target === 'ticket' ? 'Ticket créé' : intent.parsed.target === 'note' ? 'Note ajoutée' : 'Tâche créée'
          return { message: label }
        }
        default:
          return { message: "Je n'ai pas compris." }
      }
    },
    [state.tasks, state.reqTickets, voiceContext, toggleTaskStatus, updateTask, handleQuickCapture]
  )
```

Note : `handleQuickCapture` appelle déjà `setShowQuickCapture(false)`. Pour ne pas fermer la modale pendant une session vocale, retirer la ligne `setShowQuickCapture(false)` de `handleQuickCapture` et la déplacer dans le bouton « Ajouter » du mode clavier (voir Step 2, le `onSubmit` clavier fermera explicitement). Concrètement : dans `handleQuickCapture`, supprimer `setShowQuickCapture(false);`. Dans le rendu `<QuickCapture>`, passer `onSubmit={(parsed) => { handleQuickCapture(parsed); setShowQuickCapture(false) }}`.

4. Passer les nouvelles props au composant :

```jsx
      <QuickCapture
        isOpen={showQuickCapture}
        onClose={() => setShowQuickCapture(false)}
        onSubmit={(parsed) => { handleQuickCapture(parsed); setShowQuickCapture(false) }}
        voiceContext={voiceContext}
        onVoiceCommand={handleVoiceCommand}
      />
```

- [ ] **Step 2 : Réécrire `src/components/QuickCapture.jsx`** (mode clavier conservé + mode session)

```jsx
import { useState, useEffect, useRef } from 'react'
import { Modal } from './Modal'
import { useSpeech } from '../hooks/useSpeech'
import { useSpeak } from '../hooks/useSpeak'
import { parseQuickInput } from '../utils/quickParse'
import { interpretCommand, resolveAmbiguous } from '../utils/voiceCommands'
import { formatCountdown, daysUntil } from '../utils/deadlines'

const TARGET_LABELS = { task: 'Tâche', ticket: 'Ticket', note: 'Note' }
const TARGET_COLORS = { task: 'tasks', ticket: 'tickets', note: 'notes' }

export function QuickCapture({ isOpen, onClose, onSubmit, voiceContext = {}, onVoiceCommand }) {
  const [text, setText] = useState('')
  const [journal, setJournal] = useState([])
  const inputRef = useRef(null)
  const pendingRef = useRef(null)
  const voiceRef = useRef(voiceContext)
  voiceRef.current = voiceContext
  const cmdRef = useRef(onVoiceCommand)
  cmdRef.current = onVoiceCommand

  const { speak } = useSpeak()

  const handleTranscript = (transcript) => {
    if (!transcript) return
    const intent = pendingRef.current
      ? resolveAmbiguous(transcript, pendingRef.current)
      : interpretCommand(transcript, voiceRef.current)
    pendingRef.current = null
    const result = cmdRef.current?.(intent) ?? { message: '' }
    if (result.pending) pendingRef.current = result.pending
    if (result.message) {
      speak(result.message)
      setJournal((j) => [...j, result.message].slice(-6))
    }
  }

  const { supported, listening, interim, error, start, stop } = useSpeech({
    continuous: true,
    onResult: handleTranscript,
  })

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
    stop()
    pendingRef.current = null
    setJournal([])
  }, [isOpen, stop])

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
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={listening && interim ? interim : text}
            onChange={(e) => setText(e.target.value)}
            readOnly={listening}
            placeholder={listening ? 'À l\'écoute… dites une commande' : 'Ex. « payer le loyer demain », « va aux tickets »'}
            className="min-w-0 flex-1 rounded-[var(--radius-lg)] border px-4 py-3 text-base outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            aria-label="Capture rapide"
          />
          {supported && (
            <button
              type="button"
              onClick={listening ? stop : start}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all${listening ? ' pulse-glow' : ''}`}
              style={{
                background: listening ? 'var(--accent)' : 'var(--surface-2)',
                color: listening ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
              aria-label={listening ? 'Terminer la session vocale' : 'Démarrer la session vocale'}
              title={listening ? 'Terminer' : 'Session vocale (fr)'}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}
        </div>

        {listening && (
          <p className="text-xs" style={{ color: 'var(--accent)' }}>
            Session vocale active — « va aux tickets », « termine la 1 », « reporte X à demain », « qu'est-ce que j'ai aujourd'hui ». Dites « Terminer » via le bouton micro pour sortir.
          </p>
        )}

        {error && (
          <p className="text-xs" style={{ color: 'var(--danger)' }}>
            Dictée indisponible ({error}). Vous pouvez taper votre texte.
          </p>
        )}

        {journal.length > 0 && (
          <ul className="flex flex-col gap-1 rounded-[var(--radius-lg)] p-2 text-xs" style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
            {journal.map((line, i) => (
              <li key={i} className="truncate">↳ {line}</li>
            ))}
          </ul>
        )}

        {!listening && canSubmit && (
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
            disabled={!canSubmit || listening}
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

- [ ] **Step 3 : Build + lint + tests**

Run: `npm run build` puis `npm run lint` puis `npm test`
Expected: build OK ; aucun **nouveau** warning lint (les ~27 pré-existants restent) ; tous les tests passent (Tasks 1-3). Corriger tout import inutilisé introduit ici.

- [ ] **Step 4 : Vérification manuelle (dev server)**

Run: `npm run dev`. Sur Chrome/Edge :
- Ouvrir la capture (bouton « Capturer » ou `N`), cliquer le micro → autoriser le micro.
- Tester : « va aux tickets » (navigation + confirmation parlée), « ouvre le cockpit », « termine la 1 », « termine le loyer », « reporte le loyer à demain », « qu'est-ce que j'ai aujourd'hui » (réponse parlée), une commande ambiguë « termine appeler » → « Laquelle ? » puis « la 1 ».
- Vérifier le journal qui s'accumule, et que taper au clavier (sans micro) crée toujours un item comme avant.
- Vérifier que les données existantes sont intactes.

- [ ] **Step 5 : Commit**

```bash
git add src/App.jsx src/components/QuickCapture.jsx
git commit -m "feat: hands-free voice session (navigate, complete, snooze, query) with TTS"
```

---

## Couverture spec → tâches

| Exigence spec | Tâche |
|---|---|
| Ciblage par numéro + titre flou, ambiguïté | Task 1 (`taskMatch`) |
| Numérotation du cockpit | Task 2 |
| `interpretCommand` (nav/complete/snooze/query/capture/unknown) | Task 3 |
| `resolveAmbiguous` (désambiguïsation) | Task 3 |
| TTS (`useSpeak`) | Task 4 |
| Écoute continue (`useSpeech` continuous) | Task 4 |
| Session vocale enchaînée + journal | Task 5 (`QuickCapture`) |
| Exécution des intentions + réponses requêtes | Task 5 (`handleVoiceCommand`) |
| Confirmations + réponses parlées | Task 5 |
| quickParse inchangé (fallback capture) | Tasks 3, 5 |
| Store/sync additif uniquement | toutes (aucune action reducer ajoutée) |
```
