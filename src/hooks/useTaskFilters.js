import { useMemo } from 'react'
import { today } from '../utils/date'

export function useTaskFilters({
  tasks,
  context,
  searchQuery,
  energyFilter,
  domainFilter,
  countryFilter,
  todayFocusIds,
}) {
  const searchLower = searchQuery.trim().toLowerCase()

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
    const byDomain = domainFilter
      ? byEnergy.filter((t) => (t.domainIds ?? []).includes(domainFilter))
      : byEnergy
    const byCountry = countryFilter
      ? byDomain.filter((t) => (t.countryIds ?? []).includes(countryFilter))
      : byDomain

    const focusTasks = todayFocusIds
      .map((id) => byCountry.find((t) => t.id === id))
      .filter(Boolean)

    const backlog = byCountry.filter((t) => t.status === 'backlog')
    const inProgress = byCountry.filter((t) => t.status === 'in_progress')
    const done = byCountry.filter((t) => t.status === 'done')

    const kanbanColumns = [
      { id: 'backlog', label: 'Backlog', tasks: backlog },
      { id: 'in_progress', label: 'In progress', tasks: inProgress },
      { id: 'done', label: 'Done', tasks: done },
    ]

    return {
      filtered: byCountry,
      focusTasks,
      backlog,
      inProgress,
      done,
      kanbanColumns,
    }
  }, [tasks, context, searchQuery, energyFilter, domainFilter, countryFilter, todayFocusIds])
}
