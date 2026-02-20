function getBaseUrl() {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  if (envUrl && String(envUrl).trim() !== '') {
    return String(envUrl).trim().replace(/\/$/, '')
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

const LOG_SYNC = true

export async function fetchRemoteState() {
  const url = getStateUrl()
  if (!url) {
    if (LOG_SYNC) console.warn('[TARS sync] No API URL (same origin or set VITE_API_URL)')
    return null
  }
  try {
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) {
      if (LOG_SYNC) console.warn('[TARS sync] GET failed:', res.status, res.statusText, await res.text().catch(() => ''))
      return null
    }
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
  } catch (e) {
    if (LOG_SYNC) console.warn('[TARS sync] GET error:', e?.message ?? e)
    return null
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
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok && LOG_SYNC) {
      console.warn('[TARS sync] POST failed:', res.status, res.statusText, await res.text().catch(() => ''))
    }
    return res.ok
  } catch (e) {
    if (LOG_SYNC) console.warn('[TARS sync] POST error:', e?.message ?? e)
    return false
  }
}

export function isRemoteSyncConfigured() {
  return getStateUrl().length > 0
}
