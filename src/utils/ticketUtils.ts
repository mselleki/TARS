const REQ_REGEX = /^REQ\d+$/i

/**
 * Validate and normalize REQ id: REQ + digits, auto-uppercase
 */
export function normalizeReqId(raw) {
  const s = String(raw || '').trim().toUpperCase()
  if (!s) return { valid: false, normalized: '' }
  const normalized = s.startsWith('REQ') ? s : s.match(/^\d+$/) ? `REQ${s}` : s
  const valid = REQ_REGEX.test(normalized)
  return { valid, normalized }
}

/**
 * Compute waiting days since last follow-up or since creation
 */
export function getWaitingDays(ticket) {
  const ts = ticket.status === 'WAITING_REPLY'
    ? (ticket.lastFollowUpAt ?? ticket.createdAt)
    : ticket.createdAt
  const ms = Date.now() - ts
  return Math.floor(ms / (24 * 60 * 60 * 1000))
}

function toDateStart(ts) {
  if (ts == null) return null
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/**
 * Check if ticket is overdue (dueAt in the past, not DONE)
 */
export function isOverdue(ticket) {
  if (ticket.status === 'DONE') return false
  if (!ticket.dueAt) return false
  const dueStart = toDateStart(ticket.dueAt)
  const todayStart = toDateStart(Date.now())
  return dueStart < todayStart
}

/**
 * Days until due (negative = overdue)
 */
export function daysUntilDue(ticket) {
  if (!ticket.dueAt) return null
  const dueStart = toDateStart(ticket.dueAt)
  const todayStart = toDateStart(Date.now())
  return Math.ceil((dueStart - todayStart) / (24 * 60 * 60 * 1000))
}

/**
 * Sort: overdue > waiting longest > quick closable (actionable, no due) > recent
 */
export function sortTicketsForOverview(tickets) {
  return [...tickets].sort((a, b) => {
    const aOverdue = isOverdue(a) ? 1 : 0
    const bOverdue = isOverdue(b) ? 1 : 0
    if (aOverdue !== bOverdue) return bOverdue - aOverdue

    if (a.status === 'DONE' && b.status !== 'DONE') return 1
    if (a.status !== 'DONE' && b.status === 'DONE') return -1
    if (a.status === 'DONE' && b.status === 'DONE') {
      return (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
    }

    const aWaiting = a.status === 'WAITING_REPLY' ? getWaitingDays(a) : -1
    const bWaiting = b.status === 'WAITING_REPLY' ? getWaitingDays(b) : -1
    if (aWaiting !== bWaiting) return bWaiting - aWaiting

    const aDue = daysUntilDue(a)
    const bDue = daysUntilDue(b)
    if (aDue != null && bDue != null) return aDue - bDue
    if (aDue != null) return -1
    if (bDue != null) return 1

    return (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt)
  })
}
