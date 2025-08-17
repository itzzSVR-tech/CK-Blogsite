import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { rejectUserSchema, validateBody } from '@/lib/validations'
import { requireAdmin, AuthenticatedRequest, logAdminAction } from '@/lib/auth'

export const POST = requireAdmin(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    const validation = validateBody(rejectUserSchema, body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { userId, reason } = validation.data

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.status !== 'PENDING') {
      return NextResponse.json({ error: 'User is not pending approval' }, { status: 400 })
    }

    // Delete the user and all related records
    await prisma.user.delete({
      where: { id: userId },
    })

    // Log admin action
    await logAdminAction(
      request.user!.userId,
      'reject_user',
      'user',
      user.id,
      `Rejected user registration for ${user.email}. Reason: ${reason || 'No reason provided'}`
    )

    return NextResponse.json({
      message: `User registration for ${user.email} has been rejected and removed.`,
    })
  } catch (error) {
    console.error('Reject user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
