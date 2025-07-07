export enum SocketEvents {
  // Connection events
  USER_CONNECT = 'user:connect',
  USER_CONNECTED = 'user:connected',
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline',
  
  // Matchmaking events
  JOIN_MATCHMAKING = 'matchmaking:join',
  LEAVE_MATCHMAKING = 'matchmaking:leave',
  MATCHMAKING_WAITING = 'matchmaking:waiting',
  MATCHMAKING_LEFT = 'matchmaking:left',
  GAME_FOUND = 'matchmaking:gameFound',
  
  // Game events
  JOIN_GAME = 'game:join',
  GAME_JOINED = 'game:joined',
  LEAVE_GAME = 'game:leave',
  GAME_LEFT = 'game:left',
  
  // Move events
  MAKE_MOVE = 'game:makeMove',
  MOVE_MADE = 'game:moveMade',
  INVALID_MOVE = 'game:invalidMove',
  
  // Game state events
  GAME_STARTED = 'game:started',
  GAME_ENDED = 'game:ended',
  GAME_PAUSED = 'game:paused',
  GAME_RESUMED = 'game:resumed',
  
  // Game actions
  RESIGN_GAME = 'game:resign',
  OFFER_DRAW = 'game:offerDraw',
  DRAW_OFFERED = 'game:drawOffered',
  RESPOND_DRAW = 'game:respondDraw',
  DRAW_ACCEPTED = 'game:drawAccepted',
  DRAW_DECLINED = 'game:drawDeclined',
  
  // Clock events
  CLOCK_UPDATE = 'clock:update',
  CLOCK_PAUSED = 'clock:paused',
  CLOCK_RESUMED = 'clock:resumed',
  TIME_EXPIRED = 'clock:timeExpired',
  PAUSE_CLOCK = 'clock:pause',
  RESUME_CLOCK = 'clock:resume',
  
  // Chess engine events
  REQUEST_ANALYSIS = 'engine:requestAnalysis',
  ANALYSIS_RESULT = 'engine:analysisResult',
  REQUEST_BEST_MOVE = 'engine:requestBestMove',
  BEST_MOVE_RESULT = 'engine:bestMoveResult',
  
  // Error events
  ERROR = 'error',
  
  // Chat events (optional)
  SEND_MESSAGE = 'chat:sendMessage',
  MESSAGE_RECEIVED = 'chat:messageReceived',
  
  // Spectator events (optional)
  JOIN_SPECTATE = 'spectate:join',
  LEAVE_SPECTATE = 'spectate:leave',
  SPECTATOR_JOINED = 'spectate:spectatorJoined',
  SPECTATOR_LEFT = 'spectate:spectatorLeft'
}