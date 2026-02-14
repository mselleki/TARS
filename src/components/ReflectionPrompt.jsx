import { useState } from 'react'

export function ReflectionPrompt({
  tasks,
  reflection,
  onSave,
}) {
  const [done, setDone] = useState(reflection.done ?? '')
  const [useless, setUseless] = useState(reflection.useless ?? '')
  const [simplify, setSimplify] = useState(reflection.simplify ?? '')
  const [expanded, setExpanded] = useState(false)

  const handleSave = () => {
    onSave?.({ done, useless, simplify })
    setExpanded(false)
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="mb-6 w-full rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] py-4 text-sm font-medium text-[var(--text-secondary)] transition-[var(--transition)] hover:border-[var(--accent)]/30 hover:bg-[var(--accent-subtle)]"
      >
        Wrap up for today
      </button>
    )
  }

  const options = tasks.filter((t) => t.status === 'done').map((t) => t.title)

  return (
    <div className="mb-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
      <h3 className="text-sm font-semibold text-[var(--text)]">End of day reflection</h3>
      <p className="mt-1 text-xs text-[var(--muted)]">Pick one for each (optional)</p>
      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)]">1 thing done well</label>
          <input
            type="text"
            value={done}
            onChange={(e) => setDone(e.target.value)}
            list="done-list"
            className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none transition-[var(--transition)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-ring)]"
            placeholder="Optional"
          />
          <datalist id="done-list">
            {options.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)]">1 thing that felt useless</label>
          <input
            type="text"
            value={useless}
            onChange={(e) => setUseless(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none transition-[var(--transition)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-ring)]"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)]">1 thing to simplify</label>
          <input
            type="text"
            value={simplify}
            onChange={(e) => setSimplify(e.target.value)}
            className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none transition-[var(--transition)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-ring)]"
            placeholder="Optional"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium text-[var(--muted)] transition-[var(--transition)] hover:bg-[var(--border)]"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-[var(--transition)] hover:bg-[var(--accent-hover)]"
        >
          Save
        </button>
      </div>
    </div>
  )
}
