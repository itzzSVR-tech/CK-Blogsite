# CK_Blogs - Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL database
- Email SMTP credentials (Gmail, etc.)

## Quick Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy the example environment file:
```bash
cp env.example .env
```

Edit `.env` with your actual values:
```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/blog_platform?schema=public"

# JWT Secrets - Generate strong random strings
JWT_SECRET="your-super-secret-jwt-key-here-should-be-very-long-and-random"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here-should-be-very-long-and-random"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"  # Use App Password for Gmail
FROM_EMAIL="your-email@gmail.com"
FROM_NAME="CK_Blogs"

# Application URL
APP_URL="http://localhost:3000"
```

### 3. Set Up Database

#### Option A: Local PostgreSQL
Install PostgreSQL locally and create a database:
```sql
CREATE DATABASE blog_platform;
```

#### Option B: Docker
```bash
docker run --name postgres -e POSTGRES_PASSWORD=mypassword -p 5432:5432 -d postgres
docker exec -it postgres createdb -U postgres blog_platform
```

#### Option C: Cloud Database
Use services like Supabase, Railway, or Neon (free tiers available)

### 4. Run Database Migration
```bash
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client
```bash
npx prisma generate
```

### 6. Create Initial Admin User (Optional)
Run the seed script:
```bash
npm run seed
```

### 7. Start Development Server
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/activate` - Account activation
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/request-reset` - Request password reset
- `POST /api/auth/reset` - Reset password

### Blogs
- `GET /api/blogs` - Get published blogs
- `POST /api/blogs` - Create blog (verified users)
- `GET /api/blogs/[id]` - Get specific blog
- `PUT /api/blogs/[id]` - Update blog (owner only)
- `POST /api/blogs/[id]/submit` - Submit for review

### Admin
- `GET /api/admin/pending-users` - Get pending users
- `POST /api/admin/approve-user` - Approve user
- `POST /api/admin/reject-user` - Reject user
- `GET /api/admin/pending-blogs` - Get pending blogs
- `POST /api/admin/review-blog` - Approve/reject blog

## Default Admin Account
After seeding:
- Email: `admin@yourclub.com`
- Password: `admin123`

**⚠️ Change the admin password immediately in production!**

## Email Setup (Gmail Example)
1. Enable 2-Factor Authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

## Production Deployment
1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Use secure database credentials
4. Configure proper CORS if needed
5. Set up proper email service
