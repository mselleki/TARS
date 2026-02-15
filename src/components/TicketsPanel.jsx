import { useState } from 'react'
import { COUNTRIES } from '../constants'

export function TicketsPanel({ tickets = [], requesters = [], onAdd, onUpdate, onDelete, onResolve, onAddRequester }) {
  const [collapsed, setCollapsed] = useState(false)
  const [ref, setRef] = useState('')
  const [reason, setReason] = useState('')
  const [countryId, setCountryId] = useState('')
  const [requesterId, setRequesterId] = useState('')
  const [showNewRequester, setShowNewRequester] = useState(false)
  const [newRequesterName, setNewRequesterName] = useState('')

  const openTickets = tickets.filter((t) => t.context === 'pro' && !t.resolvedAt)

  const handleAddNewRequester = () => {
    const name = newRequesterName.trim()
    if (!name) return
    const id = onAddRequester?.({ name })
    if (id) {
      setRequesterId(id)
      setNewRequesterName('')
      setShowNewRequester(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const r = ref.trim()
    if (!r) return
    onAdd?.({
      ref: r,
      reason: reason.trim(),
      context: 'pro',
      countryId: countryId || null,
      requesterId: requesterId || null,
    })
    setRef('')
    setReason('')
    setCountryId('')
    setRequesterId('')
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-sm)]">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between border-b border-[var(--border)] px-4 py-3 text-left transition-[var(--transition)] hover:bg-[var(--bg)]/50"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <svg className="h-4 w-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          Tickets à suivre
        </span>
        <span className="rounded-[var(--radius-sm)] bg-[var(--bg)] px-2 py-0.5 text-xs font-medium tabular-nums text-[var(--muted)]">
          {openTickets.length}
        </span>
      </button>
      {!collapsed && (
        <div className="p-4 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="ex: JIRA-123"
                className="flex-1 min-w-[120px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
              />
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Raison du follow-up"
                className="flex-1 min-w-[140px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
              />
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <select
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                aria-label="Pays"
              >
                <option value="">Pays</option>
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <select
                  value={requesterId}
                  onChange={(e) => setRequesterId(e.target.value)}
                  className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)] min-w-[140px]"
                  aria-label="Demandeur"
                >
                  <option value="">Demandeur</option>
                  {requesters.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                {showNewRequester ? (
                  <span className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newRequesterName}
                      onChange={(e) => setNewRequesterName(e.target.value)}
                      placeholder="Nom"
                      className="w-28 rounded-[var(--radius-md)] border border-[var(--border)] px-2 py-1.5 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewRequester())}
                    />
                    <button type="button" onClick={handleAddNewRequester} className="text-xs text-[var(--accent)]">+</button>
                    <button type="button" onClick={() => { setShowNewRequester(false); setNewRequesterName('') }} className="text-xs text-[var(--muted)]">×</button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowNewRequester(true)}
                    className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] px-2 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)]"
                  >
                    + Personne
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={!ref.trim()}
                className="rounded-[var(--radius-md)] bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
              >
                +
              </button>
            </div>
          </form>
          {openTickets.length > 0 && (
            <ul className="space-y-1.5">
              {openTickets.map((t) => (
                <TicketRow
                  key={t.id}
                  ticket={t}
                  requesters={requesters}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onResolve={onResolve}
                  onAddRequester={onAddRequester}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

function TicketRow({ ticket, requesters, onUpdate, onDelete, onResolve, onAddRequester }) {
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState('')
  const country = COUNTRIES.find((c) => c.value === ticket.countryId)
  const requester = requesters.find((r) => r.id === ticket.requesterId)

  const handleAddRequester = () => {
    const name = newName.trim()
    if (!name) return
    const id = onAddRequester?.({ name })
    if (id) {
      onUpdate?.(ticket.id, { requesterId: id })
      setNewName('')
    }
  }

  return (
    <li className="group flex flex-wrap items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 hover:bg-[var(--bg)]">
      <span className="flex-1 min-w-0 text-sm">
        <span className="font-medium text-[var(--text)]">{ticket.ref}</span>
        {ticket.reason && <span className="text-[var(--muted)]"> — {ticket.reason}</span>}
      </span>
      {editing ? (
        <span className="flex flex-wrap items-center gap-2">
          <select
            value={ticket.countryId || ''}
            onChange={(e) => onUpdate?.(ticket.id, { countryId: e.target.value || null })}
            className="rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-xs"
          >
            <option value="">Pays</option>
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={ticket.requesterId || ''}
            onChange={(e) => onUpdate?.(ticket.id, { requesterId: e.target.value || null })}
            className="rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-xs min-w-[100px]"
          >
            <option value="">Demandeur</option>
            {requesters.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <span className="flex items-center gap-0.5">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nouvelle personne"
              className="w-24 rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-0.5 text-xs"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequester())}
            />
            <button type="button" onClick={handleAddRequester} className="text-[10px] text-[var(--accent)]">+</button>
          </span>
          <button type="button" onClick={() => setEditing(false)} className="text-[10px] text-[var(--muted)]">×</button>
        </span>
      ) : (
        <span
          onClick={() => setEditing(true)}
          className="cursor-pointer text-[10px] text-[var(--muted)] hover:text-[var(--text)]"
          title="Cliquer pour modifier"
        >
          {[country?.label, requester?.name].filter(Boolean).join(' · ') || 'Pays · Demandeur'}
        </span>
      )}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onResolve?.(ticket.id)}
          className="rounded p-1 text-[var(--success)] hover:bg-[var(--success-subtle)]"
          title="Marquer suivi"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(ticket.id)}
          className="rounded p-1 text-[var(--muted)] hover:bg-[var(--danger-subtle)] hover:text-[var(--danger)]"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </li>
  )
}
