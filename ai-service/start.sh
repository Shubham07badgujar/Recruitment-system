#!/bin/bash
echo "Starting AI Microservices..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python is not installed. Please install Python 3.8+."
    exit 1
fi

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Start the FastAPI server
echo "Starting FastAPI server..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Deactivate virtual environment on exit
deactivate
