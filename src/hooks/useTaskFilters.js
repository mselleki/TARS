import { useMemo } from 'react'
import { today } from '../utils/date'

export function useTaskFilters({
  tasks,
  context,
  searchQuery,
  todayFocusIds,
}) {
  const searchLower = searchQuery.trim().toLowerCase()

  return useMemo(() => {
    const byContext = tasks.filter((t) => t.context === context)
    const filtered = searchLower
      ? byContext.filter(
          (t) =>
            (t.title || '').toLowerCase().includes(searchLower) ||
            (t.note || '').toLowerCase().includes(searchLower)
        )
      : byContext

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
  }, [tasks, context, searchQuery, todayFocusIds])
}
