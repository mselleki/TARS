import { STORAGE_KEYS } from '../constants'

export function loadJSON(key, defaultValue = []) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : defaultValue
  } catch {
    return defaultValue
  }
}

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadTasks() {
  const tasks = loadJSON(STORAGE_KEYS.tasks, [])
  return tasks.map(normalizeTask)
}

export function loadRituals() {
  return loadJSON(STORAGE_KEYS.rituals, [])
}

export function loadDailyPlans() {
  return loadJSON(STORAGE_KEYS.dailyPlans, [])
}

export function loadRequesters() {
  const raw = loadJSON(STORAGE_KEYS.requesters, [])
  return raw.map((r) => normalizeRequester(r))
}

export function saveRequesters(requesters) {
  saveJSON(STORAGE_KEYS.requesters, requesters)
}

export function loadTickets() {
  const raw = loadJSON(STORAGE_KEYS.tickets, [])
  return raw.map(normalizeTicket)
}

export function saveTickets(tickets) {
  saveJSON(STORAGE_KEYS.tickets, tickets)
}

export function loadReqTickets() {
  const raw = loadJSON(STORAGE_KEYS.reqTickets, [])
  return raw.map(normalizeReqTicket)
}

export function saveReqTickets(tickets) {
  saveJSON(STORAGE_KEYS.reqTickets, tickets)
}

function normalizeReqTicket(t) {
  const now = Date.now()
  const rawId = (t.id ?? '').trim().toUpperCase()
  return {
    ...t,
    id: rawId || `REQ${Date.now().toString().slice(-6)}`,
    business: (t.business ?? '').trim() || '',
    domain: (t.domain ?? '').trim() || '',
    owner: (t.owner ?? '').trim() || '',
    summary: (t.summary ?? '').trim() || '',
    status: ['ACTIONABLE', 'WAITING_REPLY', 'DONE'].includes(t.status) ? t.status : 'ACTIONABLE',
    scope: t.scope === 'PERSO' ? 'PERSO' : 'PRO',
    createdAt: typeof t.createdAt === 'number' ? t.createdAt : now,
    updatedAt: typeof t.updatedAt === 'number' ? t.updatedAt : now,
    lastFollowUpAt: t.lastFollowUpAt != null && typeof t.lastFollowUpAt === 'number' ? t.lastFollowUpAt : null,
    dueAt: t.dueAt != null && typeof t.dueAt === 'number' ? t.dueAt : null,
    countryId: t.countryId ?? null,
  }
}

function normalizeTicket(t) {
  return {
    ...t,
    id: t.id ?? crypto.randomUUID(),
    ref: (t.ref ?? '').trim() || '',
    reason: (t.reason ?? '').trim() || '',
    context: t.context ?? 'pro',
    countryId: t.countryId ?? null,
    requesterId: t.requesterId ?? null,
    resolvedAt: t.resolvedAt ?? null,
    createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
  }
}

function normalizeRequester(r) {
  return {
    ...r,
    id: r.id ?? crypto.randomUUID(),
    name: (r.name ?? '').trim() || 'Sans nom',
  }
}

export function loadProjects() {
  const raw = loadJSON(STORAGE_KEYS.projects, [])
  return raw.map(normalizeProject)
}

export function saveProjects(projects) {
  saveJSON(STORAGE_KEYS.projects, projects)
}

function normalizeProject(p) {
  return {
    ...p,
    id: p.id ?? crypto.randomUUID(),
    title: (p.title ?? '').trim() || 'Untitled project',
    context: p.context ?? 'pro',
    parentProjectId: p.parentProjectId ?? null,
    dueDate: p.dueDate ?? '',
    createdAt: typeof p.createdAt === 'number' ? p.createdAt : Date.now(),
    updatedAt: typeof p.updatedAt === 'number' ? p.updatedAt : Date.now(),
  }
}

export function saveTasks(tasks) {
  saveJSON(STORAGE_KEYS.tasks, tasks)
}

export function saveRituals(rituals) {
  saveJSON(STORAGE_KEYS.rituals, rituals)
}

export function saveDailyPlans(plans) {
  saveJSON(STORAGE_KEYS.dailyPlans, plans)
}

function normalizeTask(t) {
  const status = t.status ?? (t.completed ? 'done' : 'backlog')
  const mapped = status === 'todo' ? 'backlog' : status
  return {
    ...t,
    id: t.id ?? crypto.randomUUID(),
    title: (t.title ?? t.name ?? '').trim() || '',
    status: mapped,
    priority: t.priority ?? 'medium',
    energy: t.energy ?? 'quick',
    dueDate: t.dueDate ?? '',
    note: (t.note ?? '').slice(0, 140),
    disliked: Boolean(t.disliked),
    ritualId: t.ritualId ?? null,
    projectId: t.projectId ?? null,
    context: t.context ?? 'pro',
    domainIds: Array.isArray(t.domainIds) ? t.domainIds : [],
    countryIds: Array.isArray(t.countryIds) ? t.countryIds : [],
    createdAt: typeof t.createdAt === 'number' ? t.createdAt : (t.createdAt ? new Date(t.createdAt).getTime() : Date.now()),
    updatedAt: typeof t.updatedAt === 'number' ? t.updatedAt : Date.now(),
  }
}
