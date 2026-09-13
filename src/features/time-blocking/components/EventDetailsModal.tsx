import { X, Clock, AlignLeft, Edit2, Trash2 } from 'lucide-react'
import { BaseModal } from '../../../components/BaseModal'
import type { CalendarEvent } from '../types/event.types'
import { formatTimeRange } from '../utils/date.utils'

export interface EventDetailsModalProps {
  event: CalendarEvent | null
  onClose: () => void
  onEdit: (event: CalendarEvent) => void
  onDelete: (eventId: string) => void
}

export function EventDetailsModal({
  event,
  onClose,
  onEdit,
  onDelete,
}: EventDetailsModalProps) {
  if (!event) return null

  const handleDelete = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa công việc "${event.title}"?`)) {
      onDelete(event.id)
      onClose()
    }
  }

  const handleEdit = () => {
    onEdit(event)
    onClose()
  }

  return (
    <BaseModal
      isOpen={!!event}
      onClose={onClose}
      maxWidth="md"
      className="overflow-y-auto"
    >
        {/* Color bar on top */}
        <div
          style={{ backgroundColor: event.color || '#eab308' }}
          className="h-2.5 sm:h-3 w-full"
        />

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="text-xl font-bold text-gray-900 leading-snug">
              {event.title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Time range */}
          <div className="flex items-center gap-2.5 text-sm text-gray-600 mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <Clock className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="font-medium">
              {event.start.toLocaleDateString('vi-VN', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}{' '}
              • {formatTimeRange(event.start, event.end)}
            </span>
          </div>

          {/* Description */}
          <div className="flex items-start gap-2.5 text-sm text-gray-700 mb-6">
            <AlignLeft className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
            <div className="flex-1 whitespace-pre-wrap leading-relaxed">
              {event.description || (
                <span className="italic text-gray-400">
                  Không có mô tả cho công việc này.
                </span>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Xóa công việc
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
    </BaseModal>
  )
}
