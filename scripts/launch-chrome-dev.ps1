# Chrome Development Mode Launcher (PowerShell)
# This script launches Chrome with developer-friendly flags and settings

param(
    [string]$targetUrl = "http://localhost:3000"
)

# Chrome application paths for Windows
$chromePaths = @(
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "${env:LOCALAPPDATA}\Google\Chrome\Application\chrome.exe"
)

# Find Chrome installation
$chromePath = $null
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $chromePath = $path
        break
    }
}

if (-not $chromePath) {
    Write-Host "❌ Chrome not found in standard installation directories" -ForegroundColor Red
    Write-Host "Please install Google Chrome or update the script with the correct path" -ForegroundColor Yellow
    exit 1
}

# Chrome development flags
$chromeFlags = @(
    "--disable-web-security",
    "--disable-features=VizDisplayCompositor",
    "--allow-running-insecure-content",
    "--disable-same-origin-policy",
    "--auto-open-devtools-for-tabs",
    "--enable-logging",
    "--log-level=0",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--aggressive-cache-discard",
    "--memory-pressure-off",
    "--ignore-certificate-errors",
    "--ignore-ssl-errors",
    "--user-data-dir=$env:TEMP\chrome-dev-profile",
    "--new-window",
    "--window-size=1400,1000",
    "--window-position=100,100"
)

Write-Host "🚀 Launching Chrome in Development Mode..." -ForegroundColor Green
Write-Host "📍 Target URL: $targetUrl" -ForegroundColor Cyan
Write-Host "🛠️  Development flags enabled:" -ForegroundColor Yellow
Write-Host "   - Auto-open DevTools" -ForegroundColor Gray
Write-Host "   - Disable web security" -ForegroundColor Gray
Write-Host "   - Separate dev profile" -ForegroundColor Gray
Write-Host "   - Enhanced logging" -ForegroundColor Gray
Write-Host "   - Performance optimizations" -ForegroundColor Gray
Write-Host ""

# Launch Chrome with development flags
$arguments = $chromeFlags + $targetUrl
$process = Start-Process -FilePath $chromePath -ArgumentList $arguments -PassThru

Write-Host "✅ Chrome launched with PID: $($process.Id)" -ForegroundColor Green
Write-Host "🔧 DevTools should open automatically" -ForegroundColor Cyan
Write-Host "🗂️  Using temporary profile: $env:TEMP\chrome-dev-profile" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   - Press F12 to toggle DevTools if not auto-opened" -ForegroundColor Gray
Write-Host "   - Use Ctrl+Shift+C for element inspector" -ForegroundColor Gray
Write-Host "   - Network throttling available in DevTools > Network tab" -ForegroundColor Gray
Write-Host "   - Application tab shows localStorage, cookies, and more" -ForegroundColor Gray
Write-Host ""
Write-Host "To kill this Chrome instance, run: Stop-Process -Id $($process.Id)" -ForegroundColor Magenta