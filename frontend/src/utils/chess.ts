// Chess utility functions for game logic and FEN handling

export interface ChessPosition {
  fen: string
  turn: 'w' | 'b'
  castling: string
  enPassant: string
  halfmove: number
  fullmove: number
}

export interface ChessMove {
  from: string
  to: string
  piece: string
  captured?: string
  promotion?: string
  san: string
  fen: string
}

export interface ChessSquare {
  file: string
  rank: number
  piece?: ChessPiece
  isLight: boolean
}

export interface ChessPiece {
  type: 'p' | 'r' | 'n' | 'b' | 'q' | 'k'
  color: 'w' | 'b'
}

// Starting position FEN
export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'



// Files and ranks
export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8]

/**
 * Parse FEN string into position object
 */
export function parseFEN(fen: string): ChessPosition {
  const parts = fen.split(' ')
  
  return {
    fen: parts[0],
    turn: parts[1] as 'w' | 'b',
    castling: parts[2],
    enPassant: parts[3],
    halfmove: parseInt(parts[4]) || 0,
    fullmove: parseInt(parts[5]) || 1
  }
}

/**
 * Convert FEN board representation to 8x8 array
 */
export function fenToBoard(fen: string): (ChessPiece | null)[][] {
  const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null))
  const position = parseFEN(fen)
  const rows = position.fen.split('/')
  
  for (let rank = 0; rank < 8; rank++) {
    let file = 0
    for (const char of rows[rank]) {
      if (char >= '1' && char <= '8') {
        file += parseInt(char)
      } else {
        const color = char === char.toUpperCase() ? 'w' : 'b'
        const type = char.toLowerCase() as ChessPiece['type']
        
        board[rank][file] = {
          type,
          color
        }
        file++
      }
    }
  }
  
  return board
}

/**
 * Convert square notation (e.g., 'e4') to array indices
 */
export function squareToIndices(square: string): [number, number] {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0)
  const rank = 8 - parseInt(square[1])
  return [rank, file]
}

/**
 * Convert array indices to square notation
 */
export function indicesToSquare(rank: number, file: number): string {
  return FILES[file] + (8 - rank).toString()
}

/**
 * Check if a square is light or dark
 */
export function isLightSquare(file: number, rank: number): boolean {
  return (file + rank) % 2 === 0
}

/**
 * Generate all squares on the board
 */
export function getAllSquares(): ChessSquare[] {
  const squares: ChessSquare[] = []
  
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      squares.push({
        file: FILES[file],
        rank: 8 - rank,
        isLight: isLightSquare(file, rank)
      })
    }
  }
  
  return squares
}

/**
 * Validate if a move is in correct format
 */
// export function isValidMoveFormat(move: string): boolean {
//   // Basic validation for algebraic notation
//   const moveRegex = /^[a-h][1-8][a-h][1-8][qrbn]?$/
//   return moveRegex.test(move)
// }

/**
 * Convert move to algebraic notation (simplified)
 */
export function moveToAlgebraic(to: string, piece: string): string {
  // This is a simplified version - a full implementation would need game state
  const pieceSymbol = piece.toUpperCase() === 'P' ? '' : piece.toUpperCase()
  return pieceSymbol + to
}

/**
 * Parse PGN move list into array of moves
 */
export function parsePGNMoves(pgn: string): string[] {
  // Remove move numbers and extract moves
  const movePattern = /\d+\.\s*([a-zA-Z0-9+#=\-]+)(?:\s+([a-zA-Z0-9+#=\-]+))?/g
  const moves: string[] = []
  let match
  
  while ((match = movePattern.exec(pgn)) !== null) {
    if (match[1]) moves.push(match[1])
    if (match[2]) moves.push(match[2])
  }
  
  return moves
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Generate a random game ID
 */
export function generateGameId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}