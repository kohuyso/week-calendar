import React, { useRef, useEffect } from 'react'
import type { CalendarEvent, SelectionRange } from '../types/event.types'
import {
  HOUR_HEIGHT,
  isSameDay,
  snapToInterval,
} from '../utils/date.utils'
import { EventCard } from './EventCard'
import { CurrentTimeLine } from './CurrentTimeLine'
import { SelectionOverlay } from './SelectionOverlay'
import { DragGhostPreview } from './DragGhostPreview'

export interface DayColumnProps {
  dayIndex: number
  date: Date
  events: CalendarEvent[]
  now: Date
  selectionRange: SelectionRange | null
  activeDrag: {
    event: CalendarEvent
    grabOffsetMinutes: number
    durationMinutes: number
  } | null
  dragOverTarget: {
    dayIndex: number
    startMinutes: number
  } | null
  onStartSelection: (dayIndex: number, date: Date, startMinutes: number) => void
  onUpdateSelection: (endMinutes: number) => void
  onCompleteSelection: () => void
  onSelectEvent: (event: CalendarEvent) => void
  onContextMenuEvent: (e: React.MouseEvent, event: CalendarEvent) => void
  onDragStartEvent: (event: CalendarEvent, grabOffsetMinutes: number) => void
  onDragEndEvent: () => void
  onDragOverColumn: (dayIndex: number, startMinutes: number) => void
  onDropEvent: (eventId: string, targetDate: Date, newStartMinutes: number) => void
}

export const DayColumn = React.memo(function DayColumn({
  dayIndex,
  date,
  events,
  now,
  selectionRange,
  activeDrag,
  dragOverTarget,
  onStartSelection,
  onUpdateSelection,
  onCompleteSelection,
  onSelectEvent,
  onContextMenuEvent,
  onDragStartEvent,
  onDragEndEvent,
  onDropEvent,
  onDragOverColumn,
}: DayColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null)
  const isToday = isSameDay(date, now)
  const dayEvents = events.filter((ev) => isSameDay(ev.start, date))
  const isSelectedHere = selectionRange?.dayIndex === dayIndex

  // High-performance window tracking with requestAnimationFrame when selecting
  useEffect(() => {
    if (!isSelectedHere) return

    let rafId: number | null = null

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!columnRef.current) return
      if (rafId !== null) cancelAnimationFrame(rafId)

      rafId = requestAnimationFrame(() => {
        if (!columnRef.current) return
        const rect = columnRef.current.getBoundingClientRect()
        const offsetY = e.clientY - rect.top
        const rawMinutes = (offsetY / HOUR_HEIGHT) * 60
        const snappedMinutes = snapToInterval(rawMinutes, 15)
        onUpdateSelection(snappedMinutes)
      })
    }

    const handleWindowMouseUp = () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      onCompleteSelection()
    }

    window.addEventListener('mousemove', handleWindowMouseMove, { passive: true })
    window.addEventListener('mouseup', handleWindowMouseUp)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', handleWindowMouseMove)
      window.removeEventListener('mouseup', handleWindowMouseUp)
    }
  }, [isSelectedHere, onUpdateSelection, onCompleteSelection])

  const calculateMinutesFromClientY = (clientY: number) => {
    if (!columnRef.current) return 0
    const rect = columnRef.current.getBoundingClientRect()
    const offsetY = clientY - rect.top
    const rawMinutes = (offsetY / HOUR_HEIGHT) * 60
    return snapToInterval(rawMinutes, 15)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return

    // Prevent starting selection if clicking an existing event card
    const target = e.target as HTMLElement
    if (target.closest('[data-event-card="true"]')) {
      return
    }

    const minutes = calculateMinutesFromClientY(e.clientY)
    onStartSelection(dayIndex, date, minutes)
  }

  // HTML5 Drag & Drop handlers for moving events with 100% precision
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (!activeDrag || !columnRef.current) return

    const rect = columnRef.current.getBoundingClientRect()
    const cursorY = e.clientY - rect.top
    const rawStartMinutes = (cursorY / HOUR_HEIGHT) * 60 - activeDrag.grabOffsetMinutes
    const snappedMinutes = snapToInterval(rawStartMinutes, 15)
    const clampedMinutes = Math.max(
      0,
      Math.min(1440 - activeDrag.durationMinutes, snappedMinutes)
    )

    onDragOverColumn(dayIndex, clampedMinutes)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!activeDrag || !columnRef.current) return

    const rect = columnRef.current.getBoundingClientRect()
    const cursorY = e.clientY - rect.top
    const rawStartMinutes = (cursorY / HOUR_HEIGHT) * 60 - activeDrag.grabOffsetMinutes
    const snappedMinutes = snapToInterval(rawStartMinutes, 15)
    const clampedMinutes = Math.max(
      0,
      Math.min(1440 - activeDrag.durationMinutes, snappedMinutes)
    )

    onDropEvent(activeDrag.event.id, date, clampedMinutes)
  }

  return (
    <div
      ref={columnRef}
      onMouseDown={handleMouseDown}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ height: `${24 * HOUR_HEIGHT}px` }}
      className="relative flex-1 border-r border-gray-200 bg-white hover:bg-slate-50/40 transition-colors select-none min-w-[80px] sm:min-w-[100px]"
    >
      {/* 24 Hour slot dividers */}
      {Array.from({ length: 24 }).map((_, hour) => (
        <div
          key={hour}
          style={{ height: `${HOUR_HEIGHT}px` }}
          className="border-b border-gray-100 pointer-events-none"
        />
      ))}

      {/* Real-time Indicator Line if today */}
      {isToday && <CurrentTimeLine now={now} />}

      {/* Render Day Events */}
      {dayEvents.map((ev) => (
        <EventCard
          key={ev.id}
          event={ev}
          onSelect={onSelectEvent}
          onContextMenu={onContextMenuEvent}
          onDragStart={onDragStartEvent}
          onDragEnd={onDragEndEvent}
        />
      ))}

      {/* Live Ghost Preview while dragging an event */}
      {activeDrag && dragOverTarget?.dayIndex === dayIndex && (
        <DragGhostPreview
          startMinutes={dragOverTarget.startMinutes}
          durationMinutes={activeDrag.durationMinutes}
          title={activeDrag.event.title}
          color={activeDrag.event.color}
          baseDate={date}
        />
      )}

      {/* Drag Selection Highlight Preview when creating new event */}
      {isSelectedHere && selectionRange && (
        <SelectionOverlay
          startMinutes={selectionRange.startMinutes}
          endMinutes={selectionRange.endMinutes}
          baseDate={date}
        />
      )}
    </div>
  )
})
