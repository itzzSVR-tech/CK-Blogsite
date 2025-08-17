import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { updateBlogSchema, validateBody } from '../../../lib/validations'
import { requireVerifiedUser, requireAuth, AuthenticatedRequest } from '@/lib/auth'

interface RouteContext {
  params: { id: string }
}

export const GET = requireAuth(async (request: AuthenticatedRequest, { params }: RouteContext) => {
  try {
    const { id } = params

    const blog = await prisma.blog.findUnique({
      where: { id },
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

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    // Check if user can access this blog
    const canAccess = 
      blog.status === 'PUBLISHED' || 
      blog.authorId === request.user!.userId || 
      request.user!.role === 'ADMIN'

    if (!canAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ blog })
  } catch (error) {
    console.error('Get blog error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const PUT = requireVerifiedUser(async (request: AuthenticatedRequest, { params }: RouteContext) => {
  try {
    const { id } = params
    const body = await request.json()
    const validation = validateBody(updateBlogSchema, body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Find the blog
    const existingBlog = await prisma.blog.findUnique({
      where: { id },
    })

    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    // Check if user owns this blog
    if (existingBlog.authorId !== request.user!.userId) {
      return NextResponse.json({ error: 'You can only edit your own blogs' }, { status: 403 })
    }

    // Can only edit drafts
    if (existingBlog.status !== 'DRAFT') {
      return NextResponse.json({ error: 'You can only edit draft blogs' }, { status: 400 })
    }

    // Update blog
    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: validation.data,
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
      message: 'Blog updated successfully',
      blog: updatedBlog,
    })
  } catch (error) {
    console.error('Update blog error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
