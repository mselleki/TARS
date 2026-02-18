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
  { value: 'gb', label: 'GB', tagClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  { value: 'ie', label: 'IE', tagClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'se', label: 'SE', tagClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'fr', label: 'FR', tagClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
]

export const VIEWS = [
  { id: 'overview', label: 'Overview', primary: true },
  { id: 'board', label: 'Board' },
  { id: 'projects', label: 'Projects' },
]

export const MAX_FOCUS_TASKS = 3
export const MAX_NOTE_LENGTH = 140
