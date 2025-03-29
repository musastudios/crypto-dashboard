#!/bin/bash

# Kill any processes running on ports 3000-3003
echo "Killing processes on ports 3000-3003..."
for port in 3000 3001 3002 3003; do 
  lsof -i :$port | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || echo "No process on port $port"
done

# Start the development server on port 3001
echo "Starting development server on port 3000..."
pnpm dev -p 3000