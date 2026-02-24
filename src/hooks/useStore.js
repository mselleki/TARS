import { useReducer, useEffect, useState, useCallback, useRef } from 'react'
import {
  rootReducer,
  getInitialState,
  persistState,
  actions,
} from '../store/reducer'
import { today } from '../utils/date'
import { fetchRemoteState, pushRemoteState, getStateUrl } from '../utils/remoteSync'
import { normalizeRemoteState } from '../utils/storage'

const REMOTE_PUSH_DEBOUNCE_MS = 1500

export function useStore() {
  const [state, dispatch] = useReducer(rootReducer, undefined, getInitialState)
  const [initialized, setInitialized] = useState(false)
  const [remoteLoadDone, setRemoteLoadDone] = useState(false)
  const [syncStatus, setSyncStatus] = useState('idle')
  const stateRef = useRef(state)
  const remotePushTimeoutRef = useRef(null)

  stateRef.current = state

  useEffect(() => {
    setInitialized(true)
  }, [])

  useEffect(() => {
    if (initialized) persistState(state)
  }, [state, initialized])

  useEffect(() => {
    if (!initialized || !getStateUrl()) {
      setRemoteLoadDone(true)
      return
    }
    let cancelled = false
    setSyncStatus('syncing')
    fetchRemoteState()
      .then((raw) => {
        if (cancelled) return
        const normalized = normalizeRemoteState(raw)
        if (normalized) dispatch({ type: actions.INIT, payload: normalized })
        setSyncStatus('ok')
      })
      .catch(() => { if (!cancelled) setSyncStatus('error') })
      .finally(() => {
        if (!cancelled) setRemoteLoadDone(true)
      })
    return () => { cancelled = true }
  }, [initialized])

  useEffect(() => {
    if (!initialized || !remoteLoadDone || !getStateUrl()) return
    if (remotePushTimeoutRef.current) clearTimeout(remotePushTimeoutRef.current)
    remotePushTimeoutRef.current = setTimeout(() => {
      remotePushTimeoutRef.current = null
      setSyncStatus('syncing')
      pushRemoteState(stateRef.current)
        .then((ok) => { setSyncStatus(ok ? 'ok' : 'error') })
        .catch(() => { setSyncStatus('error') })
    }, REMOTE_PUSH_DEBOUNCE_MS)
    return () => {
      if (remotePushTimeoutRef.current) clearTimeout(remotePushTimeoutRef.current)
    }
  }, [state, initialized, remoteLoadDone])

  useEffect(() => {
    const onBeforeUnload = () => {
      persistState(stateRef.current)
      if (getStateUrl()) pushRemoteState(stateRef.current).catch(() => {})
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  const addTask = useCallback((payload) => {
    const id = payload.id ?? crypto.randomUUID()
    dispatch({ type: actions.TASK_ADD, payload: { ...payload, id } })
    return id
  }, [])

  const updateTask = useCallback((id, updates) => {
    dispatch({ type: actions.TASK_UPDATE, payload: { id, updates } })
  }, [])

  const deleteTask = useCallback((id) => {
    dispatch({ type: actions.TASK_DELETE, payload: id })
  }, [])

  const toggleTaskStatus = useCallback((id) => {
    dispatch({ type: actions.TASK_TOGGLE_STATUS, payload: id })
  }, [])

  const addFocus = useCallback((taskId) => {
    dispatch({ type: actions.FOCUS_ADD, payload: { taskId } })
  }, [])

  const removeFocus = useCallback((taskId) => {
    dispatch({ type: actions.FOCUS_REMOVE, payload: { taskId } })
  }, [])

  const swapFocus = useCallback((addId, removeId) => {
    dispatch({ type: actions.FOCUS_SWAP, payload: { addId, removeId } })
  }, [])

  const reorderFocus = useCallback((fromIndex, toIndex) => {
    dispatch({ type: actions.FOCUS_REORDER, payload: { fromIndex, toIndex } })
  }, [])

  const addProject = useCallback((payload) => {
    const id = payload.id ?? crypto.randomUUID()
    dispatch({ type: actions.PROJECT_ADD, payload: { ...payload, id } })
    return id
  }, [])

  const updateProject = useCallback((id, updates) => {
    dispatch({ type: actions.PROJECT_UPDATE, payload: { id, updates } })
  }, [])

  const deleteProject = useCallback((id) => {
    dispatch({ type: actions.PROJECT_DELETE, payload: id })
  }, [])

  const addRitual = useCallback((payload) => {
    dispatch({ type: actions.RITUAL_ADD, payload })
  }, [])

  const updateRitual = useCallback((id, updates) => {
    dispatch({ type: actions.RITUAL_UPDATE, payload: { id, updates } })
  }, [])

  const deleteRitual = useCallback((id) => {
    dispatch({ type: actions.RITUAL_DELETE, payload: id })
  }, [])

  const addTicket = useCallback((payload) => {
    const id = payload.id ?? crypto.randomUUID()
    dispatch({ type: actions.TICKET_ADD, payload: { ...payload, id } })
    return id
  }, [])

  const updateTicket = useCallback((id, updates) => {
    dispatch({ type: actions.TICKET_UPDATE, payload: { id, updates } })
  }, [])

  const deleteTicket = useCallback((id) => {
    dispatch({ type: actions.TICKET_DELETE, payload: id })
  }, [])

  const resolveTicket = useCallback((id) => {
    dispatch({ type: actions.TICKET_RESOLVE, payload: id })
  }, [])

  const addReqTicket = useCallback((payload) => {
    const rawId = (payload.id ?? '').trim().toUpperCase()
    const id = rawId || `REQ${Date.now().toString().slice(-6)}`
    dispatch({ type: actions.REQ_TICKET_ADD, payload: { ...payload, id } })
    return id
  }, [])

  const updateReqTicket = useCallback((id, updates) => {
    dispatch({ type: actions.REQ_TICKET_UPDATE, payload: { id, updates } })
  }, [])

  const deleteReqTicket = useCallback((id) => {
    dispatch({ type: actions.REQ_TICKET_DELETE, payload: id })
  }, [])

  const addMeeting = useCallback((payload) => {
    const id = payload.id ?? crypto.randomUUID()
    dispatch({ type: actions.MEETING_ADD, payload: { ...payload, id } })
    return id
  }, [])

  const updateMeeting = useCallback((id, updates) => {
    dispatch({ type: actions.MEETING_UPDATE, payload: { id, updates } })
  }, [])

  const deleteMeeting = useCallback((id) => {
    dispatch({ type: actions.MEETING_DELETE, payload: id })
  }, [])

  const setStandupLog = useCallback((content) => {
    dispatch({ type: actions.STANDUP_LOG_SET, payload: content })
  }, [])

  const setMeetingSheet = useCallback((key, content) => {
    dispatch({ type: actions.MEETING_SHEET_UPDATE, payload: { key, content } })
  }, [])

  const addRequester = useCallback((payload) => {
    const id = payload.id ?? crypto.randomUUID()
    dispatch({ type: actions.REQUESTER_ADD, payload: { ...payload, id } })
    return id
  }, [])

  const updateRequester = useCallback((id, updates) => {
    dispatch({ type: actions.REQUESTER_UPDATE, payload: { id, updates } })
  }, [])

  const deleteRequester = useCallback((id) => {
    dispatch({ type: actions.REQUESTER_DELETE, payload: id })
  }, [])

  const updateReflection = useCallback((reflection) => {
    dispatch({ type: actions.REFLECTION_UPDATE, payload: { reflection } })
  }, [])

  const todayPlan = state.dailyPlans.find((p) => p.date === today()) ?? {
    date: today(),
    focusTaskIds: [],
    reflection: {},
  }

  return {
    state,
    syncStatus: getStateUrl() ? syncStatus : 'idle',
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    addProject,
    updateProject,
    deleteProject,
    addFocus,
    removeFocus,
    swapFocus,
    reorderFocus,
    addRitual,
    updateRitual,
    deleteRitual,
    addTicket,
    updateTicket,
    deleteTicket,
    resolveTicket,
    addReqTicket,
    updateReqTicket,
    deleteReqTicket,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    setStandupLog,
    setMeetingSheet,
    addRequester,
    updateRequester,
    deleteRequester,
    updateReflection,
    todayPlan,
  }
}
