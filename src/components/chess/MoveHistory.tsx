import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { useEffect, useRef } from 'react'

interface MoveHistoryProps {
  moves: string[]
  currentMove?: number
  onMoveClick?: (moveIndex: number) => void
  className?: string
}

export function MoveHistory({ 
  moves, 
  currentMove = -1, 
  onMoveClick,
  className
}: MoveHistoryProps) {
  const endOfMovesRef = useRef<HTMLDivElement>(null)

  const prevMovesLengthRef = useRef(moves.length)
  
  useEffect(() => {
    // Only auto-scroll when new moves are added, not when navigating history
    if (moves.length > prevMovesLengthRef.current) {
      endOfMovesRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMovesLengthRef.current = moves.length
  }, [moves])
  const movePairs: Array<{ white: string; black?: string; moveNumber: number }> = []
  
  // Group moves into pairs (white, black)
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      white: moves[i],
      black: moves[i + 1],
      moveNumber: Math.floor(i / 2) + 1
    })
  }

  const handleMoveClick = (moveIndex: number) => {
    onMoveClick?.(moveIndex)
  }

  return (
    <div className={cn('border rounded-lg flex flex-col', className)}>
      <div className="p-3 border-b bg-muted/50 flex-shrink-0">
        <h3 className="font-semibold text-sm">Move History</h3>
      </div>
      
      <ScrollArea className="p-3 h-64">
        <div className="space-y-1">
          {movePairs.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No moves yet
            </p>
          ) : (
            movePairs.map((pair, pairIndex) => (
              <div key={pairIndex} className="flex items-center space-x-2 text-sm">
                <span className="w-8 text-muted-foreground font-mono">
                  {pair.moveNumber}.
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6 px-2 font-mono text-xs transition-colors',
                    currentMove === pairIndex * 2 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'hover:bg-muted'
                  )}
                  onClick={() => handleMoveClick(pairIndex * 2)}
                >
                  {pair.white}
                </Button>
                
                {pair.black && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-6 px-2 font-mono text-xs transition-colors',
                      currentMove === pairIndex * 2 + 1 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'hover:bg-muted'
                    )}
                    onClick={() => handleMoveClick(pairIndex * 2 + 1)}
                  >
                    {pair.black}
                  </Button>
                )}
              </div>
            ))
          )}
          <div ref={endOfMovesRef} />
        </div>
      </ScrollArea>
      
      {moves.length > 0 && (
        <div className="p-3 border-t bg-muted/50 flex-shrink-0">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Total moves: {moves.length}</span>
            <span>Current: {currentMove === -1 ? 'None' : `${currentMove + 1}/${moves.length}`}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Export a simplified version for basic display
export function SimpleMoveHistory({ moves }: { moves: string[] }) {
  if (moves.length === 0) {
    return (
      <div className="font-mono text-sm text-muted-foreground">
        No moves yet
      </div>
    )
  }

  const movePairs: Array<{ white: string; black?: string; moveNumber: number }> = []
  
  // Group moves into pairs (white, black)
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      white: moves[i],
      black: moves[i + 1],
      moveNumber: Math.floor(i / 2) + 1
    })
  }

  return (
    <div className="font-mono text-sm space-y-1">
      {movePairs.map((pair, index) => (
        <div key={index} className="flex items-center space-x-2">
          <span className="text-muted-foreground w-8">
            {pair.moveNumber}.
          </span>
          <span className="font-medium">{pair.white}</span>
          {pair.black && (
            <span className="font-medium">{pair.black}</span>
          )}
        </div>
      ))}
    </div>
  )
}