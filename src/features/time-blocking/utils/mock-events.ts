import type { CalendarEvent } from '../types/event.types'
import { getSevenDays, setMinutesToDate } from './date.utils'

export function getInitialMockEvents(baseDate: Date = new Date()): CalendarEvent[] {
  const days = getSevenDays(baseDate)

  // Day 1 (Tomorrow or day 1 in 7 days): Task A1 05:00 - 06:15
  const day1 = days[1] || days[0]
  // Day 2 (Day 2 in 7 days): Task A2 02:15 - 03:15
  const day2 = days[2] || days[0]
  // Day 4: Task A3 06:00 - 07:15
  const day4 = days[4] || days[0]

  return [
    {
      id: 'mock-1',
      title: 'Task A1',
      description: 'Review tài liệu kiến trúc hệ thống và chuẩn bị roadmap',
      start: setMinutesToDate(day1, 5 * 60), // 05:00
      end: setMinutesToDate(day1, 6 * 60 + 15), // 06:15
      color: '#eab308', // Amber gold as shown in screenshot
    },
    {
      id: 'mock-2',
      title: 'Task A2',
      description: 'Kiểm tra log server và tối ưu hóa truy vấn cơ sở dữ liệu',
      start: setMinutesToDate(day2, 2 * 60 + 15), // 02:15
      end: setMinutesToDate(day2, 3 * 60 + 15), // 03:15
      color: '#eab308',
    },
    {
      id: 'mock-3',
      title: 'Task A3',
      description: 'Họp đồng bộ tiến độ dự án tuần với team kỹ thuật',
      start: setMinutesToDate(day4, 6 * 60), // 06:00
      end: setMinutesToDate(day4, 7 * 60 + 15), // 07:15
      color: '#eab308',
    },
  ]
}
