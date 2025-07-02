@echo off
echo.
echo ========================================
echo   SecurGeek YouTube Auto Uploader
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo 📋 Please install Python 3.7+ from https://python.org
    pause
    exit /b 1
)

REM Check if requirements are installed
echo 📦 Checking dependencies...
python -c "import googleapiclient" >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing required packages...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if video folder exists
if not exist "C:\CyberSecurityCourses\Edited Videos" (
    echo ❌ Video folder not found: C:\CyberSecurityCourses\Edited Videos
    echo 📋 Please create the folder and add your videos (1.1.1, 1.1.2, 1.2.1, 1.2.2, etc.)
    pause
    exit /b 1
)

REM Check if credentials file exists
if not exist "client_secrets.json" (
    echo ❌ client_secrets.json not found
    echo 📋 Please download OAuth credentials from Google Cloud Console
    echo 📋 See YOUTUBE_SETUP_INSTRUCTIONS.md for detailed steps
    pause
    exit /b 1
)

echo ✅ All checks passed!
echo.
echo 🚀 Starting YouTube uploader...
echo.

REM Run the uploader
python youtube_auto_uploader.py

echo.
echo 📋 Upload completed! Check the output above for results.
pause 