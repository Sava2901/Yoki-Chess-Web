"use client"

import { UserAvatar } from './user-avatar'
import { Avatar } from './avatar'
import { cn } from '@/lib/utils'
import * as React from 'react'

interface PlayerCardProps {
  // Player information
  username: string
  avatarUrl?: string | null
  email?: string
  
  // Display options
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showColor?: boolean
  playerColor?: 'white' | 'black'
  
  // Additional info
  subtitle?: string
  badge?: React.ReactNode
  rightContent?: React.ReactNode
  
  // Layout options
  layout?: 'horizontal' | 'vertical'
  className?: string
  
  // Avatar options
  uploading?: boolean
  autoFetchAvatar?: boolean
}

export function PlayerCard({
  username,
  avatarUrl,
  email,
  size = 'sm',
  showColor = false,
  playerColor,
  subtitle,
  badge,
  rightContent,
  layout = 'horizontal',
  className,
  uploading = false,
  autoFetchAvatar = false
}: PlayerCardProps) {
  const AvatarComponent = autoFetchAvatar ? Avatar : UserAvatar
  
  const avatarProps = autoFetchAvatar 
    ? { autoFetch: true, size, uploading }
    : { src: avatarUrl, username, email, size, uploading }

  if (layout === 'vertical') {
    return (
      <div className={cn('flex flex-col items-center space-y-2', className)}>
        <AvatarComponent {...avatarProps} />
        <div className="text-center">
          <p className="font-medium">{username}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {showColor && playerColor && (
            <span className="text-sm text-muted-foreground capitalize">
              {playerColor}
            </span>
          )}
          {badge && <div className="mt-1">{badge}</div>}
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center space-x-3">
        <AvatarComponent {...avatarProps} />
        <div>
          <p className="font-medium">{username}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {badge && <div className="mt-1">{badge}</div>}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {showColor && playerColor && (
          <span className="text-sm text-muted-foreground capitalize">
            {playerColor}
          </span>
        )}
        {rightContent}
      </div>
    </div>
  )
}

// Specialized components for common use cases
export function GamePlayerCard({
  username,
  avatarUrl,
  playerColor,
  className,
  ...props
}: Omit<PlayerCardProps, 'showColor' | 'layout'> & {
  playerColor: 'white' | 'black'
}) {
  return (
    <PlayerCard
      username={username}
      avatarUrl={avatarUrl}
      playerColor={playerColor}
      showColor
      layout="horizontal"
      className={className}
      {...props}
    />
  )
}

export function LobbyPlayerCard({
  username,
  avatarUrl,
  timeControl,
  gameType,
  onJoin,
  className,
  ...props
}: Omit<PlayerCardProps, 'subtitle' | 'badge' | 'rightContent'> & {
  timeControl?: string
  gameType?: string
  onJoin?: () => void
}) {
  const subtitle = timeControl
  const badge = gameType ? (
    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
      {gameType}
    </span>
  ) : undefined
  
  const rightContent = onJoin ? (
    <button 
      onClick={onJoin}
      className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
    >
      Join
    </button>
  ) : undefined

  return (
    <PlayerCard
      username={username}
      avatarUrl={avatarUrl}
      subtitle={subtitle}
      badge={badge}
      rightContent={rightContent}
      className={cn('p-4 border rounded-lg hover:bg-muted/50 transition-colors', className)}
      {...props}
    />
  )
}