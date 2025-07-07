import { Server, Socket } from 'socket.io';
import { GameManager } from '../services/GameManager';
import { CustomSocket, UserData, TimeControl, MoveData, GameActionData, DrawResponseData, AnalysisRequest, BestMoveRequest, ChatMessage } from '../types/Socket';
import { SocketEvents } from '../types/SocketEvents';

export class SocketHandlers {
  private io: Server;
  private gameManager: GameManager;

  constructor(io: Server, gameManager: GameManager) {
    this.io = io;
    this.gameManager = gameManager;
  }

  public setupHandlers(): void {
    this.io.on('connection', (socket: CustomSocket) => {
      console.log(`User connected: ${socket.id}`);

      // User connection handlers
      this.handleUserConnect(socket);
      this.handleDisconnect(socket);

      // Matchmaking handlers
      this.handleJoinMatchmaking(socket);
      this.handleLeaveMatchmaking(socket);

      // Game handlers
      this.handleJoinGame(socket);
      this.handleLeaveGame(socket);
      this.handleMakeMove(socket);
      this.handleResignGame(socket);
      this.handleOfferDraw(socket);
      this.handleRespondDraw(socket);

      // Clock handlers
      this.handlePauseClock(socket);
      this.handleResumeClock(socket);

      // Chess engine handlers
      this.handleRequestAnalysis(socket);
      this.handleRequestBestMove(socket);

      // Chat handlers (optional)
      this.handleSendMessage(socket);

      // Spectator handlers (optional)
      this.handleJoinSpectate(socket);
      this.handleLeaveSpectate(socket);
    });
  }

  private handleUserConnect(socket: CustomSocket): void {
    socket.on(SocketEvents.USER_CONNECT, (userData: UserData) => {
      try {
        // Register or get existing user
        let user = this.gameManager.getUser(userData.id || '');
        
        if (!user) {
          user = this.gameManager.registerUser({
            username: userData.username,
            email: userData.email,
            rating: userData.rating
          });
        }

        // Set user online
        socket.userId = user.id;
        this.gameManager.setUserOnlineStatus(user.id, true, socket.id);

        // Send confirmation
        socket.emit(SocketEvents.USER_CONNECTED, {
          userId: user.id,
          profile: user.toPublicProfile()
        });

        // Broadcast user online status
        socket.broadcast.emit(SocketEvents.USER_ONLINE, {
          userId: user.id,
          username: user.username
        });

        console.log(`User ${user.username} (${user.id}) connected`);
      } catch (error) {
        console.error('Error handling user connect:', error);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to connect user' });
      }
    });
  }

  private handleDisconnect(socket: CustomSocket): void {
    socket.on('disconnect', () => {
      try {
        if (socket.userId) {
          // Set user offline
          this.gameManager.setUserOnlineStatus(socket.userId, false);
          
          // Leave matchmaking if waiting
          this.gameManager.leaveMatchmaking(socket.userId);
          
          // Broadcast user offline status
          socket.broadcast.emit(SocketEvents.USER_OFFLINE, {
            userId: socket.userId
          });

          console.log(`User ${socket.userId} disconnected`);
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  }

  private handleJoinMatchmaking(socket: CustomSocket): void {
    socket.on(SocketEvents.JOIN_MATCHMAKING, (data: { timeControl: TimeControl }) => {
      try {
        if (!socket.userId) {
          socket.emit(SocketEvents.ERROR, { message: 'User not authenticated' });
          return;
        }

        const result = this.gameManager.joinMatchmaking(socket.userId, data.timeControl);
        
        if (result.success && result.gameId) {
          // Game found
          const game = this.gameManager.getGame(result.gameId);
          if (game) {
            // Join game room
            socket.join(`game:${result.gameId}`);
            
            // Notify both players
            this.io.to(`game:${result.gameId}`).emit(SocketEvents.GAME_FOUND, {
              gameId: result.gameId,
              whitePlayer: game.whitePlayer,
              blackPlayer: game.blackPlayer,
              timeControl: game.timeControl
            });

            // Start the game
            this.io.to(`game:${result.gameId}`).emit(SocketEvents.GAME_STARTED, {
              gameId: result.gameId,
              gameState: game.getGameState(),
              clockState: game.getClockState()
            });
          }
        } else if (result.success) {
          // Added to queue
          socket.emit(SocketEvents.MATCHMAKING_WAITING, {
            message: result.message
          });
        } else {
          // Error
          socket.emit(SocketEvents.ERROR, { message: result.message });
        }
      } catch (error) {
        console.error('Error handling join matchmaking:', error);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to join matchmaking' });
      }
    });
  }

  private handleLeaveMatchmaking(socket: CustomSocket): void {
    socket.on(SocketEvents.LEAVE_MATCHMAKING, () => {
      try {
        if (!socket.userId) {
          socket.emit(SocketEvents.ERROR, { message: 'User not authenticated' });
          return;
        }

        const success = this.gameManager.leaveMatchmaking(socket.userId);
        
        if (success) {
          socket.emit(SocketEvents.MATCHMAKING_LEFT, { message: 'Left matchmaking queue' });
        }
      } catch (error) {
        console.error('Error handling leave matchmaking:', error);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to leave matchmaking' });
      }
    });
  }

  private handleJoinGame(socket: CustomSocket): void {
    socket.on(SocketEvents.JOIN_GAME, (data: { gameId: string }) => {
      try {
        const game = this.gameManager.getGame(data.gameId);
        if (!game) {
          socket.emit(SocketEvents.ERROR, { message: 'Game not found' });
          return;
        }

        socket.join(`game:${data.gameId}`);
        
        socket.emit(SocketEvents.GAME_JOINED, {
          gameId: data.gameId,
          gameState: game.getGameState(),
          clockState: game.getClockState(),
          gameData: game.toJSON()
        });
      } catch (error) {
        console.error('Error handling join game:', error);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to join game' });
      }
    });
  }

  private handleLeaveGame(socket: CustomSocket): void {
    socket.on(SocketEvents.LEAVE_GAME, (data: { gameId: string }) => {
      try {
        socket.leave(`game:${data.gameId}`);
        socket.emit(SocketEvents.GAME_LEFT, { gameId: data.gameId });
      } catch (error) {
        console.error('Error handling leave game:', error);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to leave game' });
      }
    });
  }

  private handleMakeMove(socket: CustomSocket): void {
    socket.on(SocketEvents.MAKE_MOVE, (data: { gameId: string; move: MoveData }) => {
      try {
        if (!socket.userId) {
          socket.emit(SocketEvents.ERROR, { message: 'User not authenticated' });
          return;
        }

        const result = this.gameManager.makeMove(data.gameId, socket.userId, data.move);
        
        if (result.success && result.move && result.gameState) {
          // Broadcast move to all players in the game
          this.io.to(`game:${data.gameId}`).emit(SocketEvents.MOVE_MADE, {
            gameId: data.gameId,
            move: result.move,
            gameState: result.gameState
          });

          // Check if game ended
          if (result.gameState.isGameOver) {
            const game = this.gameManager.getGame(data.gameId);
            if (game) {
              this.io.to(`game:${data.gameId}`).emit(SocketEvents.GAME_ENDED, {
                gameId: data.gameId,
                result: result.gameState.result,
                reason: result.gameState.reason,
                gameData: game.toJSON()
              });
            }
          }
        } else {
          socket.emit(SocketEvents.INVALID_MOVE, {
            gameId: data.gameId,
            error: result.error
          });
        }
      } catch (error) {
        console.error('Error handling make move:', error);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to make move' });
      }
    });
  }

  private handleResignGame(socket: CustomSocket): void {
    socket.on(SocketEvents.RESIGN_GAME, (data: GameActionData) => {
      try {
        if (!socket.userId) {
          socket.emit(SocketEvents.ERROR, { message: 'User not authenticated' });
          return;
        }

        const game = this.gameManager.getGame(data.gameId);
        if (!game) {
          socket.emit(SocketEvents.ERROR, { message: 'Game not found' });
          return;
        }

        const success = game.resign(socket.userId);
        if (success) {
          const result = socket.userId === game.whitePlayer.id ? 'black' : 'white';
          
          this.gameManager.endGame(data.gameId, result, 'resignation');
          
          this.io.to(`game:${data.gameId}`).emit(SocketEvents.GAME_ENDED, {
            gameId: data.gameId,
            result,
            reason: 'resignation',
            gameData: game.toJSON()
          });
        }
      } catch (error) {
        console.error('Error handling resign game:', error);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to resign game' });
      }
    });
  }

  private handleOfferDraw(socket: CustomSocket): void {
    socket.on(SocketEvents.OFFER_DRAW, (data: GameActionData) => {
      try {
        if (!socket.userId) {
          socket.emit(SocketEvents.ERROR, { message: 'User not authenticated' });
          return;
        }

        const game = this.gameManager.getGame(data.gameId);
        if (!game) {
          socket.emit(SocketEvents.ERROR, { message: 'Game not found' });
          return;
        }

        const success = game.offerDraw(socket.userId);
        if (success) {
          this.io.to(`game:${data.gameId}`).emit(SocketEvents.DRAW_OFFERED, {
            gameId: data.gameId,
            playerId: socket.userId
          });
        }
      } catch (error) {
        console.error('Error handling offer draw:', error);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to offer draw' });
      }
    });
  }

  private handleRespondDraw(socket: CustomSocket): void {
    socket.on(SocketEvents.RESPOND_DRAW, (data: DrawResponseData) => {
      try {
        if (!socket.userId) {
          socket.emit(SocketEvents.ERROR, { message: 'User not authenticated' });
          return;
        }

        const game = this.gameManager.getGame(data.gameId);
        if (!game) {
          socket.emit(SocketEvents.ERROR, { message: 'Game not found' });
          return;
        }

        const success = game.respondToDraw(socket.userId, data.accept);
        if (success) {
          if (data.accept) {
            this.gameManager.endGame(data.gameId, 'draw', 'draw accepted');
            
            this.io.to(`game:${data.gameId}`).emit(SocketEvents.GAME_ENDED, {
              gameId: data.gameId,
              result: 'draw',
              reason: 'draw accepted',
              gameData: game.toJSON()
            });
          } else {
            this.io.to(`game:${data.gameId}`).emit(SocketEvents.DRAW_DECLINED, {
              gameId: data.gameId,
              playerId: socket.userId
            });
          }
        }
      } catch (error) {
        console.error('Error handling respond draw:', error);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to respond to draw' });
      }
    });
  }

  private handlePauseClock(socket: CustomSocket): void {
    socket.on(SocketEvents.PAUSE_CLOCK, (data: { gameId: string }) => {
      try {
        const game = this.gameManager.getGame(data.gameId);
        if (game) {
          game.pause();
          this.io.to(`game:${data.gameId}`).emit(SocketEvents.CLOCK_PAUSED, {
            gameId: data.gameId,
            clockState: game.getClockState()
          });
        }
      } catch (error) {
        console.error('Error handling pause clock:', error);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to pause clock' });
      }
    });
  }

  private handleResumeClock(socket: CustomSocket): void {
    socket.on(SocketEvents.RESUME_CLOCK, (data: { gameId: string }) => {
      try {
        const game = this.gameManager.getGame(data.gameId);
        if (game) {
          game.resume();
          this.io.to(`game:${data.gameId}`).emit(SocketEvents.CLOCK_RESUMED, {
            gameId: data.gameId,
            clockState: game.getClockState()
          });
        }
      } catch (error) {
        console.error('Error handling resume clock:', error);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to resume clock' });
      }
    });
  }

  private handleRequestAnalysis(socket: CustomSocket): void {
    socket.on(SocketEvents.REQUEST_ANALYSIS, async (data: AnalysisRequest) => {
      try {
        const analysis = await this.gameManager.requestAnalysis(data.fen, data.depth);
        
        socket.emit(SocketEvents.ANALYSIS_RESULT, {
          fen: data.fen,
          analysis
        });
      } catch (error) {
        console.error('Error handling request analysis:', error);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to analyze position' });
      }
    });
  }

  private handleRequestBestMove(socket: CustomSocket): void {
    socket.on(SocketEvents.REQUEST_BEST_MOVE, async (data: BestMoveRequest) => {
      try {
        const bestMove = await this.gameManager.requestBestMove(
          data.fen,
          data.depth,
          data.timeLimit
        );
        
        socket.emit(SocketEvents.BEST_MOVE_RESULT, {
          fen: data.fen,
          bestMove
        });
      } catch (error) {
        console.error('Error handling request best move:', error);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to get best move' });
      }
    });
  }

  private handleSendMessage(socket: CustomSocket): void {
    socket.on(SocketEvents.SEND_MESSAGE, (data: ChatMessage) => {
      try {
        if (!socket.userId) {
          socket.emit(SocketEvents.ERROR, { message: 'User not authenticated' });
          return;
        }

        const user = this.gameManager.getUser(socket.userId);
        if (!user) {
          socket.emit(SocketEvents.ERROR, { message: 'User not found' });
          return;
        }

        // Broadcast message to game room
        this.io.to(`game:${data.gameId}`).emit(SocketEvents.MESSAGE_RECEIVED, {
          gameId: data.gameId,
          message: data.message,
          username: user.username,
          userId: socket.userId,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error handling send message:', error);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to send message' });
      }
    });
  }

  private handleJoinSpectate(socket: CustomSocket): void {
    socket.on(SocketEvents.JOIN_SPECTATE, (data: { gameId: string }) => {
      try {
        if (!socket.userId) {
          socket.emit(SocketEvents.ERROR, { message: 'User not authenticated' });
          return;
        }

        const game = this.gameManager.getGame(data.gameId);
        if (!game) {
          socket.emit(SocketEvents.ERROR, { message: 'Game not found' });
          return;
        }

        game.addSpectator(socket.userId);
        socket.join(`game:${data.gameId}`);
        
        socket.emit(SocketEvents.SPECTATOR_JOINED, {
          gameId: data.gameId,
          gameState: game.getGameState(),
          gameData: game.toJSON()
        });

        // Notify other spectators
        socket.to(`game:${data.gameId}`).emit(SocketEvents.SPECTATOR_JOINED, {
          gameId: data.gameId,
          spectatorId: socket.userId
        });
      } catch (error) {
        console.error('Error handling join spectate:', error);
        socket.emit(SocketEvents.ERROR, { message: 'Failed to join as spectator' });
      }
    });
  }

  private handleLeaveSpectate(socket: CustomSocket): void {
    socket.on(SocketEvents.LEAVE_SPECTATE, (data: { gameId: string }) => {
      try {
        if (!socket.userId) {
          return;
        }

        const game = this.gameManager.getGame(data.gameId);
        if (game) {
          game.removeSpectator(socket.userId);
        }

        socket.leave(`game:${data.gameId}`);
        
        socket.emit(SocketEvents.SPECTATOR_LEFT, {
          gameId: data.gameId
        });

        // Notify other spectators
        socket.to(`game:${data.gameId}`).emit(SocketEvents.SPECTATOR_LEFT, {
          gameId: data.gameId,
          spectatorId: socket.userId
        });
      } catch (error) {
        console.error('Error handling leave spectate:', error);
      }
    });
  }
}