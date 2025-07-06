import { useState, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { 
  fenToBoard, 
  getAllSquares, 
  squareToIndices, 
  STARTING_FEN,
  ChessSquare,
  ChessPiece,
} from '@/utils/chess'

import { Chess, Square } from 'chess.js';
// import { validateAndExecuteMove } from '@/utils/engine';
import { useToast } from '@/hooks/use-toast';
import { useChessDrag, DragPreview } from '@/hooks/use-chess-drag.tsx';
import { Piece } from './Piece';
import { PromotionModal } from './PromotionModal';

interface ChessBoardProps {
  fen?: string
  orientation?: 'white' | 'black'
  playerColor?: 'white' | 'black'
  onMove?: (from: string, to: string) => void
  highlightedSquares?: string[]
  selectedSquare?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  externalAnimatingMove?: {from: string, to: string} | null
}

export function ChessBoard({ 
  fen = STARTING_FEN,
  orientation = 'white',
  onMove,
  highlightedSquares = [],
  selectedSquare,
  disabled = false,
  size = 'md',
  externalAnimatingMove = null
}: ChessBoardProps) {
  const { toast } = useToast()
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [internalSelectedSquare, setInternalSelectedSquare] = useState<string | null>(null)
  const [animatingMove, setAnimatingMove] = useState<{from: string, to: string} | null>(null);
  const [lastMove, setLastMove] = useState<{from: string, to: string} | null>(null);
  const [promotionModal, setPromotionModal] = useState<{
    isOpen: boolean;
    from: string;
    to: string;
    color: 'w' | 'b';
    isClickMove: boolean;
  } | null>(null);

  const chess = useMemo(() => new Chess(fen), [fen]);

  const handlePieceDragStart = useCallback((piece: ChessPiece, square: string) => {
    const colorMap = { w: 'white', b: 'black' };
    if (disabled || colorMap[chess.turn()] !== colorMap[piece.color]) {
      return;
    }
    const moves = chess.moves({ square: square as Square, verbose: true }).map(m => m.to);
    setLegalMoves(moves);
  }, [chess, disabled]);

  const handleMove = (from: string, to: string, isClickMove = false, promotion?: string) => {
    const chess = new Chess(fen);
    
    // Check if this is a pawn promotion move
    const piece = chess.get(from as Square);
    const isPromotion = piece?.type === 'p' && 
      ((piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1'));
    
    if (isPromotion && !promotion) {
      // Show promotion modal
      setPromotionModal({
        isOpen: true,
        from,
        to,
        color: piece.color,
        isClickMove
      });
      return;
    }
    
    const move = chess.move({ from, to, promotion: promotion || 'q' });
    if (move) {
      if (isClickMove) {
        // Start animation for click moves
        setAnimatingMove({ from, to });
        
        // Complete move after animation
        setTimeout(() => {
          setAnimatingMove(null);
          setLastMove({ from, to });
          onMove?.(from, to);
        }, 50);
      } else {
        // Immediate move for drag moves
        setLastMove({ from, to });
        onMove?.(from, to);
      }
    } else {
      // Handle illegal move display if necessary
      toast({
        title: "Illegal Move",
        description: "That move is not allowed.",
        variant: "destructive",
      })
    }
    setInternalSelectedSquare(null);
    setLegalMoves([]);
  }

  const handlePromotionSelect = (pieceType: 'q' | 'r' | 'b' | 'n') => {
    if (promotionModal) {
      handleMove(promotionModal.from, promotionModal.to, promotionModal.isClickMove, pieceType);
      setPromotionModal(null);
    }
  };

  const handlePromotionCancel = () => {
    setPromotionModal(null);
    setInternalSelectedSquare(null);
    setLegalMoves([]);
  };

  const { dragState, handlers: dragHandlers } = useChessDrag({
    onMove: (from, to) => handleMove(from, to, false),
    legalMoves,
    onDragStart: handlePieceDragStart,
  });
  
  const board = fenToBoard(fen)
  const squares = getAllSquares()
  const currentSelected = selectedSquare || internalSelectedSquare

  const sizeClasses = {
    sm: 'w-full h-auto max-w-sm aspect-square mx-auto',
    md: 'w-full h-auto max-w-md md:max-w-lg lg:max-w-xl aspect-square mx-auto',
    lg: 'w-full h-auto max-w-lg md:max-w-xl lg:max-w-2xl aspect-square mx-auto'
  }

  const handleSquareClick = useCallback((square: string) => {
    if (disabled) return;

    const handleSelectPiece = (sq: string) => {
      setInternalSelectedSquare(sq);
      const newMoves = chess.moves({ square: sq as Square, verbose: true }).map(m => m.to);
      setLegalMoves(newMoves);
    }

    const handleDeselect = () => {
      setInternalSelectedSquare(null);
      setLegalMoves([]);
    }

    // Case 1: A move is being made (clicking on a legal destination square)
    if (currentSelected && legalMoves.includes(square)) {
      handleMove(currentSelected, square, true);
      return;
    }

    const pieceOnSquare = chess.get(square as Square);

    // Case 2: A piece is being selected or deselected
    if (pieceOnSquare && pieceOnSquare.color === chess.turn()) {
      if (currentSelected === square) {
        handleDeselect();
      } else {
        handleSelectPiece(square);
      }
      return;
    }

    // Case 3: Clicking an empty square
    if (!pieceOnSquare) {
      handleDeselect();
      return;
    }

    // Case 4: Clicking an opponent's piece (not as a capture) - do nothing.
  }, [chess, currentSelected, disabled, handleMove, legalMoves]);



  const renderSquare = (square: ChessSquare, index: number) => {
    const squareNotation = square.file + square.rank
    const [rank, file] = squareToIndices(squareNotation)
    const piece = board[rank][file]
    
    const isSelected = currentSelected === squareNotation
    const isHighlighted = highlightedSquares.includes(squareNotation) || legalMoves.includes(squareNotation);
    const isDraggedFrom = dragState.draggedFrom === squareNotation
    const isAnimatingFrom = animatingMove?.from === squareNotation || externalAnimatingMove?.from === squareNotation
    const isAnimatingTo = animatingMove?.to === squareNotation || externalAnimatingMove?.to === squareNotation
    const isLastMoveFrom = lastMove?.from === squareNotation
    const isLastMoveTo = lastMove?.to === squareNotation
    
    let isGrabbable = false;
    if (piece && !disabled) {
      const pieceIsPlayers = chess.turn() === piece.color;
      if (pieceIsPlayers) {
        isGrabbable = currentSelected ? currentSelected === squareNotation : true;
      }
    }

    // Flip board for black orientation
    const displayIndex = orientation === 'black' ? 63 - index : index
    const displayRank = Math.floor(displayIndex / 8)
    const displayFile = displayIndex % 8
    const isLight = (displayRank + displayFile) % 2 === 0

    return (
      <div
        key={squareNotation}
        data-square={squareNotation}
        className={cn(
          'chess-square relative flex items-center justify-center cursor-pointer aspect-square w-full h-full select-none',
          isSelected
            ? isLight ? 'bg-green-200' : 'bg-green-700'
            : isLight ? 'bg-amber-100' : 'bg-amber-800',
          (isLastMoveFrom || isLastMoveTo) && !isSelected && (isLight ? 'bg-yellow-200' : 'bg-yellow-600'),
          disabled && 'cursor-not-allowed'
        )}
        onClick={() => handleSquareClick(squareNotation)}
        onMouseEnter={() => dragHandlers.onSquareEnter(squareNotation)}
        onMouseLeave={() => dragHandlers.onSquareLeave()}
      >
        {/* Square coordinates */}
        {displayFile === 0 && (
          <div className="absolute left-0.5 top-0.5 text-[10px] sm:text-xs font-semibold text-gray-600 leading-none">
            {8 - displayRank}
          </div>
        )}
        {displayRank === 7 && (
          <div className="absolute right-0.5 bottom-0.5 text-[10px] sm:text-xs font-semibold text-gray-600 leading-none">
            {String.fromCharCode(97 + displayFile)}
          </div>
        )}
        
        {/* Chess piece */}
        {piece && (
          <div
            className={cn(
              'chess-piece select-none flex items-center justify-center w-full h-full transition-all duration-300',
              isGrabbable && 'cursor-grab active:cursor-grabbing',
              isDraggedFrom && 'opacity-30',
              isAnimatingFrom && 'transform scale-110 z-10',
              isAnimatingTo && 'transform scale-110 z-10',
              disabled && 'cursor-not-allowed'
            )}
            onMouseDown={(e) => isGrabbable && dragHandlers.onDragStart(e, piece, squareNotation)}
            onTouchStart={(e) => isGrabbable && dragHandlers.onDragStart(e, piece, squareNotation)}
          >
            <Piece piece={piece} />
          </div>
        )}
        
        {/* Move indicator dots */}
        {isHighlighted && !piece && (
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-600 rounded-full opacity-60" />
        )}

      </div>
    )
  }

  return (
    <>
      <div className={cn('chess-board border-2 border-gray-800 rounded-lg overflow-hidden select-none', sizeClasses[size])}>
        {squares.map((square, index) => renderSquare(square, index))}
      </div>
      <DragPreview dragState={dragState} size={size} />
      <PromotionModal
        isOpen={promotionModal?.isOpen || false}
        color={promotionModal?.color || 'w'}
        onPromotionSelect={handlePromotionSelect}
        onCancel={handlePromotionCancel}
      />
    </>
  )
}