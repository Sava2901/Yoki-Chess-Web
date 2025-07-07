import { v4 as uuidv4 } from 'uuid';
import { Chess } from 'chess.js';
import { GameData, Player, TimeControl, Move, GameState, ClockState } from '../types/Game';

export class Game {
  public id: string;
  public whitePlayer: Player;
  public blackPlayer: Player;
  public timeControl: TimeControl;
  public status: 'waiting' | 'active' | 'paused' | 'finished';
  public result?: 'white' | 'black' | 'draw';
  public reason?: string;
  public startTime: Date;
  public endTime?: Date;
  public spectators: Set<string>;
  public drawOffers: {
    white: boolean;
    black: boolean;
  };
  
  private chess: Chess;
  private clock: ClockState;
  private clockInterval?: NodeJS.Timeout;
  private moveHistory: Move[];

  constructor(
    whitePlayer: Player,
    blackPlayer: Player,
    timeControl: TimeControl
  ) {
    this.id = uuidv4();
    this.whitePlayer = whitePlayer;
    this.blackPlayer = blackPlayer;
    this.timeControl = timeControl;
    this.status = 'waiting';
    this.startTime = new Date();
    this.spectators = new Set();
    this.drawOffers = { white: false, black: false };
    this.moveHistory = [];
    
    // Initialize chess engine
    this.chess = new Chess();
    
    // Initialize clock
    this.clock = {
      white: {
        time: timeControl.minutes * 60 * 1000, // Convert to milliseconds
        increment: timeControl.increment * 1000
      },
      black: {
        time: timeControl.minutes * 60 * 1000,
        increment: timeControl.increment * 1000
      },
      turn: 'white',
      isRunning: false,
      isPaused: false,
      lastUpdate: new Date()
    };
  }

  public start(): void {
    this.status = 'active';
    this.startClock();
  }

  public makeMove(playerId: string, moveData: { from: string; to: string; promotion?: string }): {
    success: boolean;
    move?: Move;
    gameState?: GameState;
    error?: string;
  } {
    // Validate player turn
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.id !== playerId) {
      return {
        success: false,
        error: 'Not your turn'
      };
    }

    // Validate and make move using chess.js
    try {
      const move = this.chess.move({
        from: moveData.from,
        to: moveData.to,
        promotion: moveData.promotion
      });

      if (!move) {
        return {
          success: false,
          error: 'Invalid move'
        };
      }

      // Add increment to current player's time
      const currentColor = this.clock.turn;
      this.clock[currentColor].time += this.clock[currentColor].increment;

      // Switch turns
      this.clock.turn = this.clock.turn === 'white' ? 'black' : 'white';
      this.clock.lastUpdate = new Date();

      // Create move record
      const moveRecord: Move = {
        from: move.from,
        to: move.to,
        piece: move.piece,
        captured: move.captured,
        promotion: move.promotion,
        san: move.san,
        fen: this.chess.fen(),
        timestamp: new Date(),
        timeLeft: {
          white: this.clock.white.time,
          black: this.clock.black.time
        }
      };

      this.moveHistory.push(moveRecord);

      // Check for game end conditions
      this.checkGameEnd();

      return {
        success: true,
        move: moveRecord,
        gameState: this.getGameState()
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid move'
      };
    }
  }

  public resign(playerId: string): boolean {
    if (this.status !== 'active') return false;
    
    const winner = playerId === this.whitePlayer.id ? 'black' : 'white';
    this.endGame(winner, 'resignation');
    return true;
  }

  public offerDraw(playerId: string): boolean {
    if (this.status !== 'active') return false;
    
    if (playerId === this.whitePlayer.id) {
      this.drawOffers.white = true;
    } else if (playerId === this.blackPlayer.id) {
      this.drawOffers.black = true;
    } else {
      return false;
    }
    
    // If both players have offered draw, accept it
    if (this.drawOffers.white && this.drawOffers.black) {
      this.endGame('draw', 'mutual agreement');
    }
    
    return true;
  }

  public respondToDraw(playerId: string, accept: boolean): boolean {
    if (this.status !== 'active') return false;
    
    const isWhite = playerId === this.whitePlayer.id;
    const isBlack = playerId === this.blackPlayer.id;
    
    if (!isWhite && !isBlack) return false;
    
    // Check if opponent has offered draw
    const opponentOffered = isWhite ? this.drawOffers.black : this.drawOffers.white;
    if (!opponentOffered) return false;
    
    if (accept) {
      this.endGame('draw', 'draw accepted');
    } else {
      // Reset draw offers
      this.drawOffers = { white: false, black: false };
    }
    
    return true;
  }

  public pause(): void {
    if (this.status === 'active') {
      this.status = 'paused';
      this.pauseClock();
    }
  }

  public resume(): void {
    if (this.status === 'paused') {
      this.status = 'active';
      this.resumeClock();
    }
  }

  public addSpectator(userId: string): void {
    this.spectators.add(userId);
  }

  public removeSpectator(userId: string): void {
    this.spectators.delete(userId);
  }

  public getCurrentPlayer(): Player {
    return this.chess.turn() === 'w' ? this.whitePlayer : this.blackPlayer;
  }

  public getGameState(): GameState {
    return {
      fen: this.chess.fen(),
      turn: this.chess.turn(),
      isCheck: this.chess.inCheck(),
      isCheckmate: this.chess.isCheckmate(),
      isStalemate: this.chess.isStalemate(),
      isDraw: this.chess.isDraw(),
      isGameOver: this.chess.isGameOver(),
      result: this.result,
      reason: this.reason,
      moveHistory: this.moveHistory,
      capturedPieces: this.getCapturedPieces()
    };
  }

  public getClockState(): ClockState {
    return { ...this.clock };
  }

  public toJSON(): GameData {
    return {
      id: this.id,
      whitePlayer: this.whitePlayer,
      blackPlayer: this.blackPlayer,
      timeControl: this.timeControl,
      status: this.status,
      result: this.result,
      reason: this.reason,
      startTime: this.startTime,
      endTime: this.endTime,
      currentFen: this.chess.fen(),
      moveHistory: this.moveHistory,
      spectators: Array.from(this.spectators)
    };
  }

  private startClock(): void {
    this.clock.isRunning = true;
    this.clock.lastUpdate = new Date();
    this.updateClock();
  }

  private pauseClock(): void {
    this.clock.isPaused = true;
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = undefined;
    }
  }

  private resumeClock(): void {
    this.clock.isPaused = false;
    this.clock.lastUpdate = new Date();
    this.updateClock();
  }

  private updateClock(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }

    this.clockInterval = setInterval(() => {
      if (this.clock.isPaused || !this.clock.isRunning) return;

      const now = new Date();
      const elapsed = now.getTime() - this.clock.lastUpdate.getTime();
      
      this.clock[this.clock.turn].time -= elapsed;
      this.clock.lastUpdate = now;

      // Check for time expiration
      if (this.clock[this.clock.turn].time <= 0) {
        this.clock[this.clock.turn].time = 0;
        const winner = this.clock.turn === 'white' ? 'black' : 'white';
        this.endGame(winner, 'time expired');
      }
    }, 100); // Update every 100ms for accuracy
  }

  private checkGameEnd(): void {
    if (this.chess.isCheckmate()) {
      const winner = this.chess.turn() === 'w' ? 'black' : 'white';
      this.endGame(winner, 'checkmate');
    } else if (this.chess.isStalemate()) {
      this.endGame('draw', 'stalemate');
    } else if (this.chess.isDraw()) {
      let reason = 'draw';
      if (this.chess.isInsufficientMaterial()) {
        reason = 'insufficient material';
      } else if (this.chess.isThreefoldRepetition()) {
        reason = 'threefold repetition';
      }
      this.endGame('draw', reason);
    }
  }

  private endGame(result: 'white' | 'black' | 'draw', reason: string): void {
    this.status = 'finished';
    this.result = result;
    this.reason = reason;
    this.endTime = new Date();
    this.clock.isRunning = false;
    
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = undefined;
    }
  }

  private getCapturedPieces(): { white: string[]; black: string[] } {
    const captured = { white: [] as string[], black: [] as string[] };
    
    for (const move of this.moveHistory) {
      if (move.captured) {
        const capturedBy = move.piece.toLowerCase() === move.piece ? 'black' : 'white';
        captured[capturedBy].push(move.captured);
      }
    }
    
    return captured;
  }

  public cleanup(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = undefined;
    }
  }
}