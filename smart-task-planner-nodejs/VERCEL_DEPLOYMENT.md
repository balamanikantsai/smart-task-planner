# 🚀 Vercel Deployment Guide

Complete guide to deploy Smart Task Planner (Node.js) on Vercel.

## Prerequisites

✅ Node.js project ready
✅ Vercel account (free tier available)
✅ Your Gemini API key
✅ GitHub account (optional, but recommended)

---

## Method 1: Deploy with Vercel CLI (Fastest)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser - login with GitHub, GitLab, or Email.

### Step 3: Navigate to Project

```bash
cd smart-task-planner-nodejs
```

### Step 4: Deploy

```bash
vercel
```

**Answer the prompts:**
- Set up and deploy? **Y**
- Which scope? **Select your account**
- Link to existing project? **N**
- Project name? **smart-task-planner** (or any name)
- Directory? **./ (current directory)**
- Override settings? **N**

Wait ~30 seconds... Your app will be deployed!

### Step 5: Add Environment Variable

```bash
vercel env add GEMINI_API_KEY
```

**Enter values:**
- Environment: **Production**
- Value: **AIzaSy******************** (your API key)

### Step 6: Redeploy with Environment Variable

```bash
vercel --prod
```

### ✅ Done! Your app is live!

URL will be shown in terminal, like:
```
https://smart-task-planner-abc123.vercel.app
```

---

## Method 2: Deploy via GitHub + Vercel Dashboard

### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Node.js version"

# Create main branch
git branch -M main

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/smart-task-planner-nodejs.git

# Push
git push -u origin main
```

### Step 2: Import to Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/new

2. **Import Repository:**
   - Click **"Import Git Repository"**
   - If not connected, click **"Connect GitHub"** and authorize Vercel
   - Select: `smart-task-planner-nodejs`

3. **Configure Project:**
   ```
   Project Name: smart-task-planner
   Framework Preset: Other
   Root Directory: ./
   Build Command: (leave empty)
   Output Directory: (leave empty)
   Install Command: npm install
   ```

4. **Add Environment Variables:**
   - Click **"Environment Variables"**
   - Add variable:
     - **Name:** `GEMINI_API_KEY`
     - **Value:** `AIzaSyDYbHIB9ilygu2Iux1MFTzDXROtGbMzXN0`
   - Click **"Add"**

5. **Deploy:**
   - Click **"Deploy"**
   - Wait 1-2 minutes for build and deployment

### ✅ Live URL

Your app will be at: `https://smart-task-planner-xxxxx.vercel.app`

---

## Method 3: Deploy via Vercel for Git (No CLI)

### Step 1: Install Vercel for Git Integration

If you have GitHub repo but don't want CLI:

1. Visit: https://vercel.com/
2. Click **"Sign Up"** and login with GitHub
3. Authorize Vercel to access your repos
4. Click **"New Project"**
5. Select your repository
6. Follow Method 2 steps 3-5 above

---

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

**Vercel Dashboard → Project → Settings → Domains**

Add custom domain:
- Example: `taskplanner.yourdomain.com`
- Follow DNS instructions
- SSL certificate auto-generated

### 2. Environment Variables

**Vercel Dashboard → Project → Settings → Environment Variables**

Add/Edit variables:
- `GEMINI_API_KEY` - Your API key
- `NODE_ENV` - production

### 3. Auto-Deploy on Git Push

✅ **Already enabled by default!**

Every time you push to `main` branch:
- Vercel auto-detects changes
- Builds and deploys automatically
- Zero-downtime deployment

To disable: **Settings → Git → Auto-deploy → Off**

---

## Verify Deployment

### Test Health Endpoint

```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "gemini_configured": true,
  "database": "connected"
}
```

### Test Task Generation

1. Visit: `https://your-app.vercel.app`
2. Enter goal: "Launch a mobile app in 2 weeks"
3. Click "Generate Plan"
4. Should see AI-generated tasks

---

## Troubleshooting

### ❌ Issue: "Module not found"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
vercel --prod
```

### ❌ Issue: "GEMINI_API_KEY not configured"

**Solution:**
1. Vercel Dashboard → Settings → Environment Variables
2. Add `GEMINI_API_KEY` with your API key
3. Redeploy: `vercel --prod`

### ❌ Issue: "Function timeout"

**Solution:**
- Vercel free tier has 10-second timeout
- Upgrade to Pro for 60-second timeout
- Or optimize AI prompt to respond faster

### ❌ Issue: Database not persisting

**Solution:**
- Vercel's filesystem is ephemeral (resets on each deploy)
- For persistent storage, use:
  - **Vercel Postgres** (recommended)
  - **Planetscale** (MySQL)
  - **MongoDB Atlas**

---

## Vercel Free Tier Limits

| Feature | Free Tier | Pro Tier |
|---------|-----------|----------|
| Function Timeout | 10s | 60s |
| Bandwidth | 100 GB/month | 1 TB/month |
| Deployments | Unlimited | Unlimited |
| Team Members | 1 | Unlimited |
| Custom Domains | Yes | Yes |
| Analytics | Basic | Advanced |

💡 **For this project, Free Tier is sufficient!**

---

## Monitoring & Logs

### View Real-Time Logs

1. **Vercel Dashboard → Project → Deployments**
2. Click on latest deployment
3. Click **"Functions"** tab
4. Click on **"server"** function
5. View logs in real-time

### Alternative: CLI Logs

```bash
vercel logs
```

---

## Performance Optimization

### 1. Enable Edge Caching

Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/public/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Reduce Cold Starts

- Vercel auto-warms popular routes
- Pro tier has better cold start performance

### 3. Optimize Database

For production, replace SQLite with:
- **Vercel Postgres** (serverless)
- **Neon** (serverless Postgres)
- **Planetscale** (serverless MySQL)

---

## Security Best Practices

✅ **Never commit `.env` file**
✅ **Use Vercel Environment Variables for secrets**
✅ **Enable HTTPS** (automatic on Vercel)
✅ **Rotate API keys regularly**
✅ **Use CORS properly** (already configured)
✅ **Limit request rates** (add rate limiting middleware)

---

## Advanced Configuration

### Custom Build Command

Edit `package.json`:
```json
{
  "scripts": {
    "build": "echo 'No build step required'",
    "start": "node server.js",
    "vercel-build": "echo 'Build complete'"
  }
}
```

### Serverless Function Config

Create `api/` folder for serverless functions (optional):
```
api/
  plan.js       # Separate function for /api/plan
  health.js     # Separate function for /api/health
```

---

## Comparison: Vercel vs Render

| Feature | Vercel | Render |
|---------|--------|--------|
| **Best For** | Frontend, Serverless | Full-stack, Always-on |
| **Cold Start** | ~1-2s | ~30-60s (free tier) |
| **Free Tier** | 100 GB bandwidth | 750 hours/month |
| **Database** | Ephemeral | Ephemeral (free), Persistent (paid) |
| **Deploy Speed** | ~30s | ~3-5 minutes |
| **Git Integration** | Excellent | Good |

**Recommendation:** Use Vercel for this Node.js version!

---

## Next Steps After Deployment

1. ✅ Test all features on live site
2. ✅ Update README with live URL
3. ✅ Record demo video with deployed URL
4. ✅ Share with team/friends
5. ✅ Monitor usage in Vercel Dashboard

---

## Useful Commands

```bash
# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm deployment-url

# View environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.local
```

---

## 🎉 Success!

Your Smart Task Planner is now live on Vercel!

**Share your app:**
- URL: `https://smart-task-planner-xxxxx.vercel.app`
- Add to README
- Include in demo video
- Submit with project

---

## Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Community:** https://github.com/vercel/vercel/discussions
- **Node.js Docs:** https://nodejs.org/docs

---

**Deployed with ❤️ on Vercel**
