export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  color?: string
}

export interface NewEventPayload {
  title: string
  description?: string
  start: Date
  end: Date
  color?: string
}

export interface SelectionRange {
  dayIndex: number
  date: Date
  startMinutes: number
  endMinutes: number
}

export interface ContextMenuState {
  x: number
  y: number
  event: CalendarEvent
}

export interface DraggedEventState {
  event: CalendarEvent
  initialDayIndex: number
  initialStartMinutes: number
  durationMinutes: number
  currentDayIndex: number
  currentStartMinutes: number
}
