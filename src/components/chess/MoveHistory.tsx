import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

interface MoveHistoryProps {
  moves: string[]
  currentMove?: number
  onMoveClick?: (moveIndex: number) => void
  className?: string
  maxHeight?: string
}

export function MoveHistory({ 
  moves, 
  currentMove = -1, 
  onMoveClick,
  className,
  maxHeight = '300px'
}: MoveHistoryProps) {
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
    <div className={cn('border rounded-lg', className)}>
      <div className="p-3 border-b bg-muted/50">
        <h3 className="font-semibold text-sm">Move History</h3>
      </div>
      
      <ScrollArea className="p-3" style={{ maxHeight }}>
        {movePairs.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No moves yet
          </p>
        ) : (
          <div className="space-y-1">
            {movePairs.map((pair, pairIndex) => (
              <div key={pairIndex} className="flex items-center space-x-2 text-sm">
                <span className="w-8 text-muted-foreground font-mono">
                  {pair.moveNumber}.
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6 px-2 font-mono text-xs',
                    currentMove === pairIndex * 2 && 'bg-primary text-primary-foreground'
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
                      'h-6 px-2 font-mono text-xs',
                      currentMove === pairIndex * 2 + 1 && 'bg-primary text-primary-foreground'
                    )}
                    onClick={() => handleMoveClick(pairIndex * 2 + 1)}
                  >
                    {pair.black}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      {moves.length > 0 && (
        <div className="p-3 border-t bg-muted/50">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Total moves: {moves.length}</span>
            <span>Current: {currentMove + 1}/{moves.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Export a simplified version for basic display
export function SimpleMoveHistory({ moves }: { moves: string[] }) {
  return (
    <div className="font-mono text-sm">
      {moves.map((move, index) => (
        <span key={index} className="mr-2">
          {index % 2 === 0 && `${Math.floor(index / 2) + 1}. `}
          {move}
          {index % 2 === 1 && ' '}
        </span>
      ))}
    </div>
  )
}