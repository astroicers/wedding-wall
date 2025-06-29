import bcrypt from 'bcryptjs'

// Rate limiting store
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { password } = body

    if (!password) {
      throw createError({
        statusCode: 400,
        statusMessage: '請提供密碼'
      })
    }

    // Get client IP for rate limiting
    const clientIp = getClientIP(event) || 'unknown'
    
    // Check rate limiting (5 attempts per 15 minutes)
    const attempts = loginAttempts.get(clientIp) || { count: 0, lastAttempt: 0 }
    const now = Date.now()
    const fifteenMinutes = 15 * 60 * 1000

    if (attempts.count >= 5 && now - attempts.lastAttempt < fifteenMinutes) {
      throw createError({
        statusCode: 429,
        statusMessage: '嘗試次數過多，請15分鐘後再試'
      })
    }

    // Get password from environment variable
    const correctPassword = process.env.WEDDING_WALL_PASSWORD || 'wedding2024'
    
    // For demo/development, also check against a hashed password
    const hashedPassword = '$2a$10$YourHashedPasswordHere' // Replace with your bcrypt hash
    
    // Verify password
    let isValid = false
    
    // First check plain text comparison (for env variable)
    if (password === correctPassword) {
      isValid = true
    }
    
    // Then check bcrypt comparison (for production)
    if (!isValid && process.env.NODE_ENV === 'production') {
      try {
        isValid = await bcrypt.compare(password, hashedPassword)
      } catch (error) {
        console.error('Bcrypt comparison error:', error)
      }
    }

    if (!isValid) {
      // Update rate limiting
      loginAttempts.set(clientIp, {
        count: attempts.count + 1,
        lastAttempt: now
      })

      throw createError({
        statusCode: 401,
        statusMessage: '密碼錯誤'
      })
    }

    // Clear rate limiting on successful login
    loginAttempts.delete(clientIp)

    // Clean up old rate limiting entries periodically
    if (Math.random() < 0.1) { // 10% chance
      for (const [ip, data] of loginAttempts.entries()) {
        if (now - data.lastAttempt > fifteenMinutes) {
          loginAttempts.delete(ip)
        }
      }
    }

    return {
      success: true,
      message: '登入成功'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '登入失敗'
    })
  }
})

function getClientIP(event: any): string | null {
  // Try different headers
  const headers = getHeaders(event)
  
  return headers['x-forwarded-for']?.split(',')[0].trim() ||
    headers['x-real-ip'] ||
    headers['cf-connecting-ip'] ||
    event.node?.req?.socket?.remoteAddress ||
    null
}