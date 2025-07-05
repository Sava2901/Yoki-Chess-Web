import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { formatTime } from '@/utils/chess'
import { Clock } from 'lucide-react'

interface GameClockProps {
  time: number // time in seconds
  isActive: boolean
  onTimeUp?: () => void
  increment?: number // increment in seconds
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function GameClock({ 
  time: initialTime, 
  isActive, 
  onTimeUp,
  increment = 0,
  className,
  size = 'md'
}: GameClockProps) {
  const [time, setTime] = useState(initialTime)
  const [lastMoveTime, setLastMoveTime] = useState<number | null>(null)

  useEffect(() => {
    setTime(initialTime)
  }, [initialTime])

  useEffect(() => {
    if (!isActive) {
      // Add increment when it's no longer this player's turn
      if (lastMoveTime !== null && increment > 0) {
        setTime(prevTime => prevTime + increment)
      }
      setLastMoveTime(null)
      return
    }

    if (isActive && lastMoveTime === null) {
      setLastMoveTime(Date.now())
    }

    const interval = setInterval(() => {
      setTime(prevTime => {
        const newTime = prevTime - 1
        if (newTime <= 0) {
          onTimeUp?.()
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, onTimeUp, increment, lastMoveTime])

  const isLowTime = time <= 60 // Less than 1 minute
  const isCriticalTime = time <= 10 // Less than 10 seconds

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3'
  }

  return (
    <div 
      className={cn(
        'flex items-center space-x-2 rounded-lg border-2 font-mono font-bold transition-all duration-300',
        sizeClasses[size],
        isActive ? (
          isCriticalTime 
            ? 'bg-red-100 border-red-500 text-red-700 animate-pulse' 
            : isLowTime 
            ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
            : 'bg-green-100 border-green-500 text-green-700'
        ) : 'bg-gray-100 border-gray-300 text-gray-600',
        className
      )}
    >
      <Clock className={cn(
        'flex-shrink-0',
        size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
      )} />
      <span className={cn(
        'tabular-nums',
        isCriticalTime && isActive && 'animate-pulse'
      )}>
        {formatTime(time)}
      </span>
      {increment > 0 && (
        <span className="text-xs opacity-75">+{increment}</span>
      )}
    </div>
  )
}

// Preset time controls
export const TIME_CONTROLS = {
  bullet: { time: 60, increment: 0, name: '1+0' },
  blitz: { time: 300, increment: 0, name: '5+0' },
  blitzIncrement: { time: 300, increment: 3, name: '5+3' },
  rapid: { time: 600, increment: 0, name: '10+0' },
  rapidIncrement: { time: 900, increment: 10, name: '15+10' },
  classical: { time: 1800, increment: 0, name: '30+0' },
  unlimited: { time: Infinity, increment: 0, name: 'Unlimited' }
} as const

export type TimeControl = keyof typeof TIME_CONTROLS