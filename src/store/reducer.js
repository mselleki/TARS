import { today, now } from '../utils/date'
import { createInitialTask, createInitialProject } from './initialState'
import { MAX_FOCUS_TASKS, MAX_NOTE_LENGTH } from '../constants'
import {
  loadTasks,
  loadRituals,
  loadDailyPlans,
  loadProjects,
  loadTickets,
  loadRequesters,
  saveTasks,
  saveRituals,
  saveDailyPlans,
  saveProjects,
  saveTickets,
  saveRequesters,
} from '../utils/storage'

const ts = () => now()

export const actions = {
  INIT: 'INIT',
  TASK_ADD: 'TASK_ADD',
  TASK_UPDATE: 'TASK_UPDATE',
  TASK_DELETE: 'TASK_DELETE',
  TASK_TOGGLE_STATUS: 'TASK_TOGGLE_STATUS',
  FOCUS_ADD: 'FOCUS_ADD',
  FOCUS_REMOVE: 'FOCUS_REMOVE',
  FOCUS_SWAP: 'FOCUS_SWAP',
  FOCUS_REORDER: 'FOCUS_REORDER',
  RITUAL_ADD: 'RITUAL_ADD',
  RITUAL_UPDATE: 'RITUAL_UPDATE',
  RITUAL_DELETE: 'RITUAL_DELETE',
  RITUAL_COMPLETE: 'RITUAL_COMPLETE',
  PLAN_UPDATE: 'PLAN_UPDATE',
  REFLECTION_UPDATE: 'REFLECTION_UPDATE',
  PROJECT_ADD: 'PROJECT_ADD',
  PROJECT_UPDATE: 'PROJECT_UPDATE',
  PROJECT_DELETE: 'PROJECT_DELETE',
  TICKET_ADD: 'TICKET_ADD',
  TICKET_UPDATE: 'TICKET_UPDATE',
  TICKET_DELETE: 'TICKET_DELETE',
  TICKET_RESOLVE: 'TICKET_RESOLVE',
  REQUESTER_ADD: 'REQUESTER_ADD',
  REQUESTER_UPDATE: 'REQUESTER_UPDATE',
  REQUESTER_DELETE: 'REQUESTER_DELETE',
}

function tasksReducer(tasks, action) {
  switch (action.type) {
    case actions.INIT:
      return action.payload.tasks
    case actions.TASK_ADD: {
      const t = createInitialTask({
        ...action.payload,
        projectId: action.payload.projectId ?? null,
        id: action.payload.id ?? crypto.randomUUID(),
        createdAt: ts(),
        updatedAt: ts(),
      })
      return [...tasks, t]
    }
    case actions.TASK_UPDATE: {
      const { id, updates } = action.payload
      return tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...updates,
              title: updates.title !== undefined ? String(updates.title).trim() || task.title : task.title,
              note: updates.note !== undefined ? String(updates.note).slice(0, MAX_NOTE_LENGTH) : task.note,
              domainIds: updates.domainIds !== undefined ? (Array.isArray(updates.domainIds) ? updates.domainIds : []) : task.domainIds,
              countryIds: updates.countryIds !== undefined ? (Array.isArray(updates.countryIds) ? updates.countryIds : []) : task.countryIds,
              updatedAt: ts(),
            }
          : task
      )
    }
    case actions.TASK_DELETE:
      return tasks.filter((t) => t.id !== action.payload)
    case actions.TASK_TOGGLE_STATUS: {
      const id = action.payload
      return tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === 'done' ? 'backlog' : 'done',
              updatedAt: ts(),
            }
          : t
      )
    }
    default:
      return tasks
  }
}

function projectsReducer(projects, action) {
  const ts = () => Date.now()
  switch (action.type) {
    case actions.INIT:
      return action.payload.projects ?? []
    case actions.PROJECT_ADD: {
      const p = createInitialProject({
        ...action.payload,
        id: action.payload.id ?? crypto.randomUUID(),
        createdAt: ts(),
        updatedAt: ts(),
      })
      return [...projects, p]
    }
    case actions.PROJECT_UPDATE: {
      const { id, updates } = action.payload
      return projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: ts() } : p
      )
    }
    case actions.PROJECT_DELETE:
      return projects.filter((p) => p.id !== action.payload)
    default:
      return projects
  }
}

function ticketsReducer(tickets, action) {
  const ts = () => Date.now()
  switch (action.type) {
    case actions.INIT:
      return action.payload.tickets ?? []
    case actions.TICKET_ADD: {
      const t = {
        ...action.payload,
        id: action.payload.id ?? crypto.randomUUID(),
        ref: (action.payload.ref ?? '').trim(),
        reason: (action.payload.reason ?? '').trim(),
        context: action.payload.context ?? 'pro',
        countryId: action.payload.countryId ?? null,
        requesterId: action.payload.requesterId ?? null,
        resolvedAt: null,
        createdAt: ts(),
      }
      return [...tickets, t]
    }
    case actions.TICKET_UPDATE: {
      const { id, updates } = action.payload
      return tickets.map((t) =>
        t.id === id
          ? {
              ...t,
              ...updates,
              ref: updates.ref !== undefined ? String(updates.ref).trim() : t.ref,
              reason: updates.reason !== undefined ? String(updates.reason).trim() : t.reason,
              countryId: updates.countryId !== undefined ? updates.countryId : t.countryId,
              requesterId: updates.requesterId !== undefined ? updates.requesterId : t.requesterId,
            }
          : t
      )
    }
    case actions.TICKET_DELETE:
      return tickets.filter((t) => t.id !== action.payload)
    case actions.TICKET_RESOLVE: {
      const id = action.payload
      return tickets.map((t) =>
        t.id === id ? { ...t, resolvedAt: ts() } : t
      )
    }
    default:
      return tickets
  }
}

function requestersReducer(requesters, action) {
  switch (action.type) {
    case actions.INIT:
      return action.payload.requesters ?? []
    case actions.REQUESTER_ADD: {
      const r = {
        id: action.payload.id ?? crypto.randomUUID(),
        name: (action.payload.name ?? '').trim() || 'Sans nom',
      }
      return [...requesters, r]
    }
    case actions.REQUESTER_UPDATE: {
      const { id, updates } = action.payload
      return requesters.map((r) =>
        r.id === id ? { ...r, ...updates, name: (updates.name ?? r.name).trim() || r.name } : r
      )
    }
    case actions.REQUESTER_DELETE:
      return requesters.filter((r) => r.id !== action.payload)
    default:
      return requesters
  }
}

function ritualsReducer(rituals, action) {
  switch (action.type) {
    case actions.INIT:
      return action.payload.rituals
    case actions.RITUAL_ADD:
      return [...rituals, { ...action.payload, id: crypto.randomUUID() }]
    case actions.RITUAL_UPDATE: {
      const { id, updates } = action.payload
      return rituals.map((r) => (r.id === id ? { ...r, ...updates } : r))
    }
    case actions.RITUAL_DELETE:
      return rituals.filter((r) => r.id !== action.payload)
    default:
      return rituals
  }
}

function dailyPlansReducer(plans, action) {
  const todayDate = today()

  const getPlan = (plansArr) => {
    const p = plansArr.find((x) => x.date === todayDate)
    return p ?? { date: todayDate, focusTaskIds: [], reflection: {} }
  }

  const setPlan = (plansArr, plan) => {
    const rest = plansArr.filter((p) => p.date !== plan.date)
    return [...rest, plan]
  }

  switch (action.type) {
    case actions.INIT:
      return action.payload.dailyPlans ?? []
    case actions.FOCUS_ADD: {
      const { taskId } = action.payload
      const plan = getPlan(plans)
      const current = plan.focusTaskIds ?? []
      if (current.includes(taskId)) return plans
      if (current.length >= MAX_FOCUS_TASKS) return plans
      return setPlan(plans, { ...plan, focusTaskIds: [...current, taskId] })
    }
    case actions.FOCUS_REMOVE: {
      const { taskId } = action.payload
      const plan = getPlan(plans)
      const current = plan.focusTaskIds ?? []
      return setPlan(plans, { ...plan, focusTaskIds: current.filter((id) => id !== taskId) })
    }
    case actions.FOCUS_SWAP: {
      const { addId, removeId } = action.payload
      const plan = getPlan(plans)
      const current = plan.focusTaskIds ?? []
      const next = current.filter((id) => id !== removeId)
      if (!next.includes(addId)) next.push(addId)
      return setPlan(plans, { ...plan, focusTaskIds: next })
    }
    case actions.FOCUS_REORDER: {
      const { fromIndex, toIndex } = action.payload
      const plan = getPlan(plans)
      const current = [...(plan.focusTaskIds ?? [])]
      if (fromIndex < 0 || fromIndex >= current.length) return plans
      if (toIndex < 0 || toIndex >= current.length) return plans
      const [removed] = current.splice(fromIndex, 1)
      current.splice(toIndex, 0, removed)
      return setPlan(plans, { ...plan, focusTaskIds: current })
    }
    case actions.REFLECTION_UPDATE: {
      const { reflection } = action.payload
      const plan = getPlan(plans)
      return setPlan(plans, { ...plan, reflection: { ...(plan.reflection ?? {}), ...reflection } })
    }
    case actions.PLAN_UPDATE: {
      const { date, updates } = action.payload
      const existing = plans.find((p) => p.date === date) ?? { date, focusTaskIds: [], reflection: {} }
      return setPlan(plans, { ...existing, ...updates })
    }
    default:
      return plans
  }
}

export function rootReducer(state, action) {
  const projects = projectsReducer(state.projects, action)
  const tasks = tasksReducer(state.tasks, action)
  const rituals = ritualsReducer(state.rituals, action)
  const dailyPlans = dailyPlansReducer(state.dailyPlans, action)
  const tickets = ticketsReducer(state.tickets, action)
  const requesters = requestersReducer(state.requesters, action)
  return { projects, tasks, rituals, dailyPlans, tickets, requesters }
}

export function getInitialState() {
  return {
    projects: loadProjects(),
    tasks: loadTasks(),
    rituals: loadRituals(),
    dailyPlans: loadDailyPlans(),
    tickets: loadTickets(),
    requesters: loadRequesters(),
  }
}

export function persistState(state) {
  saveProjects(state.projects)
  saveTasks(state.tasks)
  saveRituals(state.rituals)
  saveDailyPlans(state.dailyPlans)
  saveTickets(state.tickets ?? [])
  saveRequesters(state.requesters ?? [])
}
