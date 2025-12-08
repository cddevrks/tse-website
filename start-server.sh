#!/bin/bash

# TSE Website Local Server Starter
# This script starts a local web server for the TSE website

PORT=8000
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "  TSE Website - Local Development Server"
echo "=========================================="
echo ""
echo "Starting server on port $PORT..."
echo ""

cd "$SCRIPT_DIR"

# Check if port is already in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port $PORT is already in use!"
    echo "   Killing existing process..."
    kill -9 $(lsof -t -i:$PORT)
    sleep 1
fi

# Start the server
python3 -m http.server $PORT &
SERVER_PID=$!

sleep 2

echo "✅ Server started successfully!"
echo ""
echo "📱 Access the website at:"
echo "   → http://localhost:$PORT"
echo "   → http://localhost:$PORT/index.html"
echo ""
echo "📊 View pages:"
echo "   → Home: http://localhost:$PORT/index.html"
echo "   → M.Tech Alumni: http://localhost:$PORT/past-Mtech.html"
echo "   → Dual Degree Alumni: http://localhost:$PORT/past-DualDegree.html"
echo "   → PhD Alumni: http://localhost:$PORT/past-PhD.html"
echo ""
echo "🛑 To stop the server, press Ctrl+C or run:"
echo "   kill $SERVER_PID"
echo ""
echo "Server is running (PID: $SERVER_PID)..."
echo ""

# Open browser automatically
open "http://localhost:$PORT/index.html"

# Keep the script running and wait for user to stop it
wait $SERVER_PID
