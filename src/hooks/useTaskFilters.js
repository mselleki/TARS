import { useMemo } from 'react'
import { today } from '../utils/date'

export function useTaskFilters({
  tasks,
  context,
  searchQuery,
  energyFilter,
  todayFocusIds,
}) {
  const searchLower = searchQuery.trim().toLowerCase()
  const todayStr = today()

  return useMemo(() => {
    const byContext = tasks.filter((t) => t.context === context)
    const bySearch = searchLower
      ? byContext.filter(
          (t) =>
            (t.title || '').toLowerCase().includes(searchLower) ||
            (t.note || '').toLowerCase().includes(searchLower)
        )
      : byContext
    const byEnergy = energyFilter
      ? bySearch.filter((t) => t.energy === energyFilter)
      : bySearch

    const focusTasks = todayFocusIds
      .map((id) => byEnergy.find((t) => t.id === id))
      .filter(Boolean)

    const backlog = byEnergy.filter((t) => t.status === 'backlog')
    const inProgress = byEnergy.filter((t) => t.status === 'in_progress')
    const done = byEnergy.filter((t) => t.status === 'done')

    const kanbanColumns = [
      { id: 'backlog', label: 'Backlog', tasks: backlog },
      { id: 'in_progress', label: 'In progress', tasks: inProgress },
      { id: 'done', label: 'Done', tasks: done },
    ]

    return {
      filtered: byEnergy,
      focusTasks,
      backlog,
      inProgress,
      done,
      kanbanColumns,
    }
  }, [tasks, context, searchQuery, energyFilter, todayFocusIds])
}
