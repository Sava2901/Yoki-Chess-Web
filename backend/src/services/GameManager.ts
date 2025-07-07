import { Server } from 'socket.io';
import { Game } from '../models/Game';
import { User } from '../models/User';
import { TimeControl, Player, MatchmakingResult, MoveResult, GameResult } from '../types/Game';
import { CustomSocket } from '../types/Socket';
import { ChessEngine } from './ChessEngine';

export class GameManager {
  private io: Server;
  private games: Map<string, Game>;
  private users: Map<string, User>;
  private waitingPlayers: Map<string, { playerId: string; timeControl: TimeControl; timestamp: Date }>;
  private playerGames: Map<string, string>; // playerId -> gameId
  private chessEngine: ChessEngine;

  constructor(io: Server) {
    this.io = io;
    this.games = new Map();
    this.users = new Map();
    this.waitingPlayers = new Map();
    this.playerGames = new Map();
    this.chessEngine = new ChessEngine();
  }

  public registerUser(userData: { username: string; email?: string; rating?: number }): User {
    const user = new User({
      username: userData.username,
      email: userData.email,
      stats: {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        rating: userData.rating || 1200,
        totalPlayTime: 0,
        longestGame: 0,
        averageGameTime: 0,
        winStreak: 0,
        currentStreak: 0,
        bestRating: userData.rating || 1200,
        worstRating: userData.rating || 1200
      }
    });
    
    this.users.set(user.id, user);
    return user;
  }

  public getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  public setUserOnlineStatus(userId: string, isOnline: boolean, socketId?: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;
    
    user.setOnlineStatus(isOnline, socketId);
    return true;
  }

  public createGame(whitePlayerId: string, blackPlayerId: string, timeControl: TimeControl): Game | null {
    const whitePlayer = this.users.get(whitePlayerId);
    const blackPlayer = this.users.get(blackPlayerId);
    
    if (!whitePlayer || !blackPlayer) return null;
    
    const whitePlayerData: Player = {
      id: whitePlayer.id,
      username: whitePlayer.username,
      rating: whitePlayer.stats.rating,
      color: 'white'
    };
    
    const blackPlayerData: Player = {
      id: blackPlayer.id,
      username: blackPlayer.username,
      rating: blackPlayer.stats.rating,
      color: 'black'
    };
    
    const game = new Game(whitePlayerData, blackPlayerData, timeControl);
    this.games.set(game.id, game);
    this.playerGames.set(whitePlayerId, game.id);
    this.playerGames.set(blackPlayerId, game.id);
    
    // Set users as in game
    whitePlayer.setCurrentGame(game.id);
    blackPlayer.setCurrentGame(game.id);
    
    return game;
  }

  public joinMatchmaking(playerId: string, timeControl: TimeControl): MatchmakingResult {
    // Check if player is already in a game
    if (this.playerGames.has(playerId)) {
      return {
        success: false,
        message: 'Already in a game'
      };
    }
    
    // Check if player is already waiting
    if (this.waitingPlayers.has(playerId)) {
      return {
        success: false,
        message: 'Already in matchmaking queue'
      };
    }
    
    const player = this.users.get(playerId);
    if (!player) {
      return {
        success: false,
        message: 'Player not found'
      };
    }
    
    // Look for a suitable opponent
    const opponent = this.findOpponent(player, timeControl);
    
    if (opponent) {
      // Remove opponent from waiting list
      this.waitingPlayers.delete(opponent.playerId);
      
      // Randomly assign colors
      const isPlayerWhite = Math.random() < 0.5;
      const whitePlayerId = isPlayerWhite ? playerId : opponent.playerId;
      const blackPlayerId = isPlayerWhite ? opponent.playerId : playerId;
      
      // Create game
      const game = this.createGame(whitePlayerId, blackPlayerId, timeControl);
      
      if (game) {
        game.start();
        
        return {
          success: true,
          gameId: game.id,
          opponentId: opponent.playerId,
          color: isPlayerWhite ? 'white' : 'black'
        };
      }
    }
    
    // Add player to waiting list
    this.waitingPlayers.set(playerId, {
      playerId,
      timeControl,
      timestamp: new Date()
    });
    
    return {
      success: true,
      message: 'Added to matchmaking queue'
    };
  }

  public leaveMatchmaking(playerId: string): boolean {
    return this.waitingPlayers.delete(playerId);
  }

  public getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  public getPlayerGame(playerId: string): Game | null {
    const gameId = this.playerGames.get(playerId);
    if (!gameId) return null;
    
    return this.games.get(gameId) || null;
  }

  public makeMove(gameId: string, playerId: string, moveData: { from: string; to: string; promotion?: string }): MoveResult {
    const game = this.games.get(gameId);
    if (!game) {
      return {
        success: false,
        error: 'Game not found'
      };
    }
    
    return game.makeMove(playerId, moveData);
  }

  public endGame(gameId: string, result: 'white' | 'black' | 'draw', reason: string): GameResult {
    const game = this.games.get(gameId);
    if (!game) {
      return {
        success: false,
        error: 'Game not found'
      };
    }
    
    // Update player stats
    this.updatePlayerStats(game, result, reason);
    
    // Clean up
    this.playerGames.delete(game.whitePlayer.id);
    this.playerGames.delete(game.blackPlayer.id);
    
    const whitePlayer = this.users.get(game.whitePlayer.id);
    const blackPlayer = this.users.get(game.blackPlayer.id);
    
    if (whitePlayer) whitePlayer.setCurrentGame();
    if (blackPlayer) blackPlayer.setCurrentGame();
    
    game.cleanup();
    
    return {
      success: true,
      result,
      reason
    };
  }

  private updatePlayerStats(game: Game, result: 'white' | 'black' | 'draw', reason: string): void {
    const whitePlayer = this.users.get(game.whitePlayer.id);
    const blackPlayer = this.users.get(game.blackPlayer.id);
    
    if (!whitePlayer || !blackPlayer) return;
    
    const gameDuration = game.endTime 
      ? Math.floor((game.endTime.getTime() - game.startTime.getTime()) / 1000)
      : 0;
    
    // Calculate rating changes
    const ratingChanges = this.calculateRatingChange(
      whitePlayer.stats.rating,
      blackPlayer.stats.rating,
      result
    );
    
    // Update white player stats
    let whiteResult: 'win' | 'loss' | 'draw';
    if (result === 'white') whiteResult = 'win';
    else if (result === 'black') whiteResult = 'loss';
    else whiteResult = 'draw';
    
    whitePlayer.updateStats(whiteResult, gameDuration, ratingChanges.white);
    
    // Update black player stats
    let blackResult: 'win' | 'loss' | 'draw';
    if (result === 'black') blackResult = 'win';
    else if (result === 'white') blackResult = 'loss';
    else blackResult = 'draw';
    
    blackPlayer.updateStats(blackResult, gameDuration, ratingChanges.black);
  }

  private calculateRatingChange(
    whiteRating: number,
    blackRating: number,
    result: 'white' | 'black' | 'draw'
  ): { white: number; black: number } {
    const K = 32; // K-factor for Elo rating
    
    const expectedWhite = 1 / (1 + Math.pow(10, (blackRating - whiteRating) / 400));
    const expectedBlack = 1 - expectedWhite;
    
    let actualWhite: number;
    let actualBlack: number;
    
    if (result === 'white') {
      actualWhite = 1;
      actualBlack = 0;
    } else if (result === 'black') {
      actualWhite = 0;
      actualBlack = 1;
    } else {
      actualWhite = 0.5;
      actualBlack = 0.5;
    }
    
    const whiteChange = Math.round(K * (actualWhite - expectedWhite));
    const blackChange = Math.round(K * (actualBlack - expectedBlack));
    
    return {
      white: whiteChange,
      black: blackChange
    };
  }

  private findOpponent(player: User, timeControl: TimeControl): { playerId: string; timeControl: TimeControl; timestamp: Date } | null {
    const playerRating = player.stats.rating;
    const ratingRange = 200; // Allow ±200 rating difference
    
    for (const [waitingPlayerId, waitingData] of this.waitingPlayers) {
      // Skip self
      if (waitingPlayerId === player.id) continue;
      
      // Check time control match
      if (waitingData.timeControl.minutes !== timeControl.minutes || 
          waitingData.timeControl.increment !== timeControl.increment) {
        continue;
      }
      
      // Check rating range
      const waitingPlayer = this.users.get(waitingPlayerId);
      if (!waitingPlayer) continue;
      
      const ratingDiff = Math.abs(playerRating - waitingPlayer.stats.rating);
      if (ratingDiff <= ratingRange) {
        return waitingData;
      }
    }
    
    return null;
  }

  public getPlayerGameHistory(playerId: string, limit: number = 10): any[] {
    // This would typically query a database
    // For now, return empty array as placeholder
    return [];
  }

  public getOnlinePlayers(): any[] {
    const onlinePlayers = Array.from(this.users.values())
      .filter(user => user.isOnline)
      .map(user => user.toPublicProfile());
    
    return onlinePlayers;
  }

  public getLeaderboard(limit: number = 50): any[] {
    const leaderboard = Array.from(this.users.values())
      .sort((a, b) => b.stats.rating - a.stats.rating)
      .slice(0, limit)
      .map(user => user.toPublicProfile());
    
    return leaderboard;
  }

  public notifyPlayer(playerId: string, event: string, data: any): void {
    const user = this.users.get(playerId);
    if (user && user.socketId) {
      this.io.to(user.socketId).emit(event, data);
    }
  }

  public broadcastToGame(gameId: string, event: string, data: any): void {
    this.io.to(`game:${gameId}`).emit(event, data);
  }

  public cleanup(): void {
    // Clean up all games
    for (const game of this.games.values()) {
      game.cleanup();
    }
    
    this.games.clear();
    this.waitingPlayers.clear();
    this.playerGames.clear();
  }

  // Chess engine integration methods
  public async requestAnalysis(fen: string, depth: number = 15): Promise<any> {
    return this.chessEngine.analyzePosition(fen, { depth });
  }

  public async requestBestMove(fen: string, depth: number = 15, timeLimit: number = 1000): Promise<any> {
    return this.chessEngine.getBestMove(fen, depth, timeLimit);
  }
}