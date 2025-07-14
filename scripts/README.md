# 🛠️ Development Scripts

This folder contains helpful scripts for development and testing.

## 🌐 Chrome Development Scripts

### `launch-chrome-dev.sh` (macOS/Linux)
Launches Chrome with developer-friendly flags and settings.

**Usage:**
```bash
# Launch with default URL (http://localhost:3000)
./scripts/launch-chrome-dev.sh

# Launch with custom URL
./scripts/launch-chrome-dev.sh http://localhost:3001/kanban

# Or use npm script
npm run dev:chrome
```

**Features:**
- ✅ Auto-opens DevTools
- ✅ Disables web security for local development
- ✅ Uses separate dev profile
- ✅ Enhanced logging and debugging
- ✅ Performance optimizations
- ✅ Custom window size and position

### `launch-chrome-dev.ps1` (Windows)
PowerShell version for Windows users.

**Usage:**
```powershell
# Default URL
.\scripts\launch-chrome-dev.ps1

# Custom URL
.\scripts\launch-chrome-dev.ps1 -targetUrl "http://localhost:3001/kanban"
```

### `launch-kanban-dev.sh` (macOS/Linux)
Specialized script for Kanban board development.

**Usage:**
```bash
# Launches dev server (if not running) + Chrome with Kanban URL
./scripts/launch-kanban-dev.sh

# Or use npm script
npm run dev:kanban
```

**Features:**
- ✅ Auto-starts Next.js dev server if not running
- ✅ Opens Chrome directly to `/kanban` route
- ✅ Includes Kanban-specific development tips
- ✅ Monitors dev server health

## 🔧 Chrome Development Flags Explained

| Flag | Purpose |
|------|---------|
| `--disable-web-security` | Allows local file access and CORS bypass |
| `--auto-open-devtools-for-tabs` | Automatically opens DevTools |
| `--disable-background-timer-throttling` | Prevents background tab throttling |
| `--user-data-dir=/tmp/chrome-dev-profile` | Uses isolated profile for development |
| `--ignore-certificate-errors` | Bypasses SSL certificate warnings |
| `--aggressive-cache-discard` | More aggressive cache clearing |

## 💡 Development Tips

### DevTools Features for Kanban Development
- **Application Tab**: Inspect localStorage data
- **Network Tab**: Monitor API calls and asset loading
- **Console Tab**: View React/Next.js errors and logs
- **Elements Tab**: Debug drag-and-drop styling
- **Sources Tab**: Debug TypeScript/React code
- **Performance Tab**: Analyze rendering performance

### Useful Keyboard Shortcuts
- `F12` - Toggle DevTools
- `Cmd+Shift+C` (Mac) / `Ctrl+Shift+C` (Windows) - Element inspector
- `Cmd+Shift+I` (Mac) / `Ctrl+Shift+I` (Windows) - Open DevTools
- `Cmd+R` (Mac) / `Ctrl+R` (Windows) - Refresh page
- `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows) - Hard refresh

## 🚀 Quick Start

1. **Start development with Kanban board:**
   ```bash
   npm run dev:kanban
   ```

2. **Start development with custom URL:**
   ```bash
   npm run dev:chrome http://localhost:3000/custom-route
   ```

3. **Manual Chrome launch:**
   ```bash
   ./scripts/launch-chrome-dev.sh
   ```

## 🔍 Troubleshooting

### Chrome not found
- **macOS**: Update `CHROME_PATH` in script to your Chrome installation
- **Windows**: Script auto-detects common installation paths
- **Linux**: Ensure `google-chrome` is in your PATH

### Dev server not starting
- Check if port 3000 is available: `lsof -i :3000`
- Kill existing processes: `kill $(lsof -t -i:3000)`
- Try alternative port: `npm run dev -- -p 3001`

### Permission denied
```bash
chmod +x scripts/*.sh
```

## 📝 Notes

- Scripts use temporary Chrome profile to avoid interfering with your main browser
- All development flags are safe for local development but should not be used in production
- Scripts automatically detect your operating system and adjust accordingly