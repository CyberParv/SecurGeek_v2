# Vercel Deployment Guide

This guide will help you deploy your SecurGeek platform to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Supabase Project**: Your Supabase project should be set up and running

## Environment Variables

You'll need to set up the following environment variables in Vercel:

### Required Variables
- `VITE_SUPABASE_URL`: https://fmksoufybswlzjmupskz.supabase.co 

- `VITE_SUPABASE_ANON_KEY`: eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZta3NvdWZ5YnN3bHpqbXVwc2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMTIwNjAsImV4cCI6MjA2NTg4ODA2MH0.zBKF3pUxcpKQFhC8CEPez5LjZegKPagVFuJfpkGkmRg

### Getting Supabase Credentials
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings > API
4. Copy the Project URL and anon/public key

## Deployment Steps

### 1. Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it as a Vite React app

### 2. Configure Environment Variables

1. In the deployment setup, go to "Environment Variables"
2. Add the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### 3. Deploy

1. Click "Deploy"
2. Vercel will automatically:
   - Install dependencies
   - Build your React app
   - Deploy to a production URL

### 4. Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain

## Project Structure

The deployment is configured to:
- **Frontend**: React app built with Vite (main application)
- **API**: Serverless functions in `/api` directory (for YouTube video processing)
- **Database**: Supabase (already hosted)

## Build Configuration

The project includes:
- `vercel.json`: Deployment configuration
- `package.json`: Build scripts and dependencies
- `vite.config.js`: Frontend build configuration

## API Endpoints

The YouTube video API is available at:
- `https://your-domain.vercel.app/api/video?videoId=YOUTUBE_VIDEO_ID`

## Troubleshooting

### Common Issues

1. **Environment Variables Not Found**
   - Make sure all required env vars are set in Vercel dashboard
   - Restart deployment after adding new variables

2. **Build Failures**
   - Check the build logs in Vercel dashboard
   - Ensure all dependencies are listed in package.json

3. **Supabase Connection Issues**
   - Verify your Supabase URL and key are correct
   - Check Supabase project is running and accessible

### Logs and Monitoring

- View deployment logs in Vercel dashboard
- Monitor function performance in Vercel analytics
- Check Supabase logs for database issues

## Local Development vs Production

- **Local**: Uses development environment with hot reload
- **Production**: Optimized build with serverless functions

## Post-Deployment Checklist

- [ ] Test user authentication
- [ ] Verify course content loads correctly
- [ ] Check video playback functionality
- [ ] Test assessment features
- [ ] Confirm admin dashboard access
- [ ] Validate all API endpoints

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test Supabase connection
4. Review browser console for frontend errors

Your application will be available at: `https://your-project-name.vercel.app` 