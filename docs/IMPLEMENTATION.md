# Organizer - Implementation Notes

## File Structure

```
src/
├── App.jsx                 # Main orchestrator, composes all components
├── App.css                 # Minimal custom styles
├── main.jsx                # Entry point, SW registration
├── index.css               # Tailwind imports
├── constants.js            # PRIORITIES, CONTEXTS, STORAGE_KEY
├── components/
│   ├── Header.jsx          # Context tabs, search, view toggle, install button
│   ├── TaskComposer.jsx    # Add task form (inline or expanded)
│   ├── TaskItem.jsx        # Single task with inline editing
│   ├── TaskList.jsx        # List view sections (Focus, Today, Inbox, etc.)
│   ├── KanbanBoard.jsx     # Kanban columns
│   ├── SearchBar.jsx       # Search input with clear
│   ├── EmptyState.jsx      # Empty and search-empty states
│   └── InstallPrompt.jsx   # PWA install banner
├── hooks/
│   ├── useTasks.js         # useReducer + persistence, useTaskFilters
│   ├── usePWA.js           # Install prompt state
│   └── useKeyboardShortcuts.js
└── utils/
    ├── storage.js          # loadTasks, saveTasks
    └── date.js             # today(), formatDate()
```

## Logic Flow

- **App.jsx**: Holds UI state (context, view, searchQuery, showComposer). Uses useTasks, usePWA, useKeyboardShortcuts. Passes handlers to children.
- **useTasks**: useReducer for CRUD. Persists to localStorage on change. useTaskFilters derives focusTasks, todayTasks, inboxTasks, etc. from tasks + context + search.
- **TaskItem**: Inline edit for title (click), dueDate (click), priority (click). Enter saves, Esc cancels.

## PWA - Local Testing Steps

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Serve the build** (required for PWA - service worker needs HTTPS or localhost):
   ```bash
   npm run preview
   ```

3. **Open** `http://localhost:4173` in Chrome or Edge.

4. **Install**:
   - Click the Install button in the header, OR
   - Browser menu (⋮) → "Install Organizer" / "Install app"

5. **Offline test**:
   - Open DevTools → Application → Service Workers
   - Check "Offline"
   - Reload - app should load from cache

## Manual QA Checklist

### PWA
- [ ] App is installable (Install button or browser menu)
- [ ] Installed app opens in standalone window
- [ ] App icon appears in taskbar/desktop
- [ ] Works offline (build, then disconnect network, reload)
- [ ] Install banner appears (dismisses with "Not now")

### Inline editing
- [ ] Click task title → edits in place, Enter saves, Esc cancels
- [ ] Click due date → date picker, blur/Enter saves
- [ ] Click priority badge → select, change saves
- [ ] Empty title on save is rejected
- [ ] Edit state has visible ring/highlight

### Keyboard shortcuts
- [ ] Ctrl+N (Cmd+N on Mac) opens new task composer
- [ ] / focuses search input
- [ ] Esc closes composer or cancels edit
- [ ] Shortcuts do NOT fire when typing in inputs (except Esc)
- [ ] Enter in composer submits; Enter in task edit saves

### Search
- [ ] Search filters tasks by title in real time
- [ ] Result count displays
- [ ] Clear button clears search
- [ ] Empty result shows SearchEmptyState with "Clear search" action

### General
- [ ] Pro/Perso tabs filter correctly
- [ ] List/Kanban view toggle works
- [ ] Tasks persist after reload
- [ ] Mobile responsive layout
- [ ] Focus states visible (keyboard navigation)
- [ ] aria-labels on interactive elements
