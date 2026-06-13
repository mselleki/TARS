# Assistant vocal LLM — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le parseur vocal déterministe par un assistant Claude Haiku (tool use) côté serveur : l'app envoie la transcription + un instantané de l'état, reçoit des actions à appliquer + une phrase à lire.

**Architecture:** Nouvelle route serverless `api/assistant.js` (SDK Anthropic, `claude-haiku-4-5`, tool use, limite de débit Upstash) avec une fonction pure `buildResponse` testée. Côté front : `buildSnapshot` (pur, testé), `useVoiceSession` appelle la route au lieu du parseur local, `App` applique les actions. Le parseur déterministe (`voiceCommands`, `taskMatch`, `text`) est supprimé. Reconnaissance/voix navigateur inchangées.

**Tech Stack:** React 19, Vite, Vitest, `@anthropic-ai/sdk`, `@upstash/redis` (déjà présent), Web Speech / SpeechSynthesis.

**Spec:** `docs/superpowers/specs/2026-06-13-assistant-vocal-llm-design.md`

**Conventions :** un commit par tâche, messages sans attribution IA. Formateur après écriture (attendu). `npm run build` + `npm test` verts avant chaque commit. Le store/sync ne change pas de structure. La clé `ANTHROPIC_API_KEY` est à configurer par l'utilisateur sur Vercel — non requise pour build/tests.

---

### Task 1 : Dépendance + variable d'env

**Files:**
- Modify: `package.json`
- Modify: `.env.example`

- [ ] **Step 1 : Installer le SDK Anthropic**

Run: `npm install @anthropic-ai/sdk`

- [ ] **Step 2 : Documenter la clé dans `.env.example`**

Ajouter à la fin de `.env.example` :

```
# Required for the voice assistant (api/assistant.js). Set in Vercel → Settings → Environment Variables.
#   ANTHROPIC_API_KEY
```

- [ ] **Step 3 : Build + tests** — Run: `npm run build` puis `npm test` — Expected: OK (rien d'autre n'a changé).

- [ ] **Step 4 : Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: add Anthropic SDK dependency for voice assistant"
```

---

### Task 2 : Route `api/assistant.js` + `buildResponse` (TDD sur la partie pure)

**Files:**
- Create: `api/assistant.js`
- Test: `api/assistant.test.js`

La logique réseau (Anthropic, Upstash) n'est pas testée ; seule `buildResponse` (normalisation des *tool calls* → `{ actions, speech }`, filtrage des `taskId` hallucinés) l'est.

- [ ] **Step 1 : Écrire les tests `api/assistant.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { buildResponse } from './assistant.js'

const snapshot = { tasks: [{ id: 'a', title: 'Payer le loyer' }, { id: 'b', title: 'Réviser' }], reqTickets: [], view: 'cockpit', today: '2026-06-13' }

describe('buildResponse', () => {
  it('maps a navigate tool call to an action', () => {
    const content = [{ type: 'tool_use', name: 'navigate', input: { view: 'tickets' } }]
    expect(buildResponse(content, snapshot)).toEqual({ actions: [{ type: 'navigate', view: 'tickets' }], speech: '' })
  })

  it('maps create_item with optional fields defaulted', () => {
    const content = [{ type: 'tool_use', name: 'create_item', input: { target: 'task', title: 'Appeler la banque' } }]
    const r = buildResponse(content, snapshot)
    expect(r.actions).toEqual([{ type: 'create_item', target: 'task', title: 'Appeler la banque', dueDate: '', dueTime: '' }])
  })

  it('keeps complete_task only for ids present in the snapshot', () => {
    const content = [
      { type: 'tool_use', name: 'complete_task', input: { taskId: 'a' } },
      { type: 'tool_use', name: 'complete_task', input: { taskId: 'ghost' } },
    ]
    expect(buildResponse(content, snapshot).actions).toEqual([{ type: 'complete_task', taskId: 'a' }])
  })

  it('keeps snooze_task only for known ids', () => {
    const content = [{ type: 'tool_use', name: 'snooze_task', input: { taskId: 'b', dueDate: '2026-06-14' } }]
    expect(buildResponse(content, snapshot).actions).toEqual([{ type: 'snooze_task', taskId: 'b', dueDate: '2026-06-14' }])
  })

  it('uses the answer tool text as speech when there is no free text', () => {
    const content = [{ type: 'tool_use', name: 'answer', input: { text: 'Tu as 2 choses aujourd\'hui.' } }]
    expect(buildResponse(content, snapshot)).toEqual({ actions: [], speech: 'Tu as 2 choses aujourd\'hui.' })
  })

  it('prefers free text over answer for speech, and collects multiple actions', () => {
    const content = [
      { type: 'text', text: 'C\'est fait. ' },
      { type: 'tool_use', name: 'complete_task', input: { taskId: 'a' } },
      { type: 'tool_use', name: 'navigate', input: { view: 'tasks' } },
    ]
    const r = buildResponse(content, snapshot)
    expect(r.speech).toBe('C\'est fait.')
    expect(r.actions).toEqual([{ type: 'complete_task', taskId: 'a' }, { type: 'navigate', view: 'tasks' }])
  })

  it('returns empty result for empty content', () => {
    expect(buildResponse([], snapshot)).toEqual({ actions: [], speech: '' })
  })
})
```

- [ ] **Step 2 : Vérifier l'échec** — Run: `npm test` — Expected: FAIL (`api/assistant.js` absent).

- [ ] **Step 3 : Implémenter `api/assistant.js`**

```js
import Anthropic from '@anthropic-ai/sdk'
import { Redis } from '@upstash/redis'

const MODEL = 'claude-haiku-4-5'
const MAX_TOKENS = 1024
const MAX_TRANSCRIPT = 500
const RATE_LIMIT = 30
const RATE_WINDOW_S = 300

const TOOLS = [
  {
    name: 'create_item',
    description: "Créer une tâche, un ticket ou une note. Pour « ajoute », « rappelle-moi », « crée un ticket », « note … ».",
    input_schema: {
      type: 'object',
      properties: {
        target: { type: 'string', enum: ['task', 'ticket', 'note'], description: "Type d'élément." },
        title: { type: 'string', description: "Intitulé de l'élément." },
        dueDate: { type: 'string', description: 'Échéance au format YYYY-MM-DD, ou chaîne vide.' },
        dueTime: { type: 'string', description: 'Heure au format HH:MM, ou chaîne vide.' },
      },
      required: ['target', 'title'],
    },
  },
  {
    name: 'complete_task',
    description: "Marquer une tâche comme terminée. Le taskId doit provenir de la liste fournie.",
    input_schema: { type: 'object', properties: { taskId: { type: 'string' } }, required: ['taskId'] },
  },
  {
    name: 'snooze_task',
    description: "Reporter l'échéance d'une tâche. taskId de la liste fournie ; dueDate au format YYYY-MM-DD.",
    input_schema: { type: 'object', properties: { taskId: { type: 'string' }, dueDate: { type: 'string' } }, required: ['taskId', 'dueDate'] },
  },
  {
    name: 'navigate',
    description: "Aller à une vue de l'application.",
    input_schema: {
      type: 'object',
      properties: { view: { type: 'string', enum: ['cockpit', 'tasks', 'projects', 'tickets', 'rituals', 'notes', 'agenda', 'courses'] } },
      required: ['view'],
    },
  },
  {
    name: 'answer',
    description: "Répondre vocalement à une question ou demander une précision, sans agir. Mettre la phrase parlée dans text.",
    input_schema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
  },
]

export function buildResponse(content, snapshot) {
  const validIds = new Set((snapshot?.tasks ?? []).map((t) => t.id))
  const actions = []
  let text = ''
  let answer = ''
  for (const block of content ?? []) {
    if (block.type === 'text') {
      text += block.text ?? ''
    } else if (block.type === 'tool_use') {
      const input = block.input ?? {}
      switch (block.name) {
        case 'answer':
          answer = input.text ?? ''
          break
        case 'navigate':
          actions.push({ type: 'navigate', view: input.view })
          break
        case 'create_item':
          actions.push({ type: 'create_item', target: input.target, title: input.title, dueDate: input.dueDate ?? '', dueTime: input.dueTime ?? '' })
          break
        case 'complete_task':
          if (validIds.has(input.taskId)) actions.push({ type: 'complete_task', taskId: input.taskId })
          break
        case 'snooze_task':
          if (validIds.has(input.taskId)) actions.push({ type: 'snooze_task', taskId: input.taskId, dueDate: input.dueDate })
          break
        default:
          break
      }
    }
  }
  return { actions, speech: (text.trim() || answer).trim() }
}

function buildSystem(snapshot) {
  const tasks = (snapshot?.tasks ?? [])
    .map((t) => `- ${t.id} | ${t.title}${t.dueDate ? ` (échéance ${t.dueDate})` : ''}${t.status === 'done' ? ' [fait]' : ''}`)
    .join('\n') || '(aucune)'
  const tickets = (snapshot?.reqTickets ?? [])
    .map((t) => `- ${t.id} | ${t.summary}${t.dueAt ? ` (échéance ${t.dueAt})` : ''}`)
    .join('\n') || '(aucun)'
  return [
    "Tu es l'assistant vocal de TARS, une application d'organisation personnelle. L'utilisateur te parle en français ; transforme sa phrase en actions via les outils.",
    'Règles :',
    "- Utilise les outils pour agir ; tu peux en appeler plusieurs si la phrase contient plusieurs demandes.",
    "- Pour terminer ou reporter une tâche, choisis le taskId dans la liste fournie d'après le titre. Si plusieurs tâches correspondent sans pouvoir trancher, utilise l'outil answer pour demander laquelle.",
    "- Pour une question (« qu'est-ce que j'ai aujourd'hui », « combien en retard »), réponds via l'outil answer en une phrase courte et naturelle, à partir des données fournies.",
    "- Après avoir agi, tu peux ajouter une courte phrase de confirmation en texte (« C'est fait », « Tâche créée »). Reste bref.",
    `- Les dates sont au format YYYY-MM-DD. Aujourd'hui c'est ${snapshot?.today ?? ''}. Calcule toi-même les dates relatives (demain, vendredi…).`,
    `Contexte courant : vue « ${snapshot?.view ?? ''} », contexte « ${snapshot?.context ?? ''} ».`,
    `Tâches actives :\n${tasks}`,
    `Tickets ouverts :\n${tickets}`,
  ].join('\n')
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function redis() {
  const url = process.env.tars_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.tars_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

async function overRateLimit(ip) {
  const client = redis()
  if (!client) return false
  const key = `tars:assistant:rl:${ip}`
  const count = await client.incr(key)
  if (count === 1) await client.expire(key, RATE_WINDOW_S)
  return count > RATE_LIMIT
}

export default {
  async fetch(request) {
    const headers = { 'Content-Type': 'application/json', ...corsHeaders() }
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders() })
    if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })

    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }), { status: 500, headers })
      }
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
      if (await overRateLimit(ip)) {
        return new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429, headers })
      }

      const body = await request.json()
      const transcript = String(body?.transcript ?? '').slice(0, MAX_TRANSCRIPT).trim()
      const snapshot = { ...(body?.snapshot ?? {}), context: body?.context }
      if (!transcript) return new Response(JSON.stringify({ actions: [], speech: '' }), { status: 200, headers })

      const client = new Anthropic()
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: buildSystem(snapshot),
        tools: TOOLS,
        messages: [{ role: 'user', content: transcript }],
      })

      const result = buildResponse(message.content, snapshot)
      return new Response(JSON.stringify(result), { status: 200, headers })
    } catch (e) {
      const msg = e?.message ?? String(e)
      return new Response(JSON.stringify({ error: msg }), { status: 500, headers })
    }
  },
}
```

- [ ] **Step 4 : Vérifier que les tests passent** — Run: `npm test` — Expected: PASS (les tests `buildResponse`). Note : importer `api/assistant.js` n'instancie ni Anthropic ni Redis (faits dans le handler), donc le test n'a pas besoin de clé.

- [ ] **Step 5 : Build** — Run: `npm run build` — Expected: OK (la route n'est pas bundlée par Vite ; vérifier qu'aucune erreur n'apparaît).

- [ ] **Step 6 : Commit**

```bash
git add api/assistant.js api/assistant.test.js
git commit -m "feat: LLM voice assistant serverless route (Haiku tool use)"
```

---

### Task 3 : `buildSnapshot` + `getAssistantUrl` (front pur)

**Files:**
- Create: `src/utils/assistant.js`
- Test: `src/utils/assistant.test.js`
- Modify: `src/utils/remoteSync.js`

- [ ] **Step 1 : Écrire les tests `src/utils/assistant.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { buildSnapshot } from './assistant'

const state = {
  tasks: [
    { id: 'a', title: 'Payer le loyer', context: 'pro', status: 'backlog', dueDate: '2026-06-14', doToday: true },
    { id: 'b', title: 'Tâche finie', context: 'pro', status: 'done', dueDate: '' },
    { id: 'c', title: 'Perso', context: 'perso', status: 'backlog' },
  ],
  reqTickets: [
    { id: 'REQ1', summary: 'Relancer', status: 'ACTIONABLE', dueAt: 1781000000000 },
    { id: 'REQ2', summary: 'Fini', status: 'DONE', dueAt: null },
  ],
}

describe('buildSnapshot', () => {
  it('includes only active tasks of the context, with minimal fields', () => {
    const snap = buildSnapshot(state, 'pro', 'cockpit', '2026-06-13')
    expect(snap.tasks).toEqual([
      { id: 'a', title: 'Payer le loyer', status: 'backlog', dueDate: '2026-06-14', doToday: true },
    ])
  })

  it('includes only open tickets', () => {
    const snap = buildSnapshot(state, 'pro', 'cockpit', '2026-06-13')
    expect(snap.reqTickets.map((t) => t.id)).toEqual(['REQ1'])
  })

  it('carries view and today', () => {
    const snap = buildSnapshot(state, 'pro', 'tasks', '2026-06-13')
    expect(snap.view).toBe('tasks')
    expect(snap.today).toBe('2026-06-13')
  })
})
```

- [ ] **Step 2 : Vérifier l'échec** — Run: `npm test` — Expected: FAIL.

- [ ] **Step 3 : Implémenter `src/utils/assistant.js`**

```js
import { today } from './date'
import { selectActiveTasks } from './cockpit'

export function buildSnapshot(state, context, view, ref = today()) {
  const tasks = selectActiveTasks(state?.tasks ?? [], context)
    .slice(0, 60)
    .map((t) => ({ id: t.id, title: t.title, status: t.status, dueDate: t.dueDate || '', doToday: !!t.doToday }))
  const reqTickets = (state?.reqTickets ?? [])
    .filter((t) => t.status !== 'DONE')
    .slice(0, 40)
    .map((t) => ({ id: t.id, summary: t.summary || '', status: t.status, dueAt: t.dueAt ?? null }))
  return { tasks, reqTickets, view, today: ref }
}
```

- [ ] **Step 4 : Ajouter `getAssistantUrl` dans `src/utils/remoteSync.js`**

Juste après `getStateUrl` (ligne 15), ajouter :

```js
export function getAssistantUrl() {
  const base = getBaseUrl()
  return base ? `${base}/api/assistant` : ''
}
```

- [ ] **Step 5 : Vérifier que tout passe** — Run: `npm test` — Expected: PASS.

- [ ] **Step 6 : Commit**

```bash
git add src/utils/assistant.js src/utils/assistant.test.js src/utils/remoteSync.js
git commit -m "feat: voice snapshot builder + assistant endpoint URL"
```

---

### Task 4 : `useVoiceSession` appelle l'assistant (réseau)

**Files:**
- Modify (full replace): `src/hooks/useVoiceSession.js`

Le hook ne fait plus d'interprétation locale : il délègue à une fonction async `onTranscript(transcript)` (fournie par `App`) qui renvoie `{ speech }`. Half-duplex préservé ; nouvel état `thinking` pendant l'appel.

- [ ] **Step 1 : Remplacer entièrement `src/hooks/useVoiceSession.js`**

```js
import { useState, useRef, useCallback, useEffect } from 'react'
import { useSpeech } from './useSpeech'
import { useSpeak } from './useSpeak'

const TRANSIENT_ERRORS = new Set(['no-speech', 'aborted'])

// Half-duplex voice session: listens one utterance, calls the assistant,
// speaks the reply with the mic closed, then re-arms. Never keep the mic open
// during the network call or TTS (acoustic feedback loop). `busyRef` is a
// synchronous guard — `onresult`/`onend` fire back-to-back before React
// re-renders, so a state flag would race; the ref does not.
export function useVoiceSession({ onTranscript }) {
  const [journal, setJournal] = useState([])
  const [error, setError] = useState(null)
  const [active, setActive] = useState(false)
  const [thinking, setThinking] = useState(false)
  const sessionRef = useRef(false)
  const busyRef = useRef(false)
  const onTranscriptRef = useRef(onTranscript)
  const speechRef = useRef(null)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  })

  const { speak, cancel } = useSpeak()

  const reArm = useCallback(() => {
    if (sessionRef.current && !busyRef.current) speechRef.current?.start()
  }, [])

  const onResult = useCallback(
    async (transcript) => {
      if (!transcript) return
      busyRef.current = true
      setThinking(true)
      let result
      try {
        result = await onTranscriptRef.current?.(transcript)
      } catch {
        result = { speech: 'Assistant indisponible.' }
      }
      setThinking(false)
      if (!sessionRef.current) {
        busyRef.current = false
        return
      }
      const speech = result?.speech
      if (speech) {
        setJournal((j) => [...j, speech].slice(-6))
        speak(speech, () => {
          busyRef.current = false
          reArm()
        })
      } else {
        busyRef.current = false
        reArm()
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
    busyRef.current = false
    setActive(false)
    setError(err)
  }, [])

  const {
    supported,
    listening,
    interim,
    start: recStart,
    stop: recStop,
  } = useSpeech({ onResult, onEnd, onError })

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
    busyRef.current = false
    setActive(false)
    setThinking(false)
    cancel()
    recStop()
  }, [cancel, recStop])

  return { supported, active, listening, thinking, interim, journal, error, start, stop }
}
```

(Note : `busyRef` est posé **synchronement** dès le début d'`onResult`, avant le premier `await` — donc avant que `recognition.onend` ne se déclenche. `onEnd` ré-arme via `reArm`, qui ne fait rien tant que `busyRef` est vrai : le micro reste fermé pendant l'appel réseau **et** la réponse parlée. Il se ré-arme après le `onDone` de la synthèse.)

- [ ] **Step 2 : Build** — Run: `npm run build` — Expected: échoue tant que `VoiceDock` passe encore `voiceContext/onVoiceCommand` ; ce sera corrigé en Task 5. Sinon OK.

- [ ] **Step 3 : Commit**

```bash
git add src/hooks/useVoiceSession.js
git commit -m "feat: voice session delegates to async assistant call"
```

---

### Task 5 : Câblage `VoiceDock` + `App`, retrait du parseur déterministe

**Files:**
- Modify: `src/components/VoiceDock.jsx`
- Modify: `src/App.jsx`
- Delete: `src/utils/voiceCommands.js`, `src/utils/voiceCommands.test.js`, `src/utils/taskMatch.js`, `src/utils/taskMatch.test.js`, `src/utils/text.js`

- [ ] **Step 1 : `VoiceDock.jsx` — passer `onTranscript` et afficher « Réflexion… »**

Dans `src/components/VoiceDock.jsx` :

1. Changer la signature et l'appel au hook :

```jsx
export function VoiceDock({ onClose, onTranscript }) {
  const { active, listening, thinking, interim, journal, error, start, stop } = useVoiceSession({ onTranscript })
```

2. Dans la ligne d'état (le `<span>` qui choisit le texte selon `listening`/`active`), ajouter le cas `thinking`. Remplacer le `<span className="min-w-0 flex-1 truncate text-sm" …>{…}</span>` par :

```jsx
          <span className="min-w-0 flex-1 truncate text-sm" style={{ color: 'var(--text)' }}>
            {thinking
              ? '🧠 Réflexion…'
              : interim
                ? interim
                : listening
                  ? 'À l\'écoute… dites une commande'
                  : active
                    ? 'Réponse en cours…'
                    : 'Session vocale'}
          </span>
```

3. La pastille d'état : remplacer son contenu `{listening ? '🎙' : '🔊'}` par `{thinking ? '🧠' : listening ? '🎙' : '🔊'}`.

- [ ] **Step 2 : `src/App.jsx` — imports**

1. Retirer les imports devenus inutiles :
   - `import { selectNowTasks, selectActiveTasks } from './utils/cockpit'`
   - `import { collectDeadlines, formatCountdown, daysUntil } from './utils/deadlines'`
2. Ajouter :

```js
import { buildSnapshot } from './utils/assistant'
import { getAssistantUrl } from './utils/remoteSync'
```

(`today` reste importé.)

- [ ] **Step 3 : `src/App.jsx` — remplacer `voiceContext` + `handleVoiceCommand` par `applyAssistantActions` + `handleTranscript`**

Supprimer le bloc `const voiceContext = { … }` (mémo) et toute la `const handleVoiceCommand = useCallback(…)`. À la place, ajouter (après `handleQuickCapture`) :

```js
  const applyAssistantActions = useCallback(
    (actions) => {
      for (const a of actions ?? []) {
        if (a.type === 'navigate') setView(a.view)
        else if (a.type === 'complete_task') toggleTaskStatus(a.taskId)
        else if (a.type === 'snooze_task') updateTask(a.taskId, { dueDate: a.dueDate, doToday: a.dueDate === today() })
        else if (a.type === 'create_item') handleQuickCapture({ target: a.target, title: a.title, dueDate: a.dueDate || '', dueTime: a.dueTime || '' })
      }
    },
    [toggleTaskStatus, updateTask, handleQuickCapture]
  )

  const handleTranscript = useCallback(
    async (transcript) => {
      const url = getAssistantUrl()
      if (!url) return { speech: 'Assistant non configuré.' }
      const snapshot = buildSnapshot(state, context, view, today())
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript, context, snapshot }),
        })
        if (!res.ok) throw new Error(String(res.status))
        const data = await res.json()
        applyAssistantActions(data.actions)
        return { speech: data.speech ?? '' }
      } catch {
        return { speech: 'Assistant indisponible. Réessaie, ou tape via Capturer.' }
      }
    },
    [state, context, view, applyAssistantActions]
  )
```

- [ ] **Step 4 : `src/App.jsx` — mettre à jour le rendu de `<VoiceDock>`**

Remplacer :

```jsx
      {voiceOpen && (
        <VoiceDock
          onClose={() => setVoiceOpen(false)}
          voiceContext={voiceContext}
          onVoiceCommand={handleVoiceCommand}
        />
      )}
```

par :

```jsx
      {voiceOpen && (
        <VoiceDock onClose={() => setVoiceOpen(false)} onTranscript={handleTranscript} />
      )}
```

- [ ] **Step 5 : Supprimer le parseur déterministe**

Vérifier qu'aucun fichier conservé n'importe ces modules :

```bash
grep -rn "voiceCommands\|taskMatch\|utils/text" src/ --include="*.js" --include="*.jsx"
```

Expected : aucune référence hors des fichiers à supprimer eux-mêmes. (`quickParse` a son propre `normalize` interne et n'importe pas `text.js`.) Puis :

```bash
git rm src/utils/voiceCommands.js src/utils/voiceCommands.test.js src/utils/taskMatch.js src/utils/taskMatch.test.js src/utils/text.js
```

- [ ] **Step 6 : Build + lint + tests**

Run: `npm run build` puis `npm run lint` puis `npm test`
Expected: build OK ; aucun **nouveau** problème lint ; les tests passent (deadlines, quickParse, cockpit, buildSnapshot, buildResponse — les suites taskMatch/voiceCommands ont disparu). Corriger tout import inutilisé restant dans `App.jsx` signalé par ESLint.

- [ ] **Step 7 : Vérification manuelle (nécessite la clé)**

`npm run dev`. Sans `ANTHROPIC_API_KEY` configurée et sans `VITE_API_URL` pointant vers un backend qui l'a, l'assistant répondra « indisponible » — c'est le comportement attendu hors-ligne/sans clé. Avec la clé en place (déploiement Vercel, ou `VITE_API_URL` vers le déploiement) : ouvrir la session vocale, dire « va aux tickets » (navigation), « ajoute payer le loyer demain », « termine le loyer », « qu'est-ce que j'ai aujourd'hui » (réponse parlée), une formulation libre (« j'aimerais qu'on s'occupe du loyer, mets ça pour vendredi »). Vérifier l'indicateur « 🧠 Réflexion… » pendant l'appel, le half-duplex, et la capture texte (bouton Capturer) toujours fonctionnelle.

- [ ] **Step 8 : Commit**

```bash
git add src/App.jsx src/components/VoiceDock.jsx
git commit -m "feat: wire LLM assistant, remove deterministic voice parser"
```

---

## Couverture spec → tâches

| Exigence spec | Tâche |
|---|---|
| Route `api/assistant.js` (Haiku, tool use) | Task 2 |
| Outils create/complete/snooze/navigate/answer | Task 2 (`TOOLS`) |
| `buildResponse` (tool calls → actions, filtrage ids hallucinés) | Task 2 (testé) |
| Limite de débit Upstash | Task 2 (`overRateLimit`) |
| Snapshot lecture seule construit côté client | Task 3 (`buildSnapshot`, testé) |
| Appel réseau + indicateur « Réflexion » + half-duplex | Task 4 + Task 5 |
| Application des actions (effets existants) | Task 5 (`applyAssistantActions`) |
| Réponse parlée / requêtes | Task 2 (`answer`) + Task 5 |
| Pas de repli déterministe (parseur retiré) | Task 5 (suppressions) |
| `quickParse` conservé (capture texte) | inchangé |
| Clé env documentée | Task 1 |
| Store/sync inchangés | toutes (snapshot lecture seule, écritures via store existant) |
```
