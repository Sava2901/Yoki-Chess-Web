"use client"

import { Avatar as AvatarPrimitive, AvatarImage, AvatarFallback } from './primitives'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  src?: string | null
  username?: string
  email?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  uploading?: boolean
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-20 w-20 text-xl'
}

export function UserAvatar({
  src,
  username,
  email,
  size = 'md',
  className,
  uploading = false
}: UserAvatarProps) {
  // Generate fallback text from username or email
  const getFallbackText = () => {
    if (username) {
      return username.charAt(0).toUpperCase()
    }
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    return 'U' // Default fallback
  }

  // Generate alt text for accessibility
  const getAltText = () => {
    if (username) return `${username}'s avatar`
    if (email) return `Avatar for ${email}`
    return 'User avatar'
  }

  return (
    <div className="relative inline-block">
      <AvatarPrimitive className={cn(sizeClasses[size], className)}>
        <AvatarImage 
          src={src || undefined} 
          alt={getAltText()}
        />
        <AvatarFallback className={cn(
          "bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold",
          size === 'sm' && "text-xs",
          size === 'xl' && "text-2xl"
        )}>
          {getFallbackText()}
        </AvatarFallback>
      </AvatarPrimitive>
      
      {uploading && (
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        </div>
      )}
    </div>
  )
}