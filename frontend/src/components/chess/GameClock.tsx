import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Clock } from 'lucide-react'

interface GameClockProps {
  time: number // time in seconds
  isActive: boolean
  onTimeUp?: () => void
  increment?: number // increment in seconds
  className?: string
  size?: 'sm' | 'md' | 'lg'
  resetTrigger?: number // Change this value to reset the clock
  moveDelay?: number // Additional time deducted per move (in seconds)
}

export function GameClock({ 
  time: initialTime, 
  isActive, 
  onTimeUp,
  increment = 0,
  className,
  size = 'md',
  resetTrigger,
  moveDelay = 0.1
}: GameClockProps) {
  const [time, setTime] = useState(initialTime)
  const [lastMoveTime, setLastMoveTime] = useState<number | null>(null)
  const [lastResetTrigger, setLastResetTrigger] = useState(resetTrigger)
  const [preciseTime, setPreciseTime] = useState(initialTime)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize time values only once on mount
  useEffect(() => {
    if (!isInitialized) {
      setTime(initialTime)
      setPreciseTime(initialTime)
      setIsInitialized(true)
    }
  }, [initialTime, isInitialized])

  // Reset clock when resetTrigger changes or on initial mount
  useEffect(() => {
    if (resetTrigger !== lastResetTrigger) {
      setTime(initialTime)
      setPreciseTime(initialTime)
      setLastMoveTime(null)
      setLastResetTrigger(resetTrigger)
    }
  }, [resetTrigger, lastResetTrigger])

  useEffect(() => {
    if (!isActive) {
      // When turn ends, deduct move delay and add increment
      if (lastMoveTime !== null && time > 0) {
        const updateTime = (prevTime: number) => {
          let newTime = prevTime - moveDelay // Deduct move delay
          if (increment > 0) {
            newTime += increment // Add increment if any
          }
          return Math.max(0, newTime) // Ensure time doesn't go negative
        }
        setTime(updateTime)
        setPreciseTime(updateTime)
      }
      setLastMoveTime(null)
      return
    }

    // Don't start timer for infinite time (0)
    if (time === 0) {
      return
    }

    if (isActive && lastMoveTime === null) {
      setLastMoveTime(Date.now())
    }

    const interval = setInterval(() => {
      setPreciseTime(prevTime => {
        const newTime = prevTime - 0.1
        if (newTime <= 0) {
          onTimeUp?.()
          return 0
        }
        return newTime
      })
      setTime(prevTime => {
        const newTime = prevTime - 0.1
        if (newTime <= 0) {
          return 0
        }
        return newTime
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isActive, onTimeUp, increment, lastMoveTime, time])

  // Custom time formatting function
  const formatTimeWithDecimals = (seconds: number): string => {
    if (seconds <= 0) return '0:00'
    
    if (seconds <= 20) {
      // Show decimals when 20 seconds or less
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      if (minutes > 0) {
        return `${minutes}:${remainingSeconds.toFixed(1).padStart(4, '0')}`
      } else {
        return remainingSeconds.toFixed(1)
      }
    } else {
      // Regular formatting for more than 20 seconds
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.floor(seconds % 60)
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }

  const isLowTime = preciseTime <= 60 && preciseTime > 0 // Less than 1 minute (but not infinite)
  const isCriticalTime = preciseTime <= 10 && preciseTime > 0 // Less than 10 seconds (but not infinite)

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
            ? 'bg-red-100 border-red-500 text-red-700' 
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
      <span className="tabular-nums">
        {formatTimeWithDecimals(preciseTime)}
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