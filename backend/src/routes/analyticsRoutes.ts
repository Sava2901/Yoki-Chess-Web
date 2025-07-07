import { Router, Request, Response } from 'express';
import { GameManager } from '../services/GameManager';

export function createAnalyticsRoutes(gameManager: GameManager): Router {
  const router = Router();

  // Get server statistics
  router.get('/server/stats', (_req: Request, res: Response): void => {
    try {
      const onlineUsers = gameManager.getOnlinePlayers();
      const totalUsers = onlineUsers.length; // This would be from database in real implementation
      
      // TODO: Get actual statistics from database
      const stats = {
        totalUsers,
        onlineUsers: onlineUsers.length,
        activeGames: 0, // Count active games
        totalGames: 0, // Total games played
        averageRating: 1200,
        topRating: Math.max(...onlineUsers.map(u => u.rating), 1200),
        gamesPlayedToday: 0,
        peakOnlineUsers: onlineUsers.length,
        serverUptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      };
      
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Error getting server stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Analyze position with chess engine
  router.post('/position/analyze', async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { fen, depth = 15 } = req.body;
      
      if (!fen) {
        return res.status(400).json({ error: 'FEN string is required' });
      }
      
      const analysis = await gameManager.requestAnalysis(fen, depth);
      
      res.json({
        success: true,
        fen,
        analysis
      });
    } catch (error) {
      console.error('Error analyzing position:', error);
      return res.status(500).json({ error: 'Failed to analyze position' });
    }
  });

  // Get best move for position
  router.post('/position/bestmove', async (req: Request, res: Response): Promise<void> => {
    try {
      const { fen, depth = 15, timeLimit = 1000 } = req.body;
      
      if (!fen) {
        res.status(400).json({ error: 'FEN string is required' });
      }
      
      const bestMove = await gameManager.requestBestMove(fen, depth, timeLimit);
      
      res.json({
        success: true,
        fen,
        bestMove
      });
    } catch (error) {
      console.error('Error getting best move:', error);
      res.status(500).json({ error: 'Failed to get best move' });
    }
  });

  // Get opening statistics
  router.get('/openings/stats', (req: Request, res: Response): void => {
    try {
      // TODO: Implement opening statistics from database
      const openingStats = [
        {
          name: 'Sicilian Defense',
          eco: 'B20-B99',
          frequency: 25.2,
          whiteWinRate: 52.1,
          blackWinRate: 31.8,
          drawRate: 16.1,
          averageLength: 42
        },
        {
          name: 'French Defense',
          eco: 'C00-C19',
          frequency: 8.7,
          whiteWinRate: 55.3,
          blackWinRate: 28.9,
          drawRate: 15.8,
          averageLength: 38
        },
        {
          name: 'Caro-Kann Defense',
          eco: 'B10-B19',
          frequency: 6.1,
          whiteWinRate: 53.8,
          blackWinRate: 30.2,
          drawRate: 16.0,
          averageLength: 40
        },
        {
          name: 'Queen\'s Gambit',
          eco: 'D06-D69',
          frequency: 12.4,
          whiteWinRate: 56.7,
          blackWinRate: 27.3,
          drawRate: 16.0,
          averageLength: 45
        },
        {
          name: 'King\'s Indian Defense',
          eco: 'E60-E99',
          frequency: 7.8,
          whiteWinRate: 54.2,
          blackWinRate: 32.1,
          drawRate: 13.7,
          averageLength: 41
        }
      ];
      
      res.json({
        success: true,
        openings: openingStats
      });
    } catch (error) {
      console.error('Error getting opening stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get time control statistics
  router.get('/timecontrols/stats', (req: Request, res: Response): void => {
    try {
      // TODO: Implement time control statistics from database
      const timeControlStats = [
        {
          name: 'Blitz (5+0)',
          minutes: 5,
          increment: 0,
          popularity: 35.2,
          averageRating: 1450,
          gamesPlayed: 15420,
          averageLength: 8.5 // minutes
        },
        {
          name: 'Rapid (10+0)',
          minutes: 10,
          increment: 0,
          popularity: 28.7,
          averageRating: 1380,
          gamesPlayed: 12150,
          averageLength: 15.2
        },
        {
          name: 'Bullet (1+0)',
          minutes: 1,
          increment: 0,
          popularity: 18.9,
          averageRating: 1520,
          gamesPlayed: 8930,
          averageLength: 2.1
        },
        {
          name: 'Classical (30+0)',
          minutes: 30,
          increment: 0,
          popularity: 12.1,
          averageRating: 1420,
          gamesPlayed: 4280,
          averageLength: 42.8
        },
        {
          name: 'Blitz (3+2)',
          minutes: 3,
          increment: 2,
          popularity: 5.1,
          averageRating: 1465,
          gamesPlayed: 2140,
          averageLength: 12.3
        }
      ];
      
      res.json({
        success: true,
        timeControls: timeControlStats
      });
    } catch (error) {
      console.error('Error getting time control stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get rating distribution
  router.get('/ratings/distribution', (req: Request, res: Response): void => {
    try {
      // TODO: Implement rating distribution from database
      const ratingDistribution = [
        { range: '0-800', count: 125, percentage: 2.1 },
        { range: '800-1000', count: 340, percentage: 5.7 },
        { range: '1000-1200', count: 890, percentage: 14.8 },
        { range: '1200-1400', count: 1450, percentage: 24.2 },
        { range: '1400-1600', count: 1320, percentage: 22.0 },
        { range: '1600-1800', count: 980, percentage: 16.3 },
        { range: '1800-2000', count: 560, percentage: 9.3 },
        { range: '2000-2200', count: 240, percentage: 4.0 },
        { range: '2200+', count: 95, percentage: 1.6 }
      ];
      
      res.json({
        success: true,
        distribution: ratingDistribution,
        totalPlayers: ratingDistribution.reduce((sum, range) => sum + range.count, 0)
      });
    } catch (error) {
      console.error('Error getting rating distribution:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get game result statistics
  router.get('/results/stats', async (req: Request, res: Response): Promise<void | undefined> => {
    try {
      const timeRange = (req.query.timeRange as string) || '7d'; // 1d, 7d, 30d, all
      
      // TODO: Implement game result statistics from database
      const resultStats = {
        totalGames: 5420,
        whiteWins: 2180, // 40.2%
        blackWins: 1840, // 33.9%
        draws: 1400, // 25.9%
        winReasons: {
          checkmate: 3250, // 60.0%
          resignation: 1890, // 34.9%
          timeout: 180, // 3.3%
          abandonment: 100 // 1.8%
        },
        drawReasons: {
          agreement: 680, // 48.6%
          stalemate: 420, // 30.0%
          repetition: 210, // 15.0%
          insufficientMaterial: 90 // 6.4%
        },
        averageGameLength: 38.5, // moves
        averageGameDuration: 12.3 // minutes
      };
      
      res.json({
        success: true,
        timeRange,
        stats: resultStats
      });
    } catch (error) {
      console.error('Error getting result stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get player performance trends
  router.get('/player/:playerId/trends', async (req: Request, res: Response): Promise<void> => {
    try {
      const { playerId } = req.params;
      const timeRange = (req.query.timeRange as string) || '30d';
      
      const user = gameManager.getUser(playerId as string);
      if (!user) {
        res.status(404).json({ error: 'Player not found' });
        return;
      }
      
      // TODO: Implement player trends from database
      const trends = {
        ratingHistory: [
          { date: '2024-01-01', rating: 1200 },
          { date: '2024-01-08', rating: 1235 },
          { date: '2024-01-15', rating: 1198 },
          { date: '2024-01-22', rating: 1267 },
          { date: '2024-01-29', rating: 1289 }
        ],
        performanceByTimeControl: [
          { timeControl: 'Blitz (5+0)', rating: 1345, games: 45, winRate: 62.2 },
          { timeControl: 'Rapid (10+0)', rating: 1289, games: 23, winRate: 56.5 },
          { timeControl: 'Bullet (1+0)', rating: 1456, games: 78, winRate: 58.9 }
        ],
        recentForm: {
          last10Games: { wins: 6, losses: 3, draws: 1 },
          last25Games: { wins: 14, losses: 8, draws: 3 },
          winStreak: user.stats.currentStreak,
          bestStreak: user.stats.winStreak
        }
      };
      
      res.json({
        success: true,
        playerId,
        timeRange,
        trends
      });
    } catch (error) {
      console.error('Error getting player trends:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get engine performance metrics
  router.get('/engine/performance', (req: Request, res: Response): void => {
    try {
      // TODO: Implement engine performance metrics
      const engineMetrics = {
        averageAnalysisTime: 850, // milliseconds
        averageDepth: 18,
        positionsAnalyzed: 12450,
        cacheHitRate: 73.2, // percentage
        engineUptime: process.uptime(),
        memoryUsage: {
          rss: process.memoryUsage().rss,
          heapUsed: process.memoryUsage().heapUsed,
          heapTotal: process.memoryUsage().heapTotal
        },
        requestsPerMinute: 45.2,
        errorRate: 0.8 // percentage
      };
      
      res.json({
        success: true,
        metrics: engineMetrics
      });
    } catch (error) {
      console.error('Error getting engine performance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}