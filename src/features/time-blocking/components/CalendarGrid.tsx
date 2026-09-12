import React, { useEffect, useRef } from 'react'
import type { CalendarEvent, SelectionRange } from '../types/event.types'
import { HOUR_HEIGHT } from '../utils/date.utils'
import { DaysHeader } from './DaysHeader'
import { TimeGutter } from './TimeGutter'
import { DayColumn } from './DayColumn'

export interface CalendarGridProps {
  days: Date[]
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

export function CalendarGrid({
  days,
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
  onDragOverColumn,
  onDropEvent,
}: CalendarGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to roughly 07:00 or current hour on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const currentHour = now.getHours()
      const scrollHour = Math.max(0, currentHour > 7 ? currentHour - 2 : 6)
      scrollContainerRef.current.scrollTop = scrollHour * HOUR_HEIGHT
    }
  }, [])

  return (
    <div
      ref={scrollContainerRef}
      onMouseUp={(e) => {
        const target = e.target as HTMLElement
        if (target.closest('[data-event-card="true"]')) return
        if (selectionRange) onCompleteSelection()
      }}
      className="flex-1 overflow-auto bg-white h-[calc(100vh-65px)] relative scroll-smooth select-none"
    >
      <div className="min-w-[700px] sm:min-w-[840px] md:min-w-full flex flex-col">
        {/* Sticky Top Days Header (Sticky Top + Corner Sticky Left) */}
        <DaysHeader days={days} timezoneLabel="GMT+07" />

        {/* 24-hour Calendar Grid Body */}
        <div className="flex w-full">
          {/* Entire Hour Column - Sticky Left as user scrolls horizontally */}
          <TimeGutter />

          {/* 7 Day Columns with Events */}
          <div className="flex-1 grid grid-cols-7 border-l border-gray-100">
            {days.map((day, index) => (
              <DayColumn
                key={index}
                dayIndex={index}
                date={day}
                events={events}
                now={now}
                selectionRange={selectionRange}
                activeDrag={activeDrag}
                dragOverTarget={dragOverTarget}
                onStartSelection={onStartSelection}
                onUpdateSelection={onUpdateSelection}
                onCompleteSelection={onCompleteSelection}
                onSelectEvent={onSelectEvent}
                onContextMenuEvent={onContextMenuEvent}
                onDragStartEvent={onDragStartEvent}
                onDragEndEvent={onDragEndEvent}
                onDragOverColumn={onDragOverColumn}
                onDropEvent={onDropEvent}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
