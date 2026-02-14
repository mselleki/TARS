import { useEffect, useCallback } from 'react'

function isInputFocused() {
  const active = document.activeElement
  if (!active) return false
  const tag = active.tagName.toLowerCase()
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    active.isContentEditable
  )
}

export function useKeyboardShortcuts({
  onNewTask,
  onFocusSearch,
  onGoToday,
  onGoOverview,
  onSetEnergy,
  onEscape,
  enabled = true,
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (!enabled) return

      if (e.key === 'Escape') {
        onEscape?.()
        return
      }

      const inInput = isInputFocused()
      if (inInput && e.key !== 'Escape') {
        if (e.key === 'k' || e.key === 'K') {
          if (!e.ctrlKey && !e.metaKey) return
        } else if (e.key === '/' || e.key === 't' || e.key === 'T' || e.key === 'o' || e.key === 'O') {
          return
        } else if (['1', '2', '3'].includes(e.key) && !e.ctrlKey && !e.metaKey) {
          return
        }
      }

      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        onNewTask?.()
        return
      }

      if (e.key === '/') {
        e.preventDefault()
        onFocusSearch?.()
        return
      }

      if (e.key === 't' || e.key === 'T') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          onGoToday?.()
          return
        }
      }

      if (e.key === 'o' || e.key === 'O') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          onGoOverview?.()
          return
        }
      }

      if (['1', '2', '3'].includes(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const active = document.activeElement
        const inTaskCard = active?.closest('[data-task-id]')
        if (inTaskCard) {
          e.preventDefault()
          const map = { '1': 'deep', '2': 'quick', '3': 'light' }
          onSetEnergy?.(map[e.key])
        }
      }
    },
    [enabled, onNewTask, onFocusSearch, onGoToday, onGoOverview, onSetEnergy, onEscape]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [handleKeyDown])
}
