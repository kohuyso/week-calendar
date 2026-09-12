import React from 'react'
import type { CalendarEvent } from '../types/event.types'
import { HOUR_HEIGHT, formatTimeRange, getMinutesFromMidnight } from '../utils/date.utils'

export interface EventCardProps {
  event: CalendarEvent
  onSelect: (event: CalendarEvent) => void
  onContextMenu: (e: React.MouseEvent, event: CalendarEvent) => void
  onDragStart: (event: CalendarEvent, grabOffsetMinutes: number) => void
  onDragEnd?: () => void
}

export function EventCard({
  event,
  onSelect,
  onContextMenu,
  onDragStart,
  onDragEnd,
}: EventCardProps) {
  const startMinutes = getMinutesFromMidnight(event.start)
  const endMinutes = getMinutesFromMidnight(event.end)
  const durationMinutes = Math.max(15, endMinutes - startMinutes)

  const topPx = (startMinutes / 60) * HOUR_HEIGHT
  const heightPx = Math.max(26, (durationMinutes / 60) * HOUR_HEIGHT)

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
        backgroundColor: event.color || '#eab308',
      }}
      className="absolute left-1 right-1 rounded-md px-2 py-1 text-white shadow-sm cursor-grab active:cursor-grabbing hover:brightness-105 hover:shadow-md transition-all z-10 overflow-hidden flex flex-col justify-start select-none border border-black/10"
      title={`${event.title} (${formatTimeRange(event.start, event.end)}) - Chuột trái để xem, chuột phải để sửa/xóa, kéo thả để dời`}
    >
      <div className="font-semibold text-xs leading-tight truncate pointer-events-none">
        {event.title}
      </div>
      <div className="text-[10px] opacity-90 font-medium tracking-tight truncate mt-0.5 pointer-events-none">
        {formatTimeRange(event.start, event.end)}
      </div>
    </div>
  )
}
