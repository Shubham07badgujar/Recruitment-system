@echo off
echo Starting Recruitment System...

:: Start AI Service in a new window
start cmd /k "cd ai-service && start.bat"

:: Wait for a moment to allow AI service to start
timeout /t 5

:: Start Express Backend in this window
cd backend && start.bat
