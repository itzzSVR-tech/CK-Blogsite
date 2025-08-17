import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { loginSchema, validateBody } from '@/lib/validations'
import { verifyPassword, createTokenRecord } from '@/lib/auth'
import { signAccessToken, signRefreshToken, createTokenCookies } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateBody(loginSchema, body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { email, password } = validation.data

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash)
    
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Check if user is verified
    if (user.status !== 'VERIFIED') {
      return NextResponse.json({ error: 'Account not verified. Please contact an administrator.' }, { status: 403 })
    }

    // Create refresh token
    const refreshToken = await createTokenRecord(user.id, 'REFRESH', 24 * 7) // 7 days

    // Generate JWT tokens
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    })

    const refreshTokenJWT = signRefreshToken({
      userId: user.id,
      tokenId: refreshToken,
    })

    // Create response with cookies
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    })

    // Set HttpOnly cookies
    const cookies = createTokenCookies(accessToken, refreshTokenJWT)
    response.cookies.set('accessToken', cookies.accessToken.value, cookies.accessToken)
    response.cookies.set('refreshToken', cookies.refreshToken.value, cookies.refreshToken)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
