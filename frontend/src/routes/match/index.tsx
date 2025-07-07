import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, Bot, Puzzle, Trophy, Users, Zap } from 'lucide-react'

export const Route = createFileRoute('/match/')({ 
  component: MatchSelectionPage,
})

function MatchSelectionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Choose Your Game Mode</h1>
          <p className="text-muted-foreground text-lg">
            Select how you want to play chess today
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Play Online */}
          <Link to="/match/online">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Globe className="mr-3 h-6 w-6 text-blue-500 group-hover:text-blue-600" />
                  Play Online
                </CardTitle>
                <CardDescription className="text-base">
                  Challenge players from around the world in real-time matches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    <span>Multiplayer</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="mr-1 h-4 w-4" />
                    <span>Real-time</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Play vs Computer */}
          <Link to="/match/offline">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Bot className="mr-3 h-6 w-6 text-green-500 group-hover:text-green-600" />
                  Play vs Computer
                </CardTitle>
                <CardDescription className="text-base">
                  Challenge AI opponents of varying difficulty levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Bot className="mr-1 h-4 w-4" />
                    <span>AI Opponents</span>
                  </div>
                  <div className="flex items-center">
                    <span>Custom Engines</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Puzzles */}
          <Card className="h-full opacity-60 cursor-not-allowed">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Puzzle className="mr-3 h-6 w-6 text-purple-500" />
                Puzzles
                <span className="ml-2 text-xs bg-muted px-2 py-1 rounded-full">Coming Soon</span>
              </CardTitle>
              <CardDescription className="text-base">
                Solve tactical puzzles to improve your chess skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Puzzle className="mr-1 h-4 w-4" />
                  <span>Tactical Training</span>
                </div>
                <div className="flex items-center">
                  <span>Skill Building</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tournaments */}
          <Card className="h-full opacity-60 cursor-not-allowed">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Trophy className="mr-3 h-6 w-6 text-yellow-500" />
                Tournaments
                <span className="ml-2 text-xs bg-muted px-2 py-1 rounded-full">Coming Soon</span>
              </CardTitle>
              <CardDescription className="text-base">
                Participate in competitive tournaments and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Trophy className="mr-1 h-4 w-4" />
                  <span>Competitive</span>
                </div>
                <div className="flex items-center">
                  <span>Prizes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            More game modes and features coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}