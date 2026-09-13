import React from 'react'
import type { CalendarEvent } from '../types/event.types'
import { HOUR_HEIGHT, formatTimeRange, getMinutesFromMidnight } from '../utils/date.utils'

export interface EventCardProps {
  event: CalendarEvent
  colIndex?: number
  totalCols?: number
  onSelect: (event: CalendarEvent) => void
  onContextMenu: (e: React.MouseEvent, event: CalendarEvent) => void
  onDragStart: (event: CalendarEvent, grabOffsetMinutes: number) => void
  onDragEnd?: () => void
}

export function EventCard({
  event,
  colIndex = 0,
  totalCols = 1,
  onSelect,
  onContextMenu,
  onDragStart,
  onDragEnd,
}: EventCardProps) {
  const startMinutes = getMinutesFromMidnight(event.start)
  const durationMinutes = Math.max(
    15,
    (event.end.getTime() - event.start.getTime()) / (60 * 1000)
  )

  const topPx = (startMinutes / 60) * HOUR_HEIGHT
  const heightPx = Math.max(26, (durationMinutes / 60) * HOUR_HEIGHT)

  const widthPercent = 100 / totalCols
  const leftPercent = (colIndex / totalCols) * 100

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent event bubbling to parent DayColumn so it doesn't trigger new event creation
    e.stopPropagation()
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(event)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onContextMenu(e, event)
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()

    // Calculate exact grab point within this card to eliminate jumping
    const cardRect = e.currentTarget.getBoundingClientRect()
    const grabOffsetY = Math.max(0, e.clientY - cardRect.top)
    const grabOffsetMinutes = (grabOffsetY / HOUR_HEIGHT) * 60

    e.dataTransfer.setData('text/plain', event.id)
    e.dataTransfer.effectAllowed = 'move'

    onDragStart(event, grabOffsetMinutes)
  }

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onDragEnd?.()
  }

  const isShort = heightPx < 46

  return (
    <div
      data-event-card="true"
      draggable
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        top: `${topPx}px`,
        height: `${heightPx}px`,
        left: `calc(${leftPercent}% + 2px)`,
        width: `calc(${widthPercent}% - 4px)`,
        backgroundColor: event.color || '#eab308',
      }}
      className={`absolute rounded-md text-white shadow-sm cursor-grab active:cursor-grabbing hover:brightness-105 hover:shadow-md transition-all z-10 overflow-hidden select-none border border-black/10 flex flex-col ${
        totalCols > 1 ? 'px-1 sm:px-1.5' : 'px-2'
      } ${isShort ? 'justify-center py-0.5' : 'justify-start py-1'}`}
      title={`${event.title} (${formatTimeRange(event.start, event.end)}) - Chuột trái để xem, chuột phải để sửa/xóa, kéo thả để dời`}
    >
      {isShort ? (
        <div className="flex items-center gap-1.5 min-w-0 w-full overflow-hidden leading-tight pointer-events-none">
          <span className="font-semibold text-xs truncate">
            {event.title}
          </span>
          <span className="text-[10px] opacity-90 shrink-0 font-medium">
            {formatTimeRange(event.start, event.end)}
          </span>
        </div>
      ) : (
        <>
          <div className="font-semibold text-xs leading-tight truncate pointer-events-none">
            {event.title}
          </div>
          <div className="text-[10px] opacity-90 font-medium tracking-tight truncate mt-0.5 pointer-events-none">
            {formatTimeRange(event.start, event.end)}
          </div>
        </>
      )}
    </div>
  )
}
