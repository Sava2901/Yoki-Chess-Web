// Avatar primitives (base components)
export { Avatar as AvatarPrimitive, AvatarImage, AvatarFallback } from './primitives'

// User avatar components
export { UserAvatar } from './user-avatar'
export { Avatar } from './avatar'

// Player card components
export { PlayerCard, GamePlayerCard, LobbyPlayerCard } from './player-card'

// Utility functions and hooks
export { checkStorageAvatar, determineAvatarUrl, useUserProfile } from './utils'

// Re-export all components and utilities
// This provides a clean API for importing avatar-related functionality