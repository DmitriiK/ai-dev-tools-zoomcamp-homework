# Deploying to Render

This guide explains how to deploy the Online Coding Interview Platform to Render.

## Prerequisites

- A [Render account](https://render.com) (free tier available)
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Options

### Option 1: Using render.yaml (Recommended)

This method uses Infrastructure as Code to deploy all services at once.

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git push origin main
   ```

2. **Create a new Blueprint on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your repository
   - Render will automatically detect `render.yaml`
   - Click "Apply" to create all services

3. **Set CORS_ORIGINS environment variable**
   - Go to your backend service settings
   - Add environment variable:
     ```
     CORS_ORIGINS=["https://your-frontend-url.onrender.com"]
     ```
   - Replace with your actual frontend URL after deployment

### Option 2: Manual Service Creation

#### 1. Deploy PostgreSQL Database

- Click "New" → "PostgreSQL"
- Name: `coding-interview-db`
- Database: `coding_interview`
- User: `postgres`
- Region: Choose closest to you
- Plan: Free
- Click "Create Database"

#### 2. Deploy Redis

- Click "New" → "Redis"
- Name: `coding-interview-redis`
- Plan: Free (25MB)
- Click "Create Redis"

#### 3. Deploy Backend (FastAPI)

- Click "New" → "Web Service"
- Connect your repository
- Configure:
  - **Name**: `coding-interview-backend`
  - **Region**: Same as database
  - **Branch**: `main`
  - **Root Directory**: `backend`
  - **Environment**: `Python 3`
  - **Build Command**: `pip install -r requirements.txt`
  - **Start Command**: `uvicorn app.main:application --host 0.0.0.0 --port $PORT`
  - **Plan**: Free

- Add Environment Variables:
  ```
  DATABASE_URL = [Internal URL from PostgreSQL service]
  REDIS_URL = [Internal URL from Redis service]
  DEBUG = false
  CORS_ORIGINS = ["https://your-frontend-url.onrender.com"]
  ```

#### 4. Deploy Frontend (React)

- Click "New" → "Static Site"
- Connect your repository
- Configure:
  - **Name**: `coding-interview-frontend`
  - **Branch**: `main`
  - **Root Directory**: `frontend`
  - **Build Command**: `npm install && npm run build`
  - **Publish Directory**: `dist`

- Add Environment Variable:
  ```
  VITE_API_URL = https://your-backend-url.onrender.com
  ```

## Important Notes

### Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- Cold start takes ~30-60 seconds
- PostgreSQL database has 90-day expiry
- Redis has 25MB storage limit

### WebSocket Configuration

Render's free tier supports WebSockets, but you need to ensure:

1. **Backend uses wss:// (WebSocket Secure)**
   - Update Socket.IO client configuration if needed

2. **Keep-alive for Socket connections**
   - Implement ping/pong to prevent disconnections

### Production Adjustments

Before deploying, make these changes:

1. **Update CORS in backend** (`backend/app/core/config.py`):
   ```python
   CORS_ORIGINS = [
       "https://your-frontend-url.onrender.com"
   ]
   ```

2. **Update Socket.IO URL in frontend** (`frontend/src/services/socket.ts`):
   ```typescript
   const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com';
   ```

3. **Add health check endpoint** (already included):
   - Render uses `/health` for health checks
   - Prevents unnecessary spin-downs

4. **Database migrations**:
   - Add to build command if using Alembic:
     ```
     pip install -r requirements.txt && alembic upgrade head
     ```

## Monitoring

After deployment:

1. **Check service logs** in Render Dashboard
2. **Test all features**:
   - Session creation
   - Real-time code sync
   - Code execution (all languages)
   - WebSocket connection

3. **Common issues**:
   - CORS errors → Check CORS_ORIGINS matches frontend URL
   - WebSocket fails → Ensure using wss:// protocol
   - Database connection → Verify DATABASE_URL format
   - Cold start delays → Normal on free tier

## Custom Domain (Optional)

1. Go to your frontend service
2. Click "Settings" → "Custom Domain"
3. Add your domain
4. Update DNS records as instructed
5. Update CORS_ORIGINS in backend

## Cost Estimate

**Free Tier (Starting point)**:
- PostgreSQL: Free (90 days, then $7/month)
- Redis: Free (25MB)
- Backend: Free (750 hours/month)
- Frontend: Free (100GB bandwidth)

**Paid Tier (Production)**:
- PostgreSQL: $7-15/month
- Redis: $10/month (1GB)
- Backend: $7/month (always on)
- Frontend: Free
- **Total**: ~$25-35/month

## Alternative: Deploy with Docker

If you prefer Docker-based deployment:

1. Use Render's Docker environment
2. Update render.yaml to use `env: docker`
3. Point to your docker-compose.yml
4. Note: Redis and PostgreSQL still need separate services

## Troubleshooting

### Backend won't start
- Check build logs for Python dependency errors
- Verify DATABASE_URL format: `postgresql+asyncpg://...`
- Ensure all environment variables are set

### Frontend can't reach backend
- Verify VITE_API_URL in frontend settings
- Check CORS_ORIGINS includes frontend URL
- Ensure backend service is running

### WebSocket disconnects frequently
- Check backend logs for errors
- Verify Redis connection
- Implement reconnection logic in frontend

### Database connection errors
- Use internal database URL (faster, no egress charges)
- Format: `postgresql+asyncpg://user:pass@host/db`
- Check if database is sleeping (free tier)

## Next Steps

1. Set up monitoring (Render provides basic metrics)
2. Configure automatic deployments on git push
3. Set up staging environment (separate branch)
4. Consider upgrading critical services to paid tier
5. Implement database backups
