import { Chess } from 'chess.js';

export interface EngineMove {
  from: string;
  to: string;
  promotion?: string;
  san: string;
  score: number;
  depth: number;
  pv: string[]; // Principal variation
}

export interface EngineAnalysis {
  bestMove: EngineMove;
  evaluation: number;
  depth: number;
  nodes: number;
  time: number;
  pv: string[];
  multipv?: EngineMove[]; // Multiple principal variations
}

export interface EngineOptions {
  depth?: number;
  timeLimit?: number; // in milliseconds
  threads?: number;
  hash?: number; // hash table size in MB
  multipv?: number; // number of principal variations
}

/**
 * ChessEngine class that interfaces with a C++ chess engine
 * Currently uses chess.js for validation and basic functionality
 * Will be extended to call C++ engine for analysis and best move suggestions
 */
export class ChessEngine {
  private enginePath: string;
  private isEngineReady: boolean;
  private engineProcess?: any; // Will be child_process when implemented

  constructor(enginePath?: string) {
    this.enginePath = enginePath || './cpp_engine/chess_engine'; // Path to C++ executable
    this.isEngineReady = false;
    this.initializeEngine();
  }

  /**
   * Initialize the C++ chess engine
   * This is a placeholder - will spawn the C++ process
   */
  private async initializeEngine(): Promise<void> {
    try {
      // TODO: Implement C++ engine initialization
      // const { spawn } = require('child_process');
      // this.engineProcess = spawn(this.enginePath);
      // 
      // this.engineProcess.stdout.on('data', this.handleEngineOutput.bind(this));
      // this.engineProcess.stderr.on('data', this.handleEngineError.bind(this));
      // 
      // // Send UCI initialization commands
      // this.sendCommand('uci');
      // this.sendCommand('isready');
      
      // For now, mark as ready (using chess.js fallback)
      this.isEngineReady = true;
      console.log('Chess engine initialized (fallback mode)');
    } catch (error) {
      console.error('Failed to initialize chess engine:', error);
      this.isEngineReady = false;
    }
  }

  /**
   * Validate a chess position using chess.js
   */
  public validatePosition(fen: string): boolean {
    try {
      const chess = new Chess(fen);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate a move using chess.js
   */
  public validateMove(fen: string, move: { from: string; to: string; promotion?: string }): boolean {
    try {
      const chess = new Chess(fen);
      const result = chess.move(move);
      return result !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all legal moves for a position
   */
  public getLegalMoves(fen: string): string[] {
    try {
      const chess = new Chess(fen);
      return chess.moves();
    } catch (error) {
      return [];
    }
  }

  /**
   * Check if position is checkmate
   */
  public isCheckmate(fen: string): boolean {
    try {
      const chess = new Chess(fen);
      return chess.isCheckmate();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if position is stalemate
   */
  public isStalemate(fen: string): boolean {
    try {
      const chess = new Chess(fen);
      return chess.isStalemate();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if position is draw
   */
  public isDraw(fen: string): boolean {
    try {
      const chess = new Chess(fen);
      return chess.isDraw();
    } catch (error) {
      return false;
    }
  }

  /**
   * Analyze a chess position using the C++ engine
   * Currently returns a placeholder - will implement C++ engine call
   */
  public async analyzePosition(fen: string, options: EngineOptions = {}): Promise<EngineAnalysis> {
    if (!this.isEngineReady) {
      throw new Error('Chess engine not ready');
    }

    // TODO: Implement C++ engine analysis
    // For now, return a basic analysis using chess.js
    return this.getFallbackAnalysis(fen, options);
  }

  /**
   * Get the best move for a position using the C++ engine
   * Currently returns a placeholder - will implement C++ engine call
   */
  public async getBestMove(fen: string, depth: number = 15, timeLimit: number = 1000): Promise<EngineMove | null> {
    if (!this.isEngineReady) {
      throw new Error('Chess engine not ready');
    }

    // TODO: Implement C++ engine best move calculation
    // For now, return a random legal move
    return this.getFallbackBestMove(fen);
  }

  /**
   * Evaluate a position (returns centipawn evaluation)
   * Positive values favor white, negative favor black
   */
  public async evaluatePosition(fen: string): Promise<number> {
    if (!this.isEngineReady) {
      throw new Error('Chess engine not ready');
    }

    // TODO: Implement C++ engine evaluation
    // For now, return basic material evaluation
    return this.getFallbackEvaluation(fen);
  }

  /**
   * Send a command to the C++ engine (UCI protocol)
   */
  private sendCommand(command: string): void {
    // TODO: Implement UCI command sending
    // this.engineProcess?.stdin.write(command + '\n');
    console.log(`Engine command: ${command}`);
  }

  /**
   * Handle output from the C++ engine
   */
  private handleEngineOutput(data: Buffer): void {
    const output = data.toString().trim();
    console.log(`Engine output: ${output}`);
    
    // TODO: Parse UCI responses
    // Handle 'uciok', 'readyok', 'bestmove', 'info' commands
  }

  /**
   * Handle errors from the C++ engine
   */
  private handleEngineError(data: Buffer): void {
    const error = data.toString().trim();
    console.error(`Engine error: ${error}`);
  }

  /**
   * Fallback analysis using chess.js (basic implementation)
   */
  private getFallbackAnalysis(fen: string, options: EngineOptions): EngineAnalysis {
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });
    
    if (moves.length === 0) {
      throw new Error('No legal moves available');
    }

    // Return first legal move as "best" move (placeholder)
    const bestMove = moves[0];
    
    return {
      bestMove: {
        from: bestMove?.from || '',
        to: bestMove?.to || '',
        promotion: bestMove?.promotion,
        san: bestMove?.san || '',
        score: 0, // Placeholder
        depth: options.depth || 1,
        pv: [bestMove?.san || '']
      },
      evaluation: this.getFallbackEvaluation(fen),
      depth: options.depth || 1,
      nodes: 1,
      time: 100,
      pv: [bestMove?.san || '']
    };
  }

  /**
   * Fallback best move using chess.js (returns random legal move)
   */
  private getFallbackBestMove(fen: string): EngineMove | null {
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });
    
    if (moves.length === 0) {
      return null;
    }

    // Return random legal move (placeholder)
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    
    return {
      from: randomMove?.from || '',
      to: randomMove?.to || '',
      promotion: randomMove?.promotion,
      san: randomMove?.san || '',
      score: 0,
      depth: 1,
      pv: [randomMove?.san || '']
    };
  }

  /**
   * Basic material evaluation (fallback)
   */
  private getFallbackEvaluation(fen: string): number {
    const chess = new Chess(fen);
    const board = chess.board();
    
    const pieceValues: { [key: string]: number } = {
      'p': -1, 'n': -3, 'b': -3, 'r': -5, 'q': -9, 'k': 0,
      'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 0
    };
    
    let evaluation = 0;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row]?.[col];
        if (piece) {
          // evaluation += piece?.type ? pieceValues[piece?.type] * (piece.color === 'w' ? 1 : -1) : 0;
        }
      }
    }
    
    return evaluation * 100; // Convert to centipawns
  }

  /**
   * Cleanup engine resources
   */
  public cleanup(): void {
    if (this.engineProcess) {
      this.sendCommand('quit');
      this.engineProcess.kill();
      this.engineProcess = undefined;
    }
    this.isEngineReady = false;
  }

  /**
   * Check if engine is ready
   */
  public isReady(): boolean {
    return this.isEngineReady;
  }

  /**
   * Get engine information
   */
  public getEngineInfo(): { name: string; version: string; author: string } {
    return {
      name: 'Yoki Chess Engine',
      version: '1.0.0',
      author: 'Yoki Chess Team'
    };
  }
}