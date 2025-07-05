import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { 
  fenToBoard, 
  getAllSquares, 
  squareToIndices, 
  STARTING_FEN,
  ChessSquare,
  ChessPiece,
} from '@/utils/chess'
import { getLegalMovesForPiece } from '@/utils/moveValidator';
import { Chess } from 'chess.js';
// import { validateAndExecuteMove } from '@/utils/engine';
import { useToast } from '@/hooks/use-toast';
import { useChessDrag, DragPreview } from '@/hooks/use-chess-drag.tsx';
import { Piece } from './Piece';

interface ChessBoardProps {
  fen?: string
  orientation?: 'white' | 'black'
  playerColor?: 'white' | 'black'
  onMove?: (from: string, to: string) => void
  highlightedSquares?: string[]
  selectedSquare?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ChessBoard({ 
  fen = STARTING_FEN,
  orientation = 'white',
  playerColor,
  onMove,
  highlightedSquares = [],
  selectedSquare,
  disabled = false,
  size = 'md'
}: ChessBoardProps) {
  const { toast } = useToast()
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [internalSelectedSquare, setInternalSelectedSquare] = useState<string | null>(null)
  const [internalFen, setInternalFen] = useState(fen);

  useEffect(() => {
    setInternalFen(fen);
  }, [fen]);

  const handlePieceDragStart = useCallback((piece: ChessPiece, square: string) => {
    const colorMap = { w: 'white', b: 'black' };
    if (disabled || (playerColor && colorMap[piece.color] !== playerColor)) {
      return;
    }
    const moves = getLegalMovesForPiece(internalFen, square);
    setLegalMoves(moves);
  }, [internalFen, disabled, playerColor]);

  const handleMove = (from: string, to: string) => {
    const chess = new Chess(internalFen);
    const move = chess.move({ from, to, promotion: 'q' }); // Default promotion
    if (move) {
      setInternalFen(chess.fen());
      onMove?.(from, to);
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

  const { dragState, handlers: dragHandlers } = useChessDrag({
    onMove: handleMove,
    legalMoves,
    onDragStart: handlePieceDragStart,
  });
  
  const board = fenToBoard(internalFen)
  const squares = getAllSquares()
  const currentSelected = selectedSquare || internalSelectedSquare

  const sizeClasses = {
    sm: 'w-full h-auto max-w-sm aspect-square mx-auto',
    md: 'w-full h-auto max-w-md md:max-w-lg lg:max-w-xl aspect-square mx-auto',
    lg: 'w-full h-auto max-w-lg md:max-w-xl lg:max-w-2xl aspect-square mx-auto'
  }

  const handleSquareClick = useCallback((square: string) => {
    if (disabled) return

    const [rank, file] = squareToIndices(square)
    const piece = board[rank][file]
    const colorMap = { w: 'white', b: 'black' };

    if (currentSelected) {
      if (legalMoves.includes(square)) {
        // Execute the move
        handleMove(currentSelected, square);
      } else {
        // Clicked on a non-legal square, so deselect or change selection
        if (piece) {
          if (playerColor && colorMap[piece.color] !== playerColor) {
            // Clicked on opponent's piece, so deselect
            setInternalSelectedSquare(null);
            setLegalMoves([]);
          } else {
            // Clicked on one of their own pieces, change selection
            setInternalSelectedSquare(square);
            const moves = getLegalMovesForPiece(internalFen, square);
            setLegalMoves(moves);
          }
        } else {
          setInternalSelectedSquare(null);
          setLegalMoves([]);
        }
      }
    } else if (piece) {
      // No piece selected, so select this one
      if (playerColor && colorMap[piece.color] !== playerColor) {
        return;
      }
      setInternalSelectedSquare(square);
      const moves = getLegalMovesForPiece(internalFen, square);
      setLegalMoves(moves);
    }
  }, [board, currentSelected, disabled, onMove, legalMoves, internalFen, toast, playerColor])



  const renderSquare = (square: ChessSquare, index: number) => {
    const squareNotation = square.file + square.rank
    const [rank, file] = squareToIndices(squareNotation)
    const piece = board[rank][file]
    
    const isSelected = currentSelected === squareNotation
    const isHighlighted = highlightedSquares.includes(squareNotation) || legalMoves.includes(squareNotation);
    const isDraggedFrom = dragState.draggedFrom === squareNotation
    const isHovered = dragState.hoveredSquare === squareNotation && dragState.isDragging
    
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
          'chess-square relative flex items-center justify-center cursor-pointer transition-all duration-200 aspect-square w-full h-full',
          isSelected
            ? isLight ? 'bg-green-200' : 'bg-green-700'
            : isLight ? 'bg-amber-100' : 'bg-amber-800',
          isHovered && 'ring-2 ring-yellow-400 ring-inset',
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
              'chess-piece select-none flex items-center justify-center w-full h-full cursor-grab active:cursor-grabbing',
              isDraggedFrom && 'opacity-30',
              disabled && 'cursor-not-allowed'
            )}
            onMouseDown={(e) => dragHandlers.onDragStart(e, piece, squareNotation)}
            onTouchStart={(e) => dragHandlers.onDragStart(e, piece, squareNotation)}
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
      <div className={cn('chess-board border-2 border-gray-800 rounded-lg overflow-hidden', sizeClasses[size])}>
        {squares.map((square, index) => renderSquare(square, index))}
      </div>
      <DragPreview dragState={dragState} size={size} />
    </>
  )
}