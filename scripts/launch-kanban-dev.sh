#!/bin/bash

# Kanban Board Development Launcher
# This script launches Chrome optimized for Kanban board development

# Kanban board URL
KANBAN_URL="http://localhost:3000/kanban"

# Check if Next.js dev server is running
check_dev_server() {
    if curl -s "$KANBAN_URL" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

echo "🎯 Launching Kanban Board Development Environment..."

# Check if dev server is running
if ! check_dev_server; then
    echo "⚠️  Next.js dev server not detected on port 3000"
    echo "🚀 Starting Next.js development server..."
    
    # Start the dev server in background
    npm run dev &
    DEV_SERVER_PID=$!
    
    echo "⏳ Waiting for dev server to start..."
    
    # Wait for dev server to be ready (max 30 seconds)
    for i in {1..30}; do
        if check_dev_server; then
            echo "✅ Dev server is ready!"
            break
        fi
        
        if [ $i -eq 30 ]; then
            echo "❌ Dev server failed to start within 30 seconds"
            echo "Please check for errors and try again"
            exit 1
        fi
        
        sleep 1
    done
else
    echo "✅ Dev server is already running"
fi

echo ""
echo "🔧 Launching Chrome with Kanban-specific optimizations..."

# Launch Chrome with the main dev script, targeting Kanban URL
./scripts/launch-chrome-dev.sh "$KANBAN_URL"

echo ""
echo "🎨 Kanban Board Development Tips:"
echo "   - Use DevTools > Application > Local Storage to inspect saved data"
echo "   - Network tab shows API calls and asset loading"
echo "   - Console tab displays React/Next.js errors and logs"
echo "   - Elements tab for inspecting drag-and-drop styling"
echo "   - Sources tab for debugging TypeScript/React code"
echo ""
echo "🔄 To restart dev server: npm run dev"
echo "🧹 To reset Kanban data: Clear localStorage in DevTools"