# Deployment Guide

This guide covers deploying the Phishing Detection System to **Render** (backend) and **Vercel** (frontend).

## Prerequisites

- MongoDB Atlas account (free tier)
- Render account (free tier)
- Vercel account (free tier)
- VirusTotal API key (free)
- Google Safe Browsing API key (free)

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with username and password
4. Whitelist IP `0.0.0.0/0` (allows all IPs for Render)
5. Get your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/phishing-detection?retryWrites=true&w=majority`

## Step 2: Get API Keys

### VirusTotal API
1. Go to [VirusTotal](https://www.virustotal.com/)
2. Sign up for a free account
3. Get your API key from the API section

### Google Safe Browsing API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Safe Browsing APIs"
4. Create credentials (API Key)
5. Get your Client ID and API Key

## Step 3: Deploy Backend to Render

### Option A: Using Render Dashboard
1. Go to [Render](https://render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `server` folder (or configure root directory)
5. Configure:
   - **Name**: `phishing-detection-api`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Environment Variables**:
     ```
     PORT=10000
     NODE_ENV=production
     MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/phishing-detection?retryWrites=true&w=majority
     JWT_SECRET=<your-secret-key>
     VIRUSTOTAL_API_KEY=<your-vt-key>
     GOOGLE_SAFE_BROWSING_API_KEY=<your-google-key>
     GOOGLE_SAFE_BROWSING_CLIENT_ID=<your-client-id>
     ```
6. Click "Deploy Web Service"

### Option B: Using render.yaml
The `render.yaml` file is already configured. Just:
1. Connect your GitHub repository to Render
2. Render will automatically detect and deploy using the config

### After Deployment
- Copy your Render URL: `https://your-api.onrender.com`
- Test health endpoint: `https://your-api.onrender.com/health`

## Step 4: Deploy Frontend to Vercel

### Option A: Using Vercel Dashboard
1. Go to [Vercel](https://vercel.com/)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `client`
   - **Environment Variables**:
     ```
     NEXT_PUBLIC_API_URL=https://your-api.onrender.com
     ```
5. Click "Deploy"

### Option B: Using vercel.json
The `vercel.json` file is already configured. Just:
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect and deploy using the config

## Step 5: Update Client Environment

After deploying the backend, update the frontend's environment variable:

```bash
# In Vercel dashboard, add this environment variable:
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
```

Then redeploy the frontend.

## Step 6: Create Admin User

After backend deployment, create an admin user:

```bash
# SSH into your Render service or use the Render shell
cd /opt/render/project/src
node scripts/createAdmin.js
```

Or use the API endpoint:
```bash
curl -X POST https://your-api.onrender.com/api/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "your-secure-password"
  }'
```

## Step 7: Verify Deployment

### Backend
```bash
curl https://your-api.onrender.com/health
# Should return: { "status": "ok", "timestamp": "..." }
```

### Frontend
- Open your Vercel URL
- Try signing up
- Try logging in
- Test the phishing detection feature

## Environment Variables Reference

### Backend (Render)
| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port (use 10000 for Render) | Yes |
| NODE_ENV | Set to `production` | Yes |
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | Secret for JWT tokens | Yes |
| VIRUSTOTAL_API_KEY | VirusTotal API key | Yes |
| GOOGLE_SAFE_BROWSING_API_KEY | Google Safe Browsing API key | Yes |
| GOOGLE_SAFE_BROWSING_CLIENT_ID | Google Safe Browsing Client ID | Yes |

### Frontend (Vercel)
| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_API_URL | Backend API URL | Yes |

## Troubleshooting

### Backend Issues
- **Database connection error**: Check MongoDB URI and IP whitelist
- **API key errors**: Verify VirusTotal and Google API keys are correct
- **Port issues**: Render uses port 10000 by default
- **Build fails**: Check `package.json` scripts are correct

### Frontend Issues
- **API connection error**: Ensure `NEXT_PUBLIC_API_URL` is set correctly
- **Build fails**: Check Next.js version and dependencies
- **Environment variables not working**: Variables must start with `NEXT_PUBLIC_`

### Common Issues
- **CORS errors**: Backend CORS is configured to allow all origins in development
- **Rate limiting**: Render free tier has rate limits
- **Cold starts**: Free tier services may have cold starts (30-60 seconds)

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | Free | $0 |
| Render (Backend) | Free | $0 |
| Vercel (Frontend) | Hobby | $0 |

**Total Monthly Cost: $0**

## Security Notes

- Never commit `.env` files to Git
- Use strong JWT secrets (minimum 32 characters)
- Rotate API keys regularly
- Enable MongoDB Atlas IP whitelist
- Use HTTPS only (both Render and Vercel provide this)
- Monitor your API usage to avoid rate limits

## Monitoring

### Render
- View logs in Render dashboard
- Monitor metrics in Render dashboard
- Set up alerts for downtime

### Vercel
- View logs in Vercel dashboard
- Monitor deployment status
- Set up analytics

## Scaling

When ready to scale:
- **Render**: Upgrade to paid plans for better performance
- **Vercel**: Upgrade to Pro for more bandwidth
- **MongoDB**: Upgrade to shared cluster for better performance
- **CDN**: Consider using Cloudflare for additional caching

## Support

For issues:
- Check Render status page: https://status.render.com/
- Check Vercel status page: https://www.vercel-status.com/
- Check MongoDB Atlas status: https://status.cloud.mongodb.com/
