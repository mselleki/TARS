import { useState, useRef, useEffect } from 'react'

export function TicketsView({
  tickets = [],
  context,
  onAdd,
  onUpdate,
  onDelete,
  onResolve,
}) {
  const [ref, setRef] = useState('')
  const [reason, setReason] = useState('')
  const refInputRef = useRef(null)

  const proTickets = tickets.filter((t) => t.context === 'pro')
  const openTickets = proTickets.filter((t) => !t.resolvedAt)
  const resolvedTickets = proTickets.filter((t) => t.resolvedAt)

  useEffect(() => {
    refInputRef.current?.focus()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const r = ref.trim()
    if (!r) return
    onAdd?.({ ref: r, reason: reason.trim(), context: 'pro' })
    setRef('')
    setReason('')
    refInputRef.current?.focus()
  }

  if (context !== 'pro') {
    return (
      <div className="mx-auto max-w-md rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <p className="text-sm text-[var(--muted)]">
          Passez en contexte <strong>Pro</strong> pour suivre vos tickets tech.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
        <h2 className="mb-3 text-sm font-semibold text-[var(--text)]">Nouveau ticket à suivre</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="ticket-ref" className="mb-1 block text-xs font-medium text-[var(--muted)]">
              Référence ticket
            </label>
            <input
              ref={refInputRef}
              id="ticket-ref"
              type="text"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="ex: JIRA-123, GH-45"
              className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-ring)]"
            />
          </div>
          <div>
            <label htmlFor="ticket-reason" className="mb-1 block text-xs font-medium text-[var(--muted)]">
              Raison du follow-up
            </label>
            <input
              id="ticket-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ex: Blocage prod, promis pour mardi"
              className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-ring)]"
            />
          </div>
          <button
            type="submit"
            disabled={!ref.trim()}
            className="rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-[var(--transition)] hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            Ajouter
          </button>
        </form>
      </div>

      {openTickets.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            À suivre ({openTickets.length})
          </h3>
          <ul className="space-y-2">
            {openTickets.map((t) => (
              <TicketItem
                key={t.id}
                ticket={t}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onResolve={onResolve}
              />
            ))}
          </ul>
        </section>
      )}

      {resolvedTickets.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Suivis ({resolvedTickets.length})
          </h3>
          <ul className="space-y-2">
            {resolvedTickets
              .sort((a, b) => (b.resolvedAt ?? 0) - (a.resolvedAt ?? 0))
              .map((t) => (
                <TicketItem
                  key={t.id}
                  ticket={t}
                  resolved
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onResolve={onResolve}
                />
              ))}
          </ul>
        </section>
      )}

      {proTickets.length === 0 && (
        <p className="py-6 text-center text-sm text-[var(--muted)]">
          Aucun ticket enregistré. Ajoutez vos tickets tech et la raison du follow-up pour ne pas oublier.
        </p>
      )}
    </div>
  )
}

function TicketItem({ ticket, resolved, onUpdate, onDelete, onResolve }) {
  const [editing, setEditing] = useState(false)
  const [editRef, setEditRef] = useState(ticket.ref)
  const [editReason, setEditReason] = useState(ticket.reason)

  const handleSave = () => {
    onUpdate?.(ticket.id, { ref: editRef.trim(), reason: editReason.trim() })
    setEditing(false)
  }

  return (
    <li
      className={`group flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-sm)] transition-[var(--transition)] ${
        resolved ? 'opacity-70' : ''
      }`}
    >
      {editing ? (
        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="text"
            value={editRef}
            onChange={(e) => setEditRef(e.target.value)}
            placeholder="Référence"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-sm"
          />
          <input
            type="text"
            value={editReason}
            onChange={(e) => setEditReason(e.target.value)}
            placeholder="Raison"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="text-xs font-medium text-[var(--accent)] hover:underline"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs text-[var(--muted)] hover:underline"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="min-w-0 flex-1">
            <p className={`font-medium text-[var(--text)] ${resolved ? 'line-through text-[var(--muted)]' : ''}`}>
              {ticket.ref || '—'}
            </p>
            {ticket.reason && (
              <p className={`mt-0.5 text-sm ${resolved ? 'text-[var(--muted)]' : 'text-[var(--text-secondary)]'}`}>
                {ticket.reason}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {!resolved && (
              <button
                type="button"
                onClick={() => onResolve?.(ticket.id)}
                className="rounded p-1.5 text-[var(--success)] transition-colors hover:bg-[var(--success-subtle)]"
                title="Marquer comme suivi"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--border)] hover:text-[var(--text)]"
              title="Modifier"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(ticket.id)}
              className="rounded p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--danger-subtle)] hover:text-[var(--danger)]"
              title="Supprimer"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </>
      )}
    </li>
  )
}
