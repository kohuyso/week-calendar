import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react'

export interface CalendarHeaderProps {
  days: Date[]
  onToday: () => void
  onPrev: () => void
  onNext: () => void
  onNewEvent: () => void
}

export function CalendarHeader({
  days,
  onToday,
  onPrev,
  onNext,
  onNewEvent,
}: CalendarHeaderProps) {
  const firstDay = days[0]
  const lastDay = days[days.length - 1]

  const monthYearLabel = firstDay
    ? `Tháng ${firstDay.getMonth() + 1}, ${firstDay.getFullYear()}`
    : ''

  const rangeLabel =
    firstDay && lastDay
      ? `${firstDay.getDate()} Th${firstDay.getMonth() + 1} – ${lastDay.getDate()} Th${lastDay.getMonth() + 1}`
      : ''

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 bg-white border-b border-gray-200 select-none">
      {/* Date Title & Controls */}
      <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-gray-800 tracking-tight">
            {monthYearLabel}
          </h2>
          <span className="text-xs sm:text-sm font-medium text-gray-400 hidden xs:inline">
            ({rangeLabel})
          </span>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToday}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition cursor-pointer active:scale-95"
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={onPrev}
            className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition cursor-pointer active:scale-95"
            title="7 ngày trước"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition cursor-pointer active:scale-95"
            title="7 ngày tiếp theo"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Action / Help Section */}
      <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-100">
        <span className="text-[11px] text-gray-400 hidden lg:inline">
          Kéo thả vùng trống để tạo event • Click phải để sửa/xóa
        </span>
        <button
          type="button"
          onClick={onNewEvent}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Thêm công việc</span>
        </button>
      </div>
    </div>
  )
}
