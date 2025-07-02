@echo off
echo.
echo ========================================
echo   SecurGeek YouTube Resume Uploader
echo ========================================
echo.
echo This will upload the remaining videos that haven't been uploaded yet.
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

REM Check if required files exist
if not exist "client_secrets.json" (
    echo ERROR: client_secrets.json not found
    echo Please ensure you have downloaded your OAuth credentials
    pause
    exit /b 1
)

if not exist "youtube_resume_uploader.py" (
    echo ERROR: youtube_resume_uploader.py not found
    pause
    exit /b 1
)

REM Install requirements if needed
if exist "requirements.txt" (
    echo Installing/updating Python dependencies...
    pip install -r requirements.txt --quiet
    if errorlevel 1 (
        echo WARNING: Some dependencies might not have installed correctly
        echo Continuing anyway...
    )
)

echo.
echo Starting YouTube resume upload process...
echo.

REM Run the uploader
python youtube_resume_uploader.py

REM Check exit code
if errorlevel 1 (
    echo.
    echo ========================================
    echo           UPLOAD FAILED
    echo ========================================
    echo.
    echo Possible reasons:
    echo - Daily upload limit reached (try again tomorrow)
    echo - Authentication issues
    echo - Network connectivity problems
    echo - Invalid video files
    echo.
    echo Check the error messages above for details.
) else (
    echo.
    echo ========================================
    echo         UPLOAD SUCCESSFUL
    echo ========================================
    echo.
    echo Your remaining videos have been uploaded to YouTube!
    echo Check upload_results.json for video IDs and URLs.
    echo.
)

echo.
echo Press any key to exit...
pause >nul 