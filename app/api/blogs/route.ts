import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { createBlogSchema, validateBody } from '../../../lib/validations'
import { requireVerifiedUser, AuthenticatedRequest } from '../../../lib/auth'

export const POST = requireVerifiedUser(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    const validation = validateBody(createBlogSchema, body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { title, content } = validation.data

    // Create blog as draft
    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        status: 'DRAFT',
        authorId: request.user!.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Blog created successfully',
      blog,
    })
  } catch (error) {
    console.error('Create blog error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get all published blogs
    const blogs = await prisma.blog.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
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
        status: 'PUBLISHED',
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
    console.error('Get blogs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
