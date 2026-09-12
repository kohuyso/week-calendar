import { useEffect, useRef } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import type { ContextMenuState } from '../types/event.types'

export interface EventContextMenuProps {
  contextMenu: ContextMenuState | null
  onClose: () => void
  onEdit: (context: ContextMenuState) => void
  onDelete: (eventId: string) => void
}

export function EventContextMenu({
  contextMenu,
  onClose,
  onEdit,
  onDelete,
}: EventContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [contextMenu, onClose])

  if (!contextMenu) return null

  // Ensure menu doesn't overflow screen bounds
  const x = Math.min(contextMenu.x, window.innerWidth - 180)
  const y = Math.min(contextMenu.y, window.innerHeight - 100)

  const handleEdit = () => {
    onEdit(contextMenu)
    onClose()
  }

  const handleDelete = () => {
    if (confirm(`Bạn có chắc muốn xóa "${contextMenu.event.title}"?`)) {
      onDelete(contextMenu.event.id)
    }
    onClose()
  }

  return (
    <div
      ref={menuRef}
      style={{ top: `${y}px`, left: `${x}px` }}
      className="fixed z-50 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 text-xs text-gray-700 animate-in fade-in duration-100 divide-y divide-gray-100"
    >
      <div className="px-3 py-1.5 font-semibold text-gray-500 truncate text-[11px]">
        {contextMenu.event.title}
      </div>

      <div className="py-1">
        <button
          type="button"
          onClick={handleEdit}
          className="w-full px-3 py-2 flex items-center gap-2.5 text-left text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Sửa (Edit)</span>
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="w-full px-3 py-2 flex items-center gap-2.5 text-left text-rose-600 hover:bg-rose-50 transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Xóa (Delete)</span>
        </button>
      </div>
    </div>
  )
}
