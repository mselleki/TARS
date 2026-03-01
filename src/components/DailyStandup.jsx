import { useState, useRef, useEffect } from 'react'
import { COUNTRIES, DOMAIN_LABELS } from '../constants'

const GRID_COUNTRIES = [
  { value: 'se', label: 'SE' },
  { value: 'gb', label: 'GB' },
  { value: 'ie', label: 'IE' },
  { value: 'fr', label: 'FR' },
  { value: 'all', label: 'All' },
]

const GRID_DOMAINS = [
  { value: 'product', label: 'Product' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'customer', label: 'Customer' },
  { value: 'all', label: 'All' },
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
  const [selectedSheet, setSelectedSheet] = useState(null)
  const [clickedCellKey, setClickedCellKey] = useState(null)

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && selectedSheet) {
        setSelectedSheet(null)
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedSheet])

  const handleOpenSheet = (countryValue, domainValue) => {
    const key = sheetKey(countryValue, domainValue)
    setClickedCellKey(key)
    const t = setTimeout(() => {
      setSelectedSheet({ country: countryValue, domain: domainValue })
      setClickedCellKey(null)
    }, 220)
    return () => clearTimeout(t)
  }

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
    <div className="space-y-6">
      {/* Daily stand-up — glass notebook */}
      <section
        className="relative overflow-hidden rounded-[var(--radius-2xl)]"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
        aria-label="Daily stand-up notebook"
      >
        {/* Left accent strip */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[var(--radius-2xl)]"
          style={{ background: 'var(--accent-gradient)' }}
          aria-hidden
        />
        <div className="pl-6 pr-5 py-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
            >
              Daily stand-up
            </h2>
            <button
              type="button"
              onClick={handleNewMeeting}
              className="btn-primary shrink-0 px-4 py-2 text-sm"
            >
              + New meeting
            </button>
          </div>
          <textarea
            ref={logRef}
            value={standupLog}
            onChange={(e) => onStandupLogChange?.(e.target.value)}
            placeholder="Click « New meeting » to insert a dated block, then write below…"
            className="min-h-[220px] w-full resize-y rounded-[var(--radius-lg)] border-0 bg-transparent px-0 py-2 text-[14px] leading-[1.8] placeholder:text-[var(--muted-2)] outline-none focus:ring-0"
            style={{
              fontFamily: 'ui-serif, Georgia, "Times New Roman", serif',
              color: 'var(--text-secondary)',
            }}
            aria-label="Stand-up notes"
          />
        </div>
      </section>

      {/* Country × Domain notebook */}
      <section
        className="relative overflow-hidden rounded-[var(--radius-2xl)]"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
        aria-label="Country × Domain notebook"
      >
        {/* Left accent strip */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[var(--radius-2xl)]"
          style={{ background: 'linear-gradient(180deg, #10B981 0%, #2563EB 100%)' }}
          aria-hidden
        />
        <div className="pl-6 pr-5 py-5">
          <div className="mb-4">
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
            >
              Country × Domain notebook
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: 'var(--muted)' }}>
              X-axis: domains. Y-axis: countries.
            </p>
          </div>
          <div
            className="overflow-x-auto rounded-[var(--radius-xl)]"
            style={{
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr>
                  <th
                    className="w-16 px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider rounded-tl-[var(--radius-xl)]"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--muted)' }}
                  >
                    ↕ ↔
                  </th>
                  {GRID_DOMAINS.map((d, i) => (
                    <th
                      key={d.value}
                      className={`px-2 py-3 text-center text-xs font-semibold ${i === GRID_DOMAINS.length - 1 ? 'rounded-tr-[var(--radius-xl)]' : ''}`}
                      style={{
                        background: d.value === 'product'  ? 'rgba(251,191,36,0.08)'
                                  : d.value === 'vendor'   ? 'rgba(16,185,129,0.08)'
                                  : d.value === 'customer' ? 'rgba(124,58,237,0.08)'
                                  : 'rgba(255,255,255,0.04)',
                        color:  d.value === 'product'  ? '#FBBF24'
                              : d.value === 'vendor'   ? '#10B981'
                              : d.value === 'customer' ? '#A78BFA'
                              : 'var(--muted)',
                      }}
                    >
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GRID_COUNTRIES.map((row) => (
                  <tr key={row.value}>
                    <td
                      className="px-3 py-2 text-xs font-semibold align-top"
                      style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)' }}
                    >
                      {row.label}
                    </td>
                    {GRID_DOMAINS.map((col) => (
                      <td key={col.value} className="p-1.5 align-top">
                        <SheetCell
                          countryValue={row.value}
                          domainValue={col.value}
                          notes={(getSheet(meetingSheets, sheetKey(row.value, col.value))).notes}
                          onOpen={handleOpenSheet}
                          isAnimating={clickedCellKey === sheetKey(row.value, col.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Notes panel */}
      {selectedSheet && (() => {
        const currentKey = sheetKey(selectedSheet.country, selectedSheet.domain)
        const sheet = getSheet(meetingSheets, currentKey)
        return (
          <>
            <div
              className="panel-backdrop-in fixed inset-0 z-30 bg-black/60"
              style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
              aria-hidden
              onClick={() => setSelectedSheet(null)}
            />
            <aside
              className="panel-slide-in fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col"
              style={{
                background: '#0E0E1A',
                borderLeft: '1px solid rgba(255,255,255,0.10)',
                boxShadow: '-24px 0 80px rgba(0,0,0,0.7)',
              }}
              aria-label="Country × Domain notes"
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <h3
                  className="text-base font-semibold"
                  style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
                >
                  {GRID_COUNTRIES.find((c) => c.value === selectedSheet.country)?.label ?? selectedSheet.country}
                  {' · '}
                  {GRID_DOMAINS.find((d) => d.value === selectedSheet.domain)?.label ?? selectedSheet.domain}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedSheet(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] transition-all"
                  style={{ color: 'var(--muted)', background: 'transparent' }}
                  aria-label="Close"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-5 overflow-auto p-5">
                <section aria-label="Notes">
                  <h4
                    className="mb-2 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--muted)' }}
                  >
                    Notes
                  </h4>
                  <textarea
                    value={sheet.notes}
                    onChange={(e) => onMeetingSheetChange?.(currentKey, { notes: e.target.value })}
                    placeholder="Notes…"
                    className="textarea-glass min-h-[180px] w-full px-4 py-3 text-sm leading-relaxed"
                    style={{ fontFamily: 'ui-serif, Georgia, serif' }}
                    aria-label="Notes"
                    autoFocus
                  />
                </section>
                <section aria-label="Tasks">
                  <h4
                    className="mb-2 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--muted)' }}
                  >
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
                            onMeetingSheetChange?.(currentKey, { tasks: next })
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
                            onMeetingSheetChange?.(currentKey, { tasks: next })
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
                      onMeetingSheetChange?.(currentKey, { tasks: [...sheet.tasks, newTask] })
                    }}
                    className="mt-2 flex items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-sm transition-all"
                    style={{
                      border: '1px dashed var(--border-strong)',
                      color: 'var(--muted)',
                    }}
                  >
                    <span className="text-base leading-none">+</span> Add task
                  </button>
                </section>
              </div>
            </aside>
          </>
        )
      })()}
    </div>
  )
}

const DOMAIN_CELL_STYLE = {
  product:  { bg: 'rgba(251,191,36,0.06)',  border: 'rgba(251,191,36,0.15)',  hoverBg: 'rgba(251,191,36,0.10)' },
  vendor:   { bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.15)',  hoverBg: 'rgba(16,185,129,0.10)' },
  customer: { bg: 'rgba(124,58,237,0.06)',  border: 'rgba(124,58,237,0.15)',  hoverBg: 'rgba(124,58,237,0.10)' },
  all:      { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)', hoverBg: 'rgba(255,255,255,0.06)' },
}

function SheetCell({ countryValue, domainValue, notes, onOpen, isAnimating }) {
  const style = DOMAIN_CELL_STYLE[domainValue] ?? DOMAIN_CELL_STYLE.all
  const preview = notes ? (notes.trim().slice(0, 60) + (notes.length > 60 ? '…' : '')) : null

  return (
    <button
      type="button"
      onClick={() => onOpen?.(countryValue, domainValue)}
      className={`sheet-cell block w-full rounded-[var(--radius-lg)] text-left transition-all duration-200 hover:scale-[1.02] focus:outline-none active:scale-[0.99] ${isAnimating ? 'sheet-cell--clicked' : ''}`}
      style={{
        minHeight: '96px',
        background: style.bg,
        border: `1px solid ${style.border}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }}
      aria-label="Open notes"
    >
      <div className="flex min-h-[96px] items-center justify-center px-3 py-3">
        {preview ? (
          <p
            className="text-xs leading-relaxed line-clamp-3"
            style={{
              fontFamily: 'ui-serif, Georgia, serif',
              color: 'var(--text-secondary)',
            }}
          >
            {preview}
          </p>
        ) : (
          <p
            className="text-xs italic"
            style={{
              fontFamily: 'ui-serif, Georgia, serif',
              color: 'var(--muted-2)',
            }}
          >
            — Click to edit…
          </p>
        )}
      </div>
    </button>
  )
}
