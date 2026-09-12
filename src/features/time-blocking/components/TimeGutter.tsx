import React from 'react'
import { HOUR_HEIGHT } from '../utils/date.utils'

export const TimeGutter = React.memo(function TimeGutter() {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="w-12 sm:w-16 shrink-0 sticky left-0 z-20 border-r border-gray-200 bg-white select-none shadow-xs">
      {hours.map((hour) => {
        const timeString = `${hour.toString().padStart(2, '0')}:00`

        return (
          <div
            key={hour}
            style={{ height: `${HOUR_HEIGHT}px` }}
            className="relative flex items-start justify-end pr-1 sm:pr-2 text-[10px] sm:text-[11px] font-medium text-gray-400"
          >
            {hour !== 0 && (
              <span className="relative -top-2.5 bg-white px-0.5 sm:px-1">
                {timeString}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
})
