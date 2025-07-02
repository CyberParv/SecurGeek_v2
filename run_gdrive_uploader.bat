@echo off
title SecurGeek Google Drive PDF Uploader
color 0A

echo.
echo ========================================
echo   SecurGeek Google Drive PDF Uploader
echo ========================================
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
    echo ERROR: client_secrets.json not found!
    echo Please download it from Google Cloud Console
    echo and place it in this folder
    pause
    exit /b 1
)

if not exist "gdrive_pdf_uploader.py" (
    echo ERROR: gdrive_pdf_uploader.py not found!
    pause
    exit /b 1
)

REM Check if PDF folder exists
if not exist "C:\CyberSecurityCourses\PDFs" (
    echo ERROR: PDF folder not found!
    echo Expected location: C:\CyberSecurityCourses\PDFs
    echo Please check the folder path
    pause
    exit /b 1
)

echo Starting Google Drive PDF uploader...
echo.

REM Run the uploader
python gdrive_pdf_uploader.py

REM Check if the script ran successfully
if errorlevel 1 (
    echo.
    echo ERROR: Upload script failed!
    echo Check the error messages above
) else (
    echo.
    echo Upload process completed!
)

echo.
pause 