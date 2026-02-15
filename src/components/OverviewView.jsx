import { useState } from 'react'
import { TaskItem } from './TaskItem'
import { EmptyState, SearchEmptyState } from './EmptyState'
import { TicketsPanel } from './TicketsPanel'
import { CoursesPanel } from './CoursesPanel'

const SECTIONS = [
  { id: 'in_progress', label: 'In progress', tint: 'var(--column-in-progress)' },
  { id: 'backlog', label: 'Backlog', tint: 'var(--column-backlog)' },
  { id: 'done', label: 'Done', tint: 'var(--column-done)' },
]

export function OverviewView({
  backlog = [],
  inProgress = [],
  done = [],
  searchQuery,
  onClearSearch,
  projects = [],
  onNewTask,
  onToggle,
  onUpdate,
  onDelete,
  onStatusChange,
  onAddFocus,
  onRemoveFocus,
  focusIds = [],
  context = 'pro',
  tickets = [],
  onAddTicket,
  onUpdateTicket,
  onDeleteTicket,
  onResolveTicket,
  requesters = [],
  onAddRequester,
  onAddProject,
  onAddTask,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
}) {
  const [collapsed, setCollapsed] = useState({})
  const toggleSection = (id) => setCollapsed((c) => ({ ...c, [id]: !c[id] }))

  const sections = [
    { ...SECTIONS[0], tasks: inProgress },
    { ...SECTIONS[1], tasks: backlog },
    { ...SECTIONS[2], tasks: done },
  ]

  const totalTasks = backlog.length + inProgress.length + done.length
  const hasTasks = totalTasks > 0

  return (
    <div className="space-y-6">
      {context === 'pro' && (
        <TicketsPanel
          tickets={tickets}
          requesters={requesters}
          onAdd={onAddTicket}
          onUpdate={onUpdateTicket}
          onDelete={onDeleteTicket}
          onResolve={onResolveTicket}
          onAddRequester={onAddRequester}
        />
      )}
      {context === 'perso' && (
        <CoursesPanel
          projects={projects}
          tasks={[...inProgress, ...backlog, ...done]}
          context={context}
          onAddProject={onAddProject}
          onAddTask={onAddTask}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onToggleTask={onToggleTask}
        />
      )}
      {!hasTasks && searchQuery && (
        <SearchEmptyState onClear={onClearSearch || (() => {})} />
      )}
      {!hasTasks && !searchQuery && (
        <EmptyState onAction={onNewTask} shortcut="Ctrl+K" />
      )}
      {hasTasks && (
      <>
      <div className="mb-8">
        <button
          type="button"
          onClick={() => onNewTask()}
          className="flex w-full items-center gap-3 rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 text-left text-sm font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-[var(--transition)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
        >
            <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg)] text-[var(--muted)]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </span>
          Add a task
          <kbd className="ml-auto hidden rounded bg-[var(--bg)] px-2 py-0.5 text-xs font-medium text-[var(--muted)] sm:inline">Ctrl+K</kbd>
        </button>
      </div>

      {sections.map(({ id, label, tasks, tint }) => {
        const isCollapsed = collapsed[id]
        if (tasks.length === 0) return null

        return (
          <section
            key={id}
            className="rounded-[var(--radius-xl)] border border-[var(--border)] overflow-hidden shadow-[var(--shadow-sm)]"
            style={{ backgroundColor: tint }}
          >
            <button
              type="button"
              onClick={() => toggleSection(id)}
              className="flex w-full items-center justify-between border-b border-[var(--border)] px-4 py-3.5 text-left transition-[var(--transition)] hover:bg-[var(--surface)]/60"
              aria-expanded={!isCollapsed}
            >
              <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
                {label}
              </h2>
              <span className="flex items-center gap-2">
                <span className="rounded-[var(--radius-sm)] bg-[var(--surface)] px-2.5 py-0.5 text-xs font-medium tabular-nums text-[var(--muted)]">
                  {tasks.length}
                </span>
                <svg
                  className={`h-4 w-4 text-[var(--muted)] transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {!isCollapsed && (
              <ul className="space-y-2 p-3">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <TaskItem
                      task={task}
                      projects={projects}
                      onToggle={onToggle}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                      onAddFocus={onAddFocus}
                      onRemoveFocus={onRemoveFocus}
                      isFocus={focusIds.includes(task.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
      </>
      )}
    </div>
  )
}
