import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Badge } from '@/components/ui/badge'
import { Mail, Lock, Trophy, Calendar, TrendingUp, Upload } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { supabase } from '../lib/supabaseClient'
import { useToast } from '@/hooks/use-toast'
import { Loader } from '@/components/ui/loader'

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  // Function to check for existing avatar in storage bucket
  const checkStorageAvatar = async (userId: string): Promise<string | null> => {
    try {
      const { data: files, error } = await supabase.storage
        .from('avatars')
        .list('1oj01fe', {
          limit: 100,
          offset: 0
        });

      if (error || !files) {
        return null;
      }

      // Look for files that start with the user ID
      const userFile = files.find(file => file.name.startsWith(`${userId}-`));
      
      if (userFile) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(`1oj01fe/${userFile.name}`);
        return publicUrl;
      }

      return null;
    } catch (error) {
      console.error('Error checking storage avatar:', error);
      return null;
    }
  };

  // Function to determine the correct avatar URL based on priority
  const determineAvatarUrl = async (user: any): Promise<string | null> => {
    // Priority 1: Check storage bucket
    const storageAvatarUrl = await checkStorageAvatar(user.id);
    if (storageAvatarUrl) {
      return storageAvatarUrl;
    }

    // Priority 2: Use social account avatar if available
    const socialAvatarUrl = user.user_metadata?.avatar_url;
    if (socialAvatarUrl) {
      return socialAvatarUrl;
    }

    // Priority 3: No avatar (placeholder will be used by UserAvatar component)
    return null;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError.message);
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setEmail(session.user.email || '');
          setUsername(session.user.user_metadata?.username || '');
          
          // Determine avatar URL based on priority
          const avatarUrl = await determineAvatarUrl(session.user);
          setAvatarUrl(avatarUrl);
          
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
        setLoading(false);
      } catch (error: any) {
        console.error('Auth initialization error:', error.message);
        setIsLoggedIn(false);
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user;
      setIsLoggedIn(!!currentUser);
      if (currentUser) {
        setEmail(currentUser.email || '');
        setUsername(currentUser.user_metadata?.username || '');
        
        // Only determine avatar URL on initial login, not on every auth change
        if (_event === 'SIGNED_IN') {
          determineAvatarUrl(currentUser).then(avatarUrl => {
            setAvatarUrl(avatarUrl);
          });
        }
      } else {
        setEmail('');
        setUsername('');
        setAvatarUrl(null);
      }
      setLoading(false);
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

  const handleDeleteAccount = async () => {
    const { error } = await supabase.functions.invoke('delete-user', {
      method: 'POST',
    })

    if (error) {
      console.error('Delete account error:', error.message)
      toast({
        title: "Delete Account Failed",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Account Deleted",
      description: "Your account has been permanently deleted.",
      variant: "info",
    })
    setIsLoggedIn(false)
    setEmail('')
    setPassword('')
    setUsername('')
    setAvatarUrl(null)
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      console.log('Starting avatar upload...')
  
      // Check if user is authenticated first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error(`Authentication error: ${sessionError.message}`)
      }
      
      if (!session?.user) {
        console.error('No user session found')
        throw new Error('You must be signed in to upload an avatar.')
      }

      const user = session.user
      console.log('User authenticated:', user.id)
  
      // Check for existing storage bucket avatar and remove it
      console.log('Checking for existing avatar...')
      const { data: files, error: listError } = await supabase.storage
        .from('avatars')
        .list('1oj01fe', {
          limit: 100,
          offset: 0
        });

      if (listError) {
        console.error('Error listing files:', listError)
        // Don't throw here, continue with upload
      } else if (files) {
        console.log('Files in storage:', files.length)
        // Find and delete existing user avatar in storage
        const existingFile = files.find(file => file.name.startsWith(`${user.id}-`));
        if (existingFile) {
          console.log('Deleting existing file:', existingFile.name)
          const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove([`1oj01fe/${existingFile.name}`]);
          if (deleteError) {
            console.error('Error deleting existing file:', deleteError)
          }
        }
      }
  
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }
  
      const file = event.target.files[0]
      console.log('Selected file:', file.name, file.type, file.size)
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file.')
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB.')
      }
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = "1oj01fe/" + fileName
      console.log('Upload path:', filePath)
  
      // Upload file to storage
      console.log('Uploading file to storage...')
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })
  
      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }
      
      console.log('Upload successful:', uploadData)
  
      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath)
      
      console.log('Public URL:', publicUrl)
  
      // Don't update user metadata with avatar_url anymore
      // The storage bucket photo will take priority

      // Update local state
      setAvatarUrl(publicUrl)
      console.log('Avatar URL updated in state')
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
        variant: "default"
      })
  
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      toast({
        title: "Upload Failed",
        description: error.message || 'Failed to upload avatar. Please try again.',
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      // Reset the input
      if (event.target) {
        event.target.value = ''
      }
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
    setAvatarUrl(null)
  }

  if (loading) {
    return (
      <div className="container h-[80vh] mx-auto flex justify-center content-center">
        <Loader />
      </div>
    )
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
                <div className="flex items-start space-x-6">
                  <div className="flex flex-col items-center space-y-3">
                    <UserAvatar
                      src={avatarUrl}
                      username={username}
                      email={email}
                      size="xl"
                      uploading={uploading}
                    />
                    <label 
                      htmlFor="avatar-upload" 
                      className={`bg-primary text-primary-foreground rounded-md px-4 py-2 cursor-pointer hover:bg-primary/90 transition-colors text-sm font-medium flex items-center space-x-2 ${
                        uploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      <span>{uploading ? 'Uploading...' : 'Change Avatar'}</span>
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        className="hidden" 
                        onChange={uploadAvatar} 
                        disabled={uploading}
                        accept="image/*"
                      />
                    </label>
                  </div>
                  <div className="flex-1 space-y-1">
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}