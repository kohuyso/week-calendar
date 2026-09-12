export const HOUR_HEIGHT = 64 // 64px per hour for great readability

export function getSevenDays(baseDate: Date): Date[] {
  const days: Date[] = []
  const start = new Date(baseDate)
  start.setHours(0, 0, 0, 0)

  for (let i = 0; i < 7; i++) {
    const next = new Date(start)
    next.setDate(start.getDate() + i)
    days.push(next)
  }
  return days
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

export function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}

export function formatDateLabel(date: Date) {
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const dayName = daysOfWeek[date.getDay()]
  const dayNum = date.getDate()
  const today = new Date()
  const isToday = isSameDay(date, today)

  return {
    dayName,
    dayNum,
    isToday,
  }
}

export function snapToInterval(minutes: number, interval = 15): number {
  return Math.max(0, Math.min(1440, Math.round(minutes / interval) * interval))
}

export function getMinutesFromMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes()
}

export function setMinutesToDate(date: Date, minutes: number): Date {
  const res = new Date(date)
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  res.setHours(h, m, 0, 0)
  return res
}

export function toDateTimeLocalString(date: Date): string {
  const Y = date.getFullYear()
  const M = (date.getMonth() + 1).toString().padStart(2, '0')
  const D = date.getDate().toString().padStart(2, '0')
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  return `${Y}-${M}-${D}T${h}:${m}`
}

export function parseDateTimeLocal(val: string): Date {
  const [datePart, timePart] = val.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes] = timePart.split(':').map(Number)
  return new Date(year, month - 1, day, hours, minutes, 0, 0)
}
