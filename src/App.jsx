import { useState, useRef, useCallback, useEffect } from 'react'
import { useStore } from './hooks/useStore'
import { useTaskFilters } from './hooks/useTaskFilters'
import { usePWA } from './hooks/usePWA'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { isRitualDueToday } from './utils/rituals'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { OverviewView } from './components/OverviewView'
import { TaskComposer } from './components/TaskComposer'
import { TodayPanel } from './components/TodayPanel'
import { KanbanBoard } from './components/KanbanBoard'
import { RitualsView } from './components/RitualsView'
import { ProjectsView } from './components/ProjectsView'
import { CoursesView } from './components/CoursesView'
import { TicketsView } from './components/TicketsView'
import { RitualBanner } from './components/RitualBanner'
import { ReflectionPrompt } from './components/ReflectionPrompt'
import { EmptyState, SearchEmptyState } from './components/EmptyState'
import { InstallPrompt } from './components/InstallPrompt'
import { Modal } from './components/Modal'
import { Toast } from './components/Toast'
import { TaskItem } from './components/TaskItem'
import { MAX_FOCUS_TASKS, isViewAvailableInContext } from './constants'
import './App.css'

function App() {
  const [context, setContext] = useState('pro')
  const [view, setView] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [energyFilter, setEnergyFilter] = useState(null)
  const [showComposer, setShowComposer] = useState(false)
  const [composerProjectId, setComposerProjectId] = useState(null)
  const [isSilentMode, setIsSilentMode] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [dismissedRituals, setDismissedRituals] = useState(new Set())
  const [toastMessage, setToastMessage] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('organizer-theme') === 'dark'
    } catch {
      return false
    }
  })
  const searchRef = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
      localStorage.setItem('organizer-theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('organizer-theme', 'light')
    }
  }, [isDarkMode])

  const {
    state,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    addFocus,
    removeFocus,
    swapFocus,
    reorderFocus,
    addProject,
    updateProject,
    deleteProject,
    addRitual,
    updateRitual,
    deleteRitual,
    addTicket,
    updateTicket,
    deleteTicket,
    resolveTicket,
    updateReflection,
    todayPlan,
  } = useStore()

  const todayFocusIds = todayPlan.focusTaskIds ?? []

  const { filtered, focusTasks, backlog, inProgress, done, kanbanColumns } =
    useTaskFilters({
      tasks: state.tasks,
      context,
      searchQuery,
      energyFilter,
      todayFocusIds,
    })

  const dueRituals = state.rituals.filter(
    (r) => isRitualDueToday(r) && !dismissedRituals.has(r.id)
  )
  const firstDueRitual = dueRituals[0]

  const { canInstall, showInstallBanner, install, dismissInstall } = usePWA()

  const handleNewTask = useCallback((projectId = null) => {
    const id = typeof projectId === 'string' ? projectId : null
    setComposerProjectId(id)
    setShowComposer(true)
  }, [])
  const handleFocusSearch = useCallback(() => searchRef.current?.focus(), [])
  const handleGoToday = useCallback(() => setView('today'), [])
  const handleGoOverview = useCallback(() => setView('overview'), [])
  const handleEscape = useCallback(() => {
    setShowComposer(false)
    setComposerProjectId(null)
    setIsSilentMode(false)
  }, [])

  const handleSetEnergy = useCallback(
    (energy) => {
      const active = document.activeElement?.closest('[data-task-id]')
      if (active) {
        const id = active.getAttribute('data-task-id')
        if (id) updateTask(id, { energy })
      }
    },
    [updateTask]
  )

  useKeyboardShortcuts({
    onNewTask: handleNewTask,
    onFocusSearch: handleFocusSearch,
    onGoToday: handleGoToday,
    onGoOverview: handleGoOverview,
    onSetEnergy: handleSetEnergy,
    onEscape: handleEscape,
    enabled: !showComposer,
  })

  const handleAddTask = useCallback((payload) => {
    const id = addTask({ ...payload, context, projectId: payload.projectId || null })
    if (view === 'today' && todayFocusIds.length < MAX_FOCUS_TASKS && id) addFocus(id)
    setShowComposer(false)
    setComposerProjectId(null)
    setToastMessage('Task created')
  }, [addTask, context, view, todayFocusIds.length, addFocus])

  const handleStatusChange = (id, status) => {
    updateTask(id, { status })
  }

  const handleAddProject = useCallback(() => {
    addProject({ title: 'New project', context })
  }, [addProject])

  const handleAddSubProject = useCallback((parentId) => {
    addProject({ title: 'New sub-project', context, parentProjectId: parentId })
  }, [addProject, context])

  const handleAddCategory = useCallback((parentId, title) => {
    addProject({ title: title || 'Nouvelle catégorie', context, parentProjectId: parentId })
  }, [addProject, context])

  const handleDeleteProject = useCallback((id) => {
    const subs = state.projects.filter((p) => p.parentProjectId === id)
    subs.forEach((s) => handleDeleteProject(s.id))
    state.tasks.filter((t) => t.projectId === id).forEach((t) => updateTask(t.id, { projectId: null }))
    deleteProject(id)
  }, [state.projects, state.tasks, deleteProject, updateTask])

  const handleOpenComposerForProject = useCallback((projectId) => {
    setComposerProjectId(projectId)
    setShowComposer(true)
  }, [])

  const handleContextChange = useCallback((newContext) => {
    setContext(newContext)
    if (!isViewAvailableInContext(view, newContext)) {
      setView('overview')
    }
  }, [view])

  const handleAddFocus = (taskId) => {
    if (todayFocusIds.length >= MAX_FOCUS_TASKS) {
      const toRemove = todayFocusIds[todayFocusIds.length - 1]
      swapFocus(taskId, toRemove)
    } else {
      addFocus(taskId)
    }
  }

  const contextTasks = state.tasks.filter((t) => t.context === context)
  const isEmpty = contextTasks.length === 0

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Sidebar view={view} onViewChange={setView} context={context} />

      <div className="flex min-w-0 flex-1 flex-col">
      <Header
        context={context}
        onContextChange={handleContextChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResultsCount={filtered.length}
        searchRef={searchRef}
        energyFilter={energyFilter}
        onEnergyFilterChange={setEnergyFilter}
        onInstallClick={install}
        canInstall={canInstall}
        isSilentMode={isSilentMode}
        onToggleSilentMode={() => setIsSilentMode((v) => !v)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((v) => !v)}
      />

      <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:mx-auto lg:max-w-4xl">
        {view === 'overview' && (
          <OverviewView
            backlog={backlog}
            inProgress={inProgress}
            done={done}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
            projects={state.projects.filter((p) => p.context === context)}
            onNewTask={() => handleNewTask()}
            onToggle={toggleTaskStatus}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onStatusChange={handleStatusChange}
            onAddFocus={handleAddFocus}
            onRemoveFocus={removeFocus}
            focusIds={todayFocusIds}
          />
        )}

        {view === 'today' && (
          <>
            {firstDueRitual && (
              <RitualBanner
                ritual={firstDueRitual}
                onComplete={(id) => setDismissedRituals((s) => new Set(s).add(id))}
                onDismiss={() => setDismissedRituals((s) => new Set(s).add(firstDueRitual.id))}
              />
            )}

            <div className="mb-8">
              <button
                type="button"
                onClick={() => handleNewTask()}
                className="flex w-full items-center gap-3 rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 text-left text-sm font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-[var(--transition)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg)] text-[var(--muted)]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                Add a task
                <kbd className="ml-auto hidden rounded bg-[var(--bg)] px-2 py-0.5 text-xs text-[var(--muted)] sm:inline">Ctrl+K</kbd>
              </button>
            </div>

            <TodayPanel
              focusTasks={focusTasks}
              projects={state.projects.filter((p) => p.context === context)}
              onToggle={toggleTaskStatus}
              onUpdate={updateTask}
              onDelete={deleteTask}
              onStatusChange={handleStatusChange}
              onRemoveFocus={removeFocus}
              onReorderFocus={reorderFocus}
              onChoosePriorities={() => handleNewTask()}
              isEmpty={focusTasks.length === 0}
              isSilentMode={isSilentMode}
              selectedTaskId={selectedTaskId}
              onSelectTask={setSelectedTaskId}
            />

            {!isSilentMode && (
              <ReflectionPrompt
                tasks={state.tasks.filter((t) => t.context === context)}
                reflection={todayPlan.reflection ?? {}}
                onSave={updateReflection}
              />
            )}

            {!isSilentMode && filtered.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Rest
                </h2>
                <ul className="space-y-2">
                  {filtered
                    .filter((t) => !todayFocusIds.includes(t.id))
                    .slice(0, 15)
                    .map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleTaskStatus}
                        onUpdate={updateTask}
                        onDelete={deleteTask}
                        onStatusChange={handleStatusChange}
                        onAddFocus={handleAddFocus}
                        onRemoveFocus={removeFocus}
                        isFocus={todayFocusIds.includes(task.id)}
                        projects={state.projects.filter((p) => p.context === context)}
                      />
                    ))}
                </ul>
              </section>
            )}
          </>
        )}

        {view === 'board' && (
          <>
            <div className="mb-8">
              <button
                type="button"
                onClick={() => handleNewTask()}
                className="flex w-full items-center gap-3 rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 text-left text-sm font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition-[var(--transition)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg)] text-[var(--muted)]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                Add a task
              </button>
            </div>
            {filtered.length === 0 ? (
              searchQuery ? (
                <SearchEmptyState onClear={() => setSearchQuery('')} />
              ) : (
                <EmptyState onAction={() => handleNewTask()} shortcut="Ctrl+K" />
              )
            ) : (
              <KanbanBoard
                columns={kanbanColumns}
                focusIds={todayFocusIds}
                projects={state.projects.filter((p) => p.context === context)}
                onToggle={toggleTaskStatus}
                onUpdate={updateTask}
                onDelete={deleteTask}
                onStatusChange={handleStatusChange}
                onAddFocus={handleAddFocus}
                onRemoveFocus={removeFocus}
              />
            )}
          </>
        )}

        {view === 'projects' && (
          <ProjectsView
            projects={state.projects}
            tasks={filtered}
            context={context}
            onAddProject={handleAddProject}
            onAddSubProject={handleAddSubProject}
            onUpdateProject={updateProject}
            onDeleteProject={handleDeleteProject}
            onAddTask={handleOpenComposerForProject}
            onToggle={toggleTaskStatus}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onStatusChange={handleStatusChange}
            onAddFocus={handleAddFocus}
            onRemoveFocus={removeFocus}
            focusIds={todayFocusIds}
          />
        )}

        {view === 'tickets' && (
          <TicketsView
            tickets={state.tickets ?? []}
            context={context}
            onAdd={addTicket}
            onUpdate={updateTicket}
            onDelete={deleteTicket}
            onResolve={resolveTicket}
          />
        )}

        {view === 'rituals' && (
          <RitualsView
            rituals={state.rituals}
            onAdd={addRitual}
            onUpdate={updateRitual}
            onDelete={deleteRitual}
          />
        )}

        {view === 'courses' && (
          <CoursesView
            projects={state.projects}
            tasks={state.tasks.filter((t) => t.context === context)}
            context={context}
            onAddProject={addProject}
            onAddSubProject={handleAddCategory}
            onAddTask={(payload) => addTask(payload)}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onToggleTask={toggleTaskStatus}
          />
        )}

      </main>
      </div>

      <Modal
        isOpen={showComposer}
        onClose={handleEscape}
        title="New task"
      >
        <TaskComposer
          onSubmit={handleAddTask}
          onCancel={handleEscape}
          context={context}
          initialFocus
          embedded
          projectId={composerProjectId}
          projects={state.projects.filter((p) => p.context === context)}
          onProjectChange={setComposerProjectId}
        />
      </Modal>

      <Toast
        message={toastMessage}
        onDismiss={() => setToastMessage('')}
      />

      <InstallPrompt
        show={showInstallBanner}
        onInstall={install}
        onDismiss={dismissInstall}
      />
    </div>
  )
}

export default App
