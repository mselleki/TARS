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
  const dateLabel = now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  return `\n\n────────────────────────────────────────\n  Nouvelle réunion · ${dateLabel}\n────────────────────────────────────────\n\n`
}

function sheetKey(countryId, domain) {
  return `${countryId}|${domain}`
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
      {/* Carnet Stand-up quotidien */}
      <section
        className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[#fdfcfa] shadow-[0 2px 8px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.08)] dark:bg-[#f5f3f0] dark:text-gray-900 dark:border-gray-300"
        aria-label="Carnet stand-up quotidien"
      >
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-indigo-200/50 via-indigo-100/30 to-transparent dark:from-indigo-300/40 dark:via-indigo-200/20" aria-hidden />
        <div className="pl-12 pr-6 py-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-lg font-semibold text-gray-800 tracking-tight dark:text-gray-900">
              Stand-up quotidien
            </h2>
            <button
              type="button"
              onClick={handleNewMeeting}
              className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-900/20 transition-[var(--transition)] hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-900/25"
            >
              + Nouvelle réunion
            </button>
          </div>
          <textarea
            ref={logRef}
            value={standupLog}
            onChange={(e) => onStandupLogChange?.(e.target.value)}
            placeholder="Cliquez sur « Nouvelle réunion » pour insérer un bloc daté, puis écrivez en dessous…"
            className="min-h-[240px] w-full resize-y rounded-lg border-0 bg-transparent px-0 py-2 text-[15px] leading-[1.7] text-gray-900 placeholder:text-gray-500 outline-none focus:ring-0 dark:text-gray-900 dark:placeholder:text-gray-600"
            style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", serif' }}
            aria-label="Notes du stand-up"
          />
        </div>
      </section>

      {/* Carnet par Pays × Domaine */}
      <section
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0 2px 8px rgba(0,0,0,0.04)] dark:bg-[var(--surface)] dark:shadow-[0 2px 12px rgba(0,0,0,0.15)]"
        aria-label="Carnet par pays et domaine"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[var(--text)] tracking-tight">
            Carnet Pays × Domaine
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            En abscisse : domaines. En ordonnée : pays.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 p-3">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr>
                <th className="w-16 rounded-t-lg bg-[var(--surface)] px-3 py-3 text-left text-xs font-medium text-[var(--muted)]">
                  Pays \ Domaine
                </th>
                {GRID_DOMAINS.map((d) => (
                  <th
                    key={d.value}
                    className={`px-2 py-3 text-center text-xs font-semibold ${
                      d.value === 'product' ? 'text-amber-700 dark:text-amber-400' :
                      d.value === 'vendor' ? 'text-teal-700 dark:text-teal-400' :
                      d.value === 'customer' ? 'text-indigo-700 dark:text-indigo-400' :
                      'text-[var(--text-secondary)]'
                    }`}
                  >
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GRID_COUNTRIES.map((row, rowIndex) => (
                <tr key={row.value}>
                  <td className="rounded-l-lg bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] align-top">
                    {row.label}
                  </td>
                  {GRID_DOMAINS.map((col) => (
                    <td key={col.value} className="p-2 align-top">
                      <SheetCell
                        countryLabel={row.label}
                        domainLabel={col.label}
                        countryValue={row.value}
                        domainValue={col.value}
                        content={meetingSheets[sheetKey(row.value, col.value)] ?? ''}
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
      {selectedSheet && (
        <>
          <div
            className="panel-backdrop-in fixed inset-0 z-30 bg-black/25 backdrop-blur-[2px]"
            aria-hidden
            onClick={() => setSelectedSheet(null)}
          />
          <aside
            className="panel-slide-in fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-xl"
            aria-label="Notes Pays × Domaine"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <h3 className="text-base font-semibold text-[var(--text)]">
                {GRID_COUNTRIES.find((c) => c.value === selectedSheet.country)?.label ?? selectedSheet.country} · {GRID_DOMAINS.find((d) => d.value === selectedSheet.domain)?.label ?? selectedSheet.domain}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedSheet(null)}
                className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
                aria-label="Fermer"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <textarea
                value={meetingSheets[sheetKey(selectedSheet.country, selectedSheet.domain)] ?? ''}
                onChange={(e) => onMeetingSheetChange?.(sheetKey(selectedSheet.country, selectedSheet.domain), e.target.value)}
                placeholder="Notes…"
                className="min-h-[280px] w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 px-4 py-3 text-sm leading-relaxed text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]/30"
                style={{ fontFamily: 'ui-serif, Georgia, serif' }}
                aria-label="Notes"
                autoFocus
              />
            </div>
          </aside>
        </>
      )}
    </div>
  )
}

const DOMAIN_COLORS = {
  product: 'border-l-amber-500/70 bg-amber-50/50 dark:bg-amber-950/20 dark:border-l-amber-400/50',
  vendor: 'border-l-teal-500/70 bg-teal-50/50 dark:bg-teal-950/20 dark:border-l-teal-400/50',
  customer: 'border-l-indigo-500/70 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-l-indigo-400/50',
  all: 'border-l-[var(--border-strong)] bg-[var(--surface)]',
}

function SheetCell({ countryLabel, domainLabel, countryValue, domainValue, content, onOpen, isAnimating }) {
  const domainClass = DOMAIN_COLORS[domainValue] ?? DOMAIN_COLORS.all
  const preview = content ? (content.trim().slice(0, 60) + (content.length > 60 ? '…' : '')) : null

  const handleClick = () => {
    onOpen?.(countryValue, domainValue)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`sheet-cell block w-full rounded-xl border border-[var(--border)] border-l-4 text-left shadow-sm transition-[var(--transition)] hover:shadow-md hover:border-[var(--accent)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:ring-offset-1 dark:shadow-none ${domainClass} ${isAnimating ? 'sheet-cell--clicked' : ''}`}
      style={{ minHeight: '108px' }}
      aria-label={`Ouvrir notes ${countryLabel} ${domainLabel}`}
    >
      <div className="border-b border-[var(--border)]/60 px-3 py-2 text-[11px] font-medium text-[var(--text-secondary)]">
        {countryLabel} · {domainLabel}
      </div>
      <div className="px-3 py-2.5">
        {preview ? (
          <p className="text-xs leading-relaxed text-[var(--text)] line-clamp-3" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>
            {preview}
          </p>
        ) : (
          <p className="text-xs text-[var(--muted)]" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>
            Cliquer pour éditer…
          </p>
        )}
      </div>
    </button>
  )
}
