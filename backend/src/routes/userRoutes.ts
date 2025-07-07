import { Router, Request, Response } from 'express';
import { GameManager } from '../services/GameManager';

export function createUserRoutes(gameManager: GameManager): Router {
  const router = Router();

  // Get user profile by ID
  router.get('/:userId', (req: Request, res: Response): void => {
    try {
      const { userId } = req.params;
      const user = gameManager.getUser(userId as string);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        success: true,
        user: user?.toPublicProfile()
      });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get user's full profile (private - requires authentication)
  router.get('/:userId/profile', (req: Request, res: Response): void => {
    try {
      const { userId } = req.params;
      // TODO: Add authentication middleware to verify user can access this profile
      
      const user = gameManager.getUser(userId as string);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        success: true,
        profile: user?.toJSON()
      });
    } catch (error) {
      console.error('Error getting user profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Register a new user
  router.post('/register', (req: Request, res: Response): void => {
    try {
      const { username, email, rating } = req.body;
      
      if (!username) {
        res.status(400).json({ error: 'Username is required' });
      }
      
      // TODO: Add validation for unique username/email
      
      const user = gameManager.registerUser({
        username,
        email,
        rating
      });
      
      res.status(201).json({
        success: true,
        user: user.toPublicProfile()
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update user profile
  router.put('/:userId', (req: Request, res: Response): void => {
    try {
      const { userId } = req.params;
      const { username, email, country, avatar } = req.body;
      
      // TODO: Add authentication middleware to verify user can update this profile
      
      const user = gameManager.getUser(userId as string);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
      }
      
      // Update user properties
      if (username && user) user.username = username;
      if (email !== undefined && user) user.email = email;
      if (country !== undefined && user) user.country = country;
      if (avatar !== undefined && user) user.avatar = avatar;
      
      res.json({
        success: true,
        user: user?.toPublicProfile()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get user's game history
  router.get('/:userId/games', (req: Request, res: Response): void => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const user = gameManager.getUser(userId as string);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
      }
      
      const history = gameManager.getPlayerGameHistory(userId as string, limit);
      
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
      console.error('Error getting user games:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get user's current game
  router.get('/:userId/current-game', (req: Request, res: Response): void => {
    try {
      const { userId } = req.params;
      
      const user = gameManager.getUser(userId as string);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
      }
      
      const game = gameManager.getPlayerGame(userId as string);
      
      if (!game) {
        res.json({
          success: true,
          currentGame: null
        });
      }
      
      res.json({
        success: true,
        currentGame: {
          gameId: game?.id,
          game: game?.toJSON(),
          gameState: game?.getGameState(),
          clockState: game?.getClockState()
        }
      });
    } catch (error) {
      console.error('Error getting user current game:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get user statistics
  router.get('/:userId/stats', (req: Request, res: Response): void => {
    try {
      const { userId } = req.params;
      
      const user = gameManager.getUser(userId as string);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
      }
      
      const stats = {
        ...user?.stats,
        winRate: user?.getWinRate(),
        isOnline: user?.isOnline,
        lastSeen: user?.lastSeen,
        joinDate: user?.joinDate
      };
      
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Search users by username
  router.get('/search/:query', (req: Request, res: Response): void => {
    try {
      const { query } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (!query || query.length < 2) {
        res.status(400).json({ error: 'Query must be at least 2 characters' });
      }
      
      // TODO: Implement proper user search
      // For now, return empty results
      const results: any[] = [];
      
      res.json({
        success: true,
        results,
        query,
        limit
      });
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get online users
  router.get('/online/list', (req: Request, res: Response): void => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      
      const onlineUsers = gameManager.getOnlinePlayers().slice(0, limit);
      
      res.json({
        success: true,
        onlineUsers,
        count: onlineUsers.length
      });
    } catch (error) {
      console.error('Error getting online users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get leaderboard
  router.get('/leaderboard/top', (req: Request, res: Response): void => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      
      const leaderboard = gameManager.getLeaderboard(limit);
      
      res.json({
        success: true,
        leaderboard,
        count: leaderboard.length
      });
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Set user online status (for testing)
  router.post('/:userId/status', (req: Request, res: Response): void => {
    try {
      const { userId } = req.params;
      const { isOnline, socketId } = req.body;
      
      if (typeof isOnline !== 'boolean') {
        res.status(400).json({ error: 'isOnline must be a boolean' });
      }
      
      const success = gameManager.setUserOnlineStatus(userId as string, isOnline, socketId);
      
      if (!success) {
        res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        success: true,
        message: `User status updated to ${isOnline ? 'online' : 'offline'}`
      });
    } catch (error) {
      console.error('Error setting user status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}