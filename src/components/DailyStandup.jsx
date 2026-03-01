import { useState, useRef, useEffect } from 'react'

const GRID_COUNTRIES = [
  { value: 'se', label: 'SE', fullLabel: 'Sweden' },
  { value: 'gb', label: 'GB', fullLabel: 'United Kingdom' },
  { value: 'ie', label: 'IE', fullLabel: 'Ireland' },
  { value: 'fr', label: 'FR', fullLabel: 'France' },
  { value: 'all', label: 'All', fullLabel: 'All markets' },
]

const GRID_DOMAINS = [
  { value: 'product',  label: 'Product',  color: '#FBBF24' },
  { value: 'vendor',   label: 'Vendor',   color: '#10B981' },
  { value: 'customer', label: 'Customer', color: '#A78BFA' },
  { value: 'all',      label: 'All',      color: null },
]

function getNewMeetingBlock() {
  const now = new Date()
  const dateLabel = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  return `\n\n────────────────────────────────────────\n  New meeting · ${dateLabel}\n────────────────────────────────────────\n\n`
}

function sheetKey(countryId, domain) {
  return `${countryId}|${domain}`
}

function getSheet(meetingSheets, key) {
  const raw = meetingSheets[key]
  if (raw == null) return { notes: '', tasks: [] }
  if (typeof raw === 'string') return { notes: raw, tasks: [] }
  const tasks = Array.isArray(raw.tasks) ? raw.tasks : []
  const normalizedTasks = tasks.map((t, i) =>
    typeof t === 'string'
      ? { id: `legacy-${i}`, label: t, done: false }
      : { id: t.id ?? `task-${i}`, label: t.label ?? '', done: !!t.done }
  )
  return {
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    tasks: normalizedTasks,
  }
}

export function DailyStandup({
  standupLog = '',
  onStandupLogChange,
  meetingSheets = {},
  onMeetingSheetChange,
}) {
  const logRef = useRef(null)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [activeDomain, setActiveDomain] = useState('product')

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && selectedCountry) {
        setSelectedCountry(null)
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedCountry])

  const handleNewMeeting = () => {
    const block = getNewMeetingBlock()
    const newContent = (standupLog || '') + block
    onStandupLogChange?.(newContent)
    setTimeout(() => {
      const el = logRef.current
      if (el) {
        el.focus()
        el.setSelectionRange(newContent.length, newContent.length)
        el.scrollTop = el.scrollHeight
      }
    }, 0)
  }

  const handleOpenCountry = (countryValue) => {
    setSelectedCountry(countryValue)
    setActiveDomain('product')
  }

  const getCountryDots = (countryValue) =>
    GRID_DOMAINS.filter(d => {
      const s = getSheet(meetingSheets, sheetKey(countryValue, d.value))
      return s.notes.trim().length > 0 || s.tasks.length > 0
    })

  const currentKey = selectedCountry ? sheetKey(selectedCountry, activeDomain) : null
  const sheet = currentKey ? getSheet(meetingSheets, currentKey) : null
  const openCountry = GRID_COUNTRIES.find(c => c.value === selectedCountry)

  return (
    <div className="space-y-6">
      {/* Daily stand-up */}
      <section
        className="relative overflow-hidden rounded-[var(--radius-2xl)]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
        aria-label="Daily stand-up notebook"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[var(--radius-2xl)]"
          style={{ background: 'var(--accent-gradient)' }} aria-hidden />
        <div className="pl-6 pr-5 py-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-base font-semibold" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Daily stand-up
            </h2>
            <button type="button" onClick={handleNewMeeting} className="btn-primary shrink-0 px-4 py-2 text-sm">
              + New meeting
            </button>
          </div>
          <textarea
            ref={logRef}
            value={standupLog}
            onChange={(e) => onStandupLogChange?.(e.target.value)}
            placeholder="Click « New meeting » to insert a dated block, then write below…"
            className="min-h-[220px] w-full resize-y rounded-[var(--radius-lg)] border-0 bg-transparent px-0 py-2 text-[14px] leading-[1.8] placeholder:text-[var(--muted-2)] outline-none focus:ring-0"
            style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", serif', color: 'var(--text-secondary)' }}
            aria-label="Stand-up notes"
          />
        </div>
      </section>

      {/* Country × Domain — card-based */}
      <section
        className="relative overflow-hidden rounded-[var(--radius-2xl)]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
        aria-label="Country × Domain notebook"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[var(--radius-2xl)]"
          style={{ background: 'linear-gradient(180deg, #10B981 0%, #2563EB 100%)' }} aria-hidden />
        <div className="pl-6 pr-5 py-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Country × Domain
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: 'var(--muted)' }}>
              Select a market to open its notes &amp; tasks.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {GRID_COUNTRIES.map(country => (
              <CountryCard
                key={country.value}
                country={country}
                dots={getCountryDots(country.value)}
                onClick={() => handleOpenCountry(country.value)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Country detail panel */}
      {selectedCountry && (
        <>
          <div
            className="panel-backdrop-in fixed inset-0 z-30 bg-black/60"
            style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            aria-hidden
            onClick={() => setSelectedCountry(null)}
          />
          <aside
            className="panel-slide-in fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col"
            style={{ background: 'var(--panel-bg)', borderLeft: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}
            aria-label={`${openCountry?.label} notes`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
                {openCountry?.fullLabel ?? openCountry?.label}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCountry(null)}
                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] transition-all"
                style={{ color: 'var(--muted)' }}
                aria-label="Close"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Domain tabs */}
            <div className="flex gap-1 px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
              {GRID_DOMAINS.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setActiveDomain(d.value)}
                  className="rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-semibold transition-all"
                  style={{
                    background: activeDomain === d.value
                      ? (d.color ? `${d.color}20` : 'var(--surface-2)')
                      : 'transparent',
                    color: activeDomain === d.value
                      ? (d.color ?? 'var(--text)')
                      : 'var(--muted)',
                    borderBottom: activeDomain === d.value
                      ? `2px solid ${d.color ?? 'var(--accent)'}`
                      : '2px solid transparent',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Notes + tasks */}
            <div className="flex flex-1 flex-col gap-5 overflow-auto p-5">
              <section aria-label="Notes">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  Notes
                </h4>
                <textarea
                  key={currentKey}
                  value={sheet.notes}
                  onChange={(e) => onMeetingSheetChange?.(currentKey, { ...sheet, notes: e.target.value })}
                  placeholder="Notes…"
                  className="textarea-glass min-h-[180px] w-full px-4 py-3 text-sm leading-relaxed"
                  style={{ fontFamily: 'ui-serif, Georgia, serif' }}
                  aria-label="Notes"
                  autoFocus
                />
              </section>
              <section aria-label="Tasks">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  Tasks
                </h4>
                <ul className="space-y-2">
                  {sheet.tasks.map((t) => (
                    <li key={t.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => {
                          const next = sheet.tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x))
                          onMeetingSheetChange?.(currentKey, { ...sheet, tasks: next })
                        }}
                        className="h-4 w-4 rounded"
                        style={{ accentColor: 'var(--accent)' }}
                        aria-label={t.label || 'Toggle'}
                      />
                      <input
                        type="text"
                        value={t.label}
                        onChange={(e) => {
                          const next = sheet.tasks.map((x) => (x.id === t.id ? { ...x, label: e.target.value } : x))
                          onMeetingSheetChange?.(currentKey, { ...sheet, tasks: next })
                        }}
                        placeholder="Task label"
                        className="input-glass min-w-0 flex-1 rounded-[var(--radius-md)] px-3 py-1.5 text-sm"
                      />
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    const newTask = { id: crypto.randomUUID(), label: '', done: false }
                    onMeetingSheetChange?.(currentKey, { ...sheet, tasks: [...sheet.tasks, newTask] })
                  }}
                  className="mt-2 flex items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-sm transition-all"
                  style={{ border: '1px dashed var(--border-strong)', color: 'var(--muted)' }}
                >
                  <span className="text-base leading-none">+</span> Add task
                </button>
              </section>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}

const DOMAIN_DOT_COLORS = {
  product:  '#FBBF24',
  vendor:   '#10B981',
  customer: '#A78BFA',
  all:      '#8E8E93',
}

function CountryCard({ country, dots, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-start rounded-[var(--radius-xl)] p-4 transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.99]"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        minWidth: '90px',
        flex: '1 1 auto',
        maxWidth: '150px',
      }}
    >
      <span className="text-xl font-bold" style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}>
        {country.label}
      </span>
      <span className="mt-0.5 text-[10px] leading-tight" style={{ color: 'var(--muted)' }}>
        {country.fullLabel}
      </span>
      <div className="mt-3 flex items-center gap-1.5">
        {dots.length > 0
          ? dots.map(d => (
              <span
                key={d.value}
                className="h-2 w-2 rounded-full"
                style={{ background: DOMAIN_DOT_COLORS[d.value] ?? 'var(--muted)' }}
                title={d.label}
              />
            ))
          : <span className="text-[10px]" style={{ color: 'var(--muted-2)' }}>Empty</span>
        }
      </div>
    </button>
  )
}
