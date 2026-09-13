import React, { useEffect, useRef } from 'react'
import type { CalendarEvent, SelectionRange } from '../types/event.types'
import { HOUR_HEIGHT, snapToInterval } from '../utils/date.utils'
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
  const lastDragClientYRef = useRef<number | null>(null)
  const activeDragRef = useRef(activeDrag)
  activeDragRef.current = activeDrag
  const dragOverTargetRef = useRef(dragOverTarget)
  dragOverTargetRef.current = dragOverTarget
  const onDragOverColumnRef = useRef(onDragOverColumn)
  onDragOverColumnRef.current = onDragOverColumn

  // Scroll to roughly 07:00 or current hour on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const currentHour = now.getHours()
      const scrollHour = Math.max(0, currentHour > 7 ? currentHour - 2 : 6)
      scrollContainerRef.current.scrollTop = scrollHour * HOUR_HEIGHT
    }
  }, [])

  const isDragging = !!activeDrag

  // Auto-scroll loop when moving an existing event (HTML5 Drag & Drop)
  useEffect(() => {
    if (!isDragging) {
      lastDragClientYRef.current = null
      return
    }

    let rafId: number | null = null

    const EDGE_ZONE = 100
    const MAX_SPEED = 24
    const HEADER_OFFSET = 55

    const handleDocumentDragOver = (e: DragEvent) => {
      e.preventDefault()
      if (e.clientY > 0) {
        lastDragClientYRef.current = e.clientY
      }
    }

    const handleDragFinish = () => {
      lastDragClientYRef.current = null
    }

    const scrollLoop = () => {
      if (
        scrollContainerRef.current &&
        lastDragClientYRef.current !== null &&
        activeDragRef.current
      ) {
        const container = scrollContainerRef.current
        const containerRect = container.getBoundingClientRect()
        const viewportBottom = Math.min(window.innerHeight, containerRect.bottom)
        const viewportTop = Math.max(0, containerRect.top)
        const clientY = lastDragClientYRef.current
        let delta = 0

        if (clientY >= viewportBottom - EDGE_ZONE) {
          const overflow = clientY - (viewportBottom - EDGE_ZONE)
          const ratio = Math.min(1, Math.max(0.2, overflow / EDGE_ZONE))
          delta = Math.round(ratio * MAX_SPEED)
        } else if (clientY <= viewportTop + HEADER_OFFSET + EDGE_ZONE) {
          const overflow = (viewportTop + HEADER_OFFSET + EDGE_ZONE) - clientY
          const ratio = Math.min(1, Math.max(0.2, overflow / EDGE_ZONE))
          delta = -Math.round(ratio * MAX_SPEED)
        }

        if (delta !== 0) {
          const prevScrollTop = container.scrollTop
          const maxScrollTop = container.scrollHeight - container.clientHeight
          container.scrollTop = Math.max(0, Math.min(maxScrollTop, prevScrollTop + delta))

          const currentDragOver = dragOverTargetRef.current
          const currentActiveDrag = activeDragRef.current
          if (container.scrollTop !== prevScrollTop && currentDragOver && currentActiveDrag) {
            const columns = container.querySelectorAll<HTMLElement>('[data-day-column="true"]')
            const targetCol = columns[currentDragOver.dayIndex]
            if (targetCol) {
              const rect = targetCol.getBoundingClientRect()
              const cursorY = clientY - rect.top
              const rawStartMinutes = (cursorY / HOUR_HEIGHT) * 60 - currentActiveDrag.grabOffsetMinutes
              const snappedMinutes = snapToInterval(rawStartMinutes, 15)
              const clampedMinutes = Math.max(
                0,
                Math.min(1440 - currentActiveDrag.durationMinutes, snappedMinutes)
              )
              if (clampedMinutes !== currentDragOver.startMinutes) {
                onDragOverColumnRef.current(currentDragOver.dayIndex, clampedMinutes)
              }
            }
          }
        }
      }

      rafId = requestAnimationFrame(scrollLoop)
    }

    rafId = requestAnimationFrame(scrollLoop)
    document.addEventListener('dragover', handleDocumentDragOver, { passive: false })
    document.addEventListener('dragend', handleDragFinish)
    document.addEventListener('drop', handleDragFinish)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      document.removeEventListener('dragover', handleDocumentDragOver)
      document.removeEventListener('dragend', handleDragFinish)
      document.removeEventListener('drop', handleDragFinish)
    }
  }, [isDragging])

  return (
    <div
      ref={scrollContainerRef}
      data-calendar-scroll="true"
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      }}
      onMouseUp={(e) => {
        const target = e.target as HTMLElement
        if (target.closest('[data-event-card="true"]')) return
        if (selectionRange) onCompleteSelection()
      }}
      className="flex-1 min-h-0 overflow-auto bg-white relative select-none"
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
