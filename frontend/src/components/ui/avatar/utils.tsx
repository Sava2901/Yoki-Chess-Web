"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

// Function to check for existing avatar in storage bucket
export const checkStorageAvatar = async (userId: string): Promise<string | null> => {
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

// Function to determine the best avatar URL based on priority
export const determineAvatarUrl = async (user: any): Promise<string | null> => {
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

// Hook for getting user profile data
export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<{
    username: string
    email: string
    avatarUrl: string | null
  }>({ username: 'You', email: '', avatarUrl: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !session?.user) {
          setLoading(false)
          return
        }
        
        const user = session.user
        const avatarUrl = await determineAvatarUrl(user)
        
        setUserProfile({
          username: user.user_metadata?.username || 'You',
          email: user.email || '',
          avatarUrl
        })
      } catch (error) {
        console.error('Error loading user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user
        const avatarUrl = await determineAvatarUrl(user)
        setUserProfile({
          username: user.user_metadata?.username || 'You',
          email: user.email || '',
          avatarUrl
        })
      } else if (event === 'SIGNED_OUT') {
        setUserProfile({ username: 'You', email: '', avatarUrl: null })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { userProfile, loading }
}