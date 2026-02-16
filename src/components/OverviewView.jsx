import { useMemo } from 'react'
import { TicketCaptureForm } from './TicketCaptureForm'
import { TicketList } from './TicketList'
import { DOMAIN_LABELS, BUSINESSES } from '../constants'

const GHOST_TICKETS = [
  {
    id: 'REQ123456',
    business: 'sysco',
    domain: 'product',
    owner: 'Marie D.',
    summary: 'Validation specs for new API',
    status: 'WAITING_REPLY',
    scope: 'PRO',
    lastFollowUpAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
  {
    id: 'REQ789012',
    business: 'sysco',
    domain: 'vendor',
    owner: 'Thomas L.',
    summary: 'Quote for Q2 equipment',
    status: 'ACTIONABLE',
    scope: 'PRO',
    lastFollowUpAt: null,
    dueAt: Date.now() + 2 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
  },
]

function GhostTicketRow({ ticket }) {
  const businessLabel = BUSINESSES.find((b) => b.id === ticket.business)?.label ?? ticket.business
  const domainLabel = DOMAIN_LABELS[ticket.domain] ?? ticket.domain

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)]/50 px-4 py-3 opacity-75">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold text-[var(--muted)]">{ticket.id}</span>
          <span className="rounded-[var(--radius-sm)] bg-[var(--accent-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
            Waiting 3d
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
          {businessLabel && <span>{businessLabel}</span>}
          {domainLabel && <span>· {domainLabel}</span>}
          {ticket.owner && <span>· {ticket.owner}</span>}
        </div>
        {ticket.summary && (
          <p className="text-sm text-[var(--text-secondary)]">{ticket.summary}</p>
        )}
      </div>
    </li>
  )
}

function EmptyStateWithGhosts() {
  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
        <p className="text-sm text-[var(--text-secondary)]">
          Track REQ tickets with owners and follow-ups so nothing gets lost.
        </p>
      </div>
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          Example structure
        </p>
        <ul className="space-y-2">
          <GhostTicketRow ticket={GHOST_TICKETS[0]} />
          <GhostTicketRow ticket={GHOST_TICKETS[1]} />
        </ul>
      </div>
    </div>
  )
}

export function OverviewView({
  reqTickets = [],
  searchQuery = '',
  scopeFilter = 'PRO',
  filters = {},
  onAddReqTicket,
  onUpdateReqTicket,
  onDeleteReqTicket,
}) {
  const visibleTickets = useMemo(() => {
    return reqTickets.filter((t) => t.scope === scopeFilter)
  }, [reqTickets, scopeFilter])

  const existingOwners = useMemo(() => {
    return reqTickets.map((t) => t.owner).filter(Boolean)
  }, [reqTickets])

  const handleMarkDone = (id) => {
    onUpdateReqTicket?.(id, { status: 'DONE' })
  }

  const handleSetWaiting = (id) => {
    onUpdateReqTicket?.(id, { status: 'WAITING_REPLY' })
  }

  const handleAddFollowUp = (id) => {
    onUpdateReqTicket?.(id, { lastFollowUpAt: Date.now() })
  }

  const handleSetDueDate = (id, dueAt) => {
    onUpdateReqTicket?.(id, { dueAt })
  }

  const hasTickets = visibleTickets.length > 0
  const showEmptyState = !hasTickets

  return (
    <div className="space-y-6">
      <section
        className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
        aria-label="Add ticket"
      >
        <h2 className="mb-4 text-sm font-semibold text-[var(--text-secondary)]">
          Add ticket
        </h2>
        <TicketCaptureForm
          onSubmit={(payload) => {
            onAddReqTicket?.(payload)
          }}
          scope={scopeFilter}
          existingOwners={existingOwners}
          initialFocus
        />
      </section>

      <section aria-label="Tickets">
        {showEmptyState ? (
          <EmptyStateWithGhosts />
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
                Tickets
              </h2>
              <span className="text-xs text-[var(--muted)]">
                {visibleTickets.length} ticket{visibleTickets.length !== 1 ? 's' : ''}
              </span>
            </div>
            <TicketList
              tickets={reqTickets}
              searchQuery={searchQuery}
              scopeFilter={scopeFilter}
              filters={filters}
              onMarkDone={handleMarkDone}
              onSetWaiting={handleSetWaiting}
              onAddFollowUp={handleAddFollowUp}
              onSetDueDate={handleSetDueDate}
              onDelete={onDeleteReqTicket}
            />
          </>
        )}
      </section>
    </div>
  )
}
