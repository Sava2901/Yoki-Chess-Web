import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '../ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Trophy, Clock, HeartHandshake, Crown, Users, RotateCcw, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export type GameResult = 
  | { type: 'checkmate'; winner: 'white' | 'black' }
  | { type: 'stalemate' }
  | { type: 'timeout'; winner: 'white' | 'black' }
  | { type: 'draw' }
  | { type: 'resignation'; winner: 'white' | 'black' }

interface GameResultModalProps {
  isOpen: boolean
  result: GameResult | null
  playerColor: 'white' | 'black'
  playerName: string
  opponentName: string
  playerAvatar?: string | null
  onNewGame: () => void
  onReturnToLobby: () => void
  onClose: () => void
}

export function GameResultModal({
  isOpen,
  result,
  playerColor,
  playerName,
  opponentName,
  playerAvatar,
  onNewGame,
  onReturnToLobby,
  onClose
}: GameResultModalProps) {
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (isOpen && result) {
      setShowAnimation(true)
      const timer = setTimeout(() => setShowAnimation(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, result])

  if (!result) return null

  const getResultInfo = () => {
    switch (result.type) {
      case 'checkmate':
        const isPlayerWinner = result.winner === playerColor
        return {
          title: isPlayerWinner ? '🎉 Victory!' : '💔 Defeat',
          subtitle: `Checkmate! ${result.winner === 'white' ? 'White' : 'Black'} wins`,
          icon: isPlayerWinner ? Trophy : Crown,
          iconColor: isPlayerWinner ? 'text-amber-500' : 'text-slate-500',
          bgGradient: isPlayerWinner 
            ? 'bg-gradient-to-br from-emerald-300 to-green-400 dark:from-emerald-400 dark:to-green-500'
            : 'bg-gradient-to-br from-red-300 to-rose-400 dark:from-red-400 dark:to-rose-500',
          cardBg: isPlayerWinner
            ? 'bg-emerald-25 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-700'
            : 'bg-red-25 dark:bg-red-950/30 border-red-100 dark:border-red-700'
        }
      
      case 'stalemate':
        return {
          title: '🤝 Draw',
          subtitle: 'Game ended in stalemate',
          icon: HeartHandshake,
          iconColor: 'text-blue-500',
          bgGradient: 'bg-gradient-to-br from-blue-300 to-indigo-400 dark:from-blue-400 dark:to-indigo-500',
          cardBg: 'bg-blue-25 dark:bg-blue-950/30 border-blue-100 dark:border-blue-700'
        }
      
      case 'timeout':
        const isTimeoutWinner = result.winner === playerColor
        return {
          title: isTimeoutWinner ? '⏰ Victory!' : '⏰ Time Out',
          subtitle: `${result.winner === playerColor ? opponentName : playerName} ran out of time`,
          icon: isTimeoutWinner ? Trophy : Clock,
          iconColor: isTimeoutWinner ? 'text-amber-500' : 'text-orange-500',
          bgGradient: isTimeoutWinner
            ? 'bg-gradient-to-br from-emerald-300 to-green-400 dark:from-emerald-400 dark:to-green-500'
            : 'bg-gradient-to-br from-orange-300 to-red-400 dark:from-orange-400 dark:to-red-500',
          cardBg: isTimeoutWinner
            ? 'bg-emerald-25 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-700'
            : 'bg-orange-25 dark:bg-orange-950/30 border-orange-100 dark:border-orange-700'
        }
      
      case 'draw':
        return {
          title: '🤝 Draw',
          subtitle: 'Game ended in a draw',
          icon: HeartHandshake,
          iconColor: 'text-blue-500',
          bgGradient: 'bg-gradient-to-br from-blue-300 to-indigo-400 dark:from-blue-400 dark:to-indigo-500',
          cardBg: 'bg-blue-25 dark:bg-blue-950/30 border-blue-100 dark:border-blue-700'
        }
      
      case 'resignation':
        const isResignationWinner = result.winner === playerColor
        return {
          title: isResignationWinner ? '🏆 Victory!' : '🏳️ Resignation',
          subtitle: `${result.winner === playerColor ? opponentName : playerName} resigned`,
          icon: isResignationWinner ? Trophy : Crown,
          iconColor: isResignationWinner ? 'text-amber-500' : 'text-slate-500',
          bgGradient: isResignationWinner
            ? 'bg-gradient-to-br from-emerald-300 to-green-400 dark:from-emerald-400 dark:to-green-500'
            : 'bg-gradient-to-br from-slate-300 to-gray-400 dark:from-slate-400 dark:to-gray-500',
          cardBg: isResignationWinner
            ? 'bg-emerald-25 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-700'
            : 'bg-slate-25 dark:bg-slate-950/30 border-slate-100 dark:border-slate-700'
        }
    }
  }

  const resultInfo = getResultInfo()
  const ResultIcon = resultInfo.icon

  const getWinnerInfo = () => {
    if (result.type === 'stalemate' || result.type === 'draw') {
      return null
    }
    
    const winner = result.winner
    const isPlayerWinner = winner === playerColor
    const winnerName = isPlayerWinner ? playerName : opponentName
    const winnerAvatar = isPlayerWinner ? playerAvatar : undefined
    
    return {
      name: winnerName,
      avatar: winnerAvatar,
      color: winner
    }
  }

  const winnerInfo = getWinnerInfo()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 bg-transparent rounded-3xl">
        <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden">
          {/* Header with gradient background */}
          <div className={cn(
            'relative px-6 py-8 text-white',
            resultInfo.bgGradient
          )}>
            <div className="relative z-10">
              <div className="flex flex-col items-center space-y-4">
                {/* Animated icon */}
                <div className={cn(
                  'p-6 rounded-full bg-white/20 backdrop-blur-sm shadow-lg',
                  showAnimation && 'animate-pulse'
                )}>
                  <ResultIcon className={cn('h-16 w-16 text-white')} />
                </div>
                
                {/* Title and subtitle */}
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold">
                    {resultInfo.title}
                  </h2>
                  <p className="text-lg text-white/90">
                    {resultInfo.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="px-6 py-6">
          {/* Winner information */}
          {winnerInfo && (
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-4 p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
                <UserAvatar 
                  src={winnerInfo.avatar}
                  username={winnerInfo.name}
                  size="lg"
                />
                <div className="text-center">
                  <p className="font-bold text-xl text-gray-900 dark:text-gray-100">
                    {winnerInfo.name}
                  </p>
                  <Badge 
                    variant={winnerInfo.color === 'white' ? 'default' : 'secondary'}
                    className="mt-1 font-medium"
                  >
                    {winnerInfo.color === 'white' ? '⚪ White' : '⚫ Black'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Draw/Stalemate info */}
          {(result.type === 'stalemate' || result.type === 'draw') && (
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-4 p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="text-center">
                  <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    Both Players
                  </p>
                  <Badge variant="outline" className="mt-1">
                    Equal Result
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <Button 
              onClick={onNewGame} 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              New Game
            </Button>
            <Button 
              onClick={onReturnToLobby} 
              variant="outline" 
              className="w-full h-14 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Home className="mr-2 h-5 w-5" />
              Return to Lobby
            </Button>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}