# Smart Task Planner - Automated Setup Script for Windows
# Run this script in PowerShell to set up the project

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Smart Task Planner - Setup Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Python installation
Write-Host "[1/6] Checking Python installation..." -ForegroundColor Yellow
$pythonCheck = python --version 2>&1
if ($LASTEXITCODE -ne 0 -or $null -eq $pythonCheck) {
    Write-Host "✗ Python not found. Please install Python 3.8 or higher." -ForegroundColor Red
    Write-Host "Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Python found: $pythonCheck" -ForegroundColor Green

# Step 2: Create virtual environment
Write-Host ""
Write-Host "[2/6] Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "Virtual environment already exists. Skipping..." -ForegroundColor Yellow
}
else {
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

# Step 3: Activate virtual environment
Write-Host ""
Write-Host "[3/6] Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
Write-Host "✓ Virtual environment activated" -ForegroundColor Green

# Step 4: Install dependencies
Write-Host ""
Write-Host "[4/6] Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Step 5: Setup environment variables
Write-Host ""
Write-Host "[5/6] Setting up environment variables..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host ".env file already exists. Skipping..." -ForegroundColor Yellow
}
else {
    Copy-Item .env.example .env
    Write-Host "✓ .env file created from template" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Please edit .env and add your Gemini API key!" -ForegroundColor Red
    Write-Host "   Get your API key from: https://makersuite.google.com/app/apikey" -ForegroundColor Yellow
}

# Step 6: Verify installation
Write-Host ""
Write-Host "[6/6] Verifying installation..." -ForegroundColor Yellow
$requiredDirs = @("templates", "static")
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "✓ $dir directory found" -ForegroundColor Green
    }
    else {
        Write-Host "✗ $dir directory missing" -ForegroundColor Red
    }
}

# Final instructions
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file and add your GEMINI_API_KEY" -ForegroundColor White
Write-Host "2. Run: python app.py" -ForegroundColor White
Write-Host "3. Open: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see README.md" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to open .env file
$response = Read-Host "Do you want to open .env file now to add your API key? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    notepad .env
}

Write-Host ""
Write-Host "Happy planning! 🚀" -ForegroundColor Green
