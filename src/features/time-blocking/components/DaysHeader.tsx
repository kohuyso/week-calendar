import React from 'react'
import { formatDateLabel } from '../utils/date.utils'

export interface DaysHeaderProps {
  days: Date[]
  timezoneLabel?: string
}

export const DaysHeader = React.memo(function DaysHeader({
  days,
  timezoneLabel = 'GMT+07',
}: DaysHeaderProps) {
  return (
    <div className="flex border-b border-gray-200 bg-white sticky top-0 z-40 select-none w-full shadow-xs">
      {/* Corner: Timezone Gutter - Sticky Top AND Sticky Left */}
      <div className="w-12 sm:w-16 shrink-0 sticky left-0 z-50 bg-white flex items-center justify-center border-r border-gray-200 py-2 sm:py-3 text-[10px] sm:text-[11px] font-medium text-gray-500 shadow-xs">
        {timezoneLabel}
      </div>

      {/* 7 Days Columns */}
      <div className="flex-1 grid grid-cols-7 divide-x divide-gray-200 bg-white">
        {days.map((day, index) => {
          const { dayName, dayNum, isToday } = formatDateLabel(day)

          return (
            <div
              key={index}
              className="py-2 sm:py-3 px-1 sm:px-2 flex flex-col items-center justify-center text-center transition-colors min-w-[80px] sm:min-w-[100px]"
            >
              <span
                className={`text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase mb-0.5 sm:mb-1 ${
                  isToday ? 'text-blue-600 font-bold' : 'text-gray-500'
                }`}
              >
                {dayName}
              </span>

              {isToday ? (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-xs">
                  {dayNum}
                </div>
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-800 font-medium text-sm sm:text-base">
                  {dayNum}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})
