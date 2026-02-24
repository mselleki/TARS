import { useState, useMemo, useRef, useEffect } from 'react'
import { COUNTRIES, DOMAIN_LABELS } from '../constants'
import { today } from '../utils/date'

const DOMAINS = [
  { value: 'product', label: 'Product' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'customer', label: 'Customer' },
]

function formatMeetingDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T12:00:00')
  const todayStr = today()
  if (dateStr === todayStr) return "Aujourd'hui"
  const yesterday = new Date(todayStr)
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === yesterday.toISOString().slice(0, 10)) return 'Hier'
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function DailyStandup({
  meetings = [],
  onAddMeeting,
  onUpdateMeeting,
  onDeleteMeeting,
}) {
  const [countryId, setCountryId] = useState('')
  const [domain, setDomain] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const notesRef = useRef(null)

  const filtered = useMemo(() => {
    let list = [...(meetings ?? [])]
    if (countryId) list = list.filter((m) => m.countryId === countryId)
    if (domain) list = list.filter((m) => m.domain === domain)
    return list.sort((a, b) => (b.createdAtDate || '').localeCompare(a.createdAtDate || '') || b.createdAt - a.createdAt)
  }, [meetings, countryId, domain])

  const selected = useMemo(() => meetings.find((m) => m.id === selectedId), [meetings, selectedId])

  const handleNewMeeting = () => {
    const todayStr = today()
    const id = onAddMeeting({
      createdAtDate: todayStr,
      countryId: countryId || null,
      domain: domain || '',
      content: '',
      title: '',
    })
    setSelectedId(id)
    setTimeout(() => notesRef.current?.focus(), 80)
  }

  useEffect(() => {
    if (selected && notesRef.current) notesRef.current.focus()
  }, [selectedId])

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-sm)]">
      <header className="border-b border-[var(--border)] px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)]">Daily Stand-up</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={countryId}
            onChange={(e) => setCountryId(e.target.value)}
            className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
            aria-label="Pays"
          >
            <option value="">Tous les pays</option>
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
            aria-label="Domain"
          >
            <option value="">Tous les domains</option>
            {DOMAINS.map((d) => (
              <option key={d.value} value={d.value}>{DOMAIN_LABELS[d.value] ?? d.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleNewMeeting}
            className="rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-[var(--transition)] hover:bg-[var(--accent-hover)]"
          >
            + Nouvelle réunion
          </button>
        </div>
      </header>
      <div className="flex flex-col md:flex-row min-h-[200px]">
        <aside className="border-b md:border-b-0 md:border-r border-[var(--border)] w-full md:w-56 shrink-0 max-h-[240px] md:max-h-none overflow-auto">
          <ul className="p-2 space-y-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-xs text-[var(--muted)]">Aucune réunion. Cliquez sur « Nouvelle réunion ».</li>
            ) : (
              filtered.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(m.id)}
                    className={`w-full text-left rounded-[var(--radius-md)] px-3 py-2 text-xs transition-[var(--transition)] ${
                      selectedId === m.id ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' : 'hover:bg-[var(--bg)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <span className="font-medium">{formatMeetingDate(m.createdAtDate)}</span>
                    {m.countryId && <span className="ml-1 text-[var(--muted)]">· {COUNTRIES.find((c) => c.value === m.countryId)?.label ?? m.countryId}</span>}
                    {m.domain && <span className="ml-1 text-[var(--muted)]">· {DOMAIN_LABELS[m.domain] ?? m.domain}</span>}
                    {m.content && <span className="block truncate mt-0.5 text-[var(--muted)]">{m.content.slice(0, 40)}…</span>}
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>
        <div className="flex-1 flex flex-col min-w-0 p-4">
          {selected ? (
            <>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs text-[var(--muted)]">
                  {formatMeetingDate(selected.createdAtDate)}
                  {selected.countryId && ` · ${COUNTRIES.find((c) => c.value === selected.countryId)?.label ?? selected.countryId}`}
                  {selected.domain && ` · ${DOMAIN_LABELS[selected.domain] ?? selected.domain}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Supprimer cette réunion ?')) {
                      onDeleteMeeting(selected.id)
                      setSelectedId(null)
                    }
                  }}
                  className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--danger-subtle)] hover:text-[var(--danger)] text-xs"
                  aria-label="Supprimer"
                >
                  Supprimer
                </button>
              </div>
              <textarea
                ref={notesRef}
                value={selected.content}
                onChange={(e) => onUpdateMeeting(selected.id, { content: e.target.value })}
                onBlur={(e) => onUpdateMeeting(selected.id, { content: e.target.value.trim() })}
                placeholder="Notes de la réunion…"
                className="min-h-[160px] w-full resize-y rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none transition-[var(--transition)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]"
                aria-label="Notes"
              />
            </>
          ) : (
            <p className="text-sm text-[var(--muted)] py-4">Sélectionnez une réunion ou créez-en une.</p>
          )}
        </div>
      </div>
    </section>
  )
}
