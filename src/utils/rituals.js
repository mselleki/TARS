import { today } from './date'

export function isRitualDueToday(ritual) {
  const todayStr = today()
  const schedule = ritual.schedule ?? { type: 'daily' }
  if (schedule.type === 'daily') return true
  if (schedule.type === 'weekly' && schedule.days) {
    const d = new Date(todayStr)
    const day = d.getDay()
    return schedule.days.includes(day)
  }
  return false
}
