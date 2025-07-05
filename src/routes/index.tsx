import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Crown, Zap, Target, Play, Users, Trophy, BookOpen, BarChart3, Clock } from 'lucide-react'

export const Route = createFileRoute('/')({ 
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Chess Crown Icon */}
          <div className="mb-8 flex justify-center">
            <Crown className="h-24 w-24 text-primary" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Master Chess
          </h1>
          
          <p className="text-2xl md:text-3xl text-muted-foreground mb-4 font-light">
            Play. Analyze. Improve.
          </p>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            The ultimate chess experience with real-time multiplayer and powerful engine analysis
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button asChild size="lg" className="text-xl px-12 py-6 h-auto">
              <Link to="/match">
                <Play className="mr-3 h-6 w-6" />
                Play Now
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-xl px-12 py-6 h-auto">
              <Link to="/analysis">
                <Target className="mr-3 h-6 w-6" />
                Analyze
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="relative py-48">
        {/* Chessboard Background */}
        <div className="absolute inset-0 w-full opacity-10 pointer-events-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMin slice">
            <defs>
              <pattern id="chessboard-pattern" patternUnits="userSpaceOnUse" width="100" height="100" x="0" y="0">
                <rect width="50" height="50" fill="currentColor" />
                <rect x="50" y="50" width="50" height="50" fill="currentColor" />
                <rect x="50" y="0" width="50" height="50" fill="transparent" />
                <rect x="0" y="50" width="50" height="50" fill="transparent" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#chessboard-pattern)" />
          </svg>
        </div>
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 w-full pointer-events-none">
          {/* Top gradient: background to transparent */}
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-background via-background/60 to-transparent"></div>
          {/* Bottom gradient: transparent to background */}
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-b from-transparent via-background/60 to-background"></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          {/* First Row - 4 Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex justify-center mb-4">
                <Zap className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Lightning Fast</h3>
              <p className="text-muted-foreground">Real-time gameplay</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-center mb-4">
                <Target className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Engine Powered</h3>
              <p className="text-muted-foreground">Advanced analysis</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-center mb-4">
                <Crown className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Master Level</h3>
              <p className="text-muted-foreground">Improve your game</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Multiplayer</h3>
              <p className="text-muted-foreground">Play with friends</p>
            </div>
          </div>
          
          {/* Second Row - 4 Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center mt-16">
            <div className="space-y-2">
              <div className="flex justify-center mb-4">
                <Trophy className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Tournaments</h3>
              <p className="text-muted-foreground">Compete globally</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-center mb-4">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Learn</h3>
              <p className="text-muted-foreground">Study openings</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-center mb-4">
                <BarChart3 className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Statistics</h3>
              <p className="text-muted-foreground">Track your progress</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-center mb-4">
                <Clock className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Time Controls</h3>
              <p className="text-muted-foreground">Blitz to classical</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the chess revolution today
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link to="/match">
              Start Your First Game
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}