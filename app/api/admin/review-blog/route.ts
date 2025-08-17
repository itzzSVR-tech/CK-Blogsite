import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { reviewBlogSchema, validateBody } from '@/lib/validations'
import { requireAdmin, AuthenticatedRequest, logAdminAction } from '@/lib/auth'

export const POST = requireAdmin(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    const validation = validateBody(reviewBlogSchema, body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { blogId, action, reason } = validation.data

    // Find the blog
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
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

    if (blog.status !== 'PENDING_REVIEW') {
      return NextResponse.json({ error: 'Blog is not pending review' }, { status: 400 })
    }

    // Update blog status based on action
    const newStatus = action === 'approve' ? 'PUBLISHED' : 'REJECTED'
    
    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        status: newStatus,
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

    // Log admin action
    await logAdminAction(
      request.user!.userId,
      `${action}_blog`,
      'blog',
      blog.id,
      `${action === 'approve' ? 'Approved' : 'Rejected'} blog "${blog.title}" by ${blog.author.name}. ${reason ? `Reason: ${reason}` : ''}`
    )

    return NextResponse.json({
      message: `Blog "${blog.title}" has been ${action === 'approve' ? 'approved and published' : 'rejected'}.`,
      blog: updatedBlog,
    })
  } catch (error) {
    console.error('Review blog error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
