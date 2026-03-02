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

const DOMAIN_DOT_COLORS = {
  product:  '#FBBF24',
  vendor:   '#10B981',
  customer: '#A78BFA',
  all:      '#8E8E93',
}

export function DailyStandup({
  standupLog = '',
  onStandupLogChange,
  meetingSheets = {},
  onMeetingSheetChange,
}) {
  const logRef = useRef(null)
  const [selectedCountry, setSelectedCountry] = useState(null)

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

  const getCountryDots = (countryValue) =>
    GRID_DOMAINS.filter(d => {
      const s = getSheet(meetingSheets, sheetKey(countryValue, d.value))
      return s.notes.trim().length > 0 || s.tasks.length > 0
    })

  const openCountry = GRID_COUNTRIES.find(c => c.value === selectedCountry)

  return (
    <div className="space-y-4">
      {/* Daily stand-up */}
      <section
        className="relative overflow-hidden rounded-[var(--radius-2xl)]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
        aria-label="Daily stand-up notebook"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[var(--radius-2xl)]"
          style={{ background: 'var(--accent)' }} aria-hidden />
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
            className="min-h-[160px] w-full resize-y rounded-[var(--radius-lg)] border-0 bg-transparent px-0 py-2 text-[14px] leading-[1.8] placeholder:text-[var(--muted-2)] outline-none focus:ring-0"
            style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", serif', color: 'var(--text-secondary)' }}
            aria-label="Stand-up notes"
          />
        </div>
      </section>

      {/* Country × Domain — cards always visible, panel on click */}
      <section
        className="relative overflow-hidden rounded-[var(--radius-2xl)]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
        aria-label="Country × Domain notebook"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[var(--radius-2xl)]"
          style={{ background: 'var(--success)' }} aria-hidden />

        <div className="pl-6 pr-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.07em]" style={{ color: 'var(--muted)' }}>
            Country × Domain
          </p>
          <div className="flex flex-wrap gap-2">
            {GRID_COUNTRIES.map(country => (
              <CountryCard
                key={country.value}
                country={country}
                dots={getCountryDots(country.value)}
                isActive={selectedCountry === country.value}
                onClick={() => setSelectedCountry(
                  selectedCountry === country.value ? null : country.value
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Right-side panel */}
      {selectedCountry && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            style={{ background: 'rgba(0,0,0,0.18)' }}
            onClick={() => setSelectedCountry(null)}
            aria-hidden
          />

          {/* Panel */}
          <aside
            className="panel-slide-in fixed top-0 right-0 bottom-0 z-40 flex flex-col"
            style={{
              width: '360px',
              background: 'var(--panel-bg)',
              borderLeft: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xl)',
            }}
            aria-label={`${openCountry?.fullLabel} notes`}
          >
            {/* Panel header */}
            <div
              className="flex shrink-0 items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.07em]" style={{ color: 'var(--muted)' }}>
                  Country · Domain
                </p>
                <p className="text-base font-bold" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
                  {openCountry?.fullLabel}
                </p>
              </div>
              {/* Country switcher */}
              <div className="flex items-center gap-1">
                {GRID_COUNTRIES.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedCountry(c.value)}
                    className="rounded-[var(--radius-sm)] px-2 py-1 text-[11px] font-semibold transition-all"
                    style={{
                      background: selectedCountry === c.value ? 'var(--accent)' : 'var(--surface-2)',
                      color: selectedCountry === c.value ? '#fff' : 'var(--muted)',
                      border: '1px solid',
                      borderColor: selectedCountry === c.value ? 'var(--accent)' : 'var(--border)',
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Domain sections */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {GRID_DOMAINS.map(d => {
                const key = sheetKey(selectedCountry, d.value)
                const domainSheet = getSheet(meetingSheets, key)
                return (
                  <section key={d.value} aria-label={d.label}>
                    <div className="mb-2 flex items-center gap-2">
                      {d.color && (
                        <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                      )}
                      <h4 className="text-[12px] font-semibold" style={{ color: d.color ?? 'var(--muted)' }}>
                        {d.label}
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <textarea
                        value={domainSheet.notes}
                        onChange={(e) => onMeetingSheetChange?.(key, { ...domainSheet, notes: e.target.value })}
                        placeholder="Notes…"
                        className="textarea-glass min-h-[64px] w-full px-3 py-2.5 text-[13px] leading-relaxed"
                        style={{ fontFamily: 'ui-serif, Georgia, serif' }}
                        aria-label={`${d.label} notes`}
                      />
                      {domainSheet.tasks.length > 0 && (
                        <ul className="space-y-1.5">
                          {domainSheet.tasks.map((t) => (
                            <li key={t.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={t.done}
                                onChange={() => {
                                  const next = domainSheet.tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x))
                                  onMeetingSheetChange?.(key, { ...domainSheet, tasks: next })
                                }}
                                className="h-3.5 w-3.5 rounded shrink-0"
                                style={{ accentColor: d.color ?? 'var(--accent)' }}
                                aria-label={t.label || 'Toggle'}
                              />
                              <input
                                type="text"
                                value={t.label}
                                onChange={(e) => {
                                  const next = domainSheet.tasks.map((x) => (x.id === t.id ? { ...x, label: e.target.value } : x))
                                  onMeetingSheetChange?.(key, { ...domainSheet, tasks: next })
                                }}
                                placeholder="Task label"
                                className="input-glass min-w-0 flex-1 rounded-[var(--radius-md)] px-2.5 py-1 text-[12px]"
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const newTask = { id: crypto.randomUUID(), label: '', done: false }
                          onMeetingSheetChange?.(key, { ...domainSheet, tasks: [...domainSheet.tasks, newTask] })
                        }}
                        className="flex items-center gap-1.5 rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] transition-all"
                        style={{ border: '1px dashed var(--border-strong)', color: 'var(--muted)' }}
                      >
                        + Add task
                      </button>
                    </div>
                  </section>
                )
              })}
            </div>

            {/* Close button */}
            <div
              className="shrink-0 px-5 py-3"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <button
                type="button"
                onClick={() => setSelectedCountry(null)}
                className="w-full rounded-[var(--radius-md)] py-2 text-[13px] font-medium transition-all"
                style={{ background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                Close  ·  Esc
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}

function CountryCard({ country, dots, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-start rounded-[var(--radius-lg)] px-3 py-2.5 transition-all active:scale-[0.97]"
      style={{
        background: isActive ? 'var(--accent-subtle)' : 'var(--surface-2)',
        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
        minWidth: '72px',
        flex: '1 1 auto',
        maxWidth: '120px',
      }}
    >
      <span
        className="text-[15px] font-bold"
        style={{ color: isActive ? 'var(--accent)' : 'var(--text)', letterSpacing: '-0.02em' }}
      >
        {country.label}
      </span>
      <span className="mt-0.5 text-[10px] leading-tight truncate w-full" style={{ color: 'var(--muted)' }}>
        {country.fullLabel}
      </span>
      <div className="mt-2 flex items-center gap-1">
        {dots.length > 0
          ? dots.map(d => (
              <span
                key={d.value}
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: DOMAIN_DOT_COLORS[d.value] ?? 'var(--muted)' }}
                title={d.label}
              />
            ))
          : <span className="text-[9px]" style={{ color: 'var(--muted-2)' }}>empty</span>
        }
      </div>
    </button>
  )
}
