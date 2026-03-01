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
        background: 'rgba(20,20,32,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
        color: 'var(--text)',
        whiteSpace: 'nowrap',
      }}
    >
      {message}
    </div>
  )

  return createPortal(content, document.body)
}
