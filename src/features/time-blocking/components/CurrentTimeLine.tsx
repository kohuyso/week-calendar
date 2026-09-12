import { HOUR_HEIGHT } from '../utils/date.utils'

export interface CurrentTimeLineProps {
  now: Date
}

export function CurrentTimeLine({ now }: CurrentTimeLineProps) {
  const minutes = now.getHours() * 60 + now.getMinutes()
  const topPx = (minutes / 60) * HOUR_HEIGHT

  return (
    <div
      style={{ top: `${topPx}px` }}
      className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
    >
      {/* Red circle dot on left */}
      <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 ring-2 ring-white shadow-xs" />
      {/* Red indicator line */}
      <div className="h-[2px] w-full bg-red-500 shadow-xs" />
    </div>
  )
}
