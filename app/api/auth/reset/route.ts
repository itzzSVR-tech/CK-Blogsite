import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { resetPasswordSchema, validateBody } from '@/lib/validations'
import { hashPassword, validateTokenRecord } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateBody(resetPasswordSchema, body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { token, password } = validation.data

    // Validate reset token
    const tokenRecord = await validateTokenRecord(token, 'RESET')
    
    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    // Hash new password and update user
    const passwordHash = await hashPassword(password)
    
    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: {
        passwordHash,
      },
    })

    // Invalidate all refresh tokens for this user
    await prisma.token.deleteMany({
      where: {
        userId: tokenRecord.userId,
        type: 'REFRESH',
      },
    })

    return NextResponse.json({
      message: 'Password reset successful. Please log in with your new password.',
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
