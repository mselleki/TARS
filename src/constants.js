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
  { value: 'gb', label: 'GB', tagClass: 'border border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-600 dark:bg-rose-950/60 dark:text-rose-100' },
  { value: 'ie', label: 'IE', tagClass: 'border border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-100' },
  { value: 'se', label: 'SE', tagClass: 'border border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-600 dark:bg-sky-950/60 dark:text-sky-100' },
  { value: 'fr', label: 'FR', tagClass: 'border border-violet-300 bg-violet-50 text-violet-900 dark:border-violet-600 dark:bg-violet-950/60 dark:text-violet-100' },
]

export const VIEWS = [
  { id: 'overview', label: 'Overview', primary: true },
  { id: 'board', label: 'Board' },
  { id: 'projects', label: 'Projects' },
]

export const MAX_FOCUS_TASKS = 3
export const MAX_NOTE_LENGTH = 140
