import { useState, useEffect } from 'react'
import type { CalendarEvent, NewEventPayload } from '../types/event.types'
import { getInitialMockEvents } from '../utils/mock-events'
import { setMinutesToDate } from '../utils/date.utils'

const STORAGE_KEY = 'home_test_time_blocking_events'

export function useCalendarEvents(baseDate: Date) {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Array<{
          id: string
          title: string
          description?: string
          start: string
          end: string
          color?: string
        }>
        return parsed.map((item) => ({
          ...item,
          start: new Date(item.start),
          end: new Date(item.end),
        }))
      }
    } catch {
      // ignore JSON parse error
    }
    return getInitialMockEvents(baseDate)
  })

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
    } catch {
      // ignore
    }
  }, [events])

  const addEvent = (payload: NewEventPayload): CalendarEvent => {
    const newEvent: CalendarEvent = {
      id: 'event-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      ...payload,
    }
    setEvents((prev) => [...prev, newEvent])
    return newEvent
  }

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, ...updates } : ev))
    )
  }

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id))
  }

  const moveEvent = (id: string, targetDay: Date, newStartMinutes: number) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== id) return ev

        const durationMs = ev.end.getTime() - ev.start.getTime()
        const newStart = setMinutesToDate(targetDay, newStartMinutes)
        const newEnd = new Date(newStart.getTime() + durationMs)

        return {
          ...ev,
          start: newStart,
          end: newEnd,
        }
      })
    )
  }

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
  }
}
