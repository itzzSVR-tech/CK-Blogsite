import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requestResetSchema, validateBody } from '@/lib/validations'
import { createTokenRecord } from '@/lib/auth'
import { sendEmail, createPasswordResetEmail } from '@/lib/mailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateBody(requestResetSchema, body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { email } = validation.data

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      })
    }

    // Check if user is verified
    if (user.status !== 'VERIFIED') {
      return NextResponse.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      })
    }

    // Create reset token (expires in 1 hour)
    const resetToken = await createTokenRecord(user.id, 'RESET', 1)
    
    // Create reset URL
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`
    
    // Send email
    const emailContent = createPasswordResetEmail(user.name, resetUrl)
    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    return NextResponse.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
