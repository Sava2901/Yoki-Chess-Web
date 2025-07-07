"use client"

import { useState, useEffect } from 'react'
import { UserAvatar } from './user-avatar'
import { determineAvatarUrl } from './utils'
import { supabase } from '@/lib/supabaseClient'

interface AvatarProps {
  userId?: string
  username?: string
  email?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  uploading?: boolean
  // If provided, use this avatar URL directly instead of fetching
  avatarUrl?: string | null
  // If true, will automatically fetch and determine the best avatar URL for the current user
  autoFetch?: boolean
}

export function Avatar({
  username,
  email,
  size = 'md',
  className,
  uploading = false,
  avatarUrl,
  autoFetch = false
}: AvatarProps) {
  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState<string | null>(avatarUrl || null)
  const [resolvedUsername, setResolvedUsername] = useState(username)
  const [resolvedEmail, setResolvedEmail] = useState(email)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (autoFetch && !avatarUrl) {
      const fetchUserProfile = async () => {
        try {
          setLoading(true)
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError || !session?.user) {
            return
          }
          
          const user = session.user
          
          // Set user info if not provided
          if (!username) {
            setResolvedUsername(user.user_metadata?.username || 'You')
          }
          if (!email) {
            setResolvedEmail(user.email || '')
          }
          
          // Determine best avatar URL
          const bestAvatarUrl = await determineAvatarUrl(user)
          setResolvedAvatarUrl(bestAvatarUrl)
        } catch (error) {
          console.error('Error fetching user profile:', error)
        } finally {
          setLoading(false)
        }
      }
      
      fetchUserProfile()
    }
  }, [autoFetch, avatarUrl, username, email])

  // If a specific avatarUrl was provided, use it
  useEffect(() => {
    if (avatarUrl !== undefined) {
      setResolvedAvatarUrl(avatarUrl)
    }
  }, [avatarUrl])

  return (
    <UserAvatar
      src={resolvedAvatarUrl}
      username={resolvedUsername}
      email={resolvedEmail}
      size={size}
      className={className}
      uploading={uploading || loading}
    />
  )
}