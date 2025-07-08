import { minioClient } from '~/server/utils/minio'
import { streamToString } from '~/server/utils/stream'
import type { Wall } from '~/types/wall'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'userId')
    const wallId = getRouterParam(event, 'wallId')

    if (!userId || !wallId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing userId or wallId'
      })
    }

    // Check authentication and permissions
    const authContext = event.context.auth
    if (!authContext?.isAuthenticated) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    // Users can only view their own walls
    if (authContext.userId !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }

    const bucket = 'wedding-wall'
    const wallMetadataPath = `users/${userId}/walls/${wallId}/metadata.json`
    
    try {
      // Get wall metadata from MinIO
      const objectStream = await minioClient.getObject(bucket, wallMetadataPath)
      const metadataJson = await streamToString(objectStream)
      const wall: Wall = JSON.parse(metadataJson)
      
      // Ensure wall has proper settings
      if (!wall.settings) {
        wall.settings = {
          displayMode: 'default',
          wallTitle: wall.name,
          wallSubtitle: '',
          backgroundColor: null,
          textColor: '#ffffff',
          fontFamily: 'Inter, sans-serif',
          fontSize: 48,
          autoApprove: true,
          showUnmoderated: false,
          autoApproveKeywords: '',
          autoRejectKeywords: ''
        }
      }

      return {
        success: true,
        wall
      }
    } catch (minioError: any) {
      if (minioError.code === 'NoSuchKey') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Wall not found'
        })
      }
      throw minioError
    }
  } catch (error: any) {
    console.error('Error getting wall:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get wall'
    })
  }
})