import React, { useEffect, useRef, type ReactNode } from 'react'

export interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  closeOnBackdropClick?: boolean
  closeOnEsc?: boolean
}

const MAX_WIDTH_STYLES: Record<NonNullable<BaseModalProps['maxWidth']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
}

export function BaseModal({
  isOpen,
  onClose,
  children,
  className = '',
  maxWidth = 'md',
  closeOnBackdropClick = true,
  closeOnEsc = true,
}: BaseModalProps) {
  const backdropMouseDownRef = useRef(false)

  useEffect(() => {
    if (!isOpen || !closeOnEsc) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closeOnEsc, onClose])

  // Prevent background body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    backdropMouseDownRef.current = closeOnBackdropClick && e.target === e.currentTarget
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && backdropMouseDownRef.current && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white w-full ${MAX_WIDTH_STYLES[maxWidth]} rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-gray-800 max-h-[92vh] ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
