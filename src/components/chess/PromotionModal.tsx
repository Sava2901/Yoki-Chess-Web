import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '@/components/ui/button'
import { Piece } from './Piece'
import { ChessPiece } from '@/utils/chess'

interface PromotionModalProps {
  isOpen: boolean
  color: 'w' | 'b'
  onPromotionSelect: (piece: 'q' | 'r' | 'b' | 'n') => void
  onCancel: () => void
}

export function PromotionModal({
  isOpen,
  color,
  onPromotionSelect,
  onCancel
}: PromotionModalProps) {
  const promotionPieces: Array<{ type: 'q' | 'r' | 'b' | 'n'; name: string }> = [
    { type: 'q', name: 'Queen' },
    { type: 'r', name: 'Rook' },
    { type: 'b', name: 'Bishop' },
    { type: 'n', name: 'Knight' }
  ]

  const handlePieceSelect = (pieceType: 'q' | 'r' | 'b' | 'n') => {
    onPromotionSelect(pieceType)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Choose Promotion Piece</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          {promotionPieces.map((piece) => {
            const chessPiece: ChessPiece = {
              type: piece.type,
              color
            }
            
            return (
              <Button
                key={piece.type}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent transition-colors"
                onClick={() => handlePieceSelect(piece.type)}
              >
                <div className="w-12 h-12">
                  <Piece piece={chessPiece} />
                </div>
                <span className="text-sm font-medium">{piece.name}</span>
              </Button>
            )
          })}
        </div>
        
        <div className="flex justify-center pt-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}