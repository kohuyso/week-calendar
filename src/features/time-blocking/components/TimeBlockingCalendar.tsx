import React, { useState, useCallback } from 'react'
import type {
  CalendarEvent,
  NewEventPayload,
  SelectionRange,
  ContextMenuState,
} from '../types/event.types'
import { getSevenDays, setMinutesToDate, getMinutesFromMidnight } from '../utils/date.utils'
import { useCurrentTime } from '../hooks/useCurrentTime'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import { CalendarHeader } from './CalendarHeader'
import { CalendarGrid } from './CalendarGrid'
import { EventDetailsModal } from './EventDetailsModal'
import { EventFormModal } from './EventFormModal'
import { EventContextMenu } from './EventContextMenu'

export function TimeBlockingCalendar() {
  const [baseDate, setBaseDate] = useState<Date>(new Date())
  const now = useCurrentTime()
  const days = getSevenDays(baseDate)

  const { events, addEvent, updateEvent, deleteEvent, moveEvent } =
    useCalendarEvents(baseDate)

  // Drag-to-create selection state
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null)

  // Modals & Menu states
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [initialFormDates, setInitialFormDates] = useState<{
    start: Date
    end: Date
  } | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

  // Navigation handlers
  const handleToday = () => setBaseDate(new Date())

  const handlePrev = () => {
    const prev = new Date(baseDate)
    prev.setDate(baseDate.getDate() - 7)
    setBaseDate(prev)
  }

  const handleNext = () => {
    const next = new Date(baseDate)
    next.setDate(baseDate.getDate() + 7)
    setBaseDate(next)
  }

  // Drag-to-create handlers (memoized to keep references stable during drag)
  const handleStartSelection = useCallback(
    (dayIndex: number, date: Date, startMinutes: number) => {
      setSelectionRange({
        dayIndex,
        date,
        startMinutes,
        endMinutes: startMinutes + 30, // Default 30-min block
      })
    },
    []
  )

  const handleUpdateSelection = useCallback((endMinutes: number) => {
    setSelectionRange((prev) => {
      if (!prev || prev.endMinutes === endMinutes) return prev
      return {
        ...prev,
        endMinutes,
      }
    })
  }, [])

  const handleCompleteSelection = useCallback(() => {
    setSelectionRange((prev) => {
      if (!prev) return null

      const rawMin = Math.min(prev.startMinutes, prev.endMinutes)
      const rawMax = Math.max(prev.startMinutes, prev.endMinutes)
      // Guarantee minimum 30-minute block for new event
      const duration = Math.max(30, rawMax - rawMin)

      const start = setMinutesToDate(prev.date, rawMin)
      const end = setMinutesToDate(prev.date, rawMin + duration)

      setInitialFormDates({ start, end })
      setEditingEvent(null)
      setFormModalOpen(true)
      return null
    })
  }, [])

  // Event interaction handlers
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  const handleContextMenuEvent = (
    e: React.MouseEvent,
    event: CalendarEvent
  ) => {
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      event,
    })
  }

  // Active drag state for 100% accurate event repositioning
  const [activeDrag, setActiveDrag] = useState<{
    event: CalendarEvent
    grabOffsetMinutes: number
    durationMinutes: number
  } | null>(null)

  const [dragOverTarget, setDragOverTarget] = useState<{
    dayIndex: number
    startMinutes: number
  } | null>(null)

  const handleDragStartEvent = (
    event: CalendarEvent,
    grabOffsetMinutes: number
  ) => {
    const startM = getMinutesFromMidnight(event.start)
    const endM = getMinutesFromMidnight(event.end)
    const durationMinutes = Math.max(15, endM - startM)

    setActiveDrag({
      event,
      grabOffsetMinutes,
      durationMinutes,
    })
  }

  const handleDragEndEvent = () => {
    setActiveDrag(null)
    setDragOverTarget(null)
  }

  const handleDragOverColumn = (dayIndex: number, startMinutes: number) => {
    setDragOverTarget({ dayIndex, startMinutes })
  }

  const handleDropEvent = (
    eventId: string,
    targetDate: Date,
    newStartMinutes: number
  ) => {
    moveEvent(eventId, targetDate, newStartMinutes)
    setActiveDrag(null)
    setDragOverTarget(null)
  }

  // Form submit (Add or Edit)
  const handleFormSubmit = (payload: NewEventPayload, eventId?: string) => {
    if (eventId) {
      updateEvent(eventId, payload)
    } else {
      addEvent(payload)
    }
  }

  return (
    <div className="w-full flex-1 flex flex-col bg-white overflow-hidden text-gray-800">
      {/* Calendar Navigation Header */}
      <CalendarHeader
        days={days}
        onToday={handleToday}
        onPrev={handlePrev}
        onNext={handleNext}
        onNewEvent={() => {
          setEditingEvent(null)
          setInitialFormDates(null)
          setFormModalOpen(true)
        }}
      />

      {/* 24-hour Calendar Grid with events, sticky days header & sticky time column */}
      <CalendarGrid
        days={days}
        events={events}
        now={now}
        selectionRange={selectionRange}
        activeDrag={activeDrag}
        dragOverTarget={dragOverTarget}
        onStartSelection={handleStartSelection}
        onUpdateSelection={handleUpdateSelection}
        onCompleteSelection={handleCompleteSelection}
        onSelectEvent={handleSelectEvent}
        onContextMenuEvent={handleContextMenuEvent}
        onDragStartEvent={handleDragStartEvent}
        onDragEndEvent={handleDragEndEvent}
        onDragOverColumn={handleDragOverColumn}
        onDropEvent={handleDropEvent}
      />

      {/* Left-Click Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={(ev) => {
          setEditingEvent(ev)
          setInitialFormDates(null)
          setFormModalOpen(true)
        }}
        onDelete={deleteEvent}
      />

      {/* Create / Edit Form Modal */}
      <EventFormModal
        isOpen={formModalOpen}
        initialEvent={editingEvent}
        initialDates={initialFormDates}
        onClose={() => {
          setFormModalOpen(false)
          setEditingEvent(null)
          setInitialFormDates(null)
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Right-Click Context Menu */}
      <EventContextMenu
        contextMenu={contextMenu}
        onClose={() => setContextMenu(null)}
        onEdit={(ctx) => {
          setEditingEvent(ctx.event)
          setInitialFormDates(null)
          setFormModalOpen(true)
        }}
        onDelete={deleteEvent}
      />
    </div>
  )
}
