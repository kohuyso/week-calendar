import React, { useRef, useEffect, useMemo } from 'react'
import type { CalendarEvent, SelectionRange } from '../types/event.types'
import {
  HOUR_HEIGHT,
  isSameDay,
  snapToInterval,
  computeOverlappingEventLayout,
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
  const positionedEvents = useMemo(
    () => computeOverlappingEventLayout(dayEvents),
    [dayEvents]
  )
  const isSelectedHere = selectionRange?.dayIndex === dayIndex
  const lastMouseClientYRef = useRef<number | null>(null)

  const calculateMinutesFromClientY = (clientY: number) => {
    if (!columnRef.current) return 0
    const rect = columnRef.current.getBoundingClientRect()
    const offsetY = clientY - rect.top
    const rawMinutes = (offsetY / HOUR_HEIGHT) * 60
    return snapToInterval(rawMinutes, 15)
  }

  // High-performance window tracking with continuous auto-scroll when selecting
  useEffect(() => {
    if (!isSelectedHere) return

    let autoScrollRafId: number | null = null
    let lastCalculatedMinutes = -1

    const updateSelectionFromClientY = (clientY: number) => {
      const snappedMinutes = calculateMinutesFromClientY(clientY)
      if (snappedMinutes !== lastCalculatedMinutes) {
        lastCalculatedMinutes = snappedMinutes
        onUpdateSelection(snappedMinutes)
      }
    }

    const handleWindowMouseMove = (e: MouseEvent) => {
      lastMouseClientYRef.current = e.clientY
      updateSelectionFromClientY(e.clientY)
    }

    // Auto-scroll loop when mouse is near top or bottom edges of the calendar view
    const EDGE_ZONE = 90
    const MAX_SPEED = 24
    const HEADER_OFFSET = 55

    const autoScrollLoop = () => {
      if (columnRef.current && lastMouseClientYRef.current !== null) {
        const scrollContainer =
          columnRef.current.closest<HTMLElement>('[data-calendar-scroll="true"]') ||
          columnRef.current.closest<HTMLElement>('.overflow-auto')

        if (scrollContainer) {
          const containerRect = scrollContainer.getBoundingClientRect()
          const clientY = lastMouseClientYRef.current

          // Active viewport boundaries ensure scroll triggers even if container overflows viewport
          const viewportBottom = Math.min(window.innerHeight, containerRect.bottom)
          const viewportTop = Math.max(0, containerRect.top)
          let delta = 0

          if (clientY >= viewportBottom - EDGE_ZONE) {
            // Near or past bottom edge -> scroll down
            const overflow = clientY - (viewportBottom - EDGE_ZONE)
            const ratio = Math.min(1, Math.max(0.2, overflow / EDGE_ZONE))
            delta = Math.round(ratio * MAX_SPEED)
          } else if (clientY <= viewportTop + HEADER_OFFSET + EDGE_ZONE) {
            // Near or past top edge -> scroll up
            const overflow = (viewportTop + HEADER_OFFSET + EDGE_ZONE) - clientY
            const ratio = Math.min(1, Math.max(0.2, overflow / EDGE_ZONE))
            delta = -Math.round(ratio * MAX_SPEED)
          }

          if (delta !== 0) {
            const prevScrollTop = scrollContainer.scrollTop
            const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight
            scrollContainer.scrollTop = Math.max(0, Math.min(maxScrollTop, prevScrollTop + delta))

            // Update selection to match the newly scrolled position
            if (scrollContainer.scrollTop !== prevScrollTop) {
              updateSelectionFromClientY(clientY)
            }
          }
        }
      }

      autoScrollRafId = requestAnimationFrame(autoScrollLoop)
    }

    autoScrollRafId = requestAnimationFrame(autoScrollLoop)

    const handleWindowMouseUp = () => {
      if (autoScrollRafId !== null) cancelAnimationFrame(autoScrollRafId)
      lastMouseClientYRef.current = null
      onCompleteSelection()
    }

    window.addEventListener('mousemove', handleWindowMouseMove, { passive: true })
    window.addEventListener('mouseup', handleWindowMouseUp)

    return () => {
      if (autoScrollRafId !== null) cancelAnimationFrame(autoScrollRafId)
      window.removeEventListener('mousemove', handleWindowMouseMove)
      window.removeEventListener('mouseup', handleWindowMouseUp)
    }
  }, [isSelectedHere, onUpdateSelection, onCompleteSelection])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return

    // Prevent starting selection if clicking an existing event card
    const target = e.target as HTMLElement
    if (target.closest('[data-event-card="true"]')) {
      return
    }

    lastMouseClientYRef.current = e.clientY
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
      data-day-column="true"
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

      {/* Existing Events Cards (Side-by-side if overlapping) */}
      {positionedEvents.map(({ event: ev, colIndex, totalCols }) => (
        <EventCard
          key={ev.id}
          event={ev}
          colIndex={colIndex}
          totalCols={totalCols}
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
