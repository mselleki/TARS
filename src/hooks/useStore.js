import { useReducer, useEffect, useState, useCallback } from 'react'
import {
  rootReducer,
  getInitialState,
  persistState,
  actions,
} from '../store/reducer'
import { today } from '../utils/date'

export function useStore() {
  const [state, dispatch] = useReducer(rootReducer, undefined, getInitialState)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    setInitialized(true)
  }, [])

  useEffect(() => {
    if (initialized) persistState(state)
  }, [state, initialized])

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
    updateReflection,
    todayPlan,
  }
}
