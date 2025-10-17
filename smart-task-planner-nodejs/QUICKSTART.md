# 🚀 Quick Start Guide - Node.js Version

Get your Smart Task Planner running in **3 minutes!**

## Step 1: Install Dependencies

```bash
cd smart-task-planner-nodejs
npm install
```

## Step 2: Your API Key is Already Configured!

✅ `.env` file already contains your Gemini API key

## Step 3: Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## Step 4: Open in Browser

Visit: **http://localhost:5000**

---

## 🎯 Test the App

1. **Check Health:**
   - The status badge should show "✓ API Connected"

2. **Generate a Plan:**
   - Enter goal: "Launch a mobile app in 2 weeks"
   - Set deadline: 2 weeks from today
   - Click "Generate Task Plan"
   - Wait 3-5 seconds for AI response

3. **Explore Features:**
   - ✅ View Timeline and Kanban views
   - ✅ Export to JSON/CSV
   - ✅ Check risk factors and success metrics

---

## 🚀 Deploy to Vercel

### Option 1: Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add API key
vercel env add GEMINI_API_KEY
# Enter: production
# Value: AIzaSyDYbHIB9ilygu2Iux1MFTzDXROtGbMzXN0

# Deploy to production
vercel --prod
```

### Option 2: GitHub + Vercel Dashboard

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. Deploy on Vercel:
   - Go to: https://vercel.com/new
   - Import your GitHub repo
   - Add environment variable: `GEMINI_API_KEY`
   - Click Deploy

---

## 📁 Project Structure

```
smart-task-planner-nodejs/
├── server.js              # Main Express server
├── package.json           # Dependencies
├── vercel.json           # Vercel config
├── .env                  # Your API key (already configured!)
├── public/
│   ├── index.html        # Frontend
│   ├── style.css         # Styling
│   └── script.js         # Client logic
└── README.md             # Full documentation
```

---

## 🎉 You're All Set!

- **Local:** http://localhost:5000
- **After Vercel Deploy:** https://your-app.vercel.app

For detailed deployment instructions, see `VERCEL_DEPLOYMENT.md`

---

**Questions?**
- Check `README.md` for full documentation
- See `VERCEL_DEPLOYMENT.md` for deployment help
