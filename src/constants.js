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
  { value: 'product', label: 'Product', tagClass: 'bg-amber-200 text-amber-900 dark:bg-amber-700 dark:text-white' },
  { value: 'vendor', label: 'Vendor', tagClass: 'bg-teal-200 text-teal-900 dark:bg-teal-700 dark:text-white' },
  { value: 'customer', label: 'Customer', tagClass: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-700 dark:text-white' },
]

export const TICKET_STATUSES = [
  { value: 'ACTIONABLE', label: 'Actionable' },
  { value: 'WAITING_REPLY', label: 'Waiting reply' },
  { value: 'DONE', label: 'Done' },
]

export const COUNTRIES = [
  { value: 'gb', label: 'GB', tagClass: 'bg-rose-200 text-rose-900 dark:bg-rose-700 dark:text-white' },
  { value: 'ie', label: 'IE', tagClass: 'bg-emerald-200 text-emerald-900 dark:bg-emerald-700 dark:text-white' },
  { value: 'se', label: 'SE', tagClass: 'bg-sky-200 text-sky-900 dark:bg-sky-700 dark:text-white' },
  { value: 'fr', label: 'FR', tagClass: 'bg-violet-200 text-violet-900 dark:bg-violet-700 dark:text-white' },
]

export const VIEWS = [
  { id: 'overview', label: 'Overview', primary: true },
  { id: 'today', label: 'Aujourd\'hui', primary: true },
  { id: 'board', label: 'Board' },
  { id: 'projects', label: 'Projects' },
]

export const MAX_FOCUS_TASKS = 3
export const MAX_NOTE_LENGTH = 140
