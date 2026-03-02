import { useState, useRef } from 'react'

const TABS = [
  { id: 'standup',        label: 'Stand-up',      hasNewMeeting: true },
  { id: 'ekofisk',        label: 'Ekofisk' },
  { id: 'dianne',         label: 'Dianne' },
  { id: 'sustainability', label: 'Sustainability' },
  { id: 'autre',          label: 'Autre' },
]

function tabKey(tabId) {
  return `notes-tab|${tabId}`
}

function getTabData(meetingSheets, tabId, standupLog) {
  const raw = meetingSheets[tabKey(tabId)]
  // Migrate legacy standupLog into the standup tab if the tab is empty
  if (raw == null) {
    if (tabId === 'standup' && standupLog) return { notes: standupLog, tasks: [] }
    return { notes: '', tasks: [] }
  }
  if (typeof raw === 'string') return { notes: raw, tasks: [] }
  const tasks = Array.isArray(raw.tasks) ? raw.tasks : []
  const normalizedTasks = tasks.map((t, i) =>
    typeof t === 'string'
      ? { id: `legacy-${i}`, label: t, done: false }
      : { id: t.id ?? `task-${i}`, label: t.label ?? '', done: !!t.done }
  )
  return {
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    tasks: normalizedTasks,
  }
}

function getMeetingBlock() {
  const now = new Date()
  const date = now.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `\n── ${date} · ${time} ──\n\n`
}

/* ── Task row ── */
function TaskRow({ task, color, onToggle, onUpdate, onDelete }) {
  return (
    <li className="group flex items-center gap-2 py-0.5">
      <button
        type="button"
        onClick={onToggle}
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all ${
          task.done
            ? 'checkbox-done border-transparent'
            : 'border-[var(--border-strong)] hover:border-[var(--accent)]'
        }`}
        aria-label={task.done ? 'Mark undone' : 'Mark done'}
      >
        {task.done && (
          <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <input
        type="text"
        value={task.label}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="Task…"
        className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[var(--muted-2)]"
        style={{
          color: task.done ? 'var(--muted)' : 'var(--text-secondary)',
          textDecoration: task.done ? 'line-through' : 'none',
        }}
      />
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 rounded p-0.5 opacity-0 transition-all group-hover:opacity-100 hover:text-[var(--danger)]"
        style={{ color: 'var(--muted-2)' }}
        aria-label="Delete task"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  )
}

/* ── Main export ── */
export function NotesPanel({
  meetingSheets = {},
  onMeetingSheetChange,
  standupLog = '',
  compact = false,
}) {
  const [activeTab, setActiveTab] = useState('standup')
  const textareaRef = useRef(null)

  const tabData = getTabData(meetingSheets, activeTab, standupLog)

  const save = (patch) => {
    onMeetingSheetChange?.(tabKey(activeTab), { ...tabData, ...patch })
  }

  const handleNewMeeting = () => {
    const block = getMeetingBlock()
    const newNotes = (tabData.notes || '') + block
    save({ notes: newNotes })
    setTimeout(() => {
      const el = textareaRef.current
      if (el) {
        el.focus()
        el.setSelectionRange(newNotes.length, newNotes.length)
        el.scrollTop = el.scrollHeight
      }
    }, 0)
  }

  const handleAddTask = () => {
    const newTask = { id: crypto.randomUUID(), label: '', done: false }
    save({ tasks: [...tabData.tasks, newTask] })
    // Focus the new task input after render
    setTimeout(() => {
      const inputs = document.querySelectorAll('[data-notes-task-input]')
      const last = inputs[inputs.length - 1]
      last?.focus()
    }, 30)
  }

  const handleToggleTask = (id) => {
    save({ tasks: tabData.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) })
  }

  const handleUpdateTask = (id, label) => {
    save({ tasks: tabData.tasks.map(t => t.id === id ? { ...t, label } : t) })
  }

  const handleDeleteTask = (id) => {
    save({ tasks: tabData.tasks.filter(t => t.id !== id) })
  }

  /* Indicator dots per tab */
  const getIndicator = (tabId) => {
    if (tabId === activeTab) return null
    const data = getTabData(meetingSheets, tabId, tabId === 'standup' ? standupLog : '')
    const pending = data.tasks.filter(t => !t.done).length
    if (pending > 0) return 'accent'
    if (data.notes.trim().length > 0) return 'muted'
    return null
  }

  const pendingCount = tabData.tasks.filter(t => !t.done).length
  const activeTabMeta = TABS.find(t => t.id === activeTab)

  const minH = compact ? '96px' : '160px'

  return (
    <section
      className="flex flex-col overflow-hidden rounded-[var(--radius-xl)]"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
      aria-label="Notes"
    >
      {/* ── Tab bar ── */}
      <div
        className="flex shrink-0 overflow-x-auto"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}
        role="tablist"
      >
        {TABS.map(tab => {
          const isActive = tab.id === activeTab
          const indicator = getIndicator(tab.id)
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex shrink-0 items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-medium transition-colors"
              style={{
                color: isActive ? 'var(--accent)' : 'var(--muted)',
                background: isActive ? 'var(--surface)' : 'transparent',
                borderBottom: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                marginBottom: '-1px',
              }}
            >
              {tab.label}
              {indicator && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: indicator === 'accent' ? 'var(--accent)' : 'var(--muted-2)' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Tab content ── */}
      <div className="flex flex-1 flex-col px-4 pt-3 pb-4">

        {/* Top row: label + "New meeting" button (standup only) */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.09em]" style={{ color: 'var(--muted)' }}>
            Notes
          </span>
          {activeTabMeta?.hasNewMeeting && (
            <button
              type="button"
              onClick={handleNewMeeting}
              className="rounded-[var(--radius-md)] px-2.5 py-1 text-[11px] font-semibold transition-all hover:bg-[var(--accent-subtle)]"
              style={{ color: 'var(--accent)', border: '1px solid var(--accent-ring)' }}
            >
              + New meeting
            </button>
          )}
        </div>

        {/* Notes textarea */}
        <textarea
          ref={textareaRef}
          value={tabData.notes}
          onChange={(e) => save({ notes: e.target.value })}
          placeholder={
            activeTab === 'standup'
              ? 'Click « New meeting » to insert a dated separator…'
              : 'Notes…'
          }
          className="w-full resize-y rounded-[var(--radius-md)] border-0 bg-transparent p-0 text-[13px] leading-[1.8] placeholder:text-[var(--muted-2)] outline-none focus:ring-0"
          style={{
            fontFamily: 'ui-serif, Georgia, serif',
            color: 'var(--text-secondary)',
            minHeight: minH,
          }}
          aria-label={`${activeTabMeta?.label} notes`}
        />

        {/* Tasks */}
        <div className="mt-3">
          {tabData.tasks.length > 0 && (
            <div className="mb-2">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.09em]" style={{ color: 'var(--muted)' }}>
                Tasks{pendingCount > 0 ? ` · ${pendingCount} pending` : ''}
              </p>
              <ul className="space-y-0.5">
                {tabData.tasks.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggleTask(task.id)}
                    onUpdate={(label) => handleUpdateTask(task.id, label)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddTask}
            className="flex items-center gap-1 text-[11px] transition-colors hover:text-[var(--text)]"
            style={{ color: 'var(--muted)' }}
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add task
          </button>
        </div>
      </div>
    </section>
  )
}
