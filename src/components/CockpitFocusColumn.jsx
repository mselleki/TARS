import { useMemo, useState } from 'react'
import {
  isOverdue,
  daysUntilDue,
  getWaitingDays,
  sortTicketsForOverview,
} from '../utils/ticketUtils'
import { DOMAIN_LABELS, COUNTRIES, DOMAINS } from '../constants'

const DOMAIN_COLORS = {
  product:  '#FBBF24',
  vendor:   '#10B981',
  customer: '#A78BFA',
}

function classify(ticket) {
  if (isOverdue(ticket)) return 'critical'
  const days = daysUntilDue(ticket)
  if (days !== null && days === 0) return 'critical'
  if (ticket.status === 'WAITING_REPLY' && getWaitingDays(ticket) >= 3) return 'blocked'
  if (days !== null && days <= 2) return 'soon'
  if (ticket.status === 'WAITING_REPLY') return 'waiting'
  return 'active'
}

const GROUP_ORDER  = ['critical', 'blocked', 'soon', 'waiting', 'active']
const GROUP_LABELS = {
  critical: 'Action required',
  blocked:  'Long wait',
  soon:     'Due soon',
  waiting:  'Waiting reply',
  active:   'Active',
}
const GROUP_COLORS = {
  critical: 'var(--danger)',
  blocked:  'var(--warning)',
  soon:     'var(--warning)',
  waiting:  'var(--accent)',
  active:   'var(--muted)',
}

function getBadge(ticket, group) {
  if (group === 'critical') {
    if (isOverdue(ticket)) {
      const d = Math.abs(daysUntilDue(ticket) ?? 0)
      return { text: d <= 1 ? 'Overdue' : `Overdue ${d}d`, color: 'var(--danger)', bg: 'var(--danger-subtle)' }
    }
    return { text: 'Due today', color: 'var(--danger)', bg: 'var(--danger-subtle)' }
  }
  if (group === 'blocked') {
    return { text: `Waiting ${getWaitingDays(ticket)}d`, color: 'var(--warning)', bg: 'var(--warning-subtle)' }
  }
  if (group === 'soon') {
    const d = daysUntilDue(ticket)
    return { text: d === 1 ? 'Tomorrow' : `${d}d`, color: 'var(--warning)', bg: 'var(--warning-subtle)' }
  }
  if (group === 'waiting') {
    return { text: `${getWaitingDays(ticket)}d`, color: 'var(--accent)', bg: 'var(--accent-subtle)' }
  }
  return null
}

/* ── Single ticket row ── */
function TicketRow({ ticket, onMarkDone, onSetWaiting, onAddFollowUp, onSetDueDate, onDelete }) {
  const [showDuePicker, setShowDuePicker] = useState(false)
  const group = classify(ticket)
  const badge = getBadge(ticket, group)
  const domainColor = DOMAIN_COLORS[ticket.domain] ?? 'var(--border)'
  const country = COUNTRIES.find(c => c.value === ticket.countryId)
  const todayStr = new Date().toISOString().slice(0, 10)
  const isCritical = group === 'critical'

  return (
    <li
      className="group relative flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-2)]"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {/* Urgency left bar */}
      {group !== 'active' && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: GROUP_COLORS[group] }}
        />
      )}

      {/* Domain dot */}
      <span
        className="mt-[3px] h-2 w-2 shrink-0 rounded-full"
        style={{ background: domainColor }}
        title={DOMAIN_LABELS[ticket.domain]}
      />

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Owner + summary */}
        <div className="flex min-w-0 items-baseline gap-1.5">
          <span
            className="shrink-0 text-[13px] font-semibold"
            style={{ color: isCritical ? GROUP_COLORS.critical : 'var(--text)' }}
          >
            {ticket.owner || <span style={{ color: 'var(--muted)' }}>No owner</span>}
          </span>
          {ticket.summary && (
            <span className="min-w-0 truncate text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              · {ticket.summary}
            </span>
          )}
        </div>
        {/* REQ ID + country — secondary line */}
        <div className="mt-0.5 flex items-center gap-2">
          <span className="font-mono text-[10px]" style={{ color: 'var(--muted-2)' }}>
            {ticket.id}
          </span>
          {country && (
            <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
              {country.label}
            </span>
          )}
        </div>
      </div>

      {/* Badge */}
      {badge && (
        <span
          className="mt-0.5 shrink-0 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-semibold"
          style={{ background: badge.bg, color: badge.color }}
        >
          {badge.text}
        </span>
      )}

      {/* Actions (hover) */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onMarkDone(ticket.id)}
          title="Mark done"
          className="rounded p-1 text-[var(--success)] hover:bg-[var(--success-subtle)]"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </button>
        {ticket.status !== 'WAITING_REPLY' ? (
          <button
            type="button"
            onClick={() => onSetWaiting(ticket.id)}
            title="Set waiting"
            className="rounded p-1 text-[var(--accent)] hover:bg-[var(--accent-subtle)]"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onAddFollowUp(ticket.id)}
            title="Follow-up"
            className="rounded p-1 text-[var(--muted)] hover:bg-[var(--surface-2)]"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
        {showDuePicker ? (
          <input
            type="date"
            defaultValue={ticket.dueAt ? new Date(ticket.dueAt).toISOString().slice(0, 10) : todayStr}
            onChange={(e) => { if (e.target.value) onSetDueDate(ticket.id, new Date(e.target.value).getTime()); setShowDuePicker(false) }}
            onBlur={() => setShowDuePicker(false)}
            className="w-28 rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] outline-none"
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowDuePicker(true)}
            title="Set due date"
            className="rounded p-1 text-[var(--muted)] hover:bg-[var(--surface-2)]"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(ticket.id)}
          title="Delete"
          className="rounded p-1 text-[var(--muted)] hover:bg-[var(--danger-subtle)] hover:text-[var(--danger)]"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </li>
  )
}

/* ── Main export ── */
export function CockpitFocusColumn({
  tickets = [],
  filters = {},
  onFiltersChange,
  onMarkDone,
  onSetWaiting,
  onAddFollowUp,
  onSetDueDate,
  onDelete,
}) {
  const allActive = useMemo(() => tickets.filter(t => t.status !== 'DONE'), [tickets])

  const filtered = useMemo(() => {
    let list = [...allActive]
    if (filters.domain)    list = list.filter(t => t.domain === filters.domain)
    if (filters.countryId) list = list.filter(t => t.countryId === filters.countryId)
    if (filters.owner)     list = list.filter(t => (t.owner || '').toLowerCase().includes(filters.owner.toLowerCase()))
    return sortTicketsForOverview(list)
  }, [allActive, filters])

  const grouped = useMemo(() => {
    const g = { critical: [], blocked: [], soon: [], waiting: [], active: [] }
    filtered.forEach(t => g[classify(t)].push(t))
    return g
  }, [filtered])

  const criticalCount = grouped.critical.length + grouped.blocked.length
  const waitingCount = grouped.waiting.length
  const hasFilters = !!(filters.domain || filters.countryId || filters.owner)

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <section aria-label="Focus cockpit">

      {/* ── Stats header ── */}
      <div className="mb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.09em]" style={{ color: 'var(--muted)' }}>
          {dateLabel}
        </p>

        {/* Stat row */}
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1">
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-black leading-none"
              style={{ fontSize: '38px', letterSpacing: '-0.04em', color: 'var(--text)' }}
            >
              {allActive.length}
            </span>
            <span className="text-[13px]" style={{ color: 'var(--muted)' }}>active</span>
          </div>

          {criticalCount > 0 && (
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-black leading-none" style={{ color: 'var(--danger)', letterSpacing: '-0.03em' }}>
                {criticalCount}
              </span>
              <span className="text-[12px] font-medium" style={{ color: 'var(--danger)' }}>urgent</span>
            </div>
          )}

          {waitingCount > 0 && (
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-black leading-none" style={{ color: 'var(--accent)', letterSpacing: '-0.03em' }}>
                {waitingCount}
              </span>
              <span className="text-[12px] font-medium" style={{ color: 'var(--accent)' }}>waiting</span>
            </div>
          )}

          {criticalCount === 0 && allActive.length > 0 && (
            <span className="text-[12px]" style={{ color: 'var(--muted)' }}>No urgent issues</span>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <select
          value={filters.domain ?? ''}
          onChange={e => onFiltersChange({ ...filters, domain: e.target.value || null })}
          className={`input-glass rounded-[var(--radius-full)] px-2.5 py-1 text-[11px] ${filters.domain ? 'border-[var(--accent-ring)] text-[var(--accent)]' : ''}`}
          aria-label="Domain"
        >
          <option value="">Domain</option>
          {DOMAINS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <select
          value={filters.countryId ?? ''}
          onChange={e => onFiltersChange({ ...filters, countryId: e.target.value || null })}
          className={`input-glass rounded-[var(--radius-full)] px-2.5 py-1 text-[11px] ${filters.countryId ? 'border-[var(--accent-ring)] text-[var(--accent)]' : ''}`}
          aria-label="Country"
        >
          <option value="">Country</option>
          {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input
          type="text"
          value={filters.owner ?? ''}
          onChange={e => onFiltersChange({ ...filters, owner: e.target.value || null })}
          placeholder="Owner"
          className={`input-glass w-20 rounded-[var(--radius-full)] px-2.5 py-1 text-[11px] ${filters.owner ? 'border-[var(--accent-ring)] text-[var(--accent)]' : ''}`}
          aria-label="Owner"
        />
        {hasFilters && (
          <button
            type="button"
            onClick={() => onFiltersChange({ domain: null, countryId: null, owner: null })}
            className="text-[11px] transition-colors hover:text-[var(--text)]"
            style={{ color: 'var(--muted)' }}
          >
            ✕ Reset
          </button>
        )}
      </div>

      {/* ── Ticket list ── */}
      {filtered.length === 0 ? (
        <div
          className="rounded-[var(--radius-xl)] py-12 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p
            className="font-black"
            style={{ fontSize: '24px', letterSpacing: '-0.04em', color: 'var(--success)' }}
          >
            All clear
          </p>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--muted)' }}>
            {hasFilters ? 'No tickets match these filters.' : 'No active tickets.'}
          </p>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-[var(--radius-xl)]"
          style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
          {GROUP_ORDER.map(group => {
            const list = grouped[group]
            if (list.length === 0) return null
            const color = GROUP_COLORS[group]
            return (
              <div key={group}>
                {/* Group divider */}
                <div
                  className="flex items-center gap-2.5 px-4 py-2"
                  style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color }} />
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.09em]"
                    style={{ color }}
                  >
                    {GROUP_LABELS[group]}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{list.length}</span>
                </div>
                {/* Rows */}
                <ul style={{ background: 'var(--surface)' }}>
                  {list.map((ticket, i) => (
                    <TicketRow
                      key={ticket.id}
                      ticket={ticket}
                      onMarkDone={onMarkDone}
                      onSetWaiting={onSetWaiting}
                      onAddFollowUp={onAddFollowUp}
                      onSetDueDate={onSetDueDate}
                      onDelete={onDelete}
                    />
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
