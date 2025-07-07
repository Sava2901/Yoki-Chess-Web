# Yoki Chess Backend

A TypeScript-based chess server with Socket.IO for real-time gameplay and a C++ chess engine for move analysis and suggestions.

## Features

- **Real-time Multiplayer Chess**: Socket.IO-powered real-time chess games
- **TypeScript Backend**: Fully typed backend with strict type checking
- **C++ Chess Engine**: High-performance chess engine for analysis and move suggestions
- **Move Validation**: Both client-side and server-side validation using chess.js
- **Game Clock**: Server-side time management
- **Matchmaking System**: Automatic player matching based on rating and time control
- **User Management**: Player profiles, statistics, and rating system
- **Game Analytics**: Comprehensive game statistics and analysis
- **Security**: Rate limiting, CORS, and security headers

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Python 3.x (for node-gyp)
- C++ compiler:
  - **Windows**: Visual Studio Build Tools or Visual Studio Community
  - **macOS**: Xcode Command Line Tools
  - **Linux**: GCC/G++ compiler

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Yoki-Chess-Web/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the C++ chess engine**:
   ```bash
   npm run build:engine
   ```

4. **Build TypeScript**:
   ```bash
   npm run build
   ```

## Development

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL for CORS
CLIENT_URL=http://localhost:3000

# Database (if using external database)
# DATABASE_URL=your_database_url

# JWT Secret (if implementing authentication)
# JWT_SECRET=your_jwt_secret
```

## API Endpoints

### Game Routes (`/api/games`)
- `GET /:gameId` - Get game details
- `GET /player/:playerId/current` - Get player's current game
- `GET /player/:playerId/history` - Get player's game history
- `POST /create` - Create custom game
- `POST /:gameId/move` - Make a move
- `POST /:gameId/resign` - Resign game
- `POST /:gameId/draw/offer` - Offer draw
- `POST /:gameId/draw/respond` - Respond to draw offer
- `POST /:gameId/analysis` - Request game analysis
- `POST /:gameId/best-move` - Get best move suggestion

### User Routes (`/api/users`)
- `GET /:userId` - Get user profile
- `POST /register` - Register new user
- `PUT /:userId` - Update user profile
- `GET /:userId/games` - Get user's games
- `GET /:userId/stats` - Get user statistics
- `GET /search` - Search users
- `GET /online` - Get online users
- `GET /leaderboard` - Get leaderboard

### Analytics Routes (`/api/analytics`)
- `GET /server/stats` - Server statistics
- `POST /position/analyze` - Analyze chess position
- `POST /position/best-move` - Get best move for position
- `GET /openings/stats` - Opening statistics
- `GET /time-controls/stats` - Time control statistics
- `GET /ratings/distribution` - Rating distribution
- `GET /games/results` - Game result statistics
- `GET /players/:playerId/performance` - Player performance trends
- `GET /engine/performance` - Engine performance metrics

## Socket.IO Events

### Connection Events
- `USER_CONNECT` - User connects to server
- `USER_CONNECTED` - User successfully connected
- `USER_ONLINE` - User comes online
- `USER_OFFLINE` - User goes offline

### Matchmaking Events
- `JOIN_MATCHMAKING` - Join matchmaking queue
- `LEAVE_MATCHMAKING` - Leave matchmaking queue
- `MATCHMAKING_WAITING` - Waiting for opponent
- `GAME_FOUND` - Game found, opponent matched

### Game Events
- `JOIN_GAME` - Join specific game
- `GAME_JOINED` - Successfully joined game
- `MAKE_MOVE` - Make a move
- `MOVE_MADE` - Move successfully made
- `INVALID_MOVE` - Invalid move attempted
- `GAME_ENDED` - Game ended

### Game Action Events
- `RESIGN_GAME` - Resign from game
- `OFFER_DRAW` - Offer draw to opponent
- `DRAW_OFFERED` - Draw offer received
- `RESPOND_DRAW` - Respond to draw offer
- `DRAW_DECLINED` - Draw offer declined

### Clock Events
- `PAUSE_CLOCK` - Pause game clock
- `RESUME_CLOCK` - Resume game clock
- `CLOCK_PAUSED` - Clock paused
- `CLOCK_RESUMED` - Clock resumed
- `CLOCK_UPDATE` - Clock time update

### Chess Engine Events
- `REQUEST_ANALYSIS` - Request position analysis
- `ANALYSIS_RESULT` - Analysis result
- `REQUEST_BEST_MOVE` - Request best move
- `BEST_MOVE_RESULT` - Best move result

## Project Structure

```
backend/
├── src/
│   ├── engine/
│   │   └── ChessEngineBinding.cpp    # C++ chess engine
│   ├── handlers/
│   │   └── SocketHandlers.ts         # Socket.IO event handlers
│   ├── models/
│   │   ├── Game.ts                   # Game model
│   │   └── User.ts                   # User model
│   ├── routes/
│   │   ├── analyticsRoutes.ts        # Analytics API routes
│   │   ├── gameRoutes.ts             # Game API routes
│   │   └── userRoutes.ts             # User API routes
│   ├── services/
│   │   ├── ChessEngine.ts            # Chess engine service
│   │   └── GameManager.ts            # Game management service
│   ├── types/
│   │   ├── Game.ts                   # Game-related types
│   │   ├── Socket.ts                 # Socket-related types
│   │   └── SocketEvents.ts           # Socket event enums
│   └── server.ts                     # Main server file
├── binding.gyp                       # C++ build configuration
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
└── README.md                         # This file
```

## C++ Chess Engine

The backend includes a C++ chess engine for high-performance move analysis and suggestions. The engine provides:

- **Position Analysis**: Deep position evaluation with principal variation
- **Best Move Calculation**: Optimal move suggestions using minimax algorithm
- **Move Validation**: Fast legal move validation
- **Legal Move Generation**: Complete legal move list generation

### Engine API

```typescript
// Initialize engine
engine.initEngine();

// Analyze position
const analysis = engine.analyzePosition(fen, depth);
// Returns: { evaluation, depth, principalVariation, nodesSearched, timeSpent, bestMove }

// Get best move
const bestMove = engine.getBestMove(fen);

// Validate move
const isValid = engine.isValidMove(fen, move);

// Get legal moves
const legalMoves = engine.getLegalMoves(fen);
```

## Development Notes

### Building the C++ Engine

The C++ engine is built using node-gyp. If you encounter build issues:

1. **Windows**: Install Visual Studio Build Tools
2. **macOS**: Install Xcode Command Line Tools: `xcode-select --install`
3. **Linux**: Install build essentials: `sudo apt-get install build-essential`

### TypeScript Configuration

The project uses strict TypeScript configuration with:
- ES2020 target
- CommonJS modules
- Strict type checking
- Source maps for debugging

### Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **Input Validation**: Request validation

## Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.