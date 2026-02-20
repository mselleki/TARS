function getBaseUrl() {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL != null) {
    const u = import.meta.env.VITE_API_URL
    return u === '' ? '' : u.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}

export function getStateUrl() {
  const base = getBaseUrl()
  return base ? `${base}/api/state` : ''
}

export async function fetchRemoteState() {
  const url = getStateUrl()
  if (!url) return null
  const res = await fetch(url, { method: 'GET' })
  if (!res.ok) return null
  const raw = await res.json()
  if (raw == null) return null
  return {
    projects: Array.isArray(raw.projects) ? raw.projects : [],
    tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
    rituals: Array.isArray(raw.rituals) ? raw.rituals : [],
    dailyPlans: Array.isArray(raw.dailyPlans) ? raw.dailyPlans : [],
    tickets: Array.isArray(raw.tickets) ? raw.tickets : [],
    reqTickets: Array.isArray(raw.reqTickets) ? raw.reqTickets : [],
    requesters: Array.isArray(raw.requesters) ? raw.requesters : [],
  }
}

export async function pushRemoteState(state) {
  const url = getStateUrl()
  if (!url) return false
  const payload = {
    projects: state.projects ?? [],
    tasks: state.tasks ?? [],
    rituals: state.rituals ?? [],
    dailyPlans: state.dailyPlans ?? [],
    tickets: state.tickets ?? [],
    reqTickets: state.reqTickets ?? [],
    requesters: state.requesters ?? [],
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.ok
}

export function isRemoteSyncConfigured() {
  return getStateUrl().length > 0
}
