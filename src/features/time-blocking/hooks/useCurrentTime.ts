import { useState, useEffect } from 'react'

export function useCurrentTime() {
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 60000) // update every minute

    return () => clearInterval(timer)
  }, [])

  return now
}
