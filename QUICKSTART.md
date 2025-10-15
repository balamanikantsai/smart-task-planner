# Quick Start Guide

## Installation Steps

1. **Create virtual environment:**
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

3. **Configure API key:**
   - Copy `.env.example` to `.env`
   - Get your Gemini API key from: https://makersuite.google.com/app/apikey
   - Add it to `.env`: `GEMINI_API_KEY=your_key_here`

4. **Run the application:**
   ```powershell
   python app.py
   ```

5. **Access the app:**
   Open your browser and go to: http://localhost:5000

## Testing the API

Test with curl:
```powershell
curl -X POST http://localhost:5000/api/plan -H "Content-Type: application/json" -d '{\"goal\": \"Launch a mobile app in 2 weeks\", \"deadline\": \"2025-10-29\"}'
```

Or use the web interface to submit goals and view AI-generated task plans!

## Demo Video Recording Guide

To create your demo video, show:
1. Starting the application
2. Entering a goal (e.g., "Launch a product in 2 weeks")
3. Setting a deadline
4. Clicking "Generate Task Plan"
5. Viewing the AI-generated results:
   - Task breakdown with priorities
   - Timeline and milestones
   - Risk factors
   - Success metrics
6. Switching between Timeline and Kanban views
7. Exporting the plan (JSON/CSV)

Keep it under 5 minutes!
