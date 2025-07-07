export interface GameState {
  fen: string;
  turn: 'w' | 'b';
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isGameOver: boolean;
  result?: 'white' | 'black' | 'draw';
  reason?: string;
  moveHistory: Move[];
  capturedPieces: {
    white: string[];
    black: string[];
  };
}

export interface Move {
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promotion?: string;
  san: string;
  fen: string;
  timestamp: Date;
  timeLeft?: {
    white: number;
    black: number;
  };
}

export interface TimeControl {
  minutes: number;
  increment: number;
}

export interface Player {
  id: string;
  username: string;
  rating: number;
  color: 'white' | 'black';
}

export interface GameData {
  id: string;
  whitePlayer: Player;
  blackPlayer: Player;
  timeControl: TimeControl;
  status: 'waiting' | 'active' | 'paused' | 'finished';
  result?: 'white' | 'black' | 'draw';
  reason?: string;
  startTime: Date;
  endTime?: Date;
  currentFen: string;
  moveHistory: Move[];
  spectators?: string[];
}

export interface ClockState {
  white: {
    time: number;
    increment: number;
  };
  black: {
    time: number;
    increment: number;
  };
  turn: 'white' | 'black';
  isRunning: boolean;
  isPaused: boolean;
  lastUpdate: Date;
}

export interface MatchmakingResult {
  success: boolean;
  gameId?: string;
  opponentId?: string;
  color?: 'white' | 'black';
  message?: string;
}

export interface MoveResult {
  success: boolean;
  move?: Move;
  gameState?: GameState;
  error?: string;
}

export interface GameResult {
  success: boolean;
  result?: 'white' | 'black' | 'draw';
  reason?: string;
  error?: string;
}