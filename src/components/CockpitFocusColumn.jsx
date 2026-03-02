import { useMemo, useState } from 'react'
import {
  isOverdue,
  daysUntilDue,
  getWaitingDays,
  sortTicketsForOverview,
} from '../utils/ticketUtils'
import { DOMAIN_LABELS, COUNTRIES, DOMAINS } from '../constants'

/* ── Domain colors ── */
const DOMAIN_COLORS = {
  product:  '#FBBF24',
  vendor:   '#10B981',
  customer: '#A78BFA',
}

/* ── Urgency classification ── */
function classify(ticket) {
  if (isOverdue(ticket)) return 'critical'
  const days = daysUntilDue(ticket)
  if (days !== null && days === 0) return 'critical'        // due today
  if (ticket.status === 'WAITING_REPLY' && getWaitingDays(ticket) >= 3) return 'blocked'
  if (days !== null && days <= 2) return 'soon'
  if (ticket.status === 'WAITING_REPLY') return 'waiting'
  return 'active'
}

const GROUP_ORDER = ['critical', 'blocked', 'soon', 'waiting', 'active']

const GROUP_META = {
  critical: { label: 'Action required', color: 'var(--danger)' },
  blocked:  { label: 'Long wait',       color: 'var(--warning)' },
  soon:     { label: 'Due soon',        color: 'var(--warning)' },
  waiting:  { label: 'Waiting reply',   color: 'var(--accent)' },
  active:   { label: 'Active',          color: 'var(--muted)' },
}

function getBadge(ticket, group) {
  if (group === 'critical') {
    if (isOverdue(ticket)) {
      const days = Math.abs(daysUntilDue(ticket))
      return { text: days <= 1 ? 'Overdue 1d' : `Overdue ${days}d`, variant: 'danger' }
    }
    return { text: 'Due today', variant: 'danger' }
  }
  if (group === 'soon') {
    const d = daysUntilDue(ticket)
    return { text: d === 1 ? 'Tomorrow' : `In ${d}d`, variant: 'warning' }
  }
  if (group === 'blocked') {
    return { text: `Waiting ${getWaitingDays(ticket)}d`, variant: 'warning' }
  }
  if (group === 'waiting') {
    return { text: `Waiting ${getWaitingDays(ticket)}d`, variant: 'accent' }
  }
  return null
}

const BADGE_STYLES = {
  danger:  { bg: 'var(--danger-subtle)',  color: 'var(--danger)' },
  warning: { bg: 'var(--warning-subtle)', color: 'var(--warning)' },
  accent:  { bg: 'var(--accent-subtle)',  color: 'var(--accent)' },
}

/* ── Group header ── */
function GroupHeader({ group, count }) {
  const meta = GROUP_META[group]
  return (
    <div className="flex items-center gap-2 px-4 pb-1 pt-4">
      <span
        className="text-[10px] font-bold uppercase tracking-[0.1em]"
        style={{ color: meta.color }}
      >
        {meta.label}
      </span>
      <span
        className="flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold"
        style={{ background: meta.color + '22', color: meta.color }}
      >
        {count}
      </span>
    </div>
  )
}

/* ── Ticket row ── */
function TicketRow({ ticket, onMarkDone, onSetWaiting, onAddFollowUp, onSetDueDate, onDelete }) {
  const [showDuePicker, setShowDuePicker] = useState(false)
  const group = classify(ticket)
  const meta = GROUP_META[group]
  const badge = getBadge(ticket, group)
  const domainColor = DOMAIN_COLORS[ticket.domain]
  const country = COUNTRIES.find(c => c.value === ticket.countryId)
  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <li
      className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--surface-2)]"
      style={{
        borderBottom: '1px solid var(--border)',
        borderLeft: `3px solid ${group === 'active' ? 'transparent' : meta.color}`,
      }}
    >
      {/* REQ ID */}
      <span
        className="shrink-0 font-mono text-[12px] font-bold"
        style={{ color: 'var(--text)', minWidth: '82px' }}
      >
        {ticket.id}
      </span>

      {/* Domain dot */}
      {domainColor && (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: domainColor }}
          title={DOMAIN_LABELS[ticket.domain]}
        />
      )}

      {/* Country */}
      <span
        className="shrink-0 font-mono text-[11px]"
        style={{ color: 'var(--muted)', minWidth: '22px' }}
      >
        {country?.label ?? '—'}
      </span>

      {/* Owner + summary */}
      <span className="min-w-0 flex-1 truncate text-[12px]" style={{ color: 'var(--text-secondary)' }}>
        {ticket.owner
          ? <>{ticket.owner}{ticket.summary && <span style={{ color: 'var(--muted)' }}> · {ticket.summary}</span>}</>
          : <span style={{ color: 'var(--muted-2)' }}>—</span>
        }
      </span>

      {/* Badge */}
      {badge && (
        <span
          className="shrink-0 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-semibold"
          style={BADGE_STYLES[badge.variant]}
        >
          {badge.text}
        </span>
      )}

      {/* Actions (hover) */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        {/* Mark done */}
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

        {/* Wait / Follow-up */}
        {ticket.status !== 'WAITING_REPLY' ? (
          <button
            type="button"
            onClick={() => onSetWaiting(ticket.id)}
            title="Set waiting reply"
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
            title="Add follow-up"
            className="rounded p-1 text-[var(--muted)] hover:bg-[var(--surface-2)]"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}

        {/* Due date */}
        {showDuePicker ? (
          <input
            type="date"
            defaultValue={ticket.dueAt ? new Date(ticket.dueAt).toISOString().slice(0, 10) : todayStr}
            onChange={(e) => {
              if (e.target.value) onSetDueDate(ticket.id, new Date(e.target.value).getTime())
              setShowDuePicker(false)
            }}
            onBlur={() => setShowDuePicker(false)}
            className="w-28 rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] outline-none"
            style={{ background: 'var(--surface)' }}
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

        {/* Delete */}
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
  const totalActive = useMemo(
    () => tickets.filter(t => t.status !== 'DONE').length,
    [tickets]
  )

  const filtered = useMemo(() => {
    let list = tickets.filter(t => t.status !== 'DONE')
    if (filters.domain)    list = list.filter(t => t.domain === filters.domain)
    if (filters.countryId) list = list.filter(t => t.countryId === filters.countryId)
    if (filters.owner)     list = list.filter(t => (t.owner || '').toLowerCase().includes(filters.owner.toLowerCase()))
    return sortTicketsForOverview(list)
  }, [tickets, filters])

  const grouped = useMemo(() => {
    const g = { critical: [], blocked: [], soon: [], waiting: [], active: [] }
    filtered.forEach(t => g[classify(t)].push(t))
    return g
  }, [filtered])

  const criticalCount = grouped.critical.length
  const hasFilters = !!(filters.domain || filters.countryId || filters.owner)

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <section aria-label="Focus cockpit">

      {/* ── Header ── */}
      <div className="mb-5 flex items-start justify-between gap-4">

        {/* Big stat */}
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.09em]"
            style={{ color: 'var(--muted)' }}
          >
            {dateLabel}
          </p>
          <div className="mt-1 flex items-baseline gap-3">
            <span
              className="font-black leading-none"
              style={{
                fontSize: '54px',
                letterSpacing: '-0.05em',
                color: criticalCount > 0 ? 'var(--danger)' : totalActive === 0 ? 'var(--success)' : 'var(--text)',
              }}
            >
              {totalActive}
            </span>
            <div className="pb-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)', letterSpacing: '-0.01em' }}>
                active tickets
              </p>
              {criticalCount > 0 ? (
                <p className="text-[12px] font-semibold" style={{ color: 'var(--danger)' }}>
                  {criticalCount} need{criticalCount === 1 ? 's' : ''} action now
                </p>
              ) : totalActive > 0 ? (
                <p className="text-[12px]" style={{ color: 'var(--muted)' }}>No urgent issues</p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <select
            value={filters.domain ?? ''}
            onChange={e => onFiltersChange({ ...filters, domain: e.target.value || null })}
            className={`input-glass rounded-[var(--radius-full)] px-2.5 py-1 text-[11px] ${filters.domain ? 'border-[var(--accent-ring)] text-[var(--accent)]' : ''}`}
            aria-label="Filter by domain"
          >
            <option value="">Domain</option>
            {DOMAINS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <select
            value={filters.countryId ?? ''}
            onChange={e => onFiltersChange({ ...filters, countryId: e.target.value || null })}
            className={`input-glass rounded-[var(--radius-full)] px-2.5 py-1 text-[11px] ${filters.countryId ? 'border-[var(--accent-ring)] text-[var(--accent)]' : ''}`}
            aria-label="Filter by country"
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
            aria-label="Filter by owner"
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
      </div>

      {/* ── Ticket list ── */}
      {filtered.length === 0 ? (
        <div
          className="rounded-[var(--radius-xl)] p-10 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p
            className="font-black"
            style={{ fontSize: '28px', letterSpacing: '-0.04em', color: 'var(--success)' }}
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
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
        >
          {GROUP_ORDER.map(group => {
            const list = grouped[group]
            if (list.length === 0) return null
            return (
              <div key={group}>
                <GroupHeader group={group} count={list.length} />
                <ul>
                  {list.map(ticket => (
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
          {/* Last row: no bottom border */}
          <div className="h-2" />
        </div>
      )}
    </section>
  )
}
