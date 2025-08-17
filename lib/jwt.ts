import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export interface JWTPayload {
  userId: string
  email: string
  role: string
  status: string
}

export interface RefreshTokenPayload {
  userId: string
  tokenId: string
}

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m',
  })
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  })
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from cookies first (HttpOnly)
  const tokenFromCookie = request.cookies.get('accessToken')?.value
  if (tokenFromCookie) {
    return tokenFromCookie
  }

  // Fallback to Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

export function extractRefreshTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get('refreshToken')?.value || null
}

export function createTokenCookies(accessToken: string, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    accessToken: {
      value: accessToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    },
    refreshToken: {
      value: refreshToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    },
  }
}

export function clearTokenCookies() {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    accessToken: {
      value: '',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      maxAge: 0,
      path: '/',
    },
    refreshToken: {
      value: '',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      maxAge: 0,
      path: '/',
    },
  }
}
