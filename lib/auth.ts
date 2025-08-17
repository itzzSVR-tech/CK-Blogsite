import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromRequest, verifyAccessToken, JWTPayload } from './jwt'
import prisma from './prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

export function requireAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const token = extractTokenFromRequest(req)
      
      if (!token) {
        return NextResponse.json({ error: 'Access token required' }, { status: 401 })
      }

      const payload = verifyAccessToken(token)
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = payload

      return handler(authenticatedReq)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }
  }
}

export function requireVerifiedUser(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return requireAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
    if (req.user?.status !== 'VERIFIED') {
      return NextResponse.json({ error: 'Account not verified' }, { status: 403 })
    }
    return handler(req)
  })
}

export function requireAdmin(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return requireAuth(async (req: AuthenticatedRequest): Promise<NextResponse> => {
    if (req.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    return handler(req)
  })
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function createTokenRecord(userId: string, type: 'ACTIVATION' | 'RESET' | 'REFRESH', expiresInHours: number = 24) {
  const token = generateToken()
  const hashedToken = hashToken(token)
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)

  await prisma.token.create({
    data: {
      userId,
      hashed: hashedToken,
      type,
      expiresAt,
    },
  })

  return token
}

export async function validateTokenRecord(token: string, type: 'ACTIVATION' | 'RESET' | 'REFRESH') {
  const hashedToken = hashToken(token)
  
  const tokenRecord = await prisma.token.findFirst({
    where: {
      hashed: hashedToken,
      type,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  })

  if (!tokenRecord) {
    return null
  }

  // Delete the token after use (except for refresh tokens)
  if (type !== 'REFRESH') {
    await prisma.token.delete({
      where: { id: tokenRecord.id },
    })
  }

  return tokenRecord
}

export async function logAdminAction(adminId: string, action: string, targetType: string, targetId: string, description?: string) {
  await prisma.adminAction.create({
    data: {
      adminId,
      action,
      targetType,
      targetId,
      description,
    },
  })
}
