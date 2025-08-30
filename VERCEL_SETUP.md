# Vercel Deployment Setup Guide

## Required Environment Variables

Add these environment variables in your Vercel project settings:

### 1. Database Configuration
```
DATABASE_URL=<Your PostgreSQL URL>
```

### 2. Authentication Configuration
```
AUTH_TRUST_HOST=true
NEXTAUTH_URL=https://member-board-week2.vercel.app
NEXTAUTH_SECRET=5al+cJB7+oQWpoQVx3zgZP83eA9O+hdbxMkdct75NPk=
```

### 3. Email Configuration (Optional)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASS=<your-app-password>
EMAIL_FROM=<your-email@gmail.com>
EMAIL_FROM_NAME=Member Board
```

## Database Setup Options

### Option 1: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Navigate to Storage tab
3. Click "Create Database"
4. Select "Postgres"
5. Choose your region and create
6. The DATABASE_URL will be automatically added to your environment variables

### Option 2: Supabase (Free Alternative)
1. Create account at https://supabase.com
2. Create new project
3. Go to Settings > Database
4. Copy the Connection string (URI)
5. Add as DATABASE_URL in Vercel

### Option 3: Neon (Free Alternative)
1. Create account at https://neon.tech
2. Create new project
3. Copy the connection string
4. Add as DATABASE_URL in Vercel

## Deployment Steps

1. **Add Environment Variables**
   - Go to Vercel Dashboard > Settings > Environment Variables
   - Add all required variables listed above

2. **Deploy**
   - The build command is already configured: `prisma generate && prisma db push && next build`
   - This will automatically:
     - Generate Prisma client
     - Create database tables
     - Build the Next.js application

3. **Verify Deployment**
   - Visit your deployment URL
   - Check /api/auth/session endpoint
   - Test registration and login

## Troubleshooting

### Database Connection Error
- Ensure DATABASE_URL is correctly formatted
- Check if database is accessible from Vercel's IP addresses
- Verify SSL settings in connection string

### Authentication Error
- Confirm AUTH_TRUST_HOST=true is set
- Verify NEXTAUTH_SECRET matches across environments
- Check NEXTAUTH_URL matches your deployment URL

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

## Quick Test Commands

After deployment, test your API:

```bash
# Check auth endpoint
curl https://member-board-week2.vercel.app/api/auth/session

# Get CSRF token
curl https://member-board-week2.vercel.app/api/auth/csrf
```