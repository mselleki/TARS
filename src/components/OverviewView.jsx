import { useMemo, useState } from 'react'
import { TicketCaptureForm } from './TicketCaptureForm'
import { TicketList } from './TicketList'
import { CoursesPanel } from './CoursesPanel'
import { PersoAgenda } from './PersoAgenda'
import { DailyStandup } from './DailyStandup'

function EmptyStateTickets() {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
      <p className="text-sm text-[var(--text-secondary)]">
        Track REQ tickets with owners and follow-ups so nothing gets lost.
      </p>
    </div>
  )
}

export function OverviewView({
  context = 'pro',
  reqTickets = [],
  searchQuery = '',
  filters = {},
  onAddReqTicket,
  onUpdateReqTicket,
  onDeleteReqTicket,
  projects = [],
  tasks = [],
  onAddProject,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
  onOpenComposerForDate,
  meetings = [],
  onAddMeeting,
  onUpdateMeeting,
  onDeleteMeeting,
}) {
  const proTickets = useMemo(() => reqTickets.filter((t) => t.scope === 'PRO'), [reqTickets])
  const existingOwners = useMemo(() => reqTickets.map((t) => t.owner).filter(Boolean), [reqTickets])
  const hasTickets = proTickets.length > 0
  const showEmptyState = !hasTickets

  const handleMarkDone = (id) => onUpdateReqTicket?.(id, { status: 'DONE' })
  const handleSetWaiting = (id) => onUpdateReqTicket?.(id, { status: 'WAITING_REPLY' })
  const handleAddFollowUp = (id) => onUpdateReqTicket?.(id, { lastFollowUpAt: Date.now() })
  const handleSetDueDate = (id, dueAt) => onUpdateReqTicket?.(id, { dueAt })

  if (context === 'perso') {
    return (
      <div className="space-y-6">
        <CoursesPanel
          projects={projects}
          tasks={tasks}
          context="perso"
          onAddProject={onAddProject}
          onAddTask={onAddTask}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onToggleTask={onToggleTask}
        />
        <OverviewPersoTodo
          tasks={tasks}
          onToggleTask={onToggleTask}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
        />
        <PersoAgenda
          tasks={tasks}
          onToggleTask={onToggleTask}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onAddTaskForDate={onOpenComposerForDate}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DailyStandup
        meetings={meetings}
        onAddMeeting={onAddMeeting}
        onUpdateMeeting={onUpdateMeeting}
        onDeleteMeeting={onDeleteMeeting}
      />
      <section
        className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
        aria-label="Add ticket"
      >
        <h2 className="mb-4 text-sm font-semibold text-[var(--text-secondary)]">Add ticket</h2>
        <TicketCaptureForm
          onSubmit={(payload) => onAddReqTicket?.(payload)}
          scope="PRO"
          existingOwners={existingOwners}
          initialFocus
        />
      </section>

      <section aria-label="Tickets">
        {showEmptyState ? (
          <EmptyStateTickets />
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-secondary)]">Tickets</h2>
              <span className="text-xs text-[var(--muted)]">
                {proTickets.length} ticket{proTickets.length !== 1 ? 's' : ''}
              </span>
            </div>
            <TicketList
              tickets={reqTickets}
              searchQuery={searchQuery}
              scopeFilter="PRO"
              filters={filters}
              onMarkDone={handleMarkDone}
              onSetWaiting={handleSetWaiting}
              onAddFollowUp={handleAddFollowUp}
              onSetDueDate={handleSetDueDate}
              onDelete={onDeleteReqTicket}
            />
          </>
        )}
      </section>
    </div>
  )
}

function OverviewPersoTodo({ tasks, onToggleTask, onUpdateTask, onDeleteTask }) {
  const persoTasks = useMemo(
    () => tasks.filter((t) => t.context === 'perso' && !t.projectId && t.status !== 'done').slice(0, 20),
    [tasks]
  )

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-sm)]">
      <h2 className="border-b border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
        To-do perso
      </h2>
      <div className="p-4 space-y-2">
        {persoTasks.length === 0 ? (
          <p className="text-xs text-[var(--muted)]">Aucune tâche. Ajoutez-en depuis Projects ou le Board (contexte Perso).</p>
        ) : (
          <ul className="space-y-2">
            {persoTasks.map((task) => (
              <PersoTodoRow
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function PersoTodoRow({ task, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(task.title || '')

  const save = () => {
    const t = value.trim()
    if (t) onUpdate?.(task.id, { title: t })
    setEditing(false)
  }

  return (
    <li className="group flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)]/50 px-3 py-2.5 hover:border-[var(--border-strong)]">
      <button
        type="button"
        onClick={() => onToggle?.(task.id)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-[var(--border-strong)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]"
        aria-label="Marquer faite"
      />
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-[var(--accent)] bg-[var(--surface)] px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
          autoFocus
        />
      ) : (
        <button
          type="button"
          onClick={() => { setValue(task.title || ''); setEditing(true) }}
          className="min-w-0 flex-1 truncate text-left text-sm text-[var(--text)] hover:text-[var(--accent)]"
        >
          {task.title || '—'}
        </button>
      )}
      <button
        type="button"
        onClick={() => onDelete?.(task.id)}
        className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--danger-subtle)] hover:text-[var(--danger)]"
        aria-label="Supprimer"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  )
}
