import nodemailer from 'nodemailer'
import 'dotenv/config'

/**
 * Gmail SMTP transporter
 * Uses Gmail App Password (not your login password!)
 * Required in .env:
 * - SMTP_USER (gmail address)
 * - SMTP_PASS (gmail app password)
 * - FROM_NAME (display name for sender)
 * - FROM_EMAIL (same as SMTP_USER ideally)
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send an email with the given options
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'CK_Blogs'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // fallback plain text
    })
    console.log(`✅ Email sent to ${to}`)
  } catch (error) {
    console.error('❌ Error sending email:', error)
    throw new Error('Failed to send email')
  }
}

/**
 * Quick connection check for Gmail SMTP
 */
export async function verifyConnection(): Promise<void> {
  try {
    await transporter.verify()
    console.log('✅ Gmail SMTP connection is ready to send emails')
  } catch (error) {
    console.error('❌ SMTP connection failed:', error)
  }
}

/**
 * Email templates
 */
export function createActivationEmail(name: string, activationUrl: string): { subject: string; html: string } {
  return {
    subject: 'Activate Your Account - CK_Blogs',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to CK_Blogs 🎉</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thanks for registering! Please click the button below to activate your account:</p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="${activationUrl}" 
             style="background-color: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Activate Account
          </a>
        </p>
        <p>If you didn’t create an account, you can ignore this email.</p>
        <p>– The CK_Blogs Team</p>
      </div>
    `,
  }
}

export function createPasswordResetEmail(name: string, resetUrl: string): { subject: string; html: string } {
  return {
    subject: 'Password Reset - CK_Blogs',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Reset Request</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc2626; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <p>– The CK_Blogs Team</p>
      </div>
    `,
  }
}

export function createRejectionEmail(name: string): { subject: string; html: string } {
  return {
    subject: 'Registration Update - CK_Blogs',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Registration Update</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>We reviewed your registration request but unfortunately it was not approved at this time.</p>
        <p>If you believe this is a mistake, feel free to contact our support team.</p>
        <p>– The CK_Blogs Team</p>
      </div>
    `,
  }
}

/**
 * Run this file directly to test sending
 */
if (require.main === module) {
  ;(async () => {
    await verifyConnection()

    const { subject, html } = createActivationEmail(
      'Test User',
      'http://localhost:3000/activate/123'
    )

    await sendEmail({
      to: process.env.SMTP_USER || '', // test send to yourself
      subject,
      html,
    })
  })()
}
