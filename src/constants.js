export const STORAGE_KEYS = {
  tasks: 'organizer-tasks',
  rituals: 'organizer-rituals',
  dailyPlans: 'organizer-daily-plans',
  projects: 'organizer-projects',
  tickets: 'organizer-tickets',
  reqTickets: 'organizer-req-tickets',
  requesters: 'organizer-requesters',
}

export const LEGACY_STORAGE_KEY = 'organizer-tasks'

export const PRIORITIES = [
  { value: 'high', label: 'High', chip: 'border border-[var(--priority-high)]/60 bg-[var(--priority-high-bg)] text-[var(--priority-high)] font-medium' },
  { value: 'medium', label: 'Medium', chip: 'border border-[var(--border)] bg-[var(--priority-medium-bg)] text-[var(--priority-medium)]' },
  { value: 'low', label: 'Low', chip: 'border border-transparent text-[var(--priority-low)]' },
]

export const CONTEXTS = [
  { value: 'pro', label: 'Pro' },
  { value: 'perso', label: 'Perso' },
]

/** Business -> domains mapping for ticket capture */
export const BUSINESSES = [
  { id: 'sysco', label: 'Sysco', domains: ['product', 'vendor', 'customer'] },
  { id: 'other', label: 'Other', domains: ['product', 'vendor', 'customer'] },
]

export const DOMAIN_LABELS = {
  product: 'Product',
  vendor: 'Vendor',
  customer: 'Customer',
}

export const DOMAINS = [
  { value: 'product', label: 'Product' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'customer', label: 'Customer' },
]

export const TICKET_STATUSES = [
  { value: 'ACTIONABLE', label: 'Actionable' },
  { value: 'WAITING_REPLY', label: 'Waiting reply' },
  { value: 'DONE', label: 'Done' },
]

export const COUNTRIES = [
  { value: 'gb', label: 'GB', tagClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' },
  { value: 'ie', label: 'IE', tagClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' },
  { value: 'se', label: 'SE', tagClass: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200' },
  { value: 'fr', label: 'FR', tagClass: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200' },
]

export const VIEWS = [
  { id: 'overview', label: 'Overview', primary: true },
  { id: 'board', label: 'Board' },
  { id: 'projects', label: 'Projects' },
]

export const MAX_FOCUS_TASKS = 3
export const MAX_NOTE_LENGTH = 140
