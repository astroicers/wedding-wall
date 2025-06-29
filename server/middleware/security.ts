export default defineEventHandler((event) => {
  // Only apply to HTML responses
  if (!event.node.req.url?.startsWith('/api')) {
    // Security headers
    setHeaders(event, {
      // Prevent clickjacking
      'X-Frame-Options': 'SAMEORIGIN',
      
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Enable XSS protection
      'X-XSS-Protection': '1; mode=block',
      
      // Referrer policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions policy
      'Permissions-Policy': 'camera=self, microphone=(), geolocation=()',
      
      // Content Security Policy
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
        "img-src 'self' data: blob: *",
        "font-src 'self' data: fonts.gstatic.com",
        "connect-src 'self' ws: wss:",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ')
    })
  }
})