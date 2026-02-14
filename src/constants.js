export const STORAGE_KEYS = {
  tasks: 'organizer-tasks',
  rituals: 'organizer-rituals',
  dailyPlans: 'organizer-daily-plans',
  projects: 'organizer-projects',
  tickets: 'organizer-tickets',
}

export const LEGACY_STORAGE_KEY = 'organizer-tasks'

export const PRIORITIES = [
  { value: 'high', label: 'High', chip: 'border border-[var(--priority-high)]/60 bg-[var(--priority-high-bg)] text-[var(--priority-high)] font-medium' },
  { value: 'medium', label: 'Medium', chip: 'border border-[var(--border)] bg-[var(--priority-medium-bg)] text-[var(--priority-medium)]' },
  { value: 'low', label: 'Low', chip: 'border border-transparent text-[var(--priority-low)]' },
]

export const ENERGY = [
  { value: 'deep', label: 'Deep', chip: 'border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--accent)] font-medium' },
  { value: 'quick', label: 'Quick', chip: 'border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--success)]' },
  { value: 'light', label: 'Light', chip: 'border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]' },
]

export const CONTEXTS = [
  { value: 'pro', label: 'Pro' },
  { value: 'perso', label: 'Perso' },
]

export const VIEWS = [
  { id: 'overview', label: 'Overview', primary: true },
  { id: 'today', label: 'Today' },
  { id: 'tickets', label: 'Tickets', primary: false, context: 'pro' },
  { id: 'courses', label: 'Courses', primary: false, context: 'perso' },
  { id: 'board', label: 'Board' },
  { id: 'projects', label: 'Projects' },
  { id: 'rituals', label: 'Rituals' },
]

export function getViewsForContext(context) {
  return VIEWS.filter((v) => !v.context || v.context === context)
}

export function isViewAvailableInContext(viewId, context) {
  const v = VIEWS.find((x) => x.id === viewId)
  return v && (!v.context || v.context === context)
}

export const MAX_FOCUS_TASKS = 3
export const MAX_NOTE_LENGTH = 140
