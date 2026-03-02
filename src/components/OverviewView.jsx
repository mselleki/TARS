import { useMemo, useState } from 'react'
import { TicketCaptureForm } from './TicketCaptureForm'
import { CoursesPanel } from './CoursesPanel'
import { PersoAgenda } from './PersoAgenda'
import { NotesPanel } from './NotesPanel'
import { CockpitFocusColumn } from './CockpitFocusColumn'

export function OverviewView({
  context = 'pro',
  reqTickets = [],
  searchQuery = '',
  filters = {},
  onFiltersChange,
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
  const [focusMode, setFocusMode] = useState('tickets')

  const proTickets = useMemo(() => reqTickets.filter((t) => t.scope === 'PRO'), [reqTickets])
  const existingOwners = useMemo(() => reqTickets.map((t) => t.owner).filter(Boolean), [reqTickets])

  const handleMarkDone    = (id) => onUpdateReqTicket?.(id, { status: 'DONE' })
  const handleSetWaiting  = (id) => onUpdateReqTicket?.(id, { status: 'WAITING_REPLY' })
  const handleAddFollowUp = (id) => onUpdateReqTicket?.(id, { lastFollowUpAt: Date.now() })
  const handleSetDueDate  = (id, dueAt) => onUpdateReqTicket?.(id, { dueAt })

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

  const ticketsDominant = focusMode === 'tickets'
  const gridCols = ticketsDominant
    ? 'minmax(0,3fr) minmax(0,2fr)'
    : 'minmax(0,2fr) minmax(0,3fr)'

  return (
    <div className="space-y-3">

      {/* ── Focus toggle ── */}
      <div className="flex justify-end">
        <div
          className="flex rounded-[var(--radius-md)] p-0.5"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          role="group"
          aria-label="Focus mode"
        >
          {[
            { id: 'tickets', label: 'Tickets' },
            { id: 'notes',   label: 'Notes' },
          ].map(opt => {
            const isActive = focusMode === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFocusMode(opt.id)}
                className="rounded-[var(--radius-sm)] px-3 py-1 text-[11px] font-semibold transition-all"
                style={{
                  background: isActive ? 'var(--accent)' : 'transparent',
                  color:      isActive ? '#fff' : 'var(--muted)',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: gridCols }}
      >

        {/* ── Left: Focus cockpit ── */}
        <CockpitFocusColumn
          tickets={proTickets}
          filters={filters}
          onFiltersChange={onFiltersChange}
          onMarkDone={handleMarkDone}
          onSetWaiting={handleSetWaiting}
          onAddFollowUp={handleAddFollowUp}
          onSetDueDate={handleSetDueDate}
          onDelete={onDeleteReqTicket}
        />

        {/* ── Right: Notes + Capture ── */}
        <div className="min-w-0 space-y-4">

          <NotesPanel
            meetingSheets={meetingSheets}
            onMeetingSheetChange={onMeetingSheetChange}
            standupLog={standupLog}
            compact={ticketsDominant}
          />

          {/* Ticket capture */}
          <section
            className="overflow-hidden rounded-[var(--radius-xl)]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
            aria-label="Add ticket"
          >
            <div className="px-4 pt-3 pb-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.09em]" style={{ color: 'var(--muted)' }}>
                Add ticket
              </p>
            </div>
            <div className="px-4 pb-4">
              <TicketCaptureForm
                onSubmit={(payload) => onAddReqTicket?.(payload)}
                scope="PRO"
                existingOwners={existingOwners}
              />
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

/* ── Perso context ── */

function OverviewPersoTodo({ tasks, onToggleTask, onUpdateTask, onDeleteTask }) {
  const persoTasks = useMemo(
    () => tasks.filter((t) => t.context === 'perso' && !t.projectId && t.status !== 'done').slice(0, 20),
    [tasks]
  )

  return (
    <section
      className="overflow-hidden rounded-[var(--radius-xl)]"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <h2
        className="px-4 py-3 text-sm font-semibold"
        style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', letterSpacing: '-0.01em' }}
      >
        Personal to-do
      </h2>
      <div className="space-y-2 p-4">
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
