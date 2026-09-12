import { HOUR_HEIGHT, formatTime } from '../utils/date.utils'

export interface SelectionOverlayProps {
  startMinutes: number
  endMinutes: number
  baseDate: Date
}

export function SelectionOverlay({
  startMinutes,
  endMinutes,
  baseDate,
}: SelectionOverlayProps) {
  const rawMin = Math.min(startMinutes, endMinutes)
  const rawMax = Math.max(startMinutes, endMinutes)
  // Ensure minimum duration is 30 minutes so it renders as a clean, legible block
  const duration = Math.max(30, rawMax - rawMin)

  const minM = rawMin
  const maxM = rawMin + duration

  const topPx = (minM / 60) * HOUR_HEIGHT
  const heightPx = (duration / 60) * HOUR_HEIGHT

  const startTimeDate = new Date(baseDate)
  startTimeDate.setHours(Math.floor(minM / 60), minM % 60, 0, 0)
  const endTimeDate = new Date(baseDate)
  endTimeDate.setHours(Math.floor(maxM / 60), maxM % 60, 0, 0)

  return (
    <div
      style={{
        top: `${topPx}px`,
        height: `${heightPx}px`,
      }}
      className="absolute left-1 right-1 bg-blue-600/90 text-white rounded-md shadow-md border border-blue-400/80 pointer-events-none z-30 px-2 py-1 flex flex-col justify-start overflow-hidden select-none will-change-[top,height]"
    >
      <div className="flex items-center justify-between leading-none truncate">
        <span className="text-xs font-semibold text-white tracking-tight truncate">
          (Sự kiện mới)
        </span>
      </div>
      <div className="text-[10px] text-blue-100 font-medium tracking-tight truncate mt-0.5">
        {formatTime(startTimeDate)} – {formatTime(endTimeDate)}
      </div>
    </div>
  )
}
