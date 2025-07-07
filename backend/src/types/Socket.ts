import { Socket } from 'socket.io';

export interface CustomSocket extends Socket {
  userId?: string;
}

export interface UserData {
  id?: string;
  username: string;
  email?: string;
  rating?: number;
  avatar?: string;
}

export interface TimeControl {
  minutes: number;
  increment: number;
}

export interface MoveData {
  from: string;
  to: string;
  promotion?: string;
}

export interface GameActionData {
  gameId: string;
  playerId: string;
}

export interface DrawResponseData {
  gameId: string;
  accept: boolean;
}

export interface AnalysisRequest {
  fen: string;
  depth?: number;
}

export interface BestMoveRequest {
  fen: string;
  depth?: number;
  timeLimit?: number;
}

export interface ChatMessage {
  gameId: string;
  message: string;
  timestamp: Date;
}