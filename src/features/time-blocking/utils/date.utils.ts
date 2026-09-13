import type { CalendarEvent } from '../types/event.types'

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
  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const now = new Date()
  const isToday = isSameDay(date, now)

  return {
    dayName: daysOfWeek[date.getDay()],
    dayNum: date.getDate(),
    month: date.getMonth() + 1,
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

export interface PositionedEvent {
  event: CalendarEvent
  colIndex: number
  totalCols: number
}

/**
 * Calculates side-by-side layout columns for overlapping events (Google Calendar standard algorithm)
 */
export function computeOverlappingEventLayout(events: CalendarEvent[]): PositionedEvent[] {
  if (events.length === 0) return []

  // 1. Sort events by start time ascending, then by duration descending
  const sorted = [...events].sort((a, b) => {
    const diff = a.start.getTime() - b.start.getTime()
    if (diff !== 0) return diff
    const durA = a.end.getTime() - a.start.getTime()
    const durB = b.end.getTime() - b.start.getTime()
    return durB - durA
  })

  // 2. Group events into connected clusters of overlapping events
  const clusters: CalendarEvent[][] = []
  let currentCluster: CalendarEvent[] = []
  let clusterEnd = -1

  for (const ev of sorted) {
    const startM = getMinutesFromMidnight(ev.start)
    const durationMinutes = Math.max(15, (ev.end.getTime() - ev.start.getTime()) / 60000)
    const endM = startM + durationMinutes

    if (currentCluster.length === 0) {
      currentCluster.push(ev)
      clusterEnd = endM
    } else if (startM < clusterEnd) {
      currentCluster.push(ev)
      clusterEnd = Math.max(clusterEnd, endM)
    } else {
      clusters.push(currentCluster)
      currentCluster = [ev]
      clusterEnd = endM
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster)
  }

  // 3. Assign columns for each cluster using greedy interval coloring
  const result: PositionedEvent[] = []

  for (const cluster of clusters) {
    const columnEndTimes: number[] = []
    const clusterPlacements: { event: CalendarEvent; colIndex: number }[] = []

    for (const ev of cluster) {
      const startM = getMinutesFromMidnight(ev.start)
      const durationMinutes = Math.max(15, (ev.end.getTime() - ev.start.getTime()) / 60000)
      const endM = startM + durationMinutes

      let placedCol = -1
      for (let i = 0; i < columnEndTimes.length; i++) {
        if (columnEndTimes[i] <= startM) {
          placedCol = i
          columnEndTimes[i] = endM
          break
        }
      }

      if (placedCol === -1) {
        placedCol = columnEndTimes.length
        columnEndTimes.push(endM)
      }

      clusterPlacements.push({ event: ev, colIndex: placedCol })
    }

    const totalCols = Math.max(1, columnEndTimes.length)
    for (const item of clusterPlacements) {
      result.push({
        event: item.event,
        colIndex: item.colIndex,
        totalCols,
      })
    }
  }

  return result
}
