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
      className="toast-in fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-[var(--radius-xl)] px-5 py-2.5 text-sm font-medium"
      style={{
        background: 'var(--toast-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border-strong)',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--text)',
        whiteSpace: 'nowrap',
      }}
    >
      {message}
    </div>
  )

  return createPortal(content, document.body)
}
