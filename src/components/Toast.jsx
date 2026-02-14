import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export function Toast({ message, onDismiss, duration = 2500 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onDismiss])

  if (!message) return null

  const content = (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-[var(--radius-lg)] bg-[var(--text)] px-4 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-lg)] transition-opacity duration-300"
    >
      {message}
    </div>
  )

  return createPortal(content, document.body)
}
