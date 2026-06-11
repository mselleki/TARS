# Refonte TARS — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer TARS en cockpit de monitoring clair et chaleureux : dashboard d'accueil agrégeant tous les modules, navigation par modules (sidebar/bottom nav), échéances visibles partout, capture rapide texte + vocale (Web Speech API, fr-FR).

**Architecture:** Refonte progressive — le store (`useStore`, `reducer.js`, `storage.js`, `remoteSync.js`) est conservé tel quel ; seuls la couche UI, les tokens CSS et deux utilitaires purs (`deadlines.js`, `quickParse.js`) sont ajoutés/réécrits. Les modules existants (tickets, notes, agenda, cours, rituels) sont extraits d'`OverviewView` en vues dédiées. `App.jsx` est réécrit en dernier, en une seule fois, quand toutes les briques existent.

**Tech Stack:** React 19, Vite 7, Tailwind 4 (tokens CSS variables), Vitest (nouveau, logique pure uniquement), Web Speech API.

**Spec:** `docs/superpowers/specs/2026-06-11-refonte-tars-design.md`

**Conventions :**
- Les nouveaux composants sont libellés en **français** (les composants conservés restent tels quels).
- Un commit par tâche, messages sans aucune attribution IA.
- À chaque tâche : `npm run build` doit passer avant le commit.
- Le state Upstash/localStorage ne change jamais de structure (ajouts additifs uniquement).

---

### Task 1 : Installer Vitest

**Files:**
- Modify: `package.json`

- [ ] **Step 1 : Installer la dépendance**

Run: `npm install -D vitest`

- [ ] **Step 2 : Ajouter le script test**

Dans `package.json`, section `scripts`, ajouter :

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3 : Vérifier que vitest tourne (0 test = OK)**

Run: `npm test`
Expected: `No test files found` (exit code 1 est acceptable à ce stade — aucun test n'existe encore).

- [ ] **Step 4 : Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add vitest for pure logic tests"
```

---

### Task 2 : Tokens du design system « clair et chaleureux »

**Files:**
- Modify: `src/design-system.css` (bloc `:root`, lignes 9-120 environ)

Le design system actuel est entièrement piloté par des CSS variables (`var(--bg)`, `var(--surface)`, …) consommées par tous les composants : changer les tokens re-skinne toute l'app d'un coup. On ne touche **pas** au bloc `.dark` ni aux classes composants plus bas dans le fichier.

- [ ] **Step 1 : Remplacer les tokens de fond, bordures et rayons dans `:root`**

Dans `src/design-system.css`, remplacer les valeurs suivantes du bloc `:root` (light mode) — les noms de variables ne changent pas :

```css
  /* ── Backgrounds ── */
  --bg:               #FAF9F7;
  --bg-2:             #FAF9F7;
  --surface:          #FFFFFF;
  --surface-2:        #F5F3F0;
  --surface-elevated: #FFFFFF;

  /* ── Borders ── */
  --border:           rgba(68, 64, 60, 0.10);
  --border-strong:    rgba(68, 64, 60, 0.18);
  --border-subtle:    rgba(68, 64, 60, 0.06);

  /* ── Text (palette stone, chaleureuse) ── */
  --text:             #1C1917;
  --text-secondary:   #44403C;
  --muted:            #A8A29E;
  --muted-2:          #D6D3D1;

  /* ── Sidebar ── */
  --sidebar-bg:       #FFFFFF;
  --sidebar-border:   rgba(68, 64, 60, 0.08);
  --sidebar-gradient: #FFFFFF;

  /* ── Scale (arrondis plus généreux) ── */
  --radius-sm:  8px;
  --radius-md:  10px;
  --radius-lg:  14px;
  --radius-xl:  18px;
  --radius-2xl: 22px;
  --radius-full: 9999px;
```

- [ ] **Step 2 : Ajouter les couleurs d'accent par module à la fin du bloc `:root`**

Juste avant la fermeture du bloc `:root` (avant les legacy aliases), ajouter :

```css
  /* ── Couleurs par module (refonte cockpit) ── */
  --mod-cockpit:        #6D28D9;
  --mod-cockpit-bg:     #EDE9FE;
  --mod-tasks:          #0369A1;
  --mod-tasks-bg:       #E0F2FE;
  --mod-projects:       #6D28D9;
  --mod-projects-bg:    #EDE9FE;
  --mod-tickets:        #C2410C;
  --mod-tickets-bg:     #FFEDD5;
  --mod-rituals:        #15803D;
  --mod-rituals-bg:     #DCFCE7;
  --mod-notes:          #A16207;
  --mod-notes-bg:       #FEF9C3;
  --mod-agenda:         #BE185D;
  --mod-agenda-bg:      #FCE7F3;
  --mod-courses:        #B45309;
  --mod-courses-bg:     #FEF3C7;
  --overdue:            #C2410C;
  --overdue-bg:         #FFEDD5;
```

- [ ] **Step 3 : Dupliquer les variables modules dans le bloc `.dark`**

À la fin du bloc `.dark` du même fichier, ajouter (versions assombries) :

```css
  --mod-cockpit-bg:     rgba(109, 40, 217, 0.18);
  --mod-tasks-bg:       rgba(3, 105, 161, 0.18);
  --mod-projects-bg:    rgba(109, 40, 217, 0.18);
  --mod-tickets-bg:     rgba(194, 65, 12, 0.18);
  --mod-rituals-bg:     rgba(21, 128, 61, 0.18);
  --mod-notes-bg:       rgba(161, 98, 7, 0.18);
  --mod-agenda-bg:      rgba(190, 24, 93, 0.18);
  --mod-courses-bg:     rgba(180, 83, 9, 0.18);
  --overdue:            #FB923C;
  --overdue-bg:         rgba(194, 65, 12, 0.20);
```

- [ ] **Step 4 : Vérifier le build et l'apparence**

Run: `npm run build`
Expected: build OK.
Puis `npm run dev` et vérifier visuellement : fond crème, cartes blanches, arrondis plus doux. L'app reste pleinement fonctionnelle.

- [ ] **Step 5 : Commit**

```bash
git add src/design-system.css
git commit -m "feat: warm light design tokens + per-module accent colors"
```

---

### Task 3 : Utilitaire d'échéances `deadlines.js` (TDD)

**Files:**
- Create: `src/utils/deadlines.js`
- Test: `src/utils/deadlines.test.js`

Agrège les échéances des tâches (`dueDate`, déjà existant) et des tickets REQ (`dueAt`, déjà existant). Aucune modification du reducer n'est nécessaire.

- [ ] **Step 1 : Écrire les tests qui échouent**

Créer `src/utils/deadlines.test.js` :

```js
import { describe, it, expect } from 'vitest'
import { daysUntil, isOverdue, formatCountdown, collectDeadlines } from './deadlines'

const REF = '2026-06-11'

describe('daysUntil', () => {
  it('returns 0 for today', () => expect(daysUntil('2026-06-11', REF)).toBe(0))
  it('returns 1 for tomorrow', () => expect(daysUntil('2026-06-12', REF)).toBe(1))
  it('returns negative for past dates', () => expect(daysUntil('2026-06-09', REF)).toBe(-2))
  it('handles datetime strings by truncating', () => expect(daysUntil('2026-06-12T15:30:00', REF)).toBe(1))
})

describe('isOverdue', () => {
  it('is false for today', () => expect(isOverdue('2026-06-11', REF)).toBe(false))
  it('is true for yesterday', () => expect(isOverdue('2026-06-10', REF)).toBe(true))
  it('is false for empty date', () => expect(isOverdue('', REF)).toBe(false))
})

describe('formatCountdown', () => {
  it('formats today', () => expect(formatCountdown(0)).toBe("aujourd'hui"))
  it('formats tomorrow', () => expect(formatCountdown(1)).toBe('demain'))
  it('formats future days', () => expect(formatCountdown(5)).toBe('J-5'))
  it('formats overdue', () => expect(formatCountdown(-3)).toBe('en retard de 3 j'))
  it('formats one day overdue', () => expect(formatCountdown(-1)).toBe('en retard de 1 j'))
})

describe('collectDeadlines', () => {
  const tasks = [
    { id: 't1', title: 'Tâche datée', status: 'backlog', dueDate: '2026-06-12' },
    { id: 't2', title: 'Tâche finie', status: 'done', dueDate: '2026-06-12' },
    { id: 't3', title: 'Sans date', status: 'backlog', dueDate: '' },
    { id: 't4', title: 'En retard', status: 'backlog', dueDate: '2026-06-09' },
  ]
  const reqTickets = [
    { id: 'REQ1', summary: 'Ticket urgent', status: 'ACTIONABLE', dueAt: '2026-06-11' },
    { id: 'REQ2', summary: 'Ticket fini', status: 'DONE', dueAt: '2026-06-11' },
    { id: 'REQ3', summary: '', status: 'WAITING_REPLY', dueAt: null },
  ]

  it('aggregates open dated items only, sorted by due date asc', () => {
    const result = collectDeadlines({ tasks, reqTickets }, REF)
    expect(result.map((d) => d.id)).toEqual(['t4', 'REQ1', 't1'])
  })

  it('marks overdue items and sets kind', () => {
    const result = collectDeadlines({ tasks, reqTickets }, REF)
    expect(result[0]).toMatchObject({ id: 't4', kind: 'task', overdue: true })
    expect(result[1]).toMatchObject({ id: 'REQ1', kind: 'ticket', overdue: false, title: 'Ticket urgent' })
  })

  it('falls back to ticket id when summary is empty', () => {
    const result = collectDeadlines({ tasks: [], reqTickets: [{ id: 'REQ9', summary: '', status: 'ACTIONABLE', dueAt: '2026-06-12' }] }, REF)
    expect(result[0].title).toBe('REQ9')
  })
})
```

- [ ] **Step 2 : Vérifier que les tests échouent**

Run: `npm test`
Expected: FAIL — `deadlines.js` n'existe pas.

- [ ] **Step 3 : Implémenter `src/utils/deadlines.js`**

```js
import { today } from './date'

const MS_PER_DAY = 86400000

function toUTC(dateStr) {
  const s = String(dateStr).slice(0, 10)
  const [y, m, d] = s.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export function daysUntil(dateStr, ref = today()) {
  return Math.round((toUTC(dateStr) - toUTC(ref)) / MS_PER_DAY)
}

export function isOverdue(dateStr, ref = today()) {
  if (!dateStr) return false
  return daysUntil(dateStr, ref) < 0
}

export function formatCountdown(days) {
  if (days === 0) return "aujourd'hui"
  if (days === 1) return 'demain'
  if (days > 1) return `J-${days}`
  return `en retard de ${-days} j`
}

export function collectDeadlines({ tasks = [], reqTickets = [] }, ref = today()) {
  const items = []
  for (const t of tasks) {
    if (t.status === 'done' || !t.dueDate) continue
    items.push({ id: t.id, kind: 'task', title: t.title, due: String(t.dueDate).slice(0, 10) })
  }
  for (const t of reqTickets) {
    if (t.status === 'DONE' || !t.dueAt) continue
    items.push({ id: t.id, kind: 'ticket', title: t.summary || t.id, due: String(t.dueAt).slice(0, 10) })
  }
  for (const item of items) {
    item.days = daysUntil(item.due, ref)
    item.overdue = item.days < 0
    item.label = formatCountdown(item.days)
  }
  return items.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0))
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

Run: `npm test`
Expected: PASS (tous les tests deadlines).

- [ ] **Step 5 : Commit**

```bash
git add src/utils/deadlines.js src/utils/deadlines.test.js
git commit -m "feat: deadline aggregation utility (tasks + req tickets)"
```

---

### Task 4 : Parseur de capture rapide `quickParse.js` (TDD)

**Files:**
- Create: `src/utils/quickParse.js`
- Test: `src/utils/quickParse.test.js`

Interprète une phrase libre (tapée ou dictée) : cible (`task` par défaut, préfixes « ticket : » / « note : »), date en français naturel, heure optionnelle. Les fragments reconnus sont retirés du titre.

- [ ] **Step 1 : Écrire les tests qui échouent**

Créer `src/utils/quickParse.test.js` :

```js
import { describe, it, expect } from 'vitest'
import { parseQuickInput } from './quickParse'

const REF = '2026-06-11' // un jeudi

describe('parseQuickInput — cible', () => {
  it('defaults to task', () => {
    expect(parseQuickInput('payer le loyer', REF).target).toBe('task')
  })
  it('detects ticket prefix', () => {
    const r = parseQuickInput('ticket : relancer le fournisseur', REF)
    expect(r.target).toBe('ticket')
    expect(r.title).toBe('relancer le fournisseur')
  })
  it('detects note prefix case-insensitively', () => {
    const r = parseQuickInput('Note: idée pour le standup', REF)
    expect(r.target).toBe('note')
    expect(r.title).toBe('idée pour le standup')
  })
})

describe('parseQuickInput — dates', () => {
  it('parses demain', () => {
    const r = parseQuickInput('payer le loyer demain', REF)
    expect(r.dueDate).toBe('2026-06-12')
    expect(r.title).toBe('payer le loyer')
  })
  it('parses aujourd\'hui', () => {
    expect(parseQuickInput("appeler la banque aujourd'hui", REF).dueDate).toBe('2026-06-11')
  })
  it('parses après-demain before demain', () => {
    expect(parseQuickInput('rendez-vous après-demain', REF).dueDate).toBe('2026-06-13')
  })
  it('parses dans N jours', () => {
    const r = parseQuickInput('relancer dans 3 jours', REF)
    expect(r.dueDate).toBe('2026-06-14')
    expect(r.title).toBe('relancer')
  })
  it('parses next weekday occurrence (vendredi = tomorrow)', () => {
    expect(parseQuickInput('rendu vendredi', REF).dueDate).toBe('2026-06-12')
  })
  it('parses weekday equal to today as next week', () => {
    expect(parseQuickInput('réunion jeudi', REF).dueDate).toBe('2026-06-18')
  })
  it('parses lundi prochain', () => {
    const r = parseQuickInput('point lundi prochain', REF)
    expect(r.dueDate).toBe('2026-06-15')
    expect(r.title).toBe('point')
  })
  it('returns empty dueDate when no date', () => {
    const r = parseQuickInput('ranger le bureau', REF)
    expect(r.dueDate).toBe('')
    expect(r.title).toBe('ranger le bureau')
  })
})

describe('parseQuickInput — heure', () => {
  it('parses à 18h', () => {
    const r = parseQuickInput('réviser chapitre 4 demain à 18h', REF)
    expect(r.dueTime).toBe('18:00')
    expect(r.dueDate).toBe('2026-06-12')
    expect(r.title).toBe('réviser chapitre 4')
  })
  it('parses 9h30', () => {
    expect(parseQuickInput('standup à 9h30', REF).dueTime).toBe('09:30')
  })
  it('ignores numbers without h', () => {
    const r = parseQuickInput('lire 20 pages', REF)
    expect(r.dueTime).toBe('')
    expect(r.title).toBe('lire 20 pages')
  })
})
```

- [ ] **Step 2 : Vérifier que les tests échouent**

Run: `npm test`
Expected: FAIL — `quickParse.js` n'existe pas.

- [ ] **Step 3 : Implémenter `src/utils/quickParse.js`**

```js
import { today } from './date'

const DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

// NFD conserve la longueur après suppression des diacritiques combinants,
// ce qui permet de découper le texte original avec les indices du texte normalisé.
function normalize(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function toISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(refISO, n) {
  const d = new Date(`${refISO}T12:00:00`)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

function dayOfWeek(refISO) {
  return new Date(`${refISO}T12:00:00`).getDay()
}

function removeAt(text, index, length) {
  return (text.slice(0, index) + text.slice(index + length)).replace(/\s{2,}/g, ' ').trim()
}

const DATE_RULES = [
  { re: /\bapres[- ]demain\b/, resolve: () => 2 },
  { re: /\bdemain\b/, resolve: () => 1 },
  { re: /\baujourd'?hui\b/, resolve: () => 0 },
  { re: /\bdans\s+(\d+)\s+jours?\b/, resolve: (m) => Number(m[1]) },
  {
    re: /\b(dimanche|lundi|mardi|mercredi|jeudi|vendredi|samedi)(\s+prochain)?\b/,
    resolve: (m, refISO) => {
      const target = DAY_NAMES.indexOf(m[1])
      const delta = (target - dayOfWeek(refISO) + 7) % 7
      return delta === 0 ? 7 : delta
    },
  },
]

export function parseQuickInput(raw, refISO = today()) {
  let text = String(raw ?? '').trim()
  let target = 'task'

  const prefix = /^(ticket|note)\s*:\s*/i.exec(text)
  if (prefix) {
    target = prefix[1].toLowerCase()
    text = text.slice(prefix[0].length)
  }

  let dueDate = ''
  for (const rule of DATE_RULES) {
    const m = rule.re.exec(normalize(text))
    if (m) {
      dueDate = addDays(refISO, rule.resolve(m, refISO))
      text = removeAt(text, m.index, m[0].length)
      break
    }
  }

  let dueTime = ''
  const timeMatch = /(?:\ba\s+)?\b([01]?\d|2[0-3])\s*h\s*([0-5]\d)?(?=\s|$)/.exec(normalize(text))
  if (timeMatch) {
    dueTime = `${String(timeMatch[1]).padStart(2, '0')}:${timeMatch[2] ?? '00'}`
    text = removeAt(text, timeMatch.index, timeMatch[0].length)
  }

  return { target, title: text.trim(), dueDate, dueTime }
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

Run: `npm test`
Expected: PASS (tous les tests quickParse + deadlines).

- [ ] **Step 5 : Commit**

```bash
git add src/utils/quickParse.js src/utils/quickParse.test.js
git commit -m "feat: french natural-language parser for quick capture"
```

---

### Task 5 : Hook `useSpeech` (Web Speech API)

**Files:**
- Create: `src/hooks/useSpeech.js`

Pas de test automatisé (API navigateur) — vérification manuelle en Task 8.

- [ ] **Step 1 : Créer `src/hooks/useSpeech.js`**

```js
import { useState, useRef, useCallback, useEffect } from 'react'

const SpeechRecognitionImpl =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined

export const speechSupported = Boolean(SpeechRecognitionImpl)

export function useSpeech({ lang = 'fr-FR', onResult } = {}) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    if (!SpeechRecognitionImpl || recognitionRef.current) return
    const recognition = new SpeechRecognitionImpl()
    recognition.lang = lang
    recognition.interimResults = true
    recognition.continuous = false

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
      setListening(false)
      recognitionRef.current = null
    }
    recognition.onend = () => {
      setListening(false)
      setInterim('')
      recognitionRef.current = null
    }

    setError(null)
    setInterim('')
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }, [lang])

  useEffect(() => () => recognitionRef.current?.abort(), [])

  return { supported: speechSupported, listening, interim, error, start, stop }
}
```

- [ ] **Step 2 : Vérifier le build**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 3 : Commit**

```bash
git add src/hooks/useSpeech.js
git commit -m "feat: useSpeech hook (Web Speech API, fr-FR, graceful fallback)"
```

---

### Task 6 : Vues modules (extraction depuis OverviewView)

**Files:**
- Create: `src/components/modules/TicketsModule.jsx`
- Create: `src/components/modules/NotesModule.jsx`
- Create: `src/components/modules/AgendaModule.jsx`
- Create: `src/components/modules/CoursesModule.jsx`
- Create: `src/components/modules/RitualsModule.jsx`

Chaque module est un wrapper fin autour d'un composant existant, avec un en-tête uniforme (pastille couleur module + titre). Les composants enveloppés (`CockpitFocusColumn`, `NotesPanel`, `PersoAgenda`, `CoursesPanel`, `RitualsView`) ne sont **pas modifiés**. Ils ne seront câblés dans `App.jsx` qu'en Task 9 — le build doit néanmoins passer.

- [ ] **Step 1 : Créer le helper d'en-tête `src/components/modules/ModuleHeader.jsx`**

```jsx
export function ModuleHeader({ color, title, subtitle }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: `var(--mod-${color})` }}
        aria-hidden
      />
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      {subtitle && (
        <span className="text-xs" style={{ color: 'var(--muted)' }}>{subtitle}</span>
      )}
    </div>
  )
}
```

- [ ] **Step 2 : Créer `src/components/modules/TicketsModule.jsx`**

Reprend la colonne tickets + le formulaire de capture, aujourd'hui dans `OverviewView.jsx:115-156`, avec les mêmes props :

```jsx
import { useMemo } from 'react'
import { CockpitFocusColumn } from '../CockpitFocusColumn'
import { TicketCaptureForm } from '../TicketCaptureForm'
import { ModuleHeader } from './ModuleHeader'

export function TicketsModule({
  reqTickets = [],
  filters = {},
  onFiltersChange,
  onAddReqTicket,
  onUpdateReqTicket,
  onDeleteReqTicket,
}) {
  const proTickets = useMemo(() => reqTickets.filter((t) => t.scope === 'PRO'), [reqTickets])
  const existingOwners = useMemo(() => reqTickets.map((t) => t.owner).filter(Boolean), [reqTickets])
  const openCount = proTickets.filter((t) => t.status !== 'DONE').length

  return (
    <div className="space-y-4">
      <ModuleHeader color="tickets" title="Tickets" subtitle={`${openCount} ouvert${openCount > 1 ? 's' : ''}`} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <CockpitFocusColumn
          tickets={proTickets}
          filters={filters}
          onFiltersChange={onFiltersChange}
          onMarkDone={(id) => onUpdateReqTicket?.(id, { status: 'DONE' })}
          onSetWaiting={(id) => onUpdateReqTicket?.(id, { status: 'WAITING_REPLY' })}
          onAddFollowUp={(id) => onUpdateReqTicket?.(id, { lastFollowUpAt: Date.now() })}
          onSetDueDate={(id, dueAt) => onUpdateReqTicket?.(id, { dueAt })}
          onDelete={onDeleteReqTicket}
        />
        <section
          className="h-fit overflow-hidden rounded-[var(--radius-xl)]"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
          aria-label="Nouveau ticket"
        >
          <div className="px-4 pt-3 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.09em]" style={{ color: 'var(--muted)' }}>
              Nouveau ticket
            </p>
          </div>
          <div className="px-4 pb-4">
            <TicketCaptureForm
              onSubmit={(payload) => onAddReqTicket?.(payload)}
              scope="PRO"
              existingOwners={existingOwners}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 3 : Créer `src/components/modules/NotesModule.jsx`**

```jsx
import { NotesPanel } from '../NotesPanel'
import { ModuleHeader } from './ModuleHeader'

export function NotesModule({ meetingSheets = {}, onMeetingSheetChange, standupLog = '' }) {
  return (
    <div className="space-y-4">
      <ModuleHeader color="notes" title="Notes" />
      <NotesPanel
        meetingSheets={meetingSheets}
        onMeetingSheetChange={onMeetingSheetChange}
        standupLog={standupLog}
        compact={false}
      />
    </div>
  )
}
```

- [ ] **Step 4 : Créer `src/components/modules/AgendaModule.jsx`**

```jsx
import { PersoAgenda } from '../PersoAgenda'
import { ModuleHeader } from './ModuleHeader'

export function AgendaModule({ tasks = [], onToggleTask, onUpdateTask, onDeleteTask, onAddTaskForDate }) {
  return (
    <div className="space-y-4">
      <ModuleHeader color="agenda" title="Agenda" />
      <PersoAgenda
        tasks={tasks}
        onToggleTask={onToggleTask}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        onAddTaskForDate={onAddTaskForDate}
      />
    </div>
  )
}
```

- [ ] **Step 5 : Créer `src/components/modules/CoursesModule.jsx`**

```jsx
import { CoursesPanel } from '../CoursesPanel'
import { ModuleHeader } from './ModuleHeader'

export function CoursesModule({
  projects = [],
  tasks = [],
  onAddProject,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
}) {
  return (
    <div className="space-y-4">
      <ModuleHeader color="courses" title="Cours" />
      <CoursesPanel
        projects={projects}
        tasks={tasks}
        context="perso"
        onAddProject={onAddProject}
        onAddTask={onAddTask}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        onToggleTask={onToggleTask}
      />
    </div>
  )
}
```

- [ ] **Step 6 : Créer `src/components/modules/RitualsModule.jsx`**

`RitualsView` existe déjà (`src/components/RitualsView.jsx:4`, props `{ rituals, onAdd, onUpdate, onDelete }`) mais n'était plus câblée nulle part :

```jsx
import { RitualsView } from '../RitualsView'
import { ModuleHeader } from './ModuleHeader'

export function RitualsModule({ rituals = [], onAddRitual, onUpdateRitual, onDeleteRitual }) {
  return (
    <div className="space-y-4">
      <ModuleHeader color="rituals" title="Rituels" subtitle={`${rituals.length} rituel${rituals.length > 1 ? 's' : ''}`} />
      <RitualsView
        rituals={rituals}
        onAdd={onAddRitual}
        onUpdate={onUpdateRitual}
        onDelete={onDeleteRitual}
      />
    </div>
  )
}
```

- [ ] **Step 7 : Vérifier le build**

Run: `npm run build`
Expected: build OK (les modules ne sont pas encore importés, c'est normal).

- [ ] **Step 8 : Commit**

```bash
git add src/components/modules/
git commit -m "feat: dedicated module views (tickets, notes, agenda, courses, rituals)"
```

---

### Task 7 : Vue Cockpit

**Files:**
- Create: `src/components/CockpitView.jsx`

Page d'accueil : salutation, bloc « Maintenant » (tâches urgentes cochables), bloc « Échéances » (via `collectDeadlines`), tuiles modules cliquables.

- [ ] **Step 1 : Créer `src/components/CockpitView.jsx`**

```jsx
import { useMemo } from 'react'
import { collectDeadlines, isOverdue } from '../utils/deadlines'
import { today } from '../utils/date'

const TILES = [
  { view: 'rituals', color: 'rituals', label: 'Rituels' },
  { view: 'projects', color: 'projects', label: 'Projets' },
  { view: 'agenda', color: 'agenda', label: 'Agenda' },
  { view: 'notes', color: 'notes', label: 'Notes' },
  { view: 'courses', color: 'courses', label: 'Cours' },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 6) return 'Bonsoir'
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

function frenchDate() {
  const s = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function NowRow({ task, onToggle }) {
  const overdue = isOverdue(task.dueDate)
  return (
    <li
      className="flex items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2.5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
    >
      <button
        type="button"
        onClick={() => onToggle?.(task.id)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]"
        style={{ borderColor: overdue ? 'var(--overdue)' : 'var(--border-strong)' }}
        aria-label="Marquer comme fait"
      />
      <span className="min-w-0 flex-1 truncate text-sm" style={{ color: 'var(--text)' }}>
        {task.title}
      </span>
      {task.dueTime && (
        <span className="shrink-0 text-xs" style={{ color: 'var(--muted)' }}>{task.dueTime}</span>
      )}
      {overdue && (
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: 'var(--overdue-bg)', color: 'var(--overdue)' }}
        >
          en retard
        </span>
      )}
    </li>
  )
}

export function CockpitView({
  context,
  tasks = [],
  reqTickets = [],
  rituals = [],
  projects = [],
  todayPlan,
  onToggleTask,
  onNavigate,
}) {
  const todayStr = today()
  const contextTasks = useMemo(() => tasks.filter((t) => t.context === context), [tasks, context])

  const nowTasks = useMemo(() => {
    const focusIds = todayPlan?.focusTaskIds ?? []
    const isNow = (t) =>
      t.status !== 'done' &&
      (t.doToday || focusIds.includes(t.id) || (t.dueDate && String(t.dueDate).slice(0, 10) <= todayStr))
    const rank = (t) => {
      if (t.dueDate && String(t.dueDate).slice(0, 10) < todayStr) return 0
      if (t.doToday || focusIds.includes(t.id)) return 1
      return 2
    }
    return contextTasks
      .filter(isNow)
      .sort((a, b) => rank(a) - rank(b) || String(a.dueTime ?? '').localeCompare(String(b.dueTime ?? '')))
      .slice(0, 8)
  }, [contextTasks, todayPlan, todayStr])

  const deadlines = useMemo(
    () => collectDeadlines({ tasks: contextTasks, reqTickets }, todayStr).slice(0, 5),
    [contextTasks, reqTickets, todayStr]
  )

  const counts = useMemo(() => ({
    rituals: rituals.length,
    projects: projects.filter((p) => p.context === context && !p.parentProjectId).length,
    agenda: tasks.filter((t) => t.context === 'perso' && t.dueDate && t.status !== 'done').length,
    notes: null,
    courses: null,
  }), [rituals, projects, tasks, context])

  const doneToday = contextTasks.filter((t) => t.status === 'done').length

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}>
          {greeting()} 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          {frenchDate()} — {nowTasks.length} chose{nowTasks.length > 1 ? 's' : ''} à faire, {doneToday} faite{doneToday > 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* Maintenant */}
        <section aria-label="Maintenant">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.09em]" style={{ color: 'var(--muted)' }}>
            Maintenant
          </p>
          {nowTasks.length === 0 ? (
            <div
              className="rounded-[var(--radius-xl)] p-6 text-center text-sm"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
            >
              Rien d'urgent. Profitez-en ou planifiez la suite ✨
            </div>
          ) : (
            <ul className="space-y-2">
              {nowTasks.map((t) => (
                <NowRow key={t.id} task={t} onToggle={onToggleTask} />
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => onNavigate?.('tasks')}
            className="mt-2 text-xs font-medium transition-colors hover:text-[var(--accent)]"
            style={{ color: 'var(--muted)' }}
          >
            Toutes les tâches →
          </button>
        </section>

        {/* Échéances */}
        <section aria-label="Échéances">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.09em]" style={{ color: 'var(--muted)' }}>
            Échéances
          </p>
          <div
            className="overflow-hidden rounded-[var(--radius-xl)]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            {deadlines.length === 0 ? (
              <p className="p-4 text-sm" style={{ color: 'var(--muted)' }}>Aucune échéance à venir.</p>
            ) : (
              <ul>
                {deadlines.map((d) => (
                  <li key={`${d.kind}-${d.id}`}>
                    <button
                      type="button"
                      onClick={() => onNavigate?.(d.kind === 'ticket' ? 'tickets' : 'tasks')}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--surface-2)]"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: d.kind === 'ticket' ? 'var(--mod-tickets)' : 'var(--mod-tasks)' }}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 truncate" style={{ color: 'var(--text)' }}>{d.title}</span>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          background: d.overdue ? 'var(--overdue-bg)' : 'var(--surface-2)',
                          color: d.overdue ? 'var(--overdue)' : 'var(--muted)',
                        }}
                      >
                        {d.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Tuiles modules */}
      <section aria-label="Modules">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {TILES.map((tile) => (
            <button
              key={tile.view}
              type="button"
              onClick={() => onNavigate?.(tile.view)}
              className="rounded-[var(--radius-xl)] p-4 text-left transition-transform hover:-translate-y-0.5"
              style={{ background: `var(--mod-${tile.color}-bg)`, color: `var(--mod-${tile.color})` }}
            >
              <p className="text-sm font-semibold">{tile.label}</p>
              {counts[tile.view] != null && (
                <p className="mt-1 text-xs opacity-80">{counts[tile.view]}</p>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2 : Vérifier le build**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 3 : Commit**

```bash
git add src/components/CockpitView.jsx
git commit -m "feat: cockpit home view (now, deadlines, module tiles)"
```

---

### Task 8 : Composant QuickCapture (texte + voix)

**Files:**
- Create: `src/components/QuickCapture.jsx`

Modal de capture : champ texte, bouton micro (masqué si non supporté), aperçu de l'interprétation (cible + date + heure), validation. Utilise le composant `Modal` existant.

- [ ] **Step 1 : Créer `src/components/QuickCapture.jsx`**

```jsx
import { useState, useEffect, useRef } from 'react'
import { Modal } from './Modal'
import { useSpeech } from '../hooks/useSpeech'
import { parseQuickInput } from '../utils/quickParse'
import { formatCountdown, daysUntil } from '../utils/deadlines'

const TARGET_LABELS = { task: 'Tâche', ticket: 'Ticket', note: 'Note' }
const TARGET_COLORS = { task: 'tasks', ticket: 'tickets', note: 'notes' }

export function QuickCapture({ isOpen, onClose, onSubmit }) {
  const [text, setText] = useState('')
  const inputRef = useRef(null)
  const { supported, listening, interim, error, start, stop } = useSpeech({
    onResult: (transcript) => setText((prev) => (prev ? `${prev} ${transcript}` : transcript)),
  })

  useEffect(() => {
    if (isOpen) {
      setText('')
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
    stop()
  }, [isOpen, stop])

  const parsed = parseQuickInput(text)
  const canSubmit = parsed.title.length > 0

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!canSubmit) return
    onSubmit?.(parsed)
    setText('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Capture rapide">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={listening && interim ? `${text} ${interim}`.trim() : text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'Ex. « payer le loyer demain », « ticket : relancer X vendredi »'}
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
              aria-label={listening ? "Arrêter l'écoute" : 'Dicter'}
              title={listening ? "Arrêter l'écoute" : 'Dicter (fr)'}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs" style={{ color: 'var(--danger)' }}>
            Dictée indisponible ({error}). Vous pouvez taper votre texte.
          </p>
        )}

        {/* Aperçu de l'interprétation */}
        {canSubmit && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className="rounded-full px-2.5 py-1 font-semibold"
              style={{
                background: `var(--mod-${TARGET_COLORS[parsed.target]}-bg)`,
                color: `var(--mod-${TARGET_COLORS[parsed.target]})`,
              }}
            >
              {TARGET_LABELS[parsed.target]}
            </span>
            <span className="font-medium" style={{ color: 'var(--text)' }}>{parsed.title}</span>
            {parsed.dueDate && (
              <span className="rounded-full px-2.5 py-1" style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                📅 {formatCountdown(daysUntil(parsed.dueDate))}
              </span>
            )}
            {parsed.dueTime && (
              <span className="rounded-full px-2.5 py-1" style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                🕐 {parsed.dueTime}
              </span>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-lg)] border px-4 py-2.5 text-sm font-medium transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            Annuler
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

- [ ] **Step 2 : Vérifier le build**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 3 : Commit**

```bash
git add src/components/QuickCapture.jsx
git commit -m "feat: quick capture modal with voice dictation and parse preview"
```

---

### Task 9 : Nouvelle navigation + câblage complet d'App.jsx

**Files:**
- Modify: `src/constants.js:55-60` (remplacer `VIEWS`)
- Modify: `src/components/Sidebar.jsx` (réécriture)
- Modify: `src/components/BottomNav.jsx` (réécriture, + sheet « Plus » + FAB)
- Modify: `src/hooks/useKeyboardShortcuts.js` (raccourci `n`)
- Modify: `src/components/Header.jsx` (boutons capture, retrait silence)
- Modify: `src/App.jsx` (réécriture du rendu des vues)

- [ ] **Step 1 : Remplacer `VIEWS` par `MODULES` dans `src/constants.js`**

Remplacer le bloc `export const VIEWS = [...]` (lignes 55-60) par :

```js
export const MODULES = [
  { id: 'cockpit', label: 'Cockpit', color: 'cockpit', primary: true },
  { id: 'tasks', label: 'Tâches', color: 'tasks', primary: true },
  { id: 'projects', label: 'Projets', color: 'projects', primary: true },
  { id: 'tickets', label: 'Tickets', color: 'tickets' },
  { id: 'rituals', label: 'Rituels', color: 'rituals' },
  { id: 'notes', label: 'Notes', color: 'notes' },
  { id: 'agenda', label: 'Agenda', color: 'agenda' },
  { id: 'courses', label: 'Cours', color: 'courses' },
]
```

- [ ] **Step 2 : Réécrire `src/components/Sidebar.jsx`**

```jsx
import { MODULES, CONTEXTS } from '../constants'

function NavButton({ color, label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`sidebar-item w-full border-none text-left${isActive ? ' active' : ''}`}
      title={label}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center">
        <span
          className="h-2.5 w-2.5 rounded-full transition-transform"
          style={{ background: `var(--mod-${color})`, transform: isActive ? 'scale(1.25)' : 'scale(1)' }}
          aria-hidden
        />
      </span>
      <span className="truncate" style={{ letterSpacing: '-0.01em' }}>{label}</span>
    </button>
  )
}

export function Sidebar({ view, onViewChange, context, onContextChange }) {
  const primary = MODULES.filter((m) => m.primary)
  const secondary = MODULES.filter((m) => !m.primary)

  return (
    <aside
      className="hidden w-[220px] shrink-0 flex-col md:flex"
      style={{ background: 'var(--sidebar-gradient)', borderRight: '1px solid var(--sidebar-border)' }}
      aria-label="Navigation"
    >
      <div className="flex items-center px-4 pt-5 pb-4" style={{ minHeight: '60px' }}>
        <span className="gradient-text text-xl font-bold" style={{ letterSpacing: '-0.03em' }}>TARS</span>
      </div>

      <div className="px-2 pb-3">
        <div
          className="flex rounded-[var(--radius-md)] p-0.5"
          style={{ background: 'var(--surface-2)' }}
          role="group"
          aria-label="Contexte"
        >
          {CONTEXTS.map((ctx) => (
            <button
              key={ctx.value}
              type="button"
              onClick={() => onContextChange?.(ctx.value)}
              className="flex-1 rounded-[var(--radius-sm)] py-1.5 text-[12px] font-semibold transition-all"
              style={{
                background: context === ctx.value ? 'var(--surface-elevated)' : 'transparent',
                color: context === ctx.value ? 'var(--accent)' : 'var(--muted)',
                boxShadow: context === ctx.value ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {ctx.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--sidebar-border)', marginBottom: '8px' }} />

      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-2">
        {primary.map((m) => (
          <NavButton key={m.id} color={m.color} label={m.label} isActive={view === m.id} onClick={() => onViewChange(m.id)} />
        ))}

        <div className="my-3 flex items-center gap-2 px-1">
          <div style={{ height: '1px', flex: 1, background: 'var(--sidebar-border)' }} />
          <span className="section-header px-1" style={{ fontSize: '9px', letterSpacing: '0.1em' }}>Modules</span>
          <div style={{ height: '1px', flex: 1, background: 'var(--sidebar-border)' }} />
        </div>

        {secondary.map((m) => (
          <NavButton key={m.id} color={m.color} label={m.label} isActive={view === m.id} onClick={() => onViewChange(m.id)} />
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 3 : Réécrire `src/components/BottomNav.jsx`** (mobile : Cockpit / Tâches / Projets / Plus + FAB central capture)

```jsx
import { useState } from 'react'
import { MODULES } from '../constants'

const PRIMARY_IDS = ['cockpit', 'tasks', 'projects']

function NavItem({ module: m, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex min-h-[56px] min-w-[56px] flex-1 touch-manipulation flex-col items-center justify-center gap-1 px-2 py-2"
      style={{ background: 'transparent', border: 'none' }}
      aria-current={isActive ? 'page' : undefined}
      aria-label={m.label}
    >
      <span
        className="h-2.5 w-2.5 rounded-full transition-transform"
        style={{ background: `var(--mod-${m.color})`, transform: isActive ? 'scale(1.3)' : 'scale(1)', opacity: isActive ? 1 : 0.45 }}
        aria-hidden
      />
      <span className="text-[10px] font-medium" style={{ color: isActive ? 'var(--text)' : 'var(--muted)' }}>
        {m.label}
      </span>
    </button>
  )
}

export function BottomNav({ view, onViewChange, onOpenQuickCapture }) {
  const [showMore, setShowMore] = useState(false)
  const primary = MODULES.filter((m) => PRIMARY_IDS.includes(m.id))
  const secondary = MODULES.filter((m) => !PRIMARY_IDS.includes(m.id))
  const moreActive = secondary.some((m) => m.id === view)

  const navigate = (id) => {
    setShowMore(false)
    onViewChange(id)
  }

  return (
    <>
      {showMore && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 panel-backdrop-in" style={{ background: 'rgba(28, 25, 23, 0.35)' }} />
          <div
            className="absolute bottom-[64px] left-3 right-3 rounded-[var(--radius-xl)] p-3 fade-in"
            style={{ background: 'var(--popover-bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-2">
              {secondary.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => navigate(m.id)}
                  className="flex items-center gap-2.5 rounded-[var(--radius-lg)] px-3 py-3 text-sm font-medium"
                  style={{
                    background: view === m.id ? `var(--mod-${m.color}-bg)` : 'var(--surface-2)',
                    color: view === m.id ? `var(--mod-${m.color})` : 'var(--text-secondary)',
                  }}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: `var(--mod-${m.color})` }} aria-hidden />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav
        className="safe-area-inset-bottom fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around md:hidden"
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid var(--border)',
        }}
        aria-label="Navigation"
      >
        <NavItem module={primary[0]} isActive={view === primary[0].id} onClick={() => navigate(primary[0].id)} />
        <NavItem module={primary[1]} isActive={view === primary[1].id} onClick={() => navigate(primary[1].id)} />

        {/* FAB capture rapide */}
        <button
          type="button"
          onClick={onOpenQuickCapture}
          className="-mt-5 flex h-14 w-14 shrink-0 touch-manipulation items-center justify-center rounded-full text-white"
          style={{ background: 'var(--accent-gradient)', boxShadow: 'var(--accent-glow)' }}
          aria-label="Capture rapide (texte ou voix)"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <NavItem module={primary[2]} isActive={view === primary[2].id} onClick={() => navigate(primary[2].id)} />

        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="relative flex min-h-[56px] min-w-[56px] flex-1 touch-manipulation flex-col items-center justify-center gap-1 px-2 py-2"
          style={{ background: 'transparent', border: 'none' }}
          aria-label="Plus de modules"
          aria-expanded={showMore}
        >
          <span className="flex gap-0.5" aria-hidden>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--muted)' }} />
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--muted)' }} />
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--muted)' }} />
          </span>
          <span className="text-[10px] font-medium" style={{ color: moreActive ? 'var(--text)' : 'var(--muted)' }}>
            Plus
          </span>
        </button>
      </nav>
    </>
  )
}
```

- [ ] **Step 4 : Ajouter le raccourci `n` dans `src/hooks/useKeyboardShortcuts.js`**

Ajouter le paramètre `onQuickCapture` à la signature (`useKeyboardShortcuts.js:15-21`) :

```js
export function useKeyboardShortcuts({
  onNewTask,
  onFocusSearch,
  onGoOverview,
  onQuickCapture,
  onEscape,
  enabled = true,
}) {
```

Dans `handleKeyDown`, après le bloc `if ((e.key === 'k' || ...)` (ligne 44), ajouter :

```js
      if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey && !inInput) {
        e.preventDefault()
        onQuickCapture?.()
        return
      }
```

Et ajouter `onQuickCapture` au tableau de dépendances du `useCallback` (ligne 61).

- [ ] **Step 5 : Modifier `src/components/Header.jsx`**

1. Retirer les props `isSilentMode` / `onToggleSilentMode` et le bouton « Silence » (`Header.jsx:135-148`).
2. Ajouter les props `onOpenQuickCapture` et remplacer le tableau `SHORTCUTS` (lignes 4-8) par :

```js
const SHORTCUTS = [
  { keys: 'N', label: 'Capture rapide' },
  { keys: 'Ctrl+K', label: 'Nouvelle tâche' },
  { keys: '/', label: 'Rechercher' },
  { keys: 'O', label: 'Cockpit' },
]
```

3. Juste avant le bouton dark mode (ligne 115), insérer le bouton capture (micro + plus) :

```jsx
            {/* Capture rapide */}
            <button
              type="button"
              onClick={onOpenQuickCapture}
              className="flex min-h-[36px] touch-manipulation items-center gap-1.5 rounded-[var(--radius-full)] px-3 py-1.5 text-xs font-semibold text-white transition-all"
              style={{ background: 'var(--accent-gradient)', boxShadow: 'var(--accent-glow)' }}
              aria-label="Capture rapide (N)"
              title="Capture rapide — texte ou voix (N)"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
              Capturer
            </button>
```

- [ ] **Step 6 : Réécrire le câblage des vues dans `src/App.jsx`**

Modifications (en conservant la structure générale et le bloc « board toolbar » existant) :

1. **Imports** : retirer `Header` inchangé ; retirer les imports `TodayQuickPanel`, `OverviewView`, `TodayView` ; ajouter :

```js
import { CockpitView } from './components/CockpitView'
import { QuickCapture } from './components/QuickCapture'
import { TicketsModule } from './components/modules/TicketsModule'
import { NotesModule } from './components/modules/NotesModule'
import { AgendaModule } from './components/modules/AgendaModule'
import { CoursesModule } from './components/modules/CoursesModule'
import { RitualsModule } from './components/modules/RitualsModule'
import { today } from './utils/date'
```

2. **State** : `const [view, setView] = useState('cockpit')` ; supprimer `isSilentMode`, `showTodayPanel` et leurs usages ; ajouter `const [showQuickCapture, setShowQuickCapture] = useState(false)`.

3. **useStore** : ajouter à la destructuration : `addRitual, updateRitual, deleteRitual, rituals` n'existe pas — les rituels sont dans `state.rituals` ; destructurer en plus : `addRitual, updateRitual, deleteRitual`.

4. **useTaskFilters** : remplacer `view === 'board'` par `view === 'tasks'` dans le paramètre `boardFilters`.

5. **Raccourcis** : passer `onQuickCapture: () => setShowQuickCapture(true)` à `useKeyboardShortcuts` et remplacer `handleGoOverview` par `() => setView('cockpit')`.

6. **Soumission QuickCapture** — ajouter ce handler :

```js
  const handleQuickCapture = useCallback((parsed) => {
    if (parsed.target === 'ticket') {
      addReqTicket({ summary: parsed.title, dueAt: parsed.dueDate || null })
      setToastMessage('Ticket créé')
    } else if (parsed.target === 'note') {
      setStandupLog(`${state.standupLog ? state.standupLog + '\n' : ''}• ${parsed.title}`)
      setToastMessage('Note ajoutée')
    } else {
      addTask({
        title: parsed.title,
        context,
        dueDate: parsed.dueDate || '',
        dueTime: parsed.dueTime || '',
        doToday: parsed.dueDate === today(),
        projectId: null,
      })
      setToastMessage('Tâche créée')
    }
    setShowQuickCapture(false)
  }, [addReqTicket, setStandupLog, addTask, context, state.standupLog])
```

(`dueTime` est un champ additif : `createInitialTask` le conserve via le spread `...overrides`, le reducer et la sync le propagent sans modification.)

7. **Aurora** : supprimer le bloc `<div className="aurora-bg">…</div>` (App.jsx:172-177) — le fond crème le remplace.

8. **Rendu des vues** dans `<main>` (le `div.view-transition` reste) :

```jsx
        {view === 'cockpit' && (
          <CockpitView
            context={context}
            tasks={state.tasks}
            reqTickets={state.reqTickets ?? []}
            rituals={state.rituals ?? []}
            projects={state.projects}
            todayPlan={todayPlan}
            onToggleTask={toggleTaskStatus}
            onNavigate={setView}
          />
        )}

        {view === 'tasks' && (
          <>
            {/* … bloc board toolbar + KanbanBoard existant (App.jsx:229-342 actuel), inchangé,
                 en remplaçant uniquement la condition `view === 'board'` par `view === 'tasks'` … */}
          </>
        )}

        {view === 'projects' && (
          /* … bloc ProjectsView existant (App.jsx:365-383), inchangé … */
        )}

        {view === 'tickets' && (
          <TicketsModule
            reqTickets={state.reqTickets ?? []}
            filters={ticketFilters}
            onFiltersChange={setTicketFilters}
            onAddReqTicket={addReqTicket}
            onUpdateReqTicket={updateReqTicket}
            onDeleteReqTicket={deleteReqTicket}
          />
        )}

        {view === 'rituals' && (
          <RitualsModule
            rituals={state.rituals ?? []}
            onAddRitual={addRitual}
            onUpdateRitual={updateRitual}
            onDeleteRitual={deleteRitual}
          />
        )}

        {view === 'notes' && (
          <NotesModule
            meetingSheets={state.meetingSheets ?? {}}
            onMeetingSheetChange={setMeetingSheet}
            standupLog={state.standupLog ?? ''}
          />
        )}

        {view === 'agenda' && (
          <AgendaModule
            tasks={state.tasks.filter((t) => t.context === 'perso')}
            onToggleTask={toggleTaskStatus}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onAddTaskForDate={handleOpenComposerForDate}
          />
        )}

        {view === 'courses' && (
          <CoursesModule
            projects={state.projects}
            tasks={state.tasks}
            onAddProject={addProject}
            onAddTask={(p) => addTask({ ...p, context: 'perso' })}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onToggleTask={toggleTaskStatus}
          />
        )}
```

9. **Largeur du main** : remplacer la condition de classe par :

```jsx
      <main className={`flex-1 overflow-auto px-3 py-4 sm:px-6 sm:py-6 lg:mx-auto ${['tasks', 'tickets'].includes(view) ? 'lg:max-w-7xl' : view === 'cockpit' ? 'lg:max-w-6xl' : 'lg:max-w-4xl'}`}>
```

10. **TaskPanel** : remplacer la condition `(view === 'board' || view === 'today')` par `(view === 'tasks' || view === 'cockpit')`.

11. **Composants de fin** : supprimer `<TodayQuickPanel …/>` ; ajouter avant `<Toast …/>` :

```jsx
      <QuickCapture
        isOpen={showQuickCapture}
        onClose={() => setShowQuickCapture(false)}
        onSubmit={handleQuickCapture}
      />
```

12. **BottomNav / Header / Sidebar** : passer les nouvelles props :

```jsx
      <BottomNav view={view} onViewChange={setView} onOpenQuickCapture={() => setShowQuickCapture(true)} />
```

`Header` : retirer `isSilentMode`/`onToggleSilentMode`, ajouter `onOpenQuickCapture={() => setShowQuickCapture(true)}`. `Sidebar` : retirer la prop `onOpenTodayPanel`.

- [ ] **Step 7 : Vérifier build + lint + tests**

Run: `npm run build` puis `npm run lint` puis `npm test`
Expected: tout passe. Corriger les imports/variables inutilisés signalés par ESLint (ex. `TodayView`, `useRef` si devenu inutile).

- [ ] **Step 8 : Vérification manuelle (dev server)**

Run: `npm run dev`
Vérifier : cockpit par défaut, navigation sidebar (8 modules), bottom nav mobile (responsive ≤768px) avec sheet « Plus » et FAB, capture rapide via bouton Header / touche `n` / FAB, dictée sur Chrome (autoriser le micro), création de tâche avec « demain » → date correcte, ticket via « ticket : … », données existantes intactes.

- [ ] **Step 9 : Commit**

```bash
git add src/constants.js src/components/Sidebar.jsx src/components/BottomNav.jsx src/components/Header.jsx src/hooks/useKeyboardShortcuts.js src/App.jsx
git commit -m "feat: module navigation, cockpit home, quick capture wiring"
```

---

### Task 10 : Nettoyage du code mort + vérification finale

**Files:**
- Delete: `src/components/OverviewView.jsx`, `src/components/TodayView.jsx`, `src/components/TodayPanel.jsx`, `src/components/TodayQuickPanel.jsx`, `src/components/CoursesView.jsx`, `src/components/TicketsView.jsx`, `src/components/TicketsPanel.jsx`, `src/components/TicketList.jsx`, `src/components/DailyStandup.jsx`, `src/components/RitualBanner.jsx`, `src/components/ReflectionPrompt.jsx`

- [ ] **Step 1 : Vérifier qu'aucun fichier à supprimer n'est encore importé**

Run (Grep ou) :

```bash
grep -rn "OverviewView\|TodayView\|TodayPanel\|TodayQuickPanel\|CoursesView\|TicketsView\|TicketsPanel\|TicketList\|DailyStandup\|RitualBanner\|ReflectionPrompt" src/ --include="*.jsx" --include="*.js"
```

Expected: seules les définitions dans les fichiers eux-mêmes apparaissent (aucun import depuis un fichier conservé). **Si un import subsiste, ne pas supprimer le fichier concerné** — le signaler et le garder.

- [ ] **Step 2 : Supprimer les fichiers morts confirmés**

```bash
git rm src/components/OverviewView.jsx src/components/TodayView.jsx src/components/TodayPanel.jsx src/components/TodayQuickPanel.jsx src/components/CoursesView.jsx src/components/TicketsView.jsx src/components/TicketsPanel.jsx src/components/TicketList.jsx src/components/DailyStandup.jsx src/components/RitualBanner.jsx src/components/ReflectionPrompt.jsx
```

- [ ] **Step 3 : Supprimer les styles aurora devenus inutiles**

Dans `src/index.css`, supprimer les sections `AURORA BACKGROUND BLOBS` (lignes 10-86 actuelles : keyframes `aurora-*`, `.aurora-bg`, `.aurora-blob*` et leurs variantes light/dark).

- [ ] **Step 4 : Build + lint + tests finaux**

Run: `npm run build` puis `npm run lint` puis `npm test`
Expected: tout passe, zéro warning d'import manquant.

- [ ] **Step 5 : Tour de vérification complet**

`npm run dev` — re-parcourir chaque vue (cockpit, tâches, projets, tickets, rituels, notes, agenda, cours) en desktop et mobile, vérifier le mode sombre (toggle Header), vérifier que les tâches/tickets/notes existants sont toujours là.

- [ ] **Step 6 : Commit final**

```bash
git add -A
git commit -m "refactor: remove dead views and aurora background"
```

---

## Couverture spec → tâches

| Exigence spec | Tâche |
|---|---|
| Style clair chaleureux + tokens | Task 2 |
| Mode sombre conservé | Task 2 (bloc `.dark` étendu) |
| Échéances agrégées + retards | Task 3 + Task 7 |
| Capture vocale Web Speech fr-FR + fallback | Task 5 + Task 8 |
| Parseur dates françaises | Task 4 |
| AppShell sidebar / bottom nav / FAB | Task 9 |
| Cockpit (Maintenant / Échéances / tuiles) | Task 7 + Task 9 |
| Modules dédiés à iso-fonctionnalité | Task 6 + Task 9 |
| Fusion des panneaux « today » | Task 7 (remplacés) + Task 10 (supprimés) |
| Store/sync intacts, additif uniquement | Tasks 3, 4, 9 (champ `dueTime` additif) |
| App buildable à chaque étape | chaque tâche se termine par `npm run build` |
