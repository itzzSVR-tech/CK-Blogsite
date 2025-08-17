import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin, AuthenticatedRequest } from '@/lib/auth'

export const GET = requireAdmin(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get all pending users
    const users = await prisma.user.findMany({
      where: {
        status: 'PENDING',
      },
      select: {
        id: true,
        name: true,
        email: true,
        registrationNo: true,
        year: true,
        domain: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    })

    const total = await prisma.user.count({
      where: {
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get pending users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
