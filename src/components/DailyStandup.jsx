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

function hasContent(meetingSheets, countryValue) {
  return GRID_DOMAINS.some(d => {
    const s = getSheet(meetingSheets, sheetKey(countryValue, d.value))
    return s.notes.trim().length > 0 || s.tasks.length > 0
  })
}

function getCountryDots(meetingSheets, countryValue) {
  return GRID_DOMAINS.filter(d => {
    const s = getSheet(meetingSheets, sheetKey(countryValue, d.value))
    return s.notes.trim().length > 0 || s.tasks.length > 0
  })
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

  return (
    <div className="space-y-3">

      {/* ── Stand-up ── */}
      <section
        className="relative overflow-hidden rounded-[var(--radius-xl)]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        aria-label="Daily stand-up"
      >
        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: 'var(--accent)' }} aria-hidden />
        <div className="pl-5 pr-4 pt-3 pb-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.09em]" style={{ color: 'var(--muted)' }}>
              Stand-up
            </p>
            <button
              type="button"
              onClick={handleNewMeeting}
              className="shrink-0 rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-semibold transition-all hover:bg-[var(--accent-subtle)]"
              style={{ color: 'var(--accent)', border: '1px solid var(--accent-ring)' }}
            >
              + New meeting
            </button>
          </div>
          <textarea
            ref={logRef}
            value={standupLog}
            onChange={(e) => onStandupLogChange?.(e.target.value)}
            placeholder="Click « New meeting » to insert a dated block…"
            className="min-h-[100px] w-full resize-y rounded-[var(--radius-md)] border-0 bg-transparent px-0 py-1 text-[13px] leading-[1.75] placeholder:text-[var(--muted-2)] outline-none focus:ring-0"
            style={{ fontFamily: 'ui-serif, Georgia, serif', color: 'var(--text-secondary)' }}
            aria-label="Stand-up notes"
          />
        </div>
      </section>

      {/* ── Country × Domain ── */}
      <section
        className="relative overflow-hidden rounded-[var(--radius-xl)]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        aria-label="Country notes"
      >
        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: 'var(--success)' }} aria-hidden />

        <div className="pl-5 pr-4 pt-3 pb-4">
          {/* Label + country tabs */}
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <p className="mr-1 text-[10px] font-semibold uppercase tracking-[0.09em]" style={{ color: 'var(--muted)' }}>
              Context
            </p>
            {GRID_COUNTRIES.map(country => {
              const isActive = selectedCountry === country.value
              const dots = getCountryDots(meetingSheets, country.value)
              return (
                <button
                  key={country.value}
                  type="button"
                  onClick={() => setSelectedCountry(isActive ? null : country.value)}
                  className="relative flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-0.5 text-[11px] font-semibold transition-all"
                  style={{
                    background: isActive ? 'var(--accent)' : 'var(--surface-2)',
                    color: isActive ? '#fff' : 'var(--muted)',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                  title={country.fullLabel}
                >
                  {country.label}
                  {/* Content dots */}
                  {dots.length > 0 && !isActive && (
                    <span className="flex gap-0.5">
                      {dots.slice(0, 3).map(d => (
                        <span
                          key={d.value}
                          className="h-1 w-1 rounded-full"
                          style={{ background: DOMAIN_DOT_COLORS[d.value] ?? 'var(--muted)' }}
                        />
                      ))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Inline domain notes — expands when country is selected */}
          {selectedCountry && (
            <div className="fade-in space-y-3">
              {GRID_DOMAINS.map(d => {
                const key = sheetKey(selectedCountry, d.value)
                const sheet = getSheet(meetingSheets, key)
                return (
                  <div key={d.value}>
                    {/* Domain label */}
                    <div className="mb-1.5 flex items-center gap-1.5">
                      {d.color
                        ? <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: d.color }} />
                        : <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: 'var(--border-strong)' }} />
                      }
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.07em]"
                        style={{ color: d.color ?? 'var(--muted)' }}
                      >
                        {d.label}
                      </span>
                    </div>

                    {/* Notes */}
                    <textarea
                      value={sheet.notes}
                      onChange={(e) => onMeetingSheetChange?.(key, { ...sheet, notes: e.target.value })}
                      placeholder="Notes…"
                      className="textarea-glass w-full px-3 py-2 text-[12px] leading-relaxed"
                      style={{
                        fontFamily: 'ui-serif, Georgia, serif',
                        minHeight: '52px',
                        resize: 'vertical',
                      }}
                      aria-label={`${d.label} notes`}
                    />

                    {/* Tasks */}
                    {sheet.tasks.length > 0 && (
                      <ul className="mt-1.5 space-y-1">
                        {sheet.tasks.map(t => (
                          <li key={t.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={t.done}
                              onChange={() => {
                                const next = sheet.tasks.map(x => x.id === t.id ? { ...x, done: !x.done } : x)
                                onMeetingSheetChange?.(key, { ...sheet, tasks: next })
                              }}
                              className="h-3 w-3 shrink-0 rounded"
                              style={{ accentColor: d.color ?? 'var(--accent)' }}
                              aria-label={t.label || 'Toggle'}
                            />
                            <input
                              type="text"
                              value={t.label}
                              onChange={(e) => {
                                const next = sheet.tasks.map(x => x.id === t.id ? { ...x, label: e.target.value } : x)
                                onMeetingSheetChange?.(key, { ...sheet, tasks: next })
                              }}
                              placeholder="Task"
                              className="input-glass min-w-0 flex-1 rounded-[var(--radius-sm)] px-2 py-0.5 text-[11px]"
                            />
                          </li>
                        ))}
                      </ul>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const newTask = { id: crypto.randomUUID(), label: '', done: false }
                        onMeetingSheetChange?.(key, { ...sheet, tasks: [...sheet.tasks, newTask] })
                      }}
                      className="mt-1.5 flex items-center gap-1 text-[10px] transition-colors hover:text-[var(--text)]"
                      style={{ color: 'var(--muted-2)' }}
                    >
                      + task
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
