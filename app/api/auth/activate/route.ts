import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { activateSchema, validateBody } from '@/lib/validations'
import { hashPassword, validateTokenRecord } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateBody(activateSchema, body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { token, password } = validation.data

    // Validate activation token
    const tokenRecord = await validateTokenRecord(token, 'ACTIVATION')
    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid or expired activation token' }, { status: 400 })
    }

    // Hash password and update user
    const passwordHash = await hashPassword(password)
    const user = await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: {
        passwordHash,
        status: 'VERIFIED', // or 'APPROVED', just keep consistent!
      },
    })

    // Delete used token
    await prisma.token.delete({
      where: { id: tokenRecord.id },
    })

    return NextResponse.json({
      message: 'Account activated successfully. You can now log in.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    })
  } catch (error) {
    console.error('Activation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
