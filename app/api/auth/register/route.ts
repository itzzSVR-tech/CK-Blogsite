import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { registerSchema, validateBody } from '@/lib/validations'
import { sendEmail, createActivationEmail } from '@/lib/mailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateBody(registerSchema, body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { name, email, registrationNo, year, domain } = validation.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        registrationNo,
        year,
        domain,
        status: 'PENDING',
        role: 'MEMBER',
      },
    })

    // Create activation URL + email template
    const activationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/activate/${user.id}`
    const { subject, html } = createActivationEmail(user.name, activationUrl)

    // Send email
    await sendEmail({ to: user.email, subject, html })

    return NextResponse.json({
      message: 'Registration successful. Check your email for activation.',
      user: { id: user.id, name: user.name, email: user.email, status: user.status },
    })
  } catch (error) {
    console.error('❌ Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
