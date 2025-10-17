# Smart Task Planner - Node.js Version 🚀

AI-powered task planning application built with **Node.js**, **Express**, **Gemini AI**, and **LangChain**.

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-4.18-blue.svg)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

- 🤖 **AI-Powered Planning** - Uses Google Gemini 2.0 Flash with LangChain
- 📋 **Smart Task Breakdown** - Generates 15-20 actionable tasks
- 🎯 **Priority Management** - Assigns High/Medium/Low priorities
- 📊 **Timeline Generation** - Calculates deadlines and milestones
- ⚠️ **Risk Assessment** - Identifies potential blockers
- 💾 **SQLite Database** - Stores goals and tasks
- 🎨 **Modern UI** - Responsive dark theme
- 📤 **Export Options** - JSON, CSV, and Print

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
GEMINI_API_KEY=your-gemini-api-key-here
PORT=5000
```

**Get your API key:** https://makersuite.google.com/app/apikey

### 3. Run the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Visit: **http://localhost:5000**

## 📦 Project Structure

```
smart-task-planner-nodejs/
├── server.js                 # Express server & API routes
├── package.json              # Dependencies
├── vercel.json              # Vercel deployment config
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── public/
│   ├── index.html           # Frontend UI
│   ├── style.css            # Styling
│   └── script.js            # Client-side logic
└── tasks.db                 # SQLite database (auto-created)
```

## 🌐 Deploy to Vercel

### Option 1: Deploy with Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variable
vercel env add GEMINI_API_KEY
# Paste your API key when prompted

# Deploy to production
vercel --prod
```

### Option 2: Deploy via GitHub

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/smart-task-planner-nodejs.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to: https://vercel.com/new
   - Click "Import Git Repository"
   - Select your repo
   - Add environment variable:
     - **Key:** `GEMINI_API_KEY`
     - **Value:** Your Gemini API key
   - Click "Deploy"

3. **Done!** Your app will be live at: `https://your-app.vercel.app`

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/plan` | POST | Generate task plan |
| `/api/goals` | GET | Get all goals |
| `/api/goals/:id/tasks` | GET | Get tasks for goal |
| `/api/tasks/:id/status` | PATCH | Update task status |
| `/api/example` | GET | Example data |

### Example Request

```bash
curl -X POST http://localhost:5000/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Launch a mobile app in 2 weeks",
    "deadline": "2025-11-01"
  }'
```

## 🎯 Technologies Used

- **Backend:** Node.js, Express.js
- **AI:** Google Gemini 2.0 Flash, LangChain
- **Database:** SQLite (better-sqlite3)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Deployment:** Vercel

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key |
| `PORT` | ❌ No | Server port (default: 5000) |
| `NODE_ENV` | ❌ No | Environment (development/production) |

## 🐛 Troubleshooting

### Issue: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "GEMINI_API_KEY not configured"
- Check `.env` file exists
- Verify API key is correct
- Restart the server

### Issue: Database errors
- Delete `tasks.db` and restart server
- Database will auto-recreate

## 🆚 Differences from Flask Version

| Feature | Flask Version | Node.js Version |
|---------|---------------|-----------------|
| Backend | Python + Flask | Node.js + Express |
| AI Integration | google-generativeai | @langchain/google-genai |
| Database | SQLite3 (Python) | better-sqlite3 (Node) |
| Deployment | Render | Vercel |
| Package Manager | pip | npm |
| Config File | requirements.txt | package.json |

## 🚀 Performance

- **Cold Start:** ~2-3 seconds on Vercel
- **Response Time:** ~3-5 seconds for AI generation
- **Database:** SQLite (fast, embedded)
- **Scalability:** Serverless (auto-scales on Vercel)

## 📄 License

MIT License - See LICENSE file

## 🙏 Credits

- **AI Model:** Google Gemini 2.0 Flash
- **Framework:** LangChain
- **Icons:** Font Awesome
- **Deployment:** Vercel

## 🔗 Links

- **Live Demo:** https://your-app.vercel.app (update after deployment)
- **GitHub Repo:** https://github.com/balamanikantsai/smart-task-planner-nodejs
- **Flask Version:** https://github.com/balamanikantsai/smart-task-planner

---

**Built with ❤️ by Bala Manikanta Sai**
