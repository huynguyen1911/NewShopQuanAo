# Setup Baseline Project
# Run this script to create clean baseline

$ErrorActionPreference = "Stop"

Write-Host "========================================"
Write-Host "  SETUP BASELINE PROJECT"
Write-Host "========================================"
Write-Host ""

# Step 1: Copy folders
Write-Host "Step 1: Copying project..." -ForegroundColor Yellow

$SourceFolder = "D:\HUTECH\ccptpm\ShopQuanAo"
$CleanFolder = "D:\HUTECH\ccptpm\ShopQuanAo-Clean"
$BackupFolder = "D:\HUTECH\ccptpm\ShopQuanAo-Reference"

if (-not (Test-Path $SourceFolder)) {
    Write-Host "ERROR: Source folder not found!" -ForegroundColor Red
    exit 1
}

if (Test-Path $CleanFolder) {
    Write-Host "Removing existing Clean folder..." -ForegroundColor Yellow
    Remove-Item -Path $CleanFolder -Recurse -Force
}

Copy-Item -Path $SourceFolder -Destination $CleanFolder -Recurse
Write-Host "[OK] Copied to ShopQuanAo-Clean" -ForegroundColor Green

if (-not (Test-Path $BackupFolder)) {
    Copy-Item -Path $SourceFolder -Destination $BackupFolder -Recurse
    Write-Host "[OK] Created backup folder" -ForegroundColor Green
}

Write-Host ""

# Step 2: Remove old .git
Write-Host "Step 2: Removing old .git..." -ForegroundColor Yellow

Set-Location $CleanFolder
$GitFolder = Join-Path $CleanFolder ".git"
if (Test-Path $GitFolder) {
    Remove-Item -Path $GitFolder -Recurse -Force
    Write-Host "[OK] Removed .git" -ForegroundColor Green
}

Write-Host ""

# Step 3: Remove feature files
Write-Host "Step 3: Removing feature files..." -ForegroundColor Yellow

$FilesToRemove = @(
    "be\src\controllers\GoogleAuthController.js",
    "be\src\controllers\VNPayController.js",
    "be\src\configs\vnpayConfig.js",
    "be\src\routes\vnpay.js",
    "be\data\add_google_auth_fields.sql",
    "be\data\add_payment_fields.sql",
    "fe-landing\services\vnpayService.js",
    "fe-landing\pages\payment\vnpay-return.jsx"
)

$RemovedCount = 0
foreach ($file in $FilesToRemove) {
    $fullPath = Join-Path $CleanFolder $file
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Write-Host "[OK] Removed: $file" -ForegroundColor Green
        $RemovedCount++
    }
}

Write-Host "Removed $RemovedCount files" -ForegroundColor Green
Write-Host ""

# Step 4: Create .gitignore
Write-Host "Step 4: Creating .gitignore..." -ForegroundColor Yellow

$GitignoreContent = @"
node_modules/
.env
.env.local
.vscode/
.idea/
.next/
dist/
build/
.DS_Store
Thumbs.db
"@

$GitignorePath = Join-Path $CleanFolder ".gitignore"
$GitignoreContent | Out-File -FilePath $GitignorePath -Encoding UTF8
Write-Host "[OK] Created .gitignore" -ForegroundColor Green
Write-Host ""

# Step 5: Create manual edits checklist
Write-Host "Step 5: Creating manual edits checklist..." -ForegroundColor Yellow

$ChecklistContent = @"
MANUAL EDITS CHECKLIST
======================

Edit these files manually:

1. be/src/routes/customer.js
   - Remove: const GoogleAuthController = require...
   - Remove: router.post('/google-login'...)

2. be/src/routes/index.js
   - Remove: const vnpay = require...
   - Remove: server.use('/api/vnpay'...)

3. be/src/models/user.js
   - Remove: google_id field

4. be/src/models/customer_info.js
   - Remove: avatar field

5. be/src/models/order.js
   - Remove: payment_method and payment_status fields

6. fe-landing/components/login.jsx
   - Remove all Google login code

7. fe-landing/pages/_app.jsx
   - Remove GoogleOAuthProvider wrapper

8. be/package.json
   - Remove: google-auth-library

9. fe-landing/package.json
   - Remove: @react-oauth/google

After editing:
- cd be && npm install && npm start
- cd fe-landing && npm install && npm run dev
- Run: .\finalize-baseline.ps1
"@

$ChecklistPath = Join-Path $CleanFolder "MANUAL-EDITS.txt"
$ChecklistContent | Out-File -FilePath $ChecklistPath -Encoding UTF8
Write-Host "[OK] Created MANUAL-EDITS.txt" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "========================================"
Write-Host "  SETUP COMPLETE!"
Write-Host "========================================"
Write-Host ""
Write-Host "Created folders:" -ForegroundColor Cyan
Write-Host "  - ShopQuanAo-Clean (working)"
Write-Host "  - ShopQuanAo-Reference (backup)"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. cd ShopQuanAo-Clean"
Write-Host "2. Open MANUAL-EDITS.txt"
Write-Host "3. Edit the 9 files listed"
Write-Host "4. Test: npm install && npm start"
Write-Host "5. Run: .\finalize-baseline.ps1"
Write-Host ""

Read-Host "Press Enter to continue"
