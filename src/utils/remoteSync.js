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
  if (LOG_SYNC) console.log('[TARS sync] Fetching from:', url)
  try {
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) {
      const errorText = await res.text().catch(() => '')
      if (LOG_SYNC) console.warn('[TARS sync] GET failed:', res.status, res.statusText, errorText)
      return null
    }
    const raw = await res.json()
    if (raw == null) {
      if (LOG_SYNC) console.log('[TARS sync] No remote data (empty)')
      return null
    }
    if (LOG_SYNC) console.log('[TARS sync] Loaded remote state:', Object.keys(raw).map(k => `${k}:${raw[k]?.length ?? 0}`).join(', '))
    return {
      projects: Array.isArray(raw.projects) ? raw.projects : [],
      tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
      rituals: Array.isArray(raw.rituals) ? raw.rituals : [],
      dailyPlans: Array.isArray(raw.dailyPlans) ? raw.dailyPlans : [],
      tickets: Array.isArray(raw.tickets) ? raw.tickets : [],
      reqTickets: Array.isArray(raw.reqTickets) ? raw.reqTickets : [],
      requesters: Array.isArray(raw.requesters) ? raw.requesters : [],
      meetings: Array.isArray(raw.meetings) ? raw.meetings : [],
      standupLog: typeof raw.standupLog === 'string' ? raw.standupLog : '',
      meetingSheets: raw.meetingSheets && typeof raw.meetingSheets === 'object' ? raw.meetingSheets : {},
    }
  } catch (e) {
    if (LOG_SYNC) console.warn('[TARS sync] GET error:', e?.message ?? e)
    return null
  }
}

export async function pushRemoteState(state) {
  const url = getStateUrl()
  if (!url) {
    if (LOG_SYNC) console.warn('[TARS sync] No API URL for push')
    return false
  }
  const payload = {
    projects: state.projects ?? [],
    tasks: state.tasks ?? [],
    rituals: state.rituals ?? [],
    dailyPlans: state.dailyPlans ?? [],
    tickets: state.tickets ?? [],
    reqTickets: state.reqTickets ?? [],
    requesters: state.requesters ?? [],
    meetings: state.meetings ?? [],
    standupLog: state.standupLog ?? '',
    meetingSheets: state.meetingSheets ?? {},
  }
  if (LOG_SYNC) console.log('[TARS sync] Pushing to:', url, Object.keys(payload).map(k => `${k}:${payload[k]?.length ?? 0}`).join(', '))
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok && LOG_SYNC) {
      const errorText = await res.text().catch(() => '')
      console.warn('[TARS sync] POST failed:', res.status, res.statusText, errorText)
    } else if (LOG_SYNC && res.ok) {
      console.log('[TARS sync] Push successful')
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
