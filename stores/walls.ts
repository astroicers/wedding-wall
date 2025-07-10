import type { Wall, WallState, CreateWallData, defaultWallSettings, generateSlug, generateWallId } from '~/types/wall'

export const useWallsStore = defineStore('walls', {
  state: (): WallState => ({
    walls: [],
    currentWall: null,
    loading: false,
    error: null
  }),

  getters: {
    // Get walls by user ID
    getUserWalls: (state) => (userId: string) => {
      return state.walls.filter(wall => wall.userId === userId)
    },

    // Get wall by ID
    getWallById: (state) => (wallId: string) => {
      return state.walls.find(wall => wall.id === wallId)
    },

    // Get active walls count for current user
    activeWallsCount: (state) => {
      const authStore = useAuthStore()
      if (!authStore.userId) return 0
      return state.walls.filter(wall => 
        wall.userId === authStore.userId && wall.isActive
      ).length
    },

    // Check if current user owns a wall
    isOwner: (state) => (wallId: string) => {
      const authStore = useAuthStore()
      const wall = state.walls.find(w => w.id === wallId)
      return wall?.userId === authStore.userId
    }
  },

  actions: {
    // Fetch all walls for a specific user
    async fetchUserWalls(userId: string, showError = true) {
      this.loading = true
      this.error = null

      try {
        const authenticatedFetch = useAuthenticatedFetch()
        const response = await authenticatedFetch(`/api/users/${userId}/walls`)
        this.walls = response
        
        // Update message counts for each wall
        for (const wall of this.walls) {
          await this.updateWallMessageCount(wall.id)
        }
        
        return this.walls
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch walls'
        if (showError) {
          ElMessage.error(this.error)
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    // Create a new wall
    async createWall(wallData: CreateWallData) {
      this.loading = true
      this.error = null

      try {
        const authStore = useAuthStore()
        if (!authStore.userId) {
          throw new Error('User not authenticated')
        }

        const authenticatedFetch = useAuthenticatedFetch()
        const response = await authenticatedFetch('/api/walls', {
          method: 'POST',
          body: {
            ...wallData,
            userId: authStore.userId
          }
        })

        // Add the new wall to local state
        this.walls.push(response)
        
        ElMessage.success('祝福牆創建成功！')
        return response
      } catch (error: any) {
        this.error = error.message || 'Failed to create wall'
        ElMessage.error(this.error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Switch to a different wall and update related stores
    async switchWall(wallId: string) {
      this.loading = true
      this.error = null

      try {
        const wall = this.getWallById(wallId)
        if (!wall) {
          throw new Error('Wall not found')
        }

        // Check permissions
        if (!this.isOwner(wallId) && !wall.isPublic) {
          throw new Error('Access denied')
        }

        this.currentWall = wall

        // Update messages store to load messages for this wall
        const messagesStore = useMessagesStore()
        await messagesStore.fetchWallMessages(wall.userId, wallId)

        return wall
      } catch (error: any) {
        this.error = error.message || 'Failed to switch wall'
        ElMessage.error(this.error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Update wall settings
    async updateWall(wallId: string, updates: Partial<Wall>) {
      this.loading = true
      this.error = null

      try {
        if (!this.isOwner(wallId)) {
          throw new Error('Access denied')
        }

        const authenticatedFetch = useAuthenticatedFetch()
        const response = await authenticatedFetch(`/api/walls/${wallId}`, {
          method: 'PUT',
          body: updates
        })

        // Update local state
        const index = this.walls.findIndex(w => w.id === wallId)
        if (index !== -1) {
          this.walls[index] = { ...this.walls[index], ...response }
        }

        if (this.currentWall?.id === wallId) {
          this.currentWall = { ...this.currentWall, ...response }
        }

        ElMessage.success('祝福牆設定已更新')
        return response
      } catch (error: any) {
        this.error = error.message || 'Failed to update wall'
        ElMessage.error(this.error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Delete a wall
    async deleteWall(wallId: string) {
      this.loading = true
      this.error = null

      try {
        if (!this.isOwner(wallId)) {
          throw new Error('Access denied')
        }

        const authenticatedFetch = useAuthenticatedFetch()
        await authenticatedFetch(`/api/walls/${wallId}`, {
          method: 'DELETE'
        })

        // Remove from local state
        this.walls = this.walls.filter(w => w.id !== wallId)
        
        if (this.currentWall?.id === wallId) {
          this.currentWall = null
        }

        ElMessage.success('祝福牆已刪除')
      } catch (error: any) {
        this.error = error.message || 'Failed to delete wall'
        ElMessage.error(this.error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Hide a wall from UI only (doesn't delete from MinIO)
    hideWallFromUI(wallId: string) {
      try {
        if (!this.isOwner(wallId)) {
          throw new Error('Access denied')
        }

        // Remove from local state only - no API call
        this.walls = this.walls.filter(w => w.id !== wallId)
        
        if (this.currentWall?.id === wallId) {
          this.currentWall = null
        }

        console.log(`Wall ${wallId} hidden from UI (MinIO data preserved)`)
      } catch (error: any) {
        console.error('Failed to hide wall from UI:', error)
        throw error
      }
    },

    // Update message count for a wall
    async updateWallMessageCount(wallId: string) {
      try {
        const wall = this.getWallById(wallId)
        if (!wall) return

        const authenticatedFetch = useAuthenticatedFetch()
        const response = await authenticatedFetch(`/api/users/${wall.userId}/walls/${wallId}/messages/count`)
        
        // Update local state
        const index = this.walls.findIndex(w => w.id === wallId)
        if (index !== -1) {
          this.walls[index].messageCount = response.count
        }

        if (this.currentWall?.id === wallId) {
          this.currentWall.messageCount = response.count
        }
      } catch (error) {
        // Silently fail for message count updates
        console.warn(`Failed to update message count for wall ${wallId}:`, error)
      }
    },

    // Clear all wall data (useful for logout)
    clearWalls() {
      this.walls = []
      this.currentWall = null
      this.error = null
      this.loading = false
    }
  },

  // Persist only basic wall data, not the full state
  persist: process.client ? {
    storage: localStorage,
    paths: ['currentWall']
  } : false
})