import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin, AuthenticatedRequest } from '@/lib/auth'

export const GET = requireAdmin(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get all blogs pending review
    const blogs = await prisma.blog.findMany({
      where: {
        status: 'PENDING_REVIEW',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            registrationNo: true,
            year: true,
            domain: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    })

    const total = await prisma.blog.count({
      where: {
        status: 'PENDING_REVIEW',
      },
    })

    return NextResponse.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get pending blogs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
