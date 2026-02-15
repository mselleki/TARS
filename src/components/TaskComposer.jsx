import { useState, useRef, useEffect } from 'react'
import { PRIORITIES, ENERGY, DOMAINS, COUNTRIES } from '../constants'
import { flattenProjectsForSelect } from '../utils/projects'

export function TaskComposer({
  onSubmit,
  onCancel,
  context,
  initialFocus = false,
  embedded = false,
  projectId = null,
  projects = [],
  onProjectChange,
}) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [energy, setEnergy] = useState('quick')
  const [dueDate, setDueDate] = useState('')
  const [domainIds, setDomainIds] = useState([])
  const [countryIds, setCountryIds] = useState([])
  const inputRef = useRef(null)

  const toggleDomain = (val) => {
    setDomainIds((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]))
  }
  const toggleCountry = (val) => {
    setCountryIds((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]))
  }

  useEffect(() => {
    if (!initialFocus) return
    const focusInput = () => inputRef.current?.focus()
    const t1 = setTimeout(focusInput, 50)
    const t2 = setTimeout(focusInput, 200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [initialFocus])

  const handleSubmit = (e) => {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    onSubmit({
      title: t,
      context,
      priority,
      energy,
      dueDate: dueDate || '',
      projectId: projectId || null,
      domainIds: context === 'pro' ? domainIds : [],
      countryIds: context === 'pro' ? countryIds : [],
    })
    setTitle('')
    setDueDate('')
    setDomainIds([])
    setCountryIds([])
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className={embedded ? 'flex flex-col gap-4' : 'rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] transition-[var(--transition)] focus-within:shadow-[var(--shadow-md)] focus-within:ring-1 focus-within:ring-[var(--accent-ring)]'}
    >
      {embedded && (
        <div>
          <label htmlFor="task-project-input" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Project
          </label>
          <select
            id="task-project-input"
            value={projectId || ''}
            onChange={(e) => onProjectChange?.(e.target.value || null)}
            className="mb-3 w-full rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-text-secondary)]"
          >
            <option value="">No project</option>
            {flattenProjectsForSelect(projects).map((p) => (
              <option key={p.id} value={p.id}>
                {p.depth ? '—'.repeat(p.depth) + ' ' : ''}{p.title}
              </option>
            ))}
          </select>
        </div>
      )}
      {embedded && (
        <div>
          <label htmlFor="task-title-input" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Task name
          </label>
          <input
            ref={inputRef}
            id="task-title-input"
            type="text"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onCancel?.()}
            placeholder="What do you need to do?"
            className="w-full rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base outline-none transition-[var(--transition)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]"
            aria-label="Task title"
          />
        </div>
      )}
      <div className={`flex flex-col gap-3 sm:flex-row sm:items-end ${embedded ? 'flex-wrap' : ''}`}>
        {!embedded && (
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onCancel?.()}
            placeholder="New task..."
            className="min-w-0 flex-1 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition-[var(--transition)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]"
            aria-label="Task title"
          />
        )}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--accent)]"
          aria-label="Priority"
        >
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <select
          value={energy}
          onChange={(e) => setEnergy(e.target.value)}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--accent)]"
          aria-label="Energy"
        >
          {ENERGY.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--text-secondary)] outline-none focus:border-[var(--accent)]"
          aria-label="Due date"
        />
        {context === 'pro' && (
          <>
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs text-[var(--muted)] mr-1">Domain:</span>
              {DOMAINS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDomain(d.value)}
                  className={`rounded-[var(--radius-sm)] px-2 py-1 text-xs transition-[var(--transition)] ${
                    domainIds.includes(d.value) ? 'bg-[var(--accent)] text-white' : 'border border-[var(--border)] text-[var(--muted)]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs text-[var(--muted)] mr-1">Country:</span>
              {COUNTRIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => toggleCountry(c.value)}
                  className={`rounded-[var(--radius-sm)] px-2 py-1 text-xs transition-[var(--transition)] ${
                    countryIds.includes(c.value) ? 'bg-[var(--accent)] text-white' : 'border border-[var(--border)] text-[var(--muted)]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-[var(--radius-lg)] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-[var(--transition)] hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:ring-offset-2"
          >
            Add
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition-[var(--transition)] hover:bg-[var(--border)]"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
