import { useMemo, memo, useState } from 'react'
import {
  sortTicketsForOverview,
  getWaitingDays,
  isOverdue,
  daysUntilDue,
} from '../utils/ticketUtils'
import { DOMAIN_LABELS, COUNTRIES } from '../constants'

const NOW = Date.now()

function TicketBadges({ ticket }) {
  const badges = []
  if (ticket.status === 'DONE') return null

  if (isOverdue(ticket)) {
    badges.push({ key: 'overdue', label: 'Overdue', cls: 'bg-[var(--danger-subtle)] text-[var(--danger)]' })
  } else {
    const due = daysUntilDue(ticket)
    if (due != null && due <= 2 && due >= 0) {
      badges.push({ key: 'due', label: `Due in ${due}d`, cls: 'bg-[var(--warning-subtle)] text-[var(--warning)]' })
    } else if (due != null && due < 0) {
      badges.push({ key: 'overdue', label: 'Overdue', cls: 'bg-[var(--danger-subtle)] text-[var(--danger)]' })
    }
  }

  if (ticket.status === 'WAITING_REPLY') {
    const w = getWaitingDays(ticket)
    badges.push({
      key: 'waiting',
      label: w === 0 ? 'Waiting today' : `Waiting ${w}d`,
      cls: 'bg-[var(--accent-subtle)] text-[var(--accent)]',
    })
  }

  if (ticket.status !== 'DONE' && !ticket.lastFollowUpAt && ticket.status === 'WAITING_REPLY') {
    badges.push({ key: 'nofollow', label: 'No follow-up', cls: 'bg-[var(--bg)] text-[var(--muted)] border border-[var(--border)]' })
  }

  if (badges.length === 0) return null
  return (
    <span className="flex flex-wrap gap-1">
      {badges.map((b) => (
        <span
          key={b.key}
          className={`rounded-[var(--radius-sm)] px-2 py-0.5 text-[10px] font-medium ${b.cls}`}
        >
          {b.label}
        </span>
      ))}
    </span>
  )
}

function TicketRowActions({ ticket, onMarkDone, onSetWaiting, onAddFollowUp, onSetDueDate }) {
  const [showDuePicker, setShowDuePicker] = useState(false)
  if (ticket.status === 'DONE') return null

  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      {ticket.status !== 'DONE' && (
        <button
          type="button"
          onClick={() => onMarkDone(ticket.id)}
          className="rounded p-1.5 text-[var(--success)] hover:bg-[var(--success-subtle)]"
          title="Mark done"
          aria-label="Mark done"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      )}
      {ticket.status !== 'WAITING_REPLY' && (
        <button
          type="button"
          onClick={() => onSetWaiting(ticket.id)}
          className="rounded p-1.5 text-[var(--accent)] hover:bg-[var(--accent-subtle)]"
          title="Set Waiting Reply"
          aria-label="Set waiting reply"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}
      {ticket.status === 'WAITING_REPLY' && (
        <button
          type="button"
          onClick={() => onAddFollowUp(ticket.id)}
          className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
          title="Add follow-up"
          aria-label="Add follow-up"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}
      {showDuePicker ? (
        <span className="flex items-center gap-1">
          <input
            type="date"
            defaultValue={ticket.dueAt ? new Date(ticket.dueAt).toISOString().slice(0, 10) : todayStr}
            onChange={(e) => {
              const v = e.target.value
              if (v) onSetDueDate(ticket.id, new Date(v).getTime())
              setShowDuePicker(false)
            }}
            onBlur={() => setShowDuePicker(false)}
            className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] w-28"
            autoFocus
          />
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setShowDuePicker(true)}
          className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
          title="Set due date"
          aria-label="Set due date"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      )}
    </div>
  )
}

const TicketRow = memo(function TicketRow({
  ticket,
  onMarkDone,
  onSetWaiting,
  onAddFollowUp,
  onSetDueDate,
  onDelete,
}) {
  const domainLabel = DOMAIN_LABELS[ticket.domain] ?? ticket.domain
  const countryLabel = COUNTRIES.find((c) => c.value === ticket.countryId)?.label
  const createdAtLabel = ticket.createdAtDate
    ? new Date(ticket.createdAtDate + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <li
      className="group flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition-[var(--transition)] hover:border-[var(--border-strong)]"
      data-ticket-id={ticket.id}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold text-[var(--text)]">{ticket.id}</span>
          {ticket.scope === 'PERSO' && (
            <span className="rounded px-1.5 py-0.5 text-[10px] text-[var(--muted)] border border-[var(--border)]">
              Perso
            </span>
          )}
          {ticket.status === 'DONE' && (
            <span className="text-[var(--success)]">✓</span>
          )}
          <TicketBadges ticket={ticket} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
          {createdAtLabel && <span>Created on {createdAtLabel}</span>}
          {domainLabel && <span>· {domainLabel}</span>}
          {ticket.owner && <span>· {ticket.owner}</span>}
          {countryLabel && <span>· {countryLabel}</span>}
        </div>
        {ticket.summary && (
          <p className="text-sm text-[var(--text-secondary)]">{ticket.summary}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <TicketRowActions
          ticket={ticket}
          onMarkDone={onMarkDone}
          onSetWaiting={onSetWaiting}
          onAddFollowUp={onAddFollowUp}
          onSetDueDate={onSetDueDate}
        />
        <button
          type="button"
          onClick={() => onDelete(ticket.id)}
          className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--danger-subtle)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete"
          aria-label="Delete"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </li>
  )
})

export function TicketList({
  tickets,
  searchQuery = '',
  scopeFilter = 'PRO',
  filters = {},
  onMarkDone,
  onSetWaiting,
  onAddFollowUp,
  onSetDueDate,
  onDelete,
}) {
  const filtered = useMemo(() => {
    let list = tickets.filter((t) => t.scope === scopeFilter)
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (t) =>
          (t.id || '').toLowerCase().includes(q) ||
          (t.owner || '').toLowerCase().includes(q) ||
          (t.summary || '').toLowerCase().includes(q) ||
          (t.domain || '').toLowerCase().includes(q)
      )
    }
    if (filters.domain) list = list.filter((t) => t.domain === filters.domain)
    if (filters.owner) list = list.filter((t) => (t.owner || '').toLowerCase().includes(filters.owner.toLowerCase()))
    if (filters.countryId) list = list.filter((t) => t.countryId === filters.countryId)
    return sortTicketsForOverview(list)
  }, [tickets, searchQuery, scopeFilter, filters])

  return (
    <ul className="space-y-2">
      {filtered.map((ticket) => (
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
  )
}
