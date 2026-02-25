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
    <div className="space-y-10">
      {/* Daily stand-up notebook */}
      <section
        className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[#fdfcfa] shadow-[0 2px 8px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.08)] dark:bg-[#f5f3f0] dark:text-gray-900 dark:border-gray-300"
        aria-label="Daily stand-up notebook"
      >
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-indigo-200/50 via-indigo-100/30 to-transparent dark:from-indigo-300/40 dark:via-indigo-200/20" aria-hidden />
        <div className="pl-12 pr-6 py-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-lg font-semibold text-gray-800 tracking-tight dark:text-gray-900">
              Daily stand-up
            </h2>
            <button
              type="button"
              onClick={handleNewMeeting}
              className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-900/20 transition-[var(--transition)] hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-900/25"
            >
              + New meeting
            </button>
          </div>
          <textarea
            ref={logRef}
            value={standupLog}
            onChange={(e) => onStandupLogChange?.(e.target.value)}
            placeholder="Click « New meeting » to insert a dated block, then write below…"
            className="min-h-[240px] w-full resize-y rounded-lg border-0 bg-transparent px-0 py-2 text-[15px] leading-[1.7] text-gray-900 placeholder:text-gray-500 outline-none focus:ring-0 dark:text-gray-900 dark:placeholder:text-gray-600"
            style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", serif' }}
            aria-label="Stand-up notes"
          />
        </div>
      </section>

      {/* Country × Domain notebook */}
      <section
        className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[#fdfcfa] p-5 shadow-[0 2px 8px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.06)] dark:bg-[#f5f3f0] dark:border-gray-300 dark:shadow-[0 2px 12px rgba(0,0,0,0.08)]"
        aria-label="Country × Domain notebook"
      >
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-amber-200/40 via-teal-200/20 to-transparent dark:from-amber-300/30 dark:via-teal-200/15" aria-hidden />
        <div className="relative mb-5">
          <h2 className="text-lg font-semibold text-gray-800 tracking-tight dark:text-gray-900">
            Country × Domain notebook
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-700">
            X-axis: domains. Y-axis: countries.
          </p>
        </div>
        <div className="relative overflow-x-auto rounded-xl border border-gray-200 bg-white/60 p-3 shadow-inner dark:border-gray-300 dark:bg-white/40">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr>
                <th className="w-16 rounded-tl-lg bg-gray-100/80 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:bg-gray-200/60 dark:text-gray-700">
                  Country \ Domain
                </th>
                {GRID_DOMAINS.map((d, i) => (
                  <th
                    key={d.value}
                    className={`px-2 py-3 text-center text-xs font-semibold ${i === GRID_DOMAINS.length - 1 ? 'rounded-tr-lg' : ''} ${
                      d.value === 'product' ? 'bg-amber-100/70 text-amber-800 dark:bg-amber-200/50 dark:text-amber-900' :
                      d.value === 'vendor' ? 'bg-teal-100/70 text-teal-800 dark:bg-teal-200/50 dark:text-teal-900' :
                      d.value === 'customer' ? 'bg-indigo-100/70 text-indigo-800 dark:bg-indigo-200/50 dark:text-indigo-900' :
                      'bg-gray-100/80 text-gray-700 dark:bg-gray-200/60 dark:text-gray-800'
                    }`}
                  >
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GRID_COUNTRIES.map((row) => (
                <tr key={row.value}>
                  <td className="rounded-l-lg bg-gray-100/60 px-3 py-2 text-xs font-semibold text-gray-700 align-top dark:bg-gray-200/40 dark:text-gray-800">
                    {row.label}
                  </td>
                  {GRID_DOMAINS.map((col) => (
                    <td key={col.value} className="p-2 align-top">
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
      </section>

      {/* Panel feuille */}
      {selectedSheet && (() => {
        const currentKey = sheetKey(selectedSheet.country, selectedSheet.domain)
        const sheet = getSheet(meetingSheets, currentKey)
        return (
        <>
          <div
            className="panel-backdrop-in fixed inset-0 z-30 bg-black/25 backdrop-blur-[2px]"
            aria-hidden
            onClick={() => setSelectedSheet(null)}
          />
          <aside
            className="panel-slide-in fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-xl"
            aria-label="Country × Domain notes"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <h3 className="text-base font-semibold text-[var(--text)]">
                {GRID_COUNTRIES.find((c) => c.value === selectedSheet.country)?.label ?? selectedSheet.country} · {GRID_DOMAINS.find((d) => d.value === selectedSheet.domain)?.label ?? selectedSheet.domain}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedSheet(null)}
                className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-6 overflow-auto p-4">
              <section aria-label="Notes">
                <h4 className="mb-2 text-sm font-semibold text-[var(--text)]">Notes</h4>
                <textarea
                  value={sheet.notes}
                  onChange={(e) => onMeetingSheetChange?.(currentKey, { notes: e.target.value })}
                  placeholder="Notes…"
                  className="min-h-[180px] w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 px-4 py-3 text-sm leading-relaxed text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]/30"
                  style={{ fontFamily: 'ui-serif, Georgia, serif' }}
                  aria-label="Notes"
                  autoFocus
                />
              </section>
              <section aria-label="Tasks">
                <h4 className="mb-2 text-sm font-semibold text-[var(--text)]">Tasks</h4>
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
                        className="h-4 w-4 rounded border-[var(--border-strong)] text-[var(--accent)] focus:ring-[var(--accent-ring)]"
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
                        className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-ring)]"
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
                  className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition-[var(--transition)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent-subtle)] hover:text-[var(--text)]"
                >
                  <span className="text-base">+</span> Add task
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

const DOMAIN_COLORS = {
  product: 'bg-amber-50 border-amber-200/80 hover:bg-amber-100/80 hover:border-amber-300 dark:bg-amber-100/60 dark:border-amber-300/70 dark:hover:bg-amber-200/50',
  vendor: 'bg-teal-50/90 border-teal-200/80 hover:bg-teal-100/80 hover:border-teal-300 dark:bg-teal-100/60 dark:border-teal-300/70 dark:hover:bg-teal-200/50',
  customer: 'bg-indigo-50/90 border-indigo-200/80 hover:bg-indigo-100/80 hover:border-indigo-300 dark:bg-indigo-100/60 dark:border-indigo-300/70 dark:hover:bg-indigo-200/50',
  all: 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300 dark:bg-gray-100/70 dark:border-gray-300 dark:hover:bg-gray-200/60',
}

function SheetCell({ countryValue, domainValue, notes, onOpen, isAnimating }) {
  const domainClass = DOMAIN_COLORS[domainValue] ?? DOMAIN_COLORS.all
  const preview = notes ? (notes.trim().slice(0, 60) + (notes.length > 60 ? '…' : '')) : null

  const handleClick = () => {
    onOpen?.(countryValue, domainValue)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`sheet-cell block w-full rounded-xl border text-left shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:ring-offset-1 active:scale-[0.99] ${domainClass} ${isAnimating ? 'sheet-cell--clicked' : ''}`}
      style={{ minHeight: '112px' }}
      aria-label="Open notes"
    >
      <div className="flex min-h-[112px] items-center justify-center px-3 py-3">
        {preview ? (
          <p className="text-xs leading-relaxed text-gray-800 line-clamp-3 dark:text-gray-900" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>
            {preview}
          </p>
        ) : (
          <p className="text-xs italic text-gray-500 dark:text-gray-600" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>
            — Click to edit…
          </p>
        )}
      </div>
    </button>
  )
}
