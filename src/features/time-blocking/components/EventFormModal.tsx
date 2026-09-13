import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, AlignLeft } from 'lucide-react'
import { BaseModal } from '../../../components/BaseModal'
import type { CalendarEvent, NewEventPayload } from '../types/event.types'
import { toDateTimeLocalString, parseDateTimeLocal } from '../utils/date.utils'

export interface EventFormModalProps {
  isOpen: boolean
  initialEvent?: CalendarEvent | null
  initialDates?: { start: Date; end: Date } | null
  onClose: () => void
  onSubmit: (data: NewEventPayload, eventId?: string) => void
}

const COLOR_OPTIONS = [
  { label: 'Amber (Mặc định)', value: '#eab308' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Rose', value: '#f43f5e' },
]

export function EventFormModal({
  isOpen,
  initialEvent,
  initialDates,
  onClose,
  onSubmit,
}: EventFormModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startStr, setStartStr] = useState('')
  const [endStr, setEndStr] = useState('')
  const [color, setColor] = useState('#eab308')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return

    if (initialEvent) {
      setTitle(initialEvent.title)
      setDescription(initialEvent.description || '')
      setStartStr(toDateTimeLocalString(initialEvent.start))
      setEndStr(toDateTimeLocalString(initialEvent.end))
      setColor(initialEvent.color || '#eab308')
    } else if (initialDates) {
      setTitle('')
      setDescription('')
      setStartStr(toDateTimeLocalString(initialDates.start))
      setEndStr(toDateTimeLocalString(initialDates.end))
      setColor('#eab308')
    } else {
      const now = new Date()
      const end = new Date(now.getTime() + 60 * 60 * 1000)
      setTitle('')
      setDescription('')
      setStartStr(toDateTimeLocalString(now))
      setEndStr(toDateTimeLocalString(end))
      setColor('#eab308')
    }
    setError('')
  }, [isOpen, initialEvent, initialDates])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề công việc!')
      return
    }

    const startDate = parseDateTimeLocal(startStr)
    const endDate = parseDateTimeLocal(endStr)

    if (endDate <= startDate) {
      setError('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu!')
      return
    }

    onSubmit(
      {
        title: title.trim(),
        description: description.trim(),
        start: startDate,
        end: endDate,
        color,
      },
      initialEvent?.id
    )
    onClose()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      className="flex flex-col"
    >
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/70 shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            {initialEvent ? 'Chỉnh sửa công việc' : 'Tạo mới công việc (Time Block)'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Tiêu đề công việc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Task A1, Họp kỹ thuật, Thiết kế giao diện..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              autoFocus
            />
          </div>

          {/* Time range (Date + Time, no all-day) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Bắt đầu (Ngày + Giờ)
              </label>
              <input
                type="datetime-local"
                required
                value={startStr}
                onChange={(e) => setStartStr(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Kết thúc (Ngày + Giờ)
              </label>
              <input
                type="datetime-local"
                required
                value={endStr}
                onChange={(e) => setEndStr(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-gray-500" />
              Mô tả chi tiết
            </label>
            <textarea
              rows={3}
              placeholder="Nhập ghi chú hoặc mô tả công việc..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
            />
          </div>

          {/* Color tag */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Màu thẻ sự kiện
            </label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  style={{ backgroundColor: c.value }}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    color === c.value ? 'ring-3 ring-blue-400 ring-offset-2 scale-110' : 'hover:scale-105'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition cursor-pointer"
            >
              {initialEvent ? 'Lưu thay đổi' : 'Tạo sự kiện'}
            </button>
          </div>
        </form>
    </BaseModal>
  )
}
