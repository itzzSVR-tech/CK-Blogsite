import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireVerifiedUser, AuthenticatedRequest } from '@/lib/auth'

interface RouteContext {
  params: { id: string }
}

export const POST = requireVerifiedUser(async (request: AuthenticatedRequest, { params }: RouteContext) => {
  try {
    const { id } = params

    // Find the blog
    const existingBlog = await prisma.blog.findUnique({
      where: { id },
    })

    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    // Check if user owns this blog
    if (existingBlog.authorId !== request.user!.userId) {
      return NextResponse.json({ error: 'You can only submit your own blogs' }, { status: 403 })
    }

    // Can only submit drafts
    if (existingBlog.status !== 'DRAFT') {
      return NextResponse.json({ error: 'You can only submit draft blogs for review' }, { status: 400 })
    }

    // Update blog status to pending review
    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        status: 'PENDING_REVIEW',
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
      message: 'Blog submitted for review successfully',
      blog: updatedBlog,
    })
  } catch (error) {
    console.error('Submit blog error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
