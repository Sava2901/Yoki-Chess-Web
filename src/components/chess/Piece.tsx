import { ChessPiece } from '@/utils/chess';
import { cn } from '@/lib/utils';

interface PieceProps {
  piece: ChessPiece;
}

export function Piece({ piece }: PieceProps) {
  const pieceKey = `${piece.color}${piece.type.toUpperCase()}`;
  const svgUrl = `/src/assets/chess-pieces/${pieceKey}.svg`;

  return (
    <img
      src={svgUrl}
      alt={`${piece.color} ${piece.type}`}
      className={cn('w-full h-full')}
    />
  );
}