import { useState, useRef, useEffect } from 'react'
import { COUNTRIES, DOMAIN_LABELS } from '../constants'

const STANDUP_SEPARATOR = '\n\n— — — — — — — — — — — — —\n\n'

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

  const handleNewMeeting = () => {
    const newContent = (standupLog || '') + STANDUP_SEPARATOR
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
    <div className="space-y-8">
      {/* Carnet Stand-up quotidien */}
      <section
        className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[#faf9f7] shadow-[0 1px 3px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.08)] dark:bg-[#1c1917] dark:shadow-[0 1px 3px rgba(0,0,0,0.2)]"
        aria-label="Carnet stand-up quotidien"
      >
        <div className="absolute left-0 top-0 bottom-0 w-8 border-r border-[var(--border)] bg-gradient-to-r from-[var(--border)]/30 to-transparent dark:from-[var(--border)]/20" aria-hidden />
        <div className="pl-10 pr-6 py-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-base font-semibold text-[var(--text-secondary)] tracking-tight">
              Stand-up quotidien
            </h2>
            <button
              type="button"
              onClick={handleNewMeeting}
              className="shrink-0 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-[var(--transition)] hover:bg-[var(--accent-hover)]"
            >
              + Nouvelle réunion
            </button>
          </div>
          <textarea
            ref={logRef}
            value={standupLog}
            onChange={(e) => onStandupLogChange?.(e.target.value)}
            placeholder="Cliquez sur « Nouvelle réunion » pour ajouter un séparateur, puis écrivez en dessous…"
            className="min-h-[220px] w-full resize-y rounded-lg border-0 bg-transparent px-0 py-2 text-[15px] leading-relaxed text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:ring-0"
            style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", serif' }}
            aria-label="Notes du stand-up"
          />
        </div>
      </section>

      {/* Carnet par Pays × Domaine */}
      <section
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0 1px 3px rgba(0,0,0,0.04)] dark:bg-[#1c1917]"
        aria-label="Carnet par pays et domaine"
      >
        <h2 className="mb-4 text-base font-semibold text-[var(--text-secondary)] tracking-tight">
          Carnet Pays × Domaine
        </h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          En abscisse : domaines. En ordonnée : pays. Chaque feuille est un espace de notes pour ce couple.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse">
            <thead>
              <tr>
                <th className="w-14 border-b border-r border-[var(--border)] pb-2 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Pays \ Domaine
                </th>
                {GRID_DOMAINS.map((d) => (
                  <th
                    key={d.value}
                    className="border-b border-[var(--border)] px-2 pb-2 text-center text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
                  >
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GRID_COUNTRIES.map((row) => (
                <tr key={row.value}>
                  <td className="border-b border-r border-[var(--border)] py-2 pr-2 text-xs font-medium text-[var(--text-secondary)] align-top">
                    {row.label}
                  </td>
                  {GRID_DOMAINS.map((col) => (
                    <td key={col.value} className="border-b border-[var(--border)] p-2 align-top">
                      <SheetCell
                        countryLabel={row.label}
                        domainLabel={col.label}
                        content={meetingSheets[sheetKey(row.value, col.value)] ?? ''}
                        onChange={(content) => onMeetingSheetChange?.(sheetKey(row.value, col.value), content)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function SheetCell({ countryLabel, domainLabel, content, onChange }) {
  const [local, setLocal] = useState(content)
  const isAll = countryLabel === 'All' && domainLabel === 'All'

  useEffect(() => {
    setLocal(content)
  }, [content])

  const handleBlur = () => {
    if (local !== content) onChange(local)
  }

  return (
    <div
      className="rounded-xl border border-[var(--border)] bg-[#faf9f7] shadow-[0 1px 2px rgba(0,0,0,0.03)] transition-[var(--transition)] hover:border-[var(--border-strong)] hover:shadow-[0 2px 8px rgba(0,0,0,0.04)] dark:bg-[#292524] dark:shadow-[0 1px 2px rgba(0,0,0,0.15)]"
      style={{ minHeight: '100px' }}
    >
      <div className="border-b border-[var(--border)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        {countryLabel} · {domainLabel}
      </div>
      <textarea
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={handleBlur}
        placeholder={isAll ? 'Notes globales…' : 'Notes…'}
        className="w-full resize-none rounded-b-xl border-0 bg-transparent px-3 py-2 text-xs leading-relaxed text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:ring-0"
        rows={4}
        style={{ fontFamily: 'ui-serif, Georgia, serif', minHeight: '72px' }}
        aria-label={`Notes ${countryLabel} ${domainLabel}`}
      />
    </div>
  )
}
