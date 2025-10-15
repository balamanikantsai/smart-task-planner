# Testing Guide for Smart Task Planner

## 🧪 Complete Testing Checklist

This guide provides comprehensive testing procedures to ensure your Smart Task Planner works perfectly before demo and submission.

---

## Pre-Testing Setup

### 1. Environment Check
```powershell
# Verify Python version
python --version
# Should show Python 3.8 or higher

# Check if virtual environment is activated
# You should see (venv) in your prompt
```

### 2. Dependencies Check
```powershell
pip list | Select-String "flask|google-generativeai|flask-cors|python-dotenv"
```

**Expected Output**:
- Flask (2.3.0)
- google-generativeai (0.3.2)
- Flask-CORS (4.0.0)
- python-dotenv (1.0.0)

### 3. API Key Verification
```powershell
# Check if .env file exists
Test-Path .env

# Verify API key is set (don't show the actual key)
Get-Content .env | Select-String "GEMINI_API_KEY"
```

---

## Phase 1: Backend Testing

### Test 1.1: Application Startup

```powershell
# Start the application
python app.py
```

**✅ Success Criteria**:
- No error messages
- Server starts on port 5000
- Console shows:
  ```
  🚀 Smart Task Planner Starting...
  📊 Database: ✓ Connected
  🤖 Gemini AI: ✓ Configured
  ```

**❌ Common Issues**:
- Port already in use → Change port in app.py
- Module not found → Run `pip install -r requirements.txt`
- API key missing → Check .env file

---

### Test 1.2: Health Check Endpoint

**Method 1: Browser**
```
http://localhost:5000/api/health
```

**Method 2: PowerShell**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
```

**✅ Expected Response**:
```json
{
  "status": "healthy",
  "gemini_configured": true,
  "database": "connected"
}
```

---

### Test 1.3: Task Plan Generation

**Test Case 1: Simple Goal**
```powershell
$body = @{
    goal = "Write a book in 30 days"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/plan" -Method Post -Body $body -ContentType "application/json"
$response | ConvertTo-Json -Depth 10
```

**✅ Expected Response Structure**:
```json
{
  "success": true,
  "goal": "Write a book in 30 days",
  "plan": {
    "analysis": "...",
    "tasks": [
      {
        "name": "...",
        "description": "...",
        "estimated_hours": 8,
        "priority": "High",
        "dependencies": [],
        "deadline": "2025-10-20"
      }
    ],
    "timeline": {
      "total_days": 30,
      "milestones": ["..."]
    },
    "risk_factors": ["..."],
    "success_metrics": ["..."]
  }
}
```

---

**Test Case 2: Goal with Deadline**
```powershell
$body = @{
    goal = "Launch a mobile app"
    deadline = "2025-11-15"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/plan" -Method Post -Body $body -ContentType "application/json"
```

**✅ Expected Behavior**:
- Response within 5-10 seconds
- At least 10 tasks generated
- All tasks have required fields
- Deadlines are logical and sequential

---

**Test Case 3: Complex Goal**
```powershell
$body = @{
    goal = "Organize a 500-person tech conference with 20 speakers, 5 workshops, catering, venue booking, and marketing campaign"
    deadline = "2026-03-15"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/plan" -Method Post -Body $body -ContentType "application/json"
```

**✅ Expected Behavior**:
- 20+ tasks generated
- Multiple priority levels
- Complex dependency chains
- Realistic timeline

---

### Test 1.4: Error Handling

**Test Case 1: Missing Goal**
```powershell
$body = @{} | ConvertTo-Json
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/plan" -Method Post -Body $body -ContentType "application/json"
} catch {
    $_.Exception.Response.StatusCode  # Should be 400
}
```

**✅ Expected**: HTTP 400 Bad Request

---

**Test Case 2: Invalid Deadline Format**
```powershell
$body = @{
    goal = "Test goal"
    deadline = "invalid-date"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/plan" -Method Post -Body $body -ContentType "application/json"
```

**✅ Expected**: Still processes (deadline is optional validation)

---

### Test 1.5: Database Operations

**Test: Save and Retrieve Goals**
```powershell
# Create a goal
$body = @{
    goal = "Test database functionality"
    deadline = "2025-12-31"
} | ConvertTo-Json

$createResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/plan" -Method Post -Body $body -ContentType "application/json"

# Retrieve all goals
$goals = Invoke-RestMethod -Uri "http://localhost:5000/api/goals" -Method Get
$goals

# Get tasks for first goal
$tasks = Invoke-RestMethod -Uri "http://localhost:5000/api/goals/1/tasks" -Method Get
$tasks
```

**✅ Expected Behavior**:
- Goal is saved to database
- Can retrieve goal by ID
- Tasks are associated with goal
- All fields are preserved

---

## Phase 2: Frontend Testing

### Test 2.1: UI Load and Responsiveness

**Manual Checks**:
1. Open http://localhost:5000
2. ✅ Page loads without errors
3. ✅ Header displays with status indicator
4. ✅ Input form is visible
5. ✅ All buttons are clickable
6. ✅ CSS styles applied correctly
7. ✅ Icons load (Font Awesome)

---

### Test 2.2: Goal Submission

**Test Case 1: Basic Submission**

**Steps**:
1. Enter goal: "Create a YouTube channel"
2. Select deadline: 30 days from today
3. Click "Generate Task Plan"

**✅ Expected Behavior**:
- Loading spinner appears
- Generate button disabled during processing
- Results appear after 3-5 seconds
- All sections populated (analysis, tasks, timeline, risks, metrics)
- No JavaScript errors in console (F12)

---

**Test Case 2: Without Deadline**

**Steps**:
1. Enter goal: "Learn Python programming"
2. Leave deadline empty
3. Click "Generate Task Plan"

**✅ Expected Behavior**:
- Still processes successfully
- Timeline generated without fixed end date
- All other sections populate normally

---

### Test 2.3: View Switching

**Steps**:
1. Generate a task plan
2. Click "Kanban" toggle button

**✅ Expected Behavior**:
- View changes from timeline to kanban
- Tasks grouped by priority (High, Medium, Low)
- Toggle button shows as active
- All tasks still visible

3. Click "Timeline" toggle button

**✅ Expected Behavior**:
- View returns to timeline format
- Tasks show with full details
- Original sort order restored

---

### Test 2.4: Example Goals

**Steps**:
1. Click "Show Examples" button

**✅ Expected Behavior**:
- Modal appears
- 4 example goals displayed
- Each example clickable

2. Click on any example

**✅ Expected Behavior**:
- Modal closes
- Goal text filled in input
- Deadline auto-populated
- Ready to generate

---

### Test 2.5: Export Functions

**Test Case 1: JSON Export**

**Steps**:
1. Generate a task plan
2. Click "Export as JSON"

**✅ Expected Behavior**:
- File downloads immediately
- Filename: `task-plan.json`
- File contains valid JSON
- All data preserved

**Verify**:
```powershell
Get-Content "path\to\task-plan.json" | ConvertFrom-Json
```

---

**Test Case 2: CSV Export**

**Steps**:
1. Generate a task plan
2. Click "Export as CSV"

**✅ Expected Behavior**:
- File downloads immediately
- Filename: `task-plan.csv`
- Contains headers and task rows
- Opens in Excel/spreadsheet apps

**Verify**:
```powershell
Get-Content "path\to\task-plan.csv" | Select-Object -First 5
```

---

**Test Case 3: Print Function**

**Steps**:
1. Generate a task plan
2. Click "Print Plan"

**✅ Expected Behavior**:
- Print dialog opens
- Print preview shows clean layout
- No buttons or navigation in print view
- All content visible

---

### Test 2.6: Error Display

**Test Case 1: Network Error**

**Steps**:
1. Stop the Flask server (Ctrl+C)
2. Try to generate a task plan in browser

**✅ Expected Behavior**:
- Error message displays
- Message is user-friendly
- Error auto-dismisses after 5 seconds
- App doesn't crash

**Test Case 2: API Key Missing**

**Steps**:
1. Remove API key from .env
2. Restart server
3. Try to generate plan

**✅ Expected Behavior**:
- Status badge shows "⚠️ API Key Missing"
- Helpful error message displayed
- Guidance to add API key shown

---

### Test 2.7: Responsive Design

**Desktop (1920x1080)**:
- ✅ Full layout displayed
- ✅ Cards side-by-side where appropriate
- ✅ All features accessible

**Tablet (768x1024)**:
- ✅ Cards stack vertically
- ✅ Buttons remain accessible
- ✅ Text readable

**Mobile (375x667)**:
- ✅ Single column layout
- ✅ All features accessible
- ✅ Touch-friendly buttons
- ✅ No horizontal scrolling

**Test Method**:
```
F12 → Toggle Device Toolbar (Ctrl+Shift+M)
Test different screen sizes
```

---

## Phase 3: Integration Testing

### Test 3.1: Complete User Journey

**Scenario**: New user wants to plan a project

**Steps**:
1. Open application
   - ✅ Loads successfully
2. Check health status
   - ✅ Shows "AI Ready"
3. Click "Show Examples"
   - ✅ Modal opens with examples
4. Select example "Launch a mobile app"
   - ✅ Goal and deadline populated
5. Click "Generate Task Plan"
   - ✅ Loading indicator shows
   - ✅ Results display after processing
6. Review all sections
   - ✅ Analysis makes sense
   - ✅ Tasks are actionable
   - ✅ Timeline is logical
   - ✅ Risks identified
   - ✅ Metrics defined
7. Switch to Kanban view
   - ✅ View changes correctly
8. Switch back to Timeline
   - ✅ Returns to original view
9. Export as JSON
   - ✅ File downloads
10. Print preview
    - ✅ Print dialog opens

**Total Time**: Should complete in under 5 minutes

---

### Test 3.2: Stress Testing

**Test Case 1: Multiple Rapid Requests**

```powershell
# Run 5 requests in sequence
1..5 | ForEach-Object {
    $body = @{
        goal = "Test goal number $_"
    } | ConvertTo-Json
    
    Write-Host "Request $_..."
    Invoke-RestMethod -Uri "http://localhost:5000/api/plan" -Method Post -Body $body -ContentType "application/json"
}
```

**✅ Expected Behavior**:
- All requests complete successfully
- No server crashes
- Reasonable response times
- All responses valid

---

**Test Case 2: Large Goal Text**

```powershell
$longGoal = "Launch " + ("a comprehensive " * 50) + "project"
$body = @{
    goal = $longGoal
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/plan" -Method Post -Body $body -ContentType "application/json"
```

**✅ Expected Behavior**:
- Handles long input
- Response still structured
- No truncation issues

---

## Phase 4: Performance Testing

### Test 4.1: Response Time Measurement

```powershell
$body = @{
    goal = "Launch a product in 2 weeks"
    deadline = "2025-10-29"
} | ConvertTo-Json

Measure-Command {
    Invoke-RestMethod -Uri "http://localhost:5000/api/plan" -Method Post -Body $body -ContentType "application/json"
}
```

**✅ Target Performance**:
- < 5 seconds: Excellent
- 5-10 seconds: Good
- > 10 seconds: Acceptable (depends on Gemini API)

---

### Test 4.2: Database Performance

```powershell
# Insert 100 goals and measure time
Measure-Command {
    1..100 | ForEach-Object {
        $body = @{
            goal = "Test goal $_"
        } | ConvertTo-Json
        
        Invoke-RestMethod -Uri "http://localhost:5000/api/plan" -Method Post -Body $body -ContentType "application/json" | Out-Null
    }
}
```

**Note**: This test will take several minutes due to AI processing

---

## Phase 5: Cross-Browser Testing

### Browsers to Test:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

### Test Cases for Each Browser:
1. Page loads correctly
2. Styles render properly
3. Forms work
4. AJAX requests succeed
5. Export functions work
6. Console shows no errors

---

## Testing Checklist Summary

### Backend Tests
- [x] Server starts successfully
- [x] Health check returns correct status
- [x] Can generate task plan
- [x] Handles goals with deadline
- [x] Handles goals without deadline
- [x] Error handling works
- [x] Database saves goals
- [x] Database saves tasks
- [x] Can retrieve goals
- [x] Can retrieve tasks

### Frontend Tests
- [x] UI loads correctly
- [x] Form submission works
- [x] Loading states display
- [x] Results render properly
- [x] View switching works
- [x] Examples modal works
- [x] Export to JSON works
- [x] Export to CSV works
- [x] Print function works
- [x] Error messages display
- [x] Responsive on mobile
- [x] Responsive on tablet
- [x] Responsive on desktop

### Integration Tests
- [x] Complete user journey successful
- [x] Multiple requests handled
- [x] Large inputs processed
- [x] Database persistence works
- [x] Export contains correct data

### Performance Tests
- [x] Response time acceptable
- [x] No memory leaks
- [x] Multiple concurrent users (if applicable)

---

## Final Pre-Demo Checklist

Before recording your demo video:

1. **Code Quality**
   - [x] All files saved
   - [x] No console errors
   - [x] No TODO comments in final code
   - [x] Code is commented

2. **Configuration**
   - [x] .env file configured
   - [x] API key valid
   - [x] Database initialized

3. **Documentation**
   - [x] README complete
   - [x] Installation instructions clear
   - [x] API documentation accurate

4. **Testing**
   - [x] All tests passed
   - [x] No known bugs
   - [x] Error handling works

5. **Demo Preparation**
   - [x] Example goals prepared
   - [x] Browser tabs ready
   - [x] Recording software tested
   - [x] Demo script reviewed

---

## Troubleshooting Test Failures

### If Health Check Fails:
```powershell
# Check if server is running
Get-Process python

# Check API key
Get-Content .env | Select-String "GEMINI_API_KEY"

# Restart server
```

### If Task Generation Fails:
```powershell
# Check API key validity
# Visit https://makersuite.google.com/app/apikey

# Check internet connection
Test-NetConnection google.com

# Check server logs in terminal
```

### If Database Errors Occur:
```powershell
# Delete and recreate database
Remove-Item tasks.db -ErrorAction SilentlyContinue
python app.py  # Will recreate
```

### If Frontend Doesn't Load:
```powershell
# Clear browser cache
# Hard refresh: Ctrl+Shift+R

# Check console (F12)
# Look for error messages
```

---

## Test Results Template

```
TESTING REPORT - Smart Task Planner
Date: _______________
Tester: _______________

BACKEND TESTS
✅ Server startup: PASS
✅ Health check: PASS
✅ Task generation: PASS
✅ Error handling: PASS
✅ Database: PASS

FRONTEND TESTS
✅ UI load: PASS
✅ Form submission: PASS
✅ View switching: PASS
✅ Export functions: PASS
✅ Responsive design: PASS

INTEGRATION TESTS
✅ User journey: PASS
✅ Performance: PASS

OVERALL STATUS: READY FOR DEMO ✅
```

---

## Automated Testing Script

Save this as `test_all.ps1`:

```powershell
Write-Host "🧪 Running Smart Task Planner Tests..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "[1/5] Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
    if ($health.status -eq "healthy") {
        Write-Host "✅ PASS" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ FAIL - Server not running?" -ForegroundColor Red
}

# Test 2: Task Generation
Write-Host "[2/5] Testing Task Generation..." -ForegroundColor Yellow
try {
    $body = @{ goal = "Test goal" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/plan" -Method Post -Body $body -ContentType "application/json"
    if ($response.success) {
        Write-Host "✅ PASS" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ FAIL" -ForegroundColor Red
}

# Test 3: Goals Retrieval
Write-Host "[3/5] Testing Goals Retrieval..." -ForegroundColor Yellow
try {
    $goals = Invoke-RestMethod -Uri "http://localhost:5000/api/goals" -Method Get
    Write-Host "✅ PASS" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL" -ForegroundColor Red
}

# Test 4: Examples Endpoint
Write-Host "[4/5] Testing Examples..." -ForegroundColor Yellow
try {
    $examples = Invoke-RestMethod -Uri "http://localhost:5000/api/example" -Method Get
    if ($examples.success) {
        Write-Host "✅ PASS" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ FAIL" -ForegroundColor Red
}

# Test 5: UI Load
Write-Host "[5/5] Testing UI Load..." -ForegroundColor Yellow
try {
    $ui = Invoke-WebRequest -Uri "http://localhost:5000" -UseBasicParsing
    if ($ui.StatusCode -eq 200) {
        Write-Host "✅ PASS" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ FAIL" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ All tests completed!" -ForegroundColor Green
```

Run with: `.\test_all.ps1`

---

**You're now fully prepared for comprehensive testing!** 🎉

Follow this guide before your demo to ensure everything works perfectly.
