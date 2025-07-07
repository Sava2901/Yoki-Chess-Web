import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChessBoard } from '@/components/chess/ChessBoard'
import { GameClock } from '@/components/chess/GameClock'
import { MoveHistory } from '@/components/chess/MoveHistory'
import { GameResultModal, type GameResult } from '@/components/chess/GameResultModal'
import { TimeControlSelector, type TimeControlOption } from '@/components/chess/TimeControlSelector'
import { UserAvatar } from '@/components/ui/user-avatar'
import { supabase } from '@/lib/supabaseClient'
import { Plus, Search, Users } from 'lucide-react'
import { Chess } from 'chess.js'
import { STARTING_FEN } from '@/utils/chess'

export const Route = createFileRoute('/match/online')({ 
  component: OnlineMatchPage,
})

interface GameState {
  fen: string
  moves: string[]
  pgn: string
}

function OnlineMatchPage() {
  const [gameId, setGameId] = useState('')
  const [isInGame, setIsInGame] = useState(false)
  const [playerColor] = useState<'white' | 'black'>('white') // You are playing as white by default
  const [userProfile, setUserProfile] = useState<{
    username: string
    avatarUrl: string | null
  }>({ username: 'You', avatarUrl: null })
  
  // Game state management
  const [chess] = useState(() => new Chess())
  const [gameHistory, setGameHistory] = useState<GameState[]>([{
    fen: STARTING_FEN,
    moves: [],
    pgn: ''
  }])
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [displayFen, setDisplayFen] = useState(STARTING_FEN)
  const [animatingMove, setAnimatingMove] = useState<{from: string, to: string} | null>(null)
  
  // Game result state
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  
  // Timer state
  const [whiteTime, setWhiteTime] = useState(600) // 10 minutes in seconds
  const [blackTime, setBlackTime] = useState(600)
  const [currentTurn, setCurrentTurn] = useState<'white' | 'black'>('white')
  const [timeControl, setTimeControl] = useState({ minutes: 10, increment: 0 })
  const [selectedTimeControl, setSelectedTimeControl] = useState('10+0')

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !session?.user) return
        
        const user = session.user
        setUserProfile({
          username: user.user_metadata?.username || 'You',
          avatarUrl: user.user_metadata?.avatar_url || null
        })
      } catch (error) {
        console.error('Error loading user profile:', error)
      }
    }

    loadUserProfile()
  }, [])

  const handleCreateGame = () => {
    // Apply selected time control
    const totalSeconds = timeControl.minutes * 60
    setWhiteTime(totalSeconds)
    setBlackTime(totalSeconds)
    setIsInGame(true)
  }

  const handleJoinGame = () => {
    // TODO: Implement game joining logic
    if (gameId.trim()) {
      setIsInGame(true)
    }
  }

  const handleMove = (from: string, to: string, promotion?: string) => {
    let workingHistory = gameHistory
    
    // If we're viewing history (not at the latest position), we need to branch from current position
    if (currentMoveIndex < gameHistory.length - 1) {
      // Truncate history to current position and continue from there
      workingHistory = gameHistory.slice(0, currentMoveIndex + 1)
      setGameHistory(workingHistory)
    }
    
    // Load the current state we're working from
    const currentState = workingHistory[workingHistory.length - 1]
    chess.load(currentState.fen)
    
    // If we're not at the starting position, we need to replay moves to maintain history
    if (currentState.moves.length > 0) {
      // Reset chess to starting position and replay all moves
      const tempChess = new Chess()
      for (const moveStr of currentState.moves) {
        tempChess.move(moveStr)
      }
      chess.load(tempChess.fen())
      // Copy the move history
      chess.loadPgn(tempChess.pgn())
    }

    const move = chess.move({ from, to, promotion: promotion || 'q' })
    if (move) {
      const newState: GameState = {
        fen: chess.fen(),
        moves: chess.history(),
        pgn: chess.pgn()
      }
      
      // Add new state to history
      const newHistory = [...workingHistory, newState]
      setGameHistory(newHistory)
      setCurrentMoveIndex(newHistory.length - 1)
      setDisplayFen(chess.fen())
      
      console.log('Move made:', move.san)
      
      // Switch turns
      setCurrentTurn(chess.turn() === 'w' ? 'white' : 'black')
      
      // Check for game ending conditions
      checkGameEnd()
    }
  }
  
  const checkGameEnd = () => {
    if (chess.isGameOver()) {
      let result: GameResult
      
      if (chess.isCheckmate()) {
        // Checkmate - opposite of current turn wins
        const winner = chess.turn() === 'w' ? 'black' : 'white'
        result = { type: 'checkmate', winner }
      } else if (chess.isStalemate()) {
        result = { type: 'stalemate' }
      } else if (chess.isDraw()) {
        result = { type: 'draw' }
      } else {
        // Fallback to draw for other game over conditions
        result = { type: 'draw' }
      }
      
      setGameResult(result)
      setShowResultModal(true)
    }
  }
  
  const handleTimeUp = (color: 'white' | 'black') => {
    const winner = color === 'white' ? 'black' : 'white'
    const result: GameResult = { type: 'timeout', winner }
    setGameResult(result)
    setShowResultModal(true)
  }
  
  const handleResign = () => {
    const winner = playerColor === 'white' ? 'black' : 'white'
    const result: GameResult = { type: 'resignation', winner }
    setGameResult(result)
    setShowResultModal(true)
  }
  
  const handleNewGame = () => {
    // Reset game state
    chess.reset()
    setGameHistory([{
      fen: STARTING_FEN,
      moves: [],
      pgn: ''
    }])
    setCurrentMoveIndex(0)
    setDisplayFen(STARTING_FEN)
    setGameResult(null)
    setShowResultModal(false)
    setCurrentTurn('white')
    // Apply current time control settings
    const totalSeconds = timeControl.minutes * 60
    setWhiteTime(totalSeconds)
    setBlackTime(totalSeconds)
  }
  
  const handleReturnToLobby = () => {
    setIsInGame(false)
    setGameResult(null)
    setShowResultModal(false)
    handleNewGame()
  }

  const handleMoveClick = (moveIndex: number) => {
    // Handle special case for going back to starting position
    if (moveIndex === -1) {
      setCurrentMoveIndex(0)
      setDisplayFen(STARTING_FEN)
      chess.load(STARTING_FEN)
      return
    }
    
    // Convert move index to game history index (moveIndex + 1 because index 0 is starting position)
    const targetHistoryIndex = moveIndex + 1
    
    if (targetHistoryIndex >= 0 && targetHistoryIndex < gameHistory.length) {
      const targetState = gameHistory[targetHistoryIndex]
      
      // Calculate animation if moving forward by one move
      if (targetHistoryIndex === currentMoveIndex + 1 && targetHistoryIndex > 0) {
        // Get the move that was made to reach this state
        const tempChess = new Chess(gameHistory[targetHistoryIndex - 1].fen)
        const previousMoves = tempChess.history({ verbose: true })
        tempChess.load(targetState.fen)
        const currentMoves = tempChess.history({ verbose: true })
        
        if (currentMoves.length > previousMoves.length) {
          const lastMove = currentMoves[currentMoves.length - 1]
          setAnimatingMove({ from: lastMove.from, to: lastMove.to })
          
          // Clear animation after a short delay
          setTimeout(() => {
            setAnimatingMove(null)
          }, 300)
        }
      }
      
      setCurrentMoveIndex(targetHistoryIndex)
      setDisplayFen(targetState.fen)
      // Update the chess engine to match the displayed position
      chess.load(targetState.fen)
    }
  }

  if (isInGame) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Chess Board Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Game in Progress</span>
                  <div className="flex items-center space-x-2">
                    <GameClock 
                      time={playerColor === 'white' ? whiteTime : blackTime} 
                      isActive={currentTurn === playerColor && !gameResult} 
                      onTimeUp={() => handleTimeUp(playerColor)}
                      increment={timeControl.increment}
                    />
                    <span className="text-muted-foreground">vs</span>
                    <GameClock 
                      time={playerColor === 'white' ? blackTime : whiteTime} 
                      isActive={currentTurn !== playerColor && !gameResult}
                      onTimeUp={() => handleTimeUp(playerColor === 'white' ? 'black' : 'white')}
                      increment={timeControl.increment}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 pb-8 sm:pb-10">
                <ChessBoard 
                  size="md"
                  fen={displayFen}
                  onMove={handleMove}
                  disabled={currentMoveIndex < gameHistory.length - 1 || !!gameResult}
                  externalAnimatingMove={animatingMove}
                />
              </CardContent>
            </Card>
          </div>

          {/* Game Info Section */}
          <div className="flex flex-col h-full space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Players</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Opponent always on top */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserAvatar 
                      src={undefined} // No profile picture for opponent
                      username="Opponent"
                      size="sm"
                    />
                    <span className="font-medium">Opponent</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {playerColor === 'white' ? 'Black' : 'White'}
                  </span>
                </div>
                
                {/* You always at the bottom */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserAvatar 
                      src={userProfile.avatarUrl}
                      username={userProfile.username}
                      size="sm"
                    />
                    <span className="font-medium">{userProfile.username}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {playerColor === 'white' ? 'White' : 'Black'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex-1">
              <MoveHistory 
                moves={gameHistory[gameHistory.length - 1].moves}
                currentMove={currentMoveIndex - 1}
                onMoveClick={handleMoveClick}
                className="h-full"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Game Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" disabled={!!gameResult}>
                  Offer Draw
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={handleResign}
                  disabled={!!gameResult}
                >
                  Resign
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <GameResultModal
          isOpen={showResultModal}
          result={gameResult}
          playerColor={playerColor}
          playerName={userProfile.username}
          opponentName="Opponent"
          playerAvatar={userProfile.avatarUrl}
          onNewGame={handleNewGame}
          onReturnToLobby={handleReturnToLobby}
          onClose={() => setShowResultModal(false)}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Multiplayer Chess</h1>
          <p className="text-muted-foreground">
            Create a new game or join an existing one to start playing
          </p>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Game</TabsTrigger>
            <TabsTrigger value="join">Join Game</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4 min-h-[300px]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Game
                </CardTitle>
                <CardDescription>
                  Start a new chess game and wait for an opponent to join
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Time Control</Label>
                    <TimeControlSelector
                      selectedTimeControl={selectedTimeControl}
                      onTimeControlChange={(control: TimeControlOption) => {
                        setSelectedTimeControl(control.id)
                        setTimeControl({
                          minutes: control.minutes,
                          increment: control.increment
                        })
                      }}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateGame} className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Create Game
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="join" className="space-y-4 min-h-[300px]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="mr-2 h-5 w-5" />
                  Join Existing Game
                </CardTitle>
                <CardDescription>
                  Enter a game ID to join an existing chess game
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="game-id">Game ID</Label>
                  <Input
                    id="game-id"
                    placeholder="Enter game ID..."
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                  />
                </div>
                <Button onClick={handleJoinGame} className="w-full" disabled={!gameId.trim()}>
                  Join Game
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Available Games */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Available Games</CardTitle>
            <CardDescription>
              Join one of these open games
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <UserAvatar 
                    src={undefined}
                    username="Player123"
                    size="sm"
                  />
                  <div>
                    <p className="font-medium">Player123</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">10 minutes</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">Rapid</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="shrink-0">Join</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <UserAvatar 
                    src={undefined}
                    username="ChessMaster"
                    size="sm"
                  />
                  <div>
                    <p className="font-medium">ChessMaster</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">15+10</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">Rapid</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="shrink-0">Join</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <UserAvatar 
                    src={undefined}
                    username="SpeedDemon"
                    size="sm"
                  />
                  <div>
                    <p className="font-medium">SpeedDemon</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">3+2</span>
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full">Blitz</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="shrink-0">Join</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}