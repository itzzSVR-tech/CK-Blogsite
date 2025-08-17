import { z } from 'zod'

// Auth validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  registrationNo: z.string().min(1, 'Registration number is required'),
  year: z.string().min(1, 'Year is required'),
  domain: z.string().min(1, 'Domain is required'),
})

export const activateSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const requestResetSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// Blog validation schemas
export const createBlogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
})

export const updateBlogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters').optional(),
})

// Admin validation schemas
export const approveUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
})

export const rejectUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  reason: z.string().optional(),
})

export const reviewBlogSchema = z.object({
  blogId: z.string().min(1, 'Blog ID is required'),
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
})

// Utility function to validate request body
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    return { success: false, error: 'Invalid data format' }
  }
}
