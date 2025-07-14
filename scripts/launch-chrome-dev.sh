#!/bin/bash

# Chrome Development Mode Launcher
# This script launches Chrome with developer-friendly flags and settings

# Default URL to open (can be overridden with command line argument)
DEFAULT_URL="http://localhost:3000"
TARGET_URL="${1:-$DEFAULT_URL}"

# Chrome application path (adjust based on your system)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    CHROME_PATH="google-chrome"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    CHROME_PATH="chrome.exe"
else
    echo "Unsupported operating system: $OSTYPE"
    exit 1
fi

# Chrome development flags
CHROME_FLAGS=(
    # Security and CORS
    "--disable-web-security"
    "--disable-features=VizDisplayCompositor"
    "--allow-running-insecure-content"
    "--disable-same-origin-policy"
    
    # Developer tools
    "--auto-open-devtools-for-tabs"
    "--enable-logging"
    "--log-level=0"
    
    # Performance and debugging
    "--disable-background-timer-throttling"
    "--disable-backgrounding-occluded-windows"
    "--disable-renderer-backgrounding"
    "--disable-extensions-except"
    "--disable-component-extensions-with-background-pages"
    
    # Memory and cache
    "--aggressive-cache-discard"
    "--memory-pressure-off"
    
    # Network and connectivity
    "--ignore-certificate-errors"
    "--ignore-ssl-errors"
    "--ignore-certificate-errors-spki-list"
    
    # User data directory (separate profile for development)
    "--user-data-dir=/tmp/chrome-dev-profile"
    
    # Window settings
    "--new-window"
    "--window-size=1400,1000"
    "--window-position=100,100"
)

echo "🚀 Launching Chrome in Development Mode..."
echo "📍 Target URL: $TARGET_URL"
echo "🛠️  Development flags enabled:"
echo "   - Auto-open DevTools"
echo "   - Disable web security"
echo "   - Separate dev profile"
echo "   - Enhanced logging"
echo "   - Performance optimizations"
echo ""

# Check if Chrome is installed
if [[ "$OSTYPE" == "darwin"* ]] && [[ ! -f "$CHROME_PATH" ]]; then
    echo "❌ Chrome not found at $CHROME_PATH"
    echo "Please install Google Chrome or update the CHROME_PATH variable"
    exit 1
fi

# Launch Chrome with development flags
if [[ "$OSTYPE" == "darwin"* ]]; then
    "$CHROME_PATH" "${CHROME_FLAGS[@]}" "$TARGET_URL" &
else
    $CHROME_PATH "${CHROME_FLAGS[@]}" "$TARGET_URL" &
fi

# Get the process ID
CHROME_PID=$!

echo "✅ Chrome launched with PID: $CHROME_PID"
echo "🔧 DevTools should open automatically"
echo "🗂️  Using temporary profile: /tmp/chrome-dev-profile"
echo ""
echo "💡 Tips:"
echo "   - Press F12 to toggle DevTools if not auto-opened"
echo "   - Use Cmd+Shift+C (Mac) or Ctrl+Shift+C (Windows/Linux) for element inspector"
echo "   - Network throttling available in DevTools > Network tab"
echo "   - Application tab shows localStorage, cookies, and more"
echo ""
echo "To kill this Chrome instance, run: kill $CHROME_PID"