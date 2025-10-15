# Manual Setup Guide - Smart Task Planner

Since the automated setup script has an issue, please follow these manual steps:

## Step 1: Create Virtual Environment

```powershell
python -m venv venv
```

## Step 2: Activate Virtual Environment

```powershell
.\venv\Scripts\Activate.ps1
```

If you get an execution policy error, run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Step 3: Install Dependencies

```powershell
pip install -r requirements.txt
```

## Step 4: Create Environment File

```powershell
Copy-Item .env.example .env
```

## Step 5: Add Your Gemini API Key

1. Get your free API key from: https://makersuite.google.com/app/apikey
2. Open the `.env` file in Notepad:
```powershell
notepad .env
```
3. Replace `your_gemini_api_key_here` with your actual API key
4. Save and close

## Step 6: Run the Application

```powershell
python app.py
```

## Step 7: Open in Browser

Navigate to: **http://localhost:5000**

---

## Quick Copy-Paste Commands

Copy and paste these one at a time:

```powershell
# 1. Create venv
python -m venv venv

# 2. Activate venv
.\venv\Scripts\Activate.ps1

# 3. Install packages
pip install flask flask-cors google-generativeai python-dotenv gunicorn

# 4. Copy env file
Copy-Item .env.example .env

# 5. Open .env to add API key
notepad .env

# 6. Run app
python app.py
```

---

## Verification

After installation, verify with:

```powershell
# Check installed packages
pip list | Select-String "flask|google"

# Should show:
# Flask (2.3.0)
# Flask-Cors (4.0.0)
# google-generativeai (0.3.2)
```

---

## Troubleshooting

### If Python is not found
Install Python 3.8+ from: https://www.python.org/downloads/

### If pip install fails
Try upgrading pip first:
```powershell
python -m pip install --upgrade pip
```

### If activation fails
Run as Administrator and enable scripts:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

**You're ready to go!** 🚀

Once running, open http://localhost:5000 and try these example goals:
- "Launch a mobile app in 2 weeks"
- "Organize a tech conference"
- "Learn web development"
