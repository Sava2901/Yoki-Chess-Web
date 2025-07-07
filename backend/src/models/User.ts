import { v4 as uuidv4 } from 'uuid';

export interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  rating: number;
  totalPlayTime: number; // in seconds
  longestGame: number; // in seconds
  averageGameTime: number; // in seconds
  winStreak: number;
  currentStreak: number;
  bestRating: number;
  worstRating: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  country?: string;
  title?: string; // GM, IM, FM, etc.
  isOnline: boolean;
  lastSeen: Date;
  joinDate: Date;
  stats: UserStats;
}

export interface PublicUserProfile {
  id: string;
  username: string;
  avatar?: string;
  country?: string;
  title?: string;
  rating: number;
  isOnline: boolean;
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
  };
}

export class User {
  public id: string;
  public username: string;
  public email?: string;
  public avatar?: string;
  public country?: string;
  public title?: string;
  public isOnline: boolean;
  public lastSeen: Date;
  public joinDate: Date;
  public socketId?: string;
  public stats: UserStats;
  public currentGameId?: string;

  constructor(data: Partial<UserProfile>) {
    this.id = data.id || uuidv4();
    this.username = data.username || '';
    this.email = data.email;
    this.avatar = data.avatar;
    this.country = data.country;
    this.title = data.title;
    this.isOnline = false;
    this.lastSeen = new Date();
    this.joinDate = data.joinDate || new Date();
    
    this.stats = data.stats || {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      rating: 1200,
      totalPlayTime: 0,
      longestGame: 0,
      averageGameTime: 0,
      winStreak: 0,
      currentStreak: 0,
      bestRating: 1200,
      worstRating: 1200
    };
  }

  public setOnlineStatus(isOnline: boolean, socketId?: string): void {
    this.isOnline = isOnline;
    if (socketId) {
      this.socketId = socketId;
    }
    if (!isOnline) {
      this.lastSeen = new Date();
      this.socketId = undefined;
    }
  }

  public updateStats(
    result: 'win' | 'loss' | 'draw',
    gameDuration: number,
    ratingChange: number
  ): void {
    this.stats.gamesPlayed++;
    this.stats.totalPlayTime += gameDuration;
    
    if (gameDuration > this.stats.longestGame) {
      this.stats.longestGame = gameDuration;
    }
    
    this.stats.averageGameTime = this.stats.totalPlayTime / this.stats.gamesPlayed;
    
    // Update rating
    const oldRating = this.stats.rating;
    this.stats.rating += ratingChange;
    
    if (this.stats.rating > this.stats.bestRating) {
      this.stats.bestRating = this.stats.rating;
    }
    if (this.stats.rating < this.stats.worstRating) {
      this.stats.worstRating = this.stats.rating;
    }
    
    // Update game results
    switch (result) {
      case 'win':
        this.stats.wins++;
        this.stats.currentStreak++;
        if (this.stats.currentStreak > this.stats.winStreak) {
          this.stats.winStreak = this.stats.currentStreak;
        }
        break;
      case 'loss':
        this.stats.losses++;
        this.stats.currentStreak = 0;
        break;
      case 'draw':
        this.stats.draws++;
        this.stats.currentStreak = 0;
        break;
    }
  }

  public toJSON(): UserProfile {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      avatar: this.avatar,
      country: this.country,
      title: this.title,
      isOnline: this.isOnline,
      lastSeen: this.lastSeen,
      joinDate: this.joinDate,
      stats: this.stats
    };
  }

  public toPublicProfile(): PublicUserProfile {
    const winRate = this.stats.gamesPlayed > 0 
      ? (this.stats.wins / this.stats.gamesPlayed) * 100 
      : 0;

    return {
      id: this.id,
      username: this.username,
      avatar: this.avatar,
      country: this.country,
      title: this.title,
      rating: this.stats.rating,
      isOnline: this.isOnline,
      stats: {
        gamesPlayed: this.stats.gamesPlayed,
        wins: this.stats.wins,
        losses: this.stats.losses,
        draws: this.stats.draws,
        winRate: Math.round(winRate * 100) / 100
      }
    };
  }

  public getRating(): number {
    return this.stats.rating;
  }

  public getWinRate(): number {
    if (this.stats.gamesPlayed === 0) return 0;
    return (this.stats.wins / this.stats.gamesPlayed) * 100;
  }

  public isInGame(): boolean {
    return !!this.currentGameId;
  }

  public setCurrentGame(gameId?: string): void {
    this.currentGameId = gameId;
  }
}