#!/bin/bash
echo "Starting Recruitment System..."

# Start AI Service in the background
(cd ai-service && ./start.sh) &

# Wait for a moment to allow AI service to start
sleep 5

# Start Express Backend
cd backend && ./start.sh
