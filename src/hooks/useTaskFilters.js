import { useMemo } from 'react'
import { today } from '../utils/date'
import { getProjectIdsInSubtree } from '../utils/projects'

export function useTaskFilters({
  tasks,
  context,
  searchQuery,
  todayFocusIds,
  boardFilters = null,
  projects = [],
}) {
  const searchLower = searchQuery.trim().toLowerCase()

  return useMemo(() => {
    let filtered = tasks.filter((t) => t.context === context)

    if (boardFilters && (boardFilters.projectId || boardFilters.countryId || boardFilters.domain)) {
      if (boardFilters.projectId) {
        const projectIds = getProjectIdsInSubtree(projects, boardFilters.projectId)
        filtered = filtered.filter((t) => t.projectId && projectIds.includes(t.projectId))
      }
      if (boardFilters.countryId) {
        filtered = filtered.filter((t) => Array.isArray(t.countryIds) && t.countryIds.includes(boardFilters.countryId))
      }
      if (boardFilters.domain) {
        filtered = filtered.filter((t) => Array.isArray(t.domainIds) && t.domainIds.includes(boardFilters.domain))
      }
    }

    if (searchLower) {
      filtered = filtered.filter(
        (t) =>
          (t.title || '').toLowerCase().includes(searchLower) ||
          (t.note || '').toLowerCase().includes(searchLower)
      )
    }

    const focusTasks = todayFocusIds
      .map((id) => filtered.find((t) => t.id === id))
      .filter(Boolean)

    const backlog = filtered.filter((t) => t.status === 'backlog')
    const inProgress = filtered.filter((t) => t.status === 'in_progress')
    const done = filtered.filter((t) => t.status === 'done')

    const kanbanColumns = [
      { id: 'backlog', label: 'Backlog', tasks: backlog },
      { id: 'in_progress', label: 'In progress', tasks: inProgress },
      { id: 'done', label: 'Done', tasks: done },
    ]

    return {
      filtered,
      focusTasks,
      backlog,
      inProgress,
      done,
      kanbanColumns,
    }
  }, [tasks, context, searchQuery, todayFocusIds, boardFilters, projects])
}
