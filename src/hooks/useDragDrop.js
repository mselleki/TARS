const DRAG_TYPE_TASK = 'application/x-organizer-task'

export function useDragDrop() {
  const handleDragStart = (e, payload) => {
    e.dataTransfer.setData(DRAG_TYPE_TASK, JSON.stringify(payload))
    e.dataTransfer.effectAllowed = 'move'
    e.currentTarget.classList.add('opacity-50')
  }

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-50')
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const getDragPayload = (e) => {
    const raw = e.dataTransfer.getData(DRAG_TYPE_TASK)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  return { handleDragStart, handleDragEnd, handleDragOver, getDragPayload }
}
