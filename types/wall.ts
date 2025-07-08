export interface WallSettings {
  displayMode: 'grid' | 'polaroid' | 'magazine' | 'stories' | 'enhanced'
  theme: 'default' | 'polaroid' | 'instagram' | 'magazine'
  backgroundColor: string
  fontFamily: string
  autoApprove: boolean
  showUnmoderated: boolean // 是否顯示未審核的留言
  autoApproveKeywords: string // 自動通過關鍵字
  autoRejectKeywords: string // 自動拒絕關鍵字
  requirePassword: boolean
  password?: string
  textColor: string
}

export interface Wall {
  id: string
  userId: string
  name: string
  description: string
  slug: string // URL-friendly identifier
  isActive: boolean
  isPublic: boolean
  createdAt: number
  updatedAt: number
  settings: WallSettings
  messageCount: number
}

export interface WallState {
  walls: Wall[]
  currentWall: Wall | null
  loading: boolean
  error: string | null
}

// Default wall settings for new walls
export const defaultWallSettings: WallSettings = {
  displayMode: 'grid',
  theme: 'default',
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, sans-serif',
  autoApprove: true, // 預設自動審核通過，對用戶友好
  showUnmoderated: false, // 預設不顯示未審核留言
  autoApproveKeywords: '',
  autoRejectKeywords: '',
  requirePassword: false,
  textColor: '#333333'
}

// Helper function to generate URL-friendly slug
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Helper function to generate unique wall ID
export function generateWallId(): string {
  return `wall_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Wall creation data type for API
export interface CreateWallData {
  name: string
  description: string
  isPublic: boolean
  settings: Partial<WallSettings>
}