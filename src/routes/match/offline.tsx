import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChessBoard } from '@/components/chess/ChessBoard'
import { GameClock } from '@/components/chess/GameClock'
import { MoveHistory } from '@/components/chess/MoveHistory'
import { GameResultModal, type GameResult } from '@/components/chess/GameResultModal'
import { TimeControlSelector, type TimeControlOption } from '@/components/chess/TimeControlSelector'
import { useUserProfile, GamePlayerCard } from '@/components/ui/avatar'
import { ArrowLeft, Upload, Cpu, Zap, Brain } from 'lucide-react'
import { Chess } from 'chess.js'
import { STARTING_FEN } from '@/utils/chess'

export const Route = createFileRoute('/match/offline')({ 
  component: OfflineMatchPage,
})

interface GameState {
  fen: string
  moves: string[]
  pgn: string
}

interface BotProfile {
  id: string
  name: string
  elo: number
  description: string
  avatar?: string
  isCustom?: boolean
  apiEndpoint?: string
}

const PRESET_BOTS: BotProfile[] = [
  {
    id: 'beginner',
    name: 'Rookie',
    elo: 800,
    description: 'Perfect for learning the basics',
    avatar: '🤖'
  },
  {
    id: 'intermediate',
    name: 'Scholar',
    elo: 1200,
    description: 'A balanced opponent for casual games',
    avatar: '🎓'
  },
  {
    id: 'advanced',
    name: 'Master',
    elo: 1800,
    description: 'Challenging opponent for serious players',
    avatar: '👑'
  },
  {
    id: 'expert',
    name: 'Grandmaster',
    elo: 2400,
    description: 'Elite level AI for the ultimate challenge',
    avatar: '🏆'
  },
  {
    id: 'cheeseball',
    name: 'Cheeseball Charlie',
    elo: 950,
    description: 'Loves opening with the Bongcloud',
    avatar: '🧀'
  },
  {
    id: 'blunder',
    name: 'Blunder Bob',
    elo: 600,
    description: 'Hangs pieces like Christmas ornaments',
    avatar: '🤡'
  },
  {
    id: 'caffeine',
    name: 'Caffeine Kevin',
    elo: 1650,
    description: 'Plays lightning fast after 5 espressos',
    avatar: '☕'
  },
  {
    id: 'sleepy',
    name: 'Sleepy Steve',
    elo: 1100,
    description: 'Takes forever to move, might be napping',
    avatar: '😴'
  },
  {
    id: 'dramatic',
    name: 'Dramatic Dave',
    elo: 1450,
    description: 'Every move comes with theatrical flair',
    avatar: '🎭'
  },
  {
    id: 'lucky',
    name: 'Lucky Larry',
    elo: 1350,
    description: 'Somehow always finds the right move by accident',
    avatar: '🍀'
  }
]

function OfflineMatchPage() {
  const [isInGame, setIsInGame] = useState(false)
  const [selectedBot, setSelectedBot] = useState<BotProfile | null>(null)
  const [customRating, setCustomRating] = useState([1200])
  const [playerColor] = useState<'white' | 'black'>('white')
  const { userProfile } = useUserProfile()
  
  // Custom bot form state
  const [customBotName, setCustomBotName] = useState('')
  const [customBotApiEndpoint, setCustomBotApiEndpoint] = useState('')
  const [customBotAvatar, setCustomBotAvatar] = useState('')
  
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
  const [whiteTime, setWhiteTime] = useState(600)
  const [blackTime, setBlackTime] = useState(600)
  const [currentTurn, setCurrentTurn] = useState<'white' | 'black'>('white')
  const [timeControl, setTimeControl] = useState({ minutes: 10, increment: 0 })
  const [selectedTimeControl, setSelectedTimeControl] = useState('10+0')

  // Load user profile data
  // User profile is now loaded automatically by the useUserProfile hook

  const handleStartGame = (bot: BotProfile) => {
    setSelectedBot(bot)
    const totalSeconds = timeControl.minutes * 60
    setWhiteTime(totalSeconds)
    setBlackTime(totalSeconds)
    setIsInGame(true)
  }

  const handleStartCustomDifficultyGame = () => {
    const customBot: BotProfile = {
      id: 'custom-difficulty',
      name: `AI (${customRating[0]} ELO)`,
      elo: customRating[0],
      description: `Custom AI opponent with ${customRating[0]} ELO rating`,
      avatar: '⚙️'
    }
    handleStartGame(customBot)
  }

  const handleStartCustomBotGame = () => {
    if (!customBotName.trim() || !customBotApiEndpoint.trim()) return
    
    const customBot: BotProfile = {
      id: 'custom-engine',
      name: customBotName,
      elo: 0, // Unknown ELO for custom engines
      description: 'Custom chess engine',
      avatar: customBotAvatar || '🔧',
      isCustom: true,
      apiEndpoint: customBotApiEndpoint
    }
    handleStartGame(customBot)
  }

  const handleMove = (from: string, to: string, promotion?: string) => {
    let workingHistory = gameHistory
    
    if (currentMoveIndex < gameHistory.length - 1) {
      workingHistory = gameHistory.slice(0, currentMoveIndex + 1)
      setGameHistory(workingHistory)
    }
    
    const currentState = workingHistory[workingHistory.length - 1]
    chess.load(currentState.fen)
    
    if (currentState.moves.length > 0) {
      const tempChess = new Chess()
      for (const moveStr of currentState.moves) {
        tempChess.move(moveStr)
      }
      chess.load(tempChess.fen())
      chess.loadPgn(tempChess.pgn())
    }

    const move = chess.move({ from, to, promotion: promotion || 'q' })
    if (move) {
      const newState: GameState = {
        fen: chess.fen(),
        moves: chess.history(),
        pgn: chess.pgn()
      }
      
      const newHistory = [...workingHistory, newState]
      setGameHistory(newHistory)
      setCurrentMoveIndex(newHistory.length - 1)
      setDisplayFen(chess.fen())
      
      setCurrentTurn(chess.turn() === 'w' ? 'white' : 'black')
      
      // TODO: Implement AI move response here
      // This would call the selected bot's engine to make a move
      
      checkGameEnd()
    }
  }
  
  const checkGameEnd = () => {
    if (chess.isGameOver()) {
      let result: GameResult
      
      if (chess.isCheckmate()) {
        const winner = chess.turn() === 'w' ? 'black' : 'white'
        result = { type: 'checkmate', winner }
      } else if (chess.isStalemate()) {
        result = { type: 'stalemate' }
      } else if (chess.isDraw()) {
        result = { type: 'draw' }
      } else {
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
    const totalSeconds = timeControl.minutes * 60
    setWhiteTime(totalSeconds)
    setBlackTime(totalSeconds)
  }
  
  const handleReturnToSelection = () => {
    setIsInGame(false)
    setSelectedBot(null)
    setGameResult(null)
    setShowResultModal(false)
    handleNewGame()
  }

  const handleMoveClick = (moveIndex: number) => {
    if (moveIndex === -1) {
      setCurrentMoveIndex(0)
      setDisplayFen(STARTING_FEN)
      chess.load(STARTING_FEN)
      return
    }
    
    const targetHistoryIndex = moveIndex + 1
    
    if (targetHistoryIndex >= 0 && targetHistoryIndex < gameHistory.length) {
      const targetState = gameHistory[targetHistoryIndex]
      
      if (targetHistoryIndex === currentMoveIndex + 1 && targetHistoryIndex > 0) {
        const tempChess = new Chess(gameHistory[targetHistoryIndex - 1].fen)
        const previousMoves = tempChess.history({ verbose: true })
        tempChess.load(targetState.fen)
        const currentMoves = tempChess.history({ verbose: true })
        
        if (currentMoves.length > previousMoves.length) {
          const lastMove = currentMoves[currentMoves.length - 1]
          setAnimatingMove({ from: lastMove.from, to: lastMove.to })
          
          setTimeout(() => {
            setAnimatingMove(null)
          }, 300)
        }
      }
      
      setCurrentMoveIndex(targetHistoryIndex)
      setDisplayFen(targetState.fen)
      chess.load(targetState.fen)
    }
  }

  if (isInGame && selectedBot) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Chess Board Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleReturnToSelection}
                      className="mr-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span>vs {selectedBot.name}</span>
                  </div>
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
                {/* Bot always on top */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-lg">
                      {selectedBot.avatar}
                    </div>
                    <div>
                      <span className="font-medium">{selectedBot.name}</span>
                      {selectedBot.elo > 0 && (
                        <div className="text-xs text-muted-foreground">
                          ELO: {selectedBot.elo}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {playerColor === 'white' ? 'Black' : 'White'}
                  </span>
                </div>
                
                {/* You always at the bottom */}
                <GamePlayerCard
                  username={userProfile.username}
                  avatarUrl={userProfile.avatarUrl}
                  playerColor={playerColor}
                  size="sm"
                />
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
          opponentName={selectedBot.name}
          playerAvatar={userProfile.avatarUrl}
          onNewGame={handleNewGame}
          onReturnToLobby={handleReturnToSelection}
          onClose={() => setShowResultModal(false)}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Play vs Computer</h1>
          <p className="text-muted-foreground">
            Challenge AI opponents or test your custom chess engines
          </p>
        </div>

        <Tabs defaultValue="preset-bots" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preset-bots">Preset Bots</TabsTrigger>
            <TabsTrigger value="custom-difficulty">Custom Difficulty</TabsTrigger>
            <TabsTrigger value="custom-engine">Custom Engine</TabsTrigger>
          </TabsList>
          
          {/* Custom Difficulty */}
          <TabsContent value="custom-difficulty" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="mr-2 h-5 w-5" />
                  Custom Difficulty
                </CardTitle>
                <CardDescription>
                  Adjust the AI difficulty to match your skill level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>ELO Rating: {customRating[0]}</Label>
                    <Slider
                      value={customRating}
                      onValueChange={setCustomRating}
                      max={3700}
                      min={100}
                      step={50}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>100 (Beginner)</span>
                      <span>3700 (Super GM)</span>
                    </div>
                  </div>
                  
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
                
                <Button onClick={handleStartCustomDifficultyGame} className="w-full">
                  <Zap className="mr-2 h-4 w-4" />
                  Start Game
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Preset Bots */}
          <TabsContent value="preset-bots" className="space-y-6">
            {/* Classic Bots Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Classic Opponents</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {PRESET_BOTS.slice(0, 4).map((bot) => (
                  <Card key={bot.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                            {bot.avatar}
                          </div>
                          <div>
                            <div className="font-semibold">{bot.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ELO Rating: {bot.elo}
                            </div>
                          </div>
                        </div>
                      </CardTitle>
                      <CardDescription>{bot.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => handleStartGame(bot)} 
                        className="w-full"
                      >
                        Challenge {bot.name}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Fun Bots Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Other Opponents</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {PRESET_BOTS.slice(4).map((bot) => (
                  <Card key={bot.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                            {bot.avatar}
                          </div>
                          <div>
                            <div className="font-semibold">{bot.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ELO Rating: {bot.elo}
                            </div>
                          </div>
                        </div>
                      </CardTitle>
                      <CardDescription>{bot.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => handleStartGame(bot)} 
                        className="w-full"
                      >
                        Challenge {bot.name}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Custom Engine */}
          <TabsContent value="custom-engine" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5" />
                  Custom Chess Engine
                </CardTitle>
                <CardDescription>
                  Connect your own chess engine via API to test its strength
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bot-name">Engine Name</Label>
                    <Input
                      id="bot-name"
                      placeholder="My Chess Engine"
                      value={customBotName}
                      onChange={(e) => setCustomBotName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api-endpoint">API Endpoint</Label>
                    <Input
                      id="api-endpoint"
                      placeholder="https://api.mychessengine.com/move"
                      value={customBotApiEndpoint}
                      onChange={(e) => setCustomBotApiEndpoint(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your API should accept POST requests with FEN position and return the best move
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bot-avatar">Avatar (Optional)</Label>
                    <Input
                      id="bot-avatar"
                      placeholder="🤖 or image URL"
                      value={customBotAvatar}
                      onChange={(e) => setCustomBotAvatar(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleStartCustomBotGame} 
                  className="w-full"
                  disabled={!customBotName.trim() || !customBotApiEndpoint.trim()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Test Engine
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}