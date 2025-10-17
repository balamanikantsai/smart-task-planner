# 🚀 Deploying to Render

This guide will help you deploy the Smart Task Planner to Render using your GitHub repository.

## Prerequisites

✅ GitHub repository with your code pushed
✅ Render account (free tier available)
✅ Your Gemini API key

## Deployment Steps

### Option 1: Deploy with Blueprint (Recommended - Easiest)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com/
   - Sign in with your GitHub account

2. **Create New Blueprint**
   - Click **"New +"** button
   - Select **"Blueprint"**

3. **Connect Repository**
   - Select your repository: `balamanikantsai/smart-task-planner`
   - Render will automatically detect `render.yaml`

4. **Add Environment Variable**
   - During setup, you'll see "Environment Variables"
   - Add: `GEMINI_API_KEY` = `your-actual-api-key-here`
   - Click **"Apply"**

5. **Deploy**
   - Click **"Create Blueprint Instance"**
   - Wait 5-10 minutes for deployment
   - Your app will be live at: `https://smart-task-planner-xxxx.onrender.com`

---

### Option 2: Manual Deploy (Alternative)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com/

2. **Create New Web Service**
   - Click **"New +"** → **"Web Service"**
   - Click **"Connect a repository"**
   - Authorize GitHub and select: `balamanikantsai/smart-task-planner`

3. **Configure Service**
   ```
   Name: smart-task-planner
   Region: Choose closest to you (e.g., Oregon, Frankfurt)
   Branch: main
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   ```

4. **Choose Plan**
   - Select **"Free"** plan (good for testing)
   - Or **"Starter"** ($7/month for better performance)

5. **Add Environment Variables**
   - Scroll to **"Environment Variables"**
   - Click **"Add Environment Variable"**
   - Key: `GEMINI_API_KEY`
   - Value: `AIzaS*******************` (your actual key)
   - Click **"Add"**

6. **Deploy**
   - Click **"Create Web Service"**
   - Render will build and deploy automatically
   - Check logs for any errors

---

## Important Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | ✅ Yes |

**Where to find your Gemini API key:**
- Go to: https://makersuite.google.com/app/apikey
- Create or copy your API key
- Paste it in Render's environment variables

---

## Post-Deployment

### 1. Verify Deployment
Once deployed, test these endpoints:

```bash
# Health check
curl https://your-app.onrender.com/api/health

# Should return:
{
  "status": "healthy",
  "gemini_configured": true,
  "database": "connected"
}
```

### 2. Test the App
- Visit: `https://your-app.onrender.com`
- Enter a goal: "Launch a mobile app in 2 weeks"
- Click "Generate Plan"
- Should see AI-generated tasks

### 3. Check Logs
If something goes wrong:
- Go to Render Dashboard
- Click your service
- Click **"Logs"** tab
- Look for error messages

---

## Common Issues & Solutions

### ❌ Issue: "Application failed to respond"
**Solution:** Check logs, ensure `gunicorn app:app` is correct

### ❌ Issue: "GEMINI_API_KEY not configured"
**Solution:** Add environment variable in Render dashboard

### ❌ Issue: "Module not found"
**Solution:** Ensure `requirements.txt` is complete and pushed to GitHub

### ❌ Issue: Database errors
**Solution:** Render's filesystem is ephemeral. For persistent storage, upgrade to paid plan or use external database

---

## Free Tier Limitations

⚠️ **Important Notes about Render Free Tier:**

1. **Cold Starts**: App sleeps after 15 minutes of inactivity
   - First request after sleep takes 30-60 seconds
   - Solution: Use paid plan or ping service every 10 minutes

2. **Ephemeral Filesystem**: SQLite database resets on each deploy
   - Tasks won't persist between restarts
   - Solution: Use PostgreSQL (see below) or paid plan

3. **750 hours/month**: Free tier has usage limits
   - Should be enough for personal projects

---

## Upgrade Options

### Use PostgreSQL for Persistent Storage

1. **Add PostgreSQL on Render:**
   - Dashboard → "New +" → "PostgreSQL"
   - Copy connection string

2. **Update code to use PostgreSQL:**
   ```python
   # Instead of SQLite, use PostgreSQL
   import psycopg2
   DATABASE_URL = os.getenv('DATABASE_URL')
   ```

3. **Add environment variable:**
   - `DATABASE_URL` = (your PostgreSQL connection string)

---

## Monitoring

### View Real-Time Logs
```bash
# In Render Dashboard
Logs tab → Enable "Auto-scroll"
```

### Custom Domain (Optional)
- Render Dashboard → Settings → Custom Domain
- Add your domain (requires paid plan for custom SSL)

---

## Auto-Deploy on Git Push

✅ **Already Enabled!**

Every time you push to `main` branch:
1. Render detects the change
2. Automatically rebuilds
3. Deploys new version
4. Zero-downtime deployment

To disable: Render Dashboard → Settings → Auto-Deploy → Off

---

## Security Best Practices

✅ **Never commit `.env` file** (already in `.gitignore`)
✅ **Use Render's environment variables** for secrets
✅ **Rotate API keys regularly**
✅ **Enable HTTPS** (Render does this automatically)
✅ **Use strong passwords** for any admin features

---

## Need Help?

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com/
- **Gemini API Docs**: https://ai.google.dev/docs

---

## Quick Reference Commands

```bash
# Push changes to trigger deployment
git add .
git commit -m "Update app"
git push origin main

# View app logs (in Render dashboard)
# https://dashboard.render.com → Your Service → Logs

# Check deployment status
# https://dashboard.render.com → Your Service → Events
```

---

## 🎉 Success!

Once deployed, share your app:
- URL: `https://smart-task-planner-xxxx.onrender.com`
- Add to README.md
- Share with friends/team!

**Your API Key (keep secure):**
- `GEMINI_API_KEY=AIzaSyDYbHIB9ilygu2Iux1MFTzDXROtGbMzXN0`

---

## Next Steps After Deployment

1. ✅ Test all features on live site
2. ✅ Record demo video with deployed URL
3. ✅ Add live URL to README
4. ✅ Submit project with live link
5. ✅ Monitor logs for any issues

Good luck! 🚀
