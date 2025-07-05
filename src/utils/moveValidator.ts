import { Chess, Square } from 'chess.js/src/chess';

/**
 * Get all legal moves for a piece on a given square.
 * @param fen The FEN string of the current board state.
 * @param square The square to get moves for (e.g., 'e2').
 * @returns An array of legal destination squares.
 */
export function getLegalMovesForPiece(fen: string, square: string): string[] {
  try {
    const chess = new Chess(fen);
    const moves = chess.moves({ square: square as Square, verbose: true });
    return moves.map(move => move.to);
  } catch (error) {
    console.error('Error getting legal moves:', error);
    return [];
  }
}