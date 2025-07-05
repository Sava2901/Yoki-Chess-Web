import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChessBoard } from '@/components/chess/ChessBoard'
import { GameClock } from '@/components/chess/GameClock'
import { MoveHistory } from '@/components/chess/MoveHistory'
import { Plus, Search, Users } from 'lucide-react'

export const Route = createFileRoute('/match')({ 
  component: MatchPage,
})

function MatchPage() {
  const [gameId, setGameId] = useState('')
  const [isInGame, setIsInGame] = useState(false)

  const handleCreateGame = () => {
    // TODO: Implement game creation logic
    setIsInGame(true)
  }

  const handleJoinGame = () => {
    // TODO: Implement game joining logic
    if (gameId.trim()) {
      setIsInGame(true)
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
                    <GameClock time={600} isActive={true} />
                    <span className="text-muted-foreground">vs</span>
                    <GameClock time={580} isActive={false} />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 pb-8 sm:pb-10">
                <ChessBoard 
                  size="md"
                  onMove={(from, to) => {
                    console.log('Move:', from, 'to', to)
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Game Info Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Players</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-white border border-gray-400 rounded-full"></div>
                    <span className="font-medium">You</span>
                  </div>
                  <span className="text-sm text-muted-foreground">White</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                    <span className="font-medium">Opponent</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Black</span>
                </div>
              </CardContent>
            </Card>

            <MoveHistory moves={['e4', 'e5', 'Nf3', 'Nc6']} />

            <Card>
              <CardHeader>
                <CardTitle>Game Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full">
                  Offer Draw
                </Button>
                <Button variant="destructive" className="w-full">
                  Resign
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
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
                <div className="space-y-2">
                  <Label htmlFor="time-control">Time Control</Label>
                  <select 
                    id="time-control" 
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="10+0">10 minutes</option>
                    <option value="15+10">15 minutes + 10 seconds</option>
                    <option value="30+0">30 minutes</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Player123</p>
                  <p className="text-sm text-muted-foreground">10 minutes</p>
                </div>
                <Button size="sm">Join</Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">ChessMaster</p>
                  <p className="text-sm text-muted-foreground">15+10</p>
                </div>
                <Button size="sm">Join</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}