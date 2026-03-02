import { useMemo, useState } from 'react'
import { TicketCaptureForm } from './TicketCaptureForm'
import { TicketList } from './TicketList'
import { CoursesPanel } from './CoursesPanel'
import { PersoAgenda } from './PersoAgenda'
import { DailyStandup } from './DailyStandup'

function EmptyStateTickets() {
  return (
    <div
      className="rounded-[var(--radius-xl)] p-6 text-center"
      style={{ background: 'var(--surface)', border: '1px dashed var(--border)' }}
    >
      <p className="text-sm" style={{ color: 'var(--muted)' }}>
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
  standupLog = '',
  onStandupLogChange,
  meetingSheets = {},
  onMeetingSheetChange,
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      {/* Left column: standup notes + country context */}
      <div className="min-w-0">
        <DailyStandup
          standupLog={standupLog}
          onStandupLogChange={onStandupLogChange}
          meetingSheets={meetingSheets}
          onMeetingSheetChange={onMeetingSheetChange}
        />
      </div>

      {/* Right column: ticket capture + ticket list */}
      <div className="min-w-0 space-y-4">
        <section
          className="rounded-[var(--radius-xl)] p-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          aria-label="Add ticket"
        >
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
    </div>
  )
}

function OverviewPersoTodo({ tasks, onToggleTask, onUpdateTask, onDeleteTask }) {
  const persoTasks = useMemo(
    () => tasks.filter((t) => t.context === 'perso' && !t.projectId && t.status !== 'done').slice(0, 20),
    [tasks]
  )

  return (
    <section
      className="rounded-[var(--radius-xl)] overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <h2
        className="px-4 py-3 text-sm font-semibold"
        style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', letterSpacing: '-0.01em' }}
      >
        Personal to-do
      </h2>
      <div className="p-4 space-y-2">
        {persoTasks.length === 0 ? (
          <p className="text-xs text-[var(--muted)]">No tasks. Add some from Projects or the Board (Perso context).</p>
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
    <li className="task-card task-border group flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5">
      <button
        type="button"
        onClick={() => onToggle?.(task.id)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-[var(--border-strong)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]"
        aria-label="Mark done"
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
        aria-label="Delete"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  )
}
