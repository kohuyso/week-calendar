import { HOUR_HEIGHT, formatTime } from '../utils/date.utils'

export interface DragGhostPreviewProps {
  startMinutes: number
  durationMinutes: number
  title: string
  color?: string
  baseDate: Date
}

export function DragGhostPreview({
  startMinutes,
  durationMinutes,
  title,
  color = '#eab308',
  baseDate,
}: DragGhostPreviewProps) {
  const topPx = (startMinutes / 60) * HOUR_HEIGHT
  const heightPx = Math.max(26, (durationMinutes / 60) * HOUR_HEIGHT)

  const startDate = new Date(baseDate)
  startDate.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0)
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)

  const isShort = heightPx < 46

  return (
    <div
      style={{
        top: `${topPx}px`,
        height: `${heightPx}px`,
        backgroundColor: color,
      }}
      className={`absolute left-1 right-1 rounded-md px-2 text-white shadow-xl pointer-events-none z-20 overflow-hidden border-2 border-dashed border-white/90 ring-2 ring-blue-500 opacity-80 flex flex-col select-none will-change-[top,height] ${
        isShort ? 'justify-center py-0.5' : 'justify-start py-1'
      }`}
    >
      {isShort ? (
        <div className="flex items-center gap-1.5 min-w-0 w-full overflow-hidden leading-tight">
          <span className="font-bold text-xs truncate">{title}</span>
          <span className="text-[10px] font-semibold text-white/95 shrink-0">
            {formatTime(startDate)} – {formatTime(endDate)}
          </span>
        </div>
      ) : (
        <>
          <div className="font-bold text-xs leading-tight truncate">
            {title}
          </div>
          <div className="text-[10px] font-semibold text-white/95 truncate mt-0.5">
            {formatTime(startDate)} – {formatTime(endDate)} (Thả tại đây)
          </div>
        </>
      )}
    </div>
  )
}
