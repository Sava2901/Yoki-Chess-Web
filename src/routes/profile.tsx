import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Mail, Lock, Trophy, Calendar, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '@/hooks/use-toast'

export const Route = createFileRoute('/profile')({ 
  component: ProfilePage,
})

function ProfilePage() {
  const { toast } = useToast()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
        setIsLoggedIn(false);
        return;
      }
      if (data.user) {
        setEmail(data.user.email || '');
        setUsername(data.user.user_metadata?.username || '');
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user;
      setIsLoggedIn(!!currentUser);
      if (currentUser) {
        setEmail(currentUser.email || '');
        setUsername(currentUser.user_metadata?.username || '');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error(error.message)
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      })
    } else if (data.user) {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
        variant: "success",
      })
      navigate({ to: '/' })
    }
  }

  const handleSignUp = async () => {
    if (!email || !password) return
  
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    })
  
    if (error) {
      console.error('Signup error:', error.message)
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      })
      return
    }
  
    if (data.user) {
      toast({
        title: "Sign Up Successful",
        description: "Please check your email to verify your account.",
        variant: "success",
      })
      setIsLoggedIn(true)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) {
      console.error('OAuth error:', error.message)
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
  
    if (error) {
      console.error('Logout error:', error.message)
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      })
      return
    }
  
    toast({
      title: "Logged Out",
      description: "You have been successfully signed out.",
      variant: "info",
    })
    setIsLoggedIn(false)
    setEmail('')
    setPassword('')
    setUsername('')
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp 
                ? 'Join Yoki Chess and start playing today' 
                : 'Welcome back to Yoki Chess'
              }
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={isSignUp ? handleSignUp : handleLogin} 
                  className="w-full"
                  disabled={!email || !password || (isSignUp && !username)}
                >
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <Button 
              variant="link" 
              onClick={() => setIsSignUp(!isSignUp)}
              className="p-0 h-auto"
            >
              {isSignUp ? 'Sign in here' : 'Create one here'}
            </Button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button variant="outline" onClick={() => handleOAuthLogin('google')}>
                Google
              </Button>
              <Button variant="outline" onClick={() => handleOAuthLogin('github')}>
                GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="text-lg">
                      {username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold">{username || 'Chess Player'}</h2>
                    <p className="text-muted-foreground flex items-center">
                      <Mail className="mr-1 h-4 w-4" />
                      {email}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        <Trophy className="mr-1 h-3 w-3" />
                        Rating: 1200
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="mr-1 h-3 w-3" />
                        Joined: Today
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Games */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Games</CardTitle>
                <CardDescription>
                  Your latest chess matches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">vs. ChessMaster</p>
                      <p className="text-sm text-muted-foreground">Sicilian Defense • 10+0</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">Loss</Badge>
                      <p className="text-sm text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">vs. Player123</p>
                      <p className="text-sm text-muted-foreground">Queen's Gambit • 15+10</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">Win</Badge>
                      <p className="text-sm text-muted-foreground mt-1">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">vs. Rookie</p>
                      <p className="text-sm text-muted-foreground">Italian Game • 10+0</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">Draw</Badge>
                      <p className="text-sm text-muted-foreground mt-1">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5" />
                    Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1200</div>
                  <p className="text-sm text-muted-foreground">Current rating</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Games Played
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">42</div>
                  <p className="text-sm text-muted-foreground">Total games</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">65%</div>
                  <p className="text-sm text-muted-foreground">27W • 10L • 5D</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance by Opening</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Sicilian Defense</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">8 games</span>
                      <Badge variant="default">75% win rate</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Queen's Gambit</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">6 games</span>
                      <Badge variant="secondary">50% win rate</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Italian Game</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">4 games</span>
                      <Badge variant="default">100% win rate</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input id="display-name" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-settings">Email</Label>
                  <Input id="email-settings" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Game Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="board-theme">Board Theme</Label>
                  <select id="board-theme" className="w-full p-2 border rounded-md bg-background">
                    <option value="classic">Classic</option>
                    <option value="wood">Wood</option>
                    <option value="marble">Marble</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="piece-set">Piece Set</Label>
                  <select id="piece-set" className="w-full p-2 border rounded-md bg-background">
                    <option value="classic">Classic</option>
                    <option value="modern">Modern</option>
                    <option value="medieval">Medieval</option>
                  </select>
                </div>
                <Button>Save Preferences</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={handleLogout}>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}