/** Ticket status for follow-up workflow */
export type TicketStatus = 'ACTIONABLE' | 'WAITING_REPLY' | 'DONE'

/** Scope: Pro (work) or Perso (personal) */
export type TicketScope = 'PRO' | 'PERSO'

/** REQ-style ticket: tracking + follow-up entity */
export interface Ticket {
  /** REQ + digits, e.g. REQ123456 */
  id: string
  business: string
  domain: string
  owner: string
  summary: string
  status: TicketStatus
  scope: TicketScope
  createdAt: number
  updatedAt: number
  /** Last follow-up timestamp; null = never relanced */
  lastFollowUpAt: number | null
  /** Due date YYYY-MM-DD; null = no due */
  dueAt: string | null
}

/** Business entity - maps to domains */
export interface Business {
  id: string
  label: string
  domains: string[]
}
