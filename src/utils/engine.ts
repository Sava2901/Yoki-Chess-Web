// Chess engine communication interface
// Handles frontend-to-engine communication for move validation

export interface MoveValidationRequest {
  fen: string;           // Current board state in FEN notation
  from: string;          // Source square (e.g., 'e2')
  to: string;            // Destination square (e.g., 'e4')
  promotion?: string;    // Optional promotion piece ('q', 'r', 'b', 'n')
}

export interface MoveValidationResult {
  isLegal: boolean;
  error?: string;        // If illegal, explain why
  isCapture: boolean;
  isPromotion: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  newFen?: string;       // Updated FEN after the move (if legal)
  san?: string;          // Standard Algebraic Notation of the move
}

export interface EngineConfig {
  endpoint: string;      // Engine API endpoint
  timeout: number;       // Request timeout in milliseconds
}

// Default engine configuration
const DEFAULT_CONFIG: EngineConfig = {
  endpoint: '/api/engine/validate-move', // Will be implemented as Supabase Edge Function
  timeout: 5000
};

/**
 * Chess Engine API client
 * Handles communication with the C++ chess engine via backend API
 */
export class ChessEngine {
  private config: EngineConfig;

  constructor(config: Partial<EngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Validate a chess move using the engine
   * @param request Move validation request
   * @returns Promise resolving to validation result
   */
  async validateMove(request: MoveValidationRequest): Promise<MoveValidationResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Engine request failed: ${response.status} ${response.statusText}`);
      }

      const result: MoveValidationResult = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Engine request timed out');
        }
        throw new Error(`Engine communication error: ${error.message}`);
      }
      throw new Error('Unknown engine error');
    }
  }

  /**
   * Validate move format before sending to engine
   * @param from Source square
   * @param to Destination square
   * @returns true if format is valid
   */
  private isValidMoveFormat(from: string, to: string): boolean {
    const squareRegex = /^[a-h][1-8]$/;
    return squareRegex.test(from) && squareRegex.test(to);
  }

  /**
   * Create a move validation request
   * @param fen Current board FEN
   * @param from Source square
   * @param to Destination square
   * @param promotion Optional promotion piece
   * @returns Move validation request object
   */
  createMoveRequest(
    fen: string,
    from: string,
    to: string,
    promotion?: string
  ): MoveValidationRequest {
    if (!this.isValidMoveFormat(from, to)) {
      throw new Error(`Invalid move format: ${from} to ${to}`);
    }

    if (promotion && !['q', 'r', 'b', 'n'].includes(promotion.toLowerCase())) {
      throw new Error(`Invalid promotion piece: ${promotion}`);
    }

    return {
      fen,
      from: from.toLowerCase(),
      to: to.toLowerCase(),
      promotion: promotion?.toLowerCase(),
    };
  }
}

// Singleton instance for global use
// export const chessEngine = new ChessEngine();

// export function getEngine(): ChessEngine {
//   return chessEngine;
// }

export function getEngine(): ChessEngine {
  return new ChessEngine();
}

/**
 * Utility function to validate a move and handle the result
 * @param fen Current board FEN
 * @param from Source square
 * @param to Destination square
 * @param onSuccess Callback for successful move
 * @param onError Callback for failed move
 * @param promotion Optional promotion piece
 */
export async function validateAndExecuteMove(
  fen: string,
  from: string,
  to: string,
  onSuccess: (result: MoveValidationResult) => void,
  onError: (error: string) => void,
  promotion?: string
): Promise<void> {
  try {
    const engine = getEngine();
    const request = engine.createMoveRequest(fen, from, to, promotion);
    const result = await engine.validateMove(request);

    if (result.isLegal) {
      onSuccess(result);
    } else {
      onError(result.error || 'Move is not legal');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    onError(errorMessage);
  }
}