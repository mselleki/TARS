import { useMemo, useState } from 'react'
import { today } from '../utils/date'

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

function getMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startOffset = first.getDay() === 0 ? 6 : first.getDay() - 1
  const daysInMonth = last.getDate()
  const totalCells = startOffset + daysInMonth
  const rows = Math.ceil(totalCells / 7)
  const grid = []
  let day = 1
  for (let r = 0; r < rows; r++) {
    const week = []
    for (let c = 0; c < 7; c++) {
      const cellIndex = r * 7 + c
      if (cellIndex < startOffset || day > daysInMonth) {
        week.push(null)
      } else {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        week.push({ dateStr, day, isCurrentMonth: true })
        day++
      }
    }
    grid.push(week)
  }
  return grid
}

function getWeekDates(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - dayOfWeek)
  const out = []
  for (let i = 0; i < 7; i++) {
    out.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return out
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.getDate()
}

function formatDailyTitle(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const todayStr = today()
  if (dateStr === todayStr) return "Aujourd'hui"
  const yesterday = new Date(todayStr)
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === yesterday.toISOString().slice(0, 10)) return 'Hier'
  return `${WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function PersoAgenda({
  tasks = [],
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onAddTaskForDate,
}) {
  const todayStr = today()
  const [base, setBase] = useState(() => {
    const t = new Date(todayStr)
    return { year: t.getFullYear(), month: t.getMonth() }
  })
  const [weekAnchor, setWeekAnchor] = useState(todayStr)
  const [dailyDate, setDailyDate] = useState(todayStr)
  const [viewMode, setViewMode] = useState('month')

  const goPrev = () => setBase((b) => (b.month === 0 ? { year: b.year - 1, month: 11 } : { year: b.year, month: b.month - 1 }))
  const goNext = () => setBase((b) => (b.month === 11 ? { year: b.year + 1, month: 0 } : { year: b.year, month: b.month + 1 }))

  const weekDates = useMemo(() => getWeekDates(viewMode === 'week' ? weekAnchor : todayStr), [viewMode, weekAnchor])
  const goPrevWeek = () => {
    const d = new Date(weekAnchor + 'T12:00:00')
    d.setDate(d.getDate() - 7)
    setWeekAnchor(d.toISOString().slice(0, 10))
  }
  const goNextWeek = () => {
    const d = new Date(weekAnchor + 'T12:00:00')
    d.setDate(d.getDate() + 7)
    setWeekAnchor(d.toISOString().slice(0, 10))
  }

  const goPrevDay = () => {
    const d = new Date(dailyDate + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    setDailyDate(d.toISOString().slice(0, 10))
  }
  const goNextDay = () => {
    const d = new Date(dailyDate + 'T12:00:00')
    d.setDate(d.getDate() + 1)
    setDailyDate(d.toISOString().slice(0, 10))
  }

  const tasksByDate = useMemo(() => {
    const map = new Map()
    tasks
      .filter((t) => t.context === 'perso' && t.dueDate)
      .forEach((t) => {
        const key = String(t.dueDate).slice(0, 10)
        if (!map.has(key)) map.set(key, [])
        map.get(key).push(t)
      })
    return map
  }, [tasks])

  const grid = useMemo(() => getMonthGrid(base.year, base.month), [base.year, base.month])

  const handleCellClick = (dateStr, e) => {
    if (e.target.closest('button, [data-task-item]')) return
    onAddTaskForDate?.(dateStr)
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-sm)]">
      <header className="border-b border-[var(--border)] px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={viewMode === 'month' ? goPrev : viewMode === 'week' ? goPrevWeek : goPrevDay}
            className="rounded-[var(--radius-md)] p-2 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--text)]"
            aria-label="Précédent"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] shrink-0 min-w-[140px] text-center">
            {viewMode === 'month' && `${MONTHS[base.month]} ${base.year}`}
            {viewMode === 'week' && `Semaine du ${formatDayLabel(weekDates[0])} ${MONTHS[new Date(weekDates[0] + 'T12:00:00').getMonth()]}`}
            {viewMode === 'daily' && formatDailyTitle(dailyDate)}
          </h2>
          <button
            type="button"
            onClick={viewMode === 'month' ? goNext : viewMode === 'week' ? goNextWeek : goNextDay}
            className="rounded-[var(--radius-md)] p-2 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--text)]"
            aria-label="Suivant"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <div className="flex rounded-[var(--radius-md)] bg-[var(--bg)] p-0.5">
          {(['month', 'week', 'daily']).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setViewMode(mode)
                if (mode === 'week') setWeekAnchor(viewMode === 'daily' ? dailyDate : todayStr)
                if (mode === 'daily') setDailyDate(viewMode === 'week' ? weekAnchor : todayStr)
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-[var(--transition)] ${viewMode === mode ? 'bg-[var(--surface)] text-[var(--accent)] shadow-[var(--shadow-sm)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
            >
              {mode === 'month' ? 'Mois' : mode === 'week' ? 'Semaine' : 'Jour'}
            </button>
          ))}
        </div>
      </header>

      {viewMode === 'month' && (
        <div className="p-3 overflow-x-auto">
          <table className="w-full min-w-[320px] table-fixed border-collapse text-sm">
            <thead>
              <tr>
                {WEEKDAYS.map((wd) => (
                  <th key={wd} className="py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] border-b border-[var(--border)]">
                    {wd}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((week, ri) => (
                <tr key={ri}>
                  {week.map((cell, ci) => {
                    if (!cell) {
                      return <td key={ci} className="align-top border-b border-[var(--border)] p-1 min-h-[80px]" />
                    }
                    const { dateStr, day } = cell
                    const isToday = dateStr === todayStr
                    const isPast = dateStr < todayStr
                    const dayTasks = tasksByDate.get(dateStr) ?? []

                    return (
                      <td
                        key={ci}
                        onClick={(e) => handleCellClick(dateStr, e)}
                        className={`align-top border-b border-[var(--border)] p-1.5 min-h-[88px] w-[14.28%] cursor-pointer hover:bg-[var(--bg)]/80 transition-colors ${
                          isToday ? 'bg-[var(--accent-subtle)] ring-1 ring-[var(--accent)] rounded-[var(--radius-md)]' : ''
                        } ${isPast ? 'opacity-75' : ''}`}
                      >
                        <div className={`text-[11px] font-semibold mb-1 ${isToday ? 'text-[var(--accent)]' : isPast ? 'text-[var(--muted)]' : 'text-[var(--text-secondary)]'}`}>
                          {day}
                        </div>
                        <ul className="space-y-1">
                          {dayTasks
                            .filter((t) => t.status !== 'done')
                            .concat(dayTasks.filter((t) => t.status === 'done'))
                            .map((task) => (
                              <AgendaCellItem
                                key={task.id}
                                task={task}
                                onToggle={onToggleTask}
                                onDelete={onDeleteTask}
                              />
                            ))}
                        </ul>
                        {dayTasks.length === 0 && (
                          <span className="text-[10px] text-[var(--muted)] opacity-0 group-hover:opacity-100">+</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'week' && (
        <div className="p-3 overflow-x-auto">
          <table className="w-full min-w-[320px] table-fixed border-collapse text-sm">
            <thead>
              <tr>
                {weekDates.map((dateStr) => {
                  const isToday = dateStr === todayStr
                  const d = new Date(dateStr + 'T12:00:00')
                  return (
                    <th key={dateStr} className={`py-2 text-[10px] font-semibold uppercase tracking-wider border-b border-[var(--border)] ${isToday ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}>
                      {WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]} {d.getDate()}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                {weekDates.map((dateStr) => {
                  const isToday = dateStr === todayStr
                  const isPast = dateStr < todayStr
                  const dayTasks = tasksByDate.get(dateStr) ?? []

                  return (
                    <td
                      key={dateStr}
                      onClick={(e) => handleCellClick(dateStr, e)}
                      className={`align-top border-b border-[var(--border)] p-2 min-h-[120px] w-[14.28%] cursor-pointer hover:bg-[var(--bg)]/80 transition-colors ${isToday ? 'bg-[var(--accent-subtle)] ring-1 ring-[var(--accent)] rounded-[var(--radius-md)]' : ''} ${isPast ? 'opacity-75' : ''}`}
                    >
                      <ul className="space-y-1">
                        {dayTasks
                          .filter((t) => t.status !== 'done')
                          .concat(dayTasks.filter((t) => t.status === 'done'))
                          .map((task) => (
                            <AgendaCellItem
                              key={task.id}
                              task={task}
                              onToggle={onToggleTask}
                              onDelete={onDeleteTask}
                            />
                          ))}
                      </ul>
                      <span className="text-xs text-[var(--muted)]">+ tâche</span>
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'daily' && (
        <div
          className="p-4 cursor-pointer hover:bg-[var(--bg)]/50 transition-colors min-h-[160px]"
          onClick={(e) => handleCellClick(dailyDate, e)}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--muted)]">{dailyDate}</span>
            <span className="text-xs text-[var(--accent)]">+ Ajouter une tâche</span>
          </div>
          <ul className="space-y-2">
            {(tasksByDate.get(dailyDate) ?? [])
              .filter((t) => t.status !== 'done')
              .concat((tasksByDate.get(dailyDate) ?? []).filter((t) => t.status === 'done'))
              .map((task) => (
                <li key={task.id} data-task-item onClick={(e) => e.stopPropagation()}>
                  <AgendaCellItem
                    task={task}
                    onToggle={onToggleTask}
                    onDelete={onDeleteTask}
                  />
                </li>
              ))}
          </ul>
        </div>
      )}

    </section>
  )
}

function AgendaCellItem({ task, onToggle, onDelete }) {
  const isDone = task.status === 'done'

  return (
    <li data-task-item className="group flex items-center gap-1 rounded border border-[var(--border)] bg-[var(--bg)]/80 px-1.5 py-1 hover:border-[var(--border-strong)]">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggle?.(task.id) }}
        className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border border-[var(--border-strong)] transition-colors hover:border-[var(--accent)]"
        aria-label={isDone ? 'Marquer non faite' : 'Marquer faite'}
      >
        {isDone && (
          <svg className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <span className={`min-w-0 flex-1 truncate text-[11px] ${isDone ? 'text-[var(--muted)] line-through' : 'text-[var(--text)]'}`} title={task.title}>
        {task.title || '—'}
      </span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete?.(task.id) }}
        className="rounded p-0.5 text-[var(--muted)] opacity-0 hover:bg-[var(--danger-subtle)] hover:text-[var(--danger)] group-hover:opacity-100"
        aria-label="Supprimer"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  )
}
