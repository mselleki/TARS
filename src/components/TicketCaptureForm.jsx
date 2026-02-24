import { useState, useRef, useCallback, useEffect } from 'react'
import { DOMAIN_LABELS, COUNTRIES, TICKET_OWNERS } from '../constants'
import { normalizeReqId } from '../utils/ticketUtils'

export function TicketCaptureForm({
  onSubmit,
  onCancel,
  scope = 'PRO',
  existingOwners = [],
  initialFocus = false,
}) {
  const [reqId, setReqId] = useState('')
  const [domain, setDomain] = useState('')
  const [owner, setOwner] = useState('')
  const [summary, setSummary] = useState('')
  const [countryId, setCountryId] = useState('')
  const [idError, setIdError] = useState('')
  const firstInputRef = useRef(null)

  useEffect(() => {
    if (initialFocus) firstInputRef.current?.focus()
  }, [initialFocus])

  const handleReqIdChange = useCallback((e) => {
    const v = e.target.value.toUpperCase()
    setReqId(v)
    if (v) {
      const { valid } = normalizeReqId(v)
      setIdError(valid ? '' : 'REQ + chiffres (ex: REQ123456)')
    } else {
      setIdError('')
    }
  }, [])

  const handleReqIdPaste = useCallback((e) => {
    const pasted = (e.clipboardData?.getData('text') ?? '').trim().toUpperCase()
    if (pasted && /^REQ\d+/i.test(pasted)) {
      e.preventDefault()
      const match = pasted.match(/^(REQ\d+)/i)
      if (match) setReqId(match[1])
    }
  }, [])

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault()
      const { valid, normalized } = normalizeReqId(reqId.trim())
      if (!valid) {
        setIdError('REQ + chiffres (ex: REQ123456)')
        firstInputRef.current?.focus()
        return
      }
      onSubmit({
        id: normalized,
        domain: domain.trim(),
        owner: owner.trim(),
        summary: summary.trim(),
        scope: 'PRO',
        countryId: countryId || null,
      })
      setReqId('')
      setDomain('')
      setOwner('')
      setSummary('')
      setCountryId('')
      setIdError('')
      firstInputRef.current?.focus()
    },
    [reqId, domain, owner, summary, countryId, onSubmit]
  )

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setReqId('')
        setDomain('')
        setOwner('')
        setSummary('')
        setCountryId('')
        setIdError('')
        onCancel?.()
      }
    },
    [onCancel]
  )

  const canSubmit = normalizeReqId(reqId.trim()).valid

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="ticket-req-id" className="sr-only">
            Ticket ID (REQ…)
          </label>
          <input
            ref={firstInputRef}
            id="ticket-req-id"
            type="text"
            value={reqId}
            onChange={handleReqIdChange}
            onPaste={handleReqIdPaste}
            placeholder="REQ123456"
            className={`w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm font-mono outline-none transition-[var(--transition)] placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[var(--accent-ring)] ${
              idError ? 'border-[var(--danger)]' : 'border-[var(--border)] bg-[var(--surface)] focus:border-[var(--accent)]'
            }`}
            aria-invalid={!!idError}
            aria-describedby={idError ? 'req-id-error' : undefined}
          />
          {idError && (
            <p id="req-id-error" className="mt-1 text-xs text-[var(--danger)]">
              {idError}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="ticket-domain" className="sr-only">
            Domain
          </label>
          <select
            id="ticket-domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none transition-[var(--transition)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]"
          >
            <option value="">Domain</option>
            {Object.entries(DOMAIN_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ticket-owner" className="sr-only">
            Owner
          </label>
          <select
            id="ticket-owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none transition-[var(--transition)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]"
          >
            <option value="">Owner</option>
            {TICKET_OWNERS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="w-full">
        <label htmlFor="ticket-summary" className="sr-only">
          Short reminder
        </label>
        <input
          id="ticket-summary"
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Short reminder…"
          className="w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none transition-[var(--transition)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-ring)]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={countryId}
          onChange={(e) => setCountryId(e.target.value)}
          className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
          aria-label="Country"
        >
          <option value="">Country</option>
          {COUNTRIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-[var(--transition)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add ticket
        </button>
        <span className="text-[11px] text-[var(--muted)]">
          <kbd className="rounded bg-[var(--bg)] px-1 py-0.5">Enter</kbd> submit · <kbd className="rounded bg-[var(--bg)] px-1 py-0.5">Esc</kbd> clear
        </span>
      </div>
    </form>
  )
}
