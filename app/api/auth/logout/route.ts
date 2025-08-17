import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { extractRefreshTokenFromRequest, verifyRefreshToken } from '@/lib/jwt'
import { clearTokenCookies } from '@/lib/jwt'
import { hashToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = extractRefreshTokenFromRequest(request)
    
    if (refreshToken) {
      try {
        // Verify and get token payload
        const payload = verifyRefreshToken(refreshToken)
        
        // Delete refresh token from database
        const hashedToken = hashToken(payload.tokenId)
        await prisma.token.deleteMany({
          where: {
            hashed: hashedToken,
            type: 'REFRESH',
          },
        })
      } catch (error) {
        // Token might be invalid or expired, but we still want to clear cookies
        console.log('Invalid refresh token during logout')
      }
    }

    // Create response and clear cookies
    const response = NextResponse.json({ message: 'Logged out successfully' })
    
    const cookies = clearTokenCookies()
    response.cookies.set('accessToken', cookies.accessToken.value, cookies.accessToken)
    response.cookies.set('refreshToken', cookies.refreshToken.value, cookies.refreshToken)

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
