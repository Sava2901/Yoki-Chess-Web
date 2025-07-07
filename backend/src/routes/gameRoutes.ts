import { Router, Request, Response } from 'express';
import { GameManager } from '../services/GameManager';
import { TimeControl } from '../types/Game';

export function createGameRoutes(gameManager: GameManager): Router {
  const router = Router();

  // Get game by ID
  router.get('/:gameId', (req: Request, res: Response): void => {
    try {
      const { gameId } = req.params;
      const game = gameManager.getGame(gameId as string);
      
      if (!game) {
        res.status(404).json({ error: 'Game not found' });
      }
      
      res.json({
        success: true,
        game: game?.toJSON(),
        gameState: game?.getGameState(),
        clockState: game?.getClockState()
      });
    } catch (error) {
      console.error('Error getting game:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get player's current game
  router.get('/player/:playerId/current', (req: Request, res: Response): void => {
    try {
      const { playerId } = req.params;
      const game = gameManager.getPlayerGame(playerId as string);
      
      if (!game) {
        res.status(404).json({ error: 'No active game found' });
      }
      
      res.json({
        success: true,
        game: game?.toJSON(),
        gameState: game?.getGameState(),
        clockState: game?.getClockState()
      });
    } catch (error) {
      console.error('Error getting player game:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get player's game history
  router.get('/player/:playerId/history', (req: Request, res: Response): void => {
    try {
      const { playerId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const history = gameManager.getPlayerGameHistory(playerId as string, limit);
      
      res.json({
        success: true,
        history,
        pagination: {
          limit,
          offset,
          total: history.length
        }
      });
    } catch (error) {
      console.error('Error getting game history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create a custom game (for testing or private games)
  router.post('/create', (req: Request, res: Response): void => {
    try {
      const { whitePlayerId, blackPlayerId, timeControl } = req.body;
      
      if (!whitePlayerId || !blackPlayerId || !timeControl) {
        res.status(400).json({ error: 'Missing required fields' });
      }
      
      const game = gameManager.createGame(whitePlayerId, blackPlayerId, timeControl as TimeControl);
      
      if (!game) {
        res.status(400).json({ error: 'Failed to create game' });
      }
      
      game?.start();
      
      res.json({
        success: true,
        game: game?.toJSON(),
        gameState: game?.getGameState(),
        clockState: game?.getClockState()
      });
    } catch (error) {
      console.error('Error creating game:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Make a move (REST endpoint as backup to Socket.IO)
  router.post('/:gameId/move', (req: Request, res: Response): void => {
    try {
      const { gameId } = req.params;
      const { playerId, move } = req.body;
      
      if (!playerId || !move) {
        res.status(400).json({ error: 'Missing required fields' });
      }
      
      const result = gameManager.makeMove(gameId as string, playerId, move);
      
      if (!result.success) {
        res.status(400).json({ error: result.error });
      }
      
      res.json({
        success: true,
        move: result.move,
        gameState: result.gameState
      });
    } catch (error) {
      console.error('Error making move:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Resign game
  router.post('/:gameId/resign', (req: Request, res: Response): void => {
    try {
      const { gameId } = req.params;
      const { playerId } = req.body;
      
      if (!playerId) {
        res.status(400).json({ error: 'Missing playerId' });
      }
      
      const game = gameManager.getGame(gameId as string);
      if (!game) {
        res.status(404).json({ error: 'Game not found' });
      }
      
      const success = game?.resign(playerId);
      if (!success) {
        res.status(400).json({ error: 'Failed to resign' });
      }
      
      const result = playerId === game?.whitePlayer.id ? 'black' : 'white';
      gameManager.endGame(gameId as string, result, 'resignation');
      
      res.json({
        success: true,
        result,
        reason: 'resignation'
      });
    } catch (error) {
      console.error('Error resigning game:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Offer draw
  router.post('/:gameId/draw/offer', (req: Request, res: Response): void => {
    try {
      const { gameId } = req.params;
      const { playerId } = req.body;
      
      if (!playerId) {
        res.status(400).json({ error: 'Missing playerId' });
      }
      
      const game = gameManager.getGame(gameId as string);
      if (!game) {
        res.status(404).json({ error: 'Game not found' });
      }
      
      const success = game?.offerDraw(playerId);
      if (!success) {
        res.status(400).json({ error: 'Failed to offer draw' });
      }
      
      res.json({
        success: true,
        message: 'Draw offered'
      });
    } catch (error) {
      console.error('Error offering draw:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Respond to draw offer
  router.post('/:gameId/draw/respond', (req: Request, res: Response): void => {
    try {
      const { gameId } = req.params;
      const { playerId, accept } = req.body;
      
      if (!playerId || typeof accept !== 'boolean') {
        res.status(400).json({ error: 'Missing required fields' });
      }
      
      const game = gameManager.getGame(gameId as string);
      if (!game) {
        res.status(404).json({ error: 'Game not found' });
      }
      
      const success = game?.respondToDraw(playerId, accept);
      if (!success) {
        res.status(400).json({ error: 'Failed to respond to draw' });
      }
      
      if (accept) {
        gameManager.endGame(gameId as string, 'draw', 'draw accepted');
      }
      
      res.json({
        success: true,
        accepted: accept,
        message: accept ? 'Draw accepted' : 'Draw declined'
      });
    } catch (error) {
      console.error('Error responding to draw:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get game analysis
  router.post('/:gameId/analyze', async (req: Request, res: Response): Promise<void> => {
    try {
      const { gameId } = req.params;
      const { depth = 15 } = req.body;
      
      const game = gameManager.getGame(gameId as string);
      if (!game) {
        res.status(404).json({ error: 'Game not found' });
      }
      
      const gameState = game?.getGameState();
      const analysis = gameState ? await gameManager.requestAnalysis(gameState.fen, depth) : null;
      
      res.json({
        success: true,
        fen: gameState?.fen,
        analysis
      });
    } catch (error) {
      console.error('Error analyzing game:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get best move for current position
  router.post('/:gameId/bestmove', async (req: Request, res: Response): Promise<void> => {
    try {
      const { gameId } = req.params;
      const { depth = 15, timeLimit = 1000 } = req.body;
      
      const game = gameManager.getGame(gameId as string);
      if (!game) {
        res.status(404).json({ error: 'Game not found' });
      }
      
      const gameState = game?.getGameState();
      const bestMove = gameState ? await gameManager.requestBestMove(gameState.fen, depth, timeLimit) : null;
      
      res.json({
        success: true,
        fen: gameState?.fen,
        bestMove
      });
    } catch (error) {
      console.error('Error getting best move:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}