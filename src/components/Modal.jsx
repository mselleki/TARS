import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export function Modal({ isOpen, onClose, children, title }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen) {
      dialog.showModal()
      document.body.style.overflow = 'hidden'
    } else {
      dialog.close()
      document.body.style.overflow = ''
    }
    return () => {
      dialog.close()
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const dialog = dialogRef.current
    if (!dialog) return
    const handleCancel = () => onClose()
    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const content = (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-[100] m-0 max-h-[100dvh] w-full max-w-none overflow-auto border-0 bg-transparent p-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm [&::backdrop]:bg-black/50 [&::backdrop]:backdrop-blur-sm"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      onClose={onClose}
    >
      <div
        className="flex min-h-full items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
      >
        <div
          className="relative w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]"
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <h2 id="modal-title" className="mb-4 text-lg font-semibold text-[var(--text)]">
              {title}
            </h2>
          )}
          {children}
        </div>
      </div>
    </dialog>
  )

  return createPortal(content, document.body)
}
