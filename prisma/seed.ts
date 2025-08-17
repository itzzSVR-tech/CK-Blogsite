import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: process.env.ADMIN_EMAIL || 'admin@yourclub.com' },
  })

  if (existingAdmin) {
    console.log('✅ Admin user already exists')
    return
  }

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourclub.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const passwordHash = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: adminEmail,
      passwordHash,
      registrationNo: 'ADMIN001',
      year: '2024',
      domain: 'Administration',
      status: 'VERIFIED',
      role: 'ADMIN',
    },
  })

  console.log('✅ Created admin user:', {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  })

  // Create a sample blog post
  const sampleBlog = await prisma.blog.create({
    data: {
      title: 'Welcome to CK_Blogs',
      content: `
# Welcome to Our Blog Platform!

This is a sample blog post to demonstrate the platform's capabilities.

## Features

- **User Registration**: Students can register and wait for admin approval
- **Blog Creation**: Verified users can create and manage blog posts
- **Review Process**: All blogs go through admin review before publication
- **Email Notifications**: Automated emails for account activation and password resets

## Getting Started

1. Register for an account
2. Wait for admin approval
3. Activate your account via email
4. Start writing amazing blog posts!

Enjoy writing and sharing your thoughts with the club community!
      `,
      status: 'PUBLISHED',
      authorId: admin.id,
    },
  })

  console.log('✅ Created sample blog post:', {
    id: sampleBlog.id,
    title: sampleBlog.title,
    status: sampleBlog.status,
  })

  console.log('🎉 Database seeding completed successfully!')
  console.log(`
📧 Admin Login Credentials:
   Email: ${adminEmail}
   Password: ${adminPassword}
   
⚠️  IMPORTANT: Change the admin password immediately in production!
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
