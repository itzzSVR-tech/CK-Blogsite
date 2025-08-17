import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { approveUserSchema, validateBody } from '../../../lib/validations'
import { requireAdmin, AuthenticatedRequest, createTokenRecord, logAdminAction } from '@/lib/auth'
import { sendEmail, createActivationEmail, createRejectionEmail } from '../../../lib/mailer'

export const POST = requireAdmin(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    const validation = validateBody(approveUserSchema, body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { userId, action } = validation.data  // 👈 action: "APPROVE" | "REJECT"

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

    if (action === 'APPROVE') {
      // Create activation token (expires in 24 hours)
      const activationToken = await createTokenRecord(user.id, 'ACTIVATION', 24)
      
      // Create activation URL
      const activationUrl = `${process.env.APP_URL}/activate?token=${activationToken}`
      
      // Send activation email
      const emailContent = createActivationEmail(user.name, activationUrl)
      await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
      })

      // Log admin action
      await logAdminAction(
        request.user!.userId,
        'approve_user',
        'user',
        user.id,
        `Approved user registration for ${user.email}`
      )

      return NextResponse.json({
        message: `User ${user.name} has been approved. Activation email sent to ${user.email}.`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
        },
      })
    } 

    if (action === 'REJECT') {
      // Update user status
      await prisma.user.update({
        where: { id: user.id },
        data: { status: 'REJECTED' },
      })

      // Send rejection email
      const emailContent = createRejectionEmail(user.name)
      await sendEmail({
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
      })

      // Log admin action
      await logAdminAction(
        request.user!.userId,
        'reject_user',
        'user',
        user.id,
        `Rejected user registration for ${user.email}`
      )

      return NextResponse.json({
        message: `User ${user.name} has been rejected. Rejection email sent to ${user.email}.`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: 'REJECTED',
        },
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Approve/Reject user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
