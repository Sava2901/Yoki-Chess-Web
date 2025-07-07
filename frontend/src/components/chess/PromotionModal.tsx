import { Piece } from './Piece'
import { ChessPiece } from '@/utils/chess'
import { cn } from '@/lib/utils'

interface PromotionModalProps {
  isOpen: boolean
  color: 'w' | 'b'
  onPromotionSelect: (piece: 'q' | 'r' | 'b' | 'n') => void
  onCancel: () => void
  position?: { x: number; y: number }
}

export function PromotionModal({
  isOpen,
  color,
  onPromotionSelect,
  onCancel,
  position = { x: 0, y: 0 }
}: PromotionModalProps) {
  const promotionPieces: Array<{ type: 'q' | 'r' | 'b' | 'n' }> = [
    { type: 'q' },
    { type: 'r' },
    { type: 'b' },
    { type: 'n' }
  ]

  const handlePieceSelect = (pieceType: 'q' | 'r' | 'b' | 'n') => {
    onPromotionSelect(pieceType)
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none"
      onClick={onCancel}
    >
      <div
        className={cn(
          "absolute pointer-events-auto",
          "bg-card border border-border rounded-lg shadow-lg",
          "backdrop-blur-sm bg-card/95",
          "p-3 min-w-fit",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
        style={{
          left: position.x,
          top: position.y - 70, // Position above the square with more space
          transform: 'translateX(-50%)' // Center horizontally
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Small arrow pointing down to the square */}
        <div 
          className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border"
        />
        <div 
          className="absolute left-1/2 -bottom-1.5 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-card"
        />
        
        {/* Title */}
        <div className="text-xs font-medium text-muted-foreground mb-2 text-center">
          Choose piece
        </div>
        
        <div className="flex gap-2">
          {promotionPieces.map((piece) => {
            const chessPiece: ChessPiece = {
              type: piece.type,
              color
            }
            
            return (
              <button
                key={piece.type}
                className={cn(
                  "w-14 h-14 p-2 rounded-md",
                  "border border-border bg-background",
                  "hover:bg-accent hover:border-accent-foreground/20",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "transition-all duration-150 cursor-pointer",
                  "flex items-center justify-center",
                  "shadow-sm hover:shadow-md"
                )}
                onClick={() => handlePieceSelect(piece.type)}
                title={`Promote to ${piece.type === 'q' ? 'Queen' : piece.type === 'r' ? 'Rook' : piece.type === 'b' ? 'Bishop' : 'Knight'}`}
              >
                <Piece piece={chessPiece} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}