# Finalize Baseline and Push to GitHub
# Run this after completing manual edits and testing

$ErrorActionPreference = "Stop"

Write-Host "========================================"
Write-Host "  FINALIZE BASELINE & PUSH TO GITHUB"
Write-Host "========================================"
Write-Host ""

# Verify in correct folder
$CurrentPath = Get-Location
if (-not $CurrentPath.Path.EndsWith("ShopQuanAo-Clean")) {
    Write-Host "[ERROR] Must run from ShopQuanAo-Clean folder" -ForegroundColor Red
    Write-Host "Current: $CurrentPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Verifying manual edits..." -ForegroundColor Yellow

# Check deleted files
$errors = @()

if (Test-Path "be\src\controllers\GoogleAuthController.js") {
    $errors += "GoogleAuthController.js still exists"
}

if (Test-Path "be\src\controllers\VNPayController.js") {
    $errors += "VNPayController.js still exists"
}

if (Test-Path "be\src\configs\vnpayConfig.js") {
    $errors += "vnpayConfig.js still exists"
}

if (Test-Path "be\src\routes\vnpay.js") {
    $errors += "vnpay.js still exists"
}

if (Test-Path "fe-landing\services\vnpayService.js") {
    $errors += "vnpayService.js still exists"
}

# Check imports removed
$customerJs = Get-Content "be\src\routes\customer.js" -Raw
if ($customerJs -match "GoogleAuthController") {
    $errors += "customer.js still has GoogleAuthController"
}

$indexJs = Get-Content "be\src\routes\index.js" -Raw
if ($indexJs -match "vnpay") {
    $errors += "index.js still has vnpay route"
}

$cartJsx = Get-Content "fe-landing\pages\cart.jsx" -Raw
if ($cartJsx -match "vnpayService") {
    $errors += "cart.jsx still has vnpayService import"
}

if ($errors.Count -gt 0) {
    Write-Host "[ERROR] Manual edits not complete:" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host "  - $err" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Please complete all edits first" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] All manual edits verified" -ForegroundColor Green
Write-Host ""

# Step 2: Initialize Git
Write-Host "Step 2: Initializing Git repository..." -ForegroundColor Yellow

git init
git branch -M main

Write-Host "[OK] Git initialized" -ForegroundColor Green
Write-Host ""

# Step 3: Commit baseline
Write-Host "Step 3: Committing baseline code..." -ForegroundColor Yellow

git add .

git commit -m "chore: Initial baseline project

Project: ShopQuanAo - E-commerce Clothing Store
Sprint: 06/10 - 09/10 (4 days)
Team: Huy (Backend), Han (Frontend), Nghia (Integration)

Technology Stack:
- Backend: NodeJS + Express + Sequelize + MySQL
- Frontend Landing: NextJS + Zustand + Ant Design + React Hook Form
- Frontend Portal: NextJS Admin Panel
- Authentication: JWT (access token + refresh token)

Features Included:
- Product management (catalog, colors, sizes, variants)
- Order management (COD payment)
- Customer authentication (email/password)
- Customer profile management
- Shopping cart functionality
- Order history and tracking
- Product reviews and feedback

Features to be Implemented in Sprint:
- Epic 1: Google OAuth 2.0 Authentication
- Epic 2: VNPay Payment Gateway Integration

Database:
- MySQL with tables: users, customer_infos, orders, products, variants, etc.

Note: This baseline does NOT include Google Auth and VNPay features.
These will be developed incrementally during the sprint."

Write-Host "[OK] Baseline committed" -ForegroundColor Green
Write-Host ""

# Step 4: Add remote and push
Write-Host "Step 4: Pushing to GitHub..." -ForegroundColor Yellow

$RepoUrl = "https://github.com/huynguyen1911/NewShopQuanAo.git"

git remote add origin $RepoUrl

Write-Host "  Pushing to main branch..." -ForegroundColor Gray
git push -u origin main

Write-Host "[OK] Pushed to GitHub" -ForegroundColor Green
Write-Host ""

# Step 5: Create dev branch
Write-Host "Step 5: Creating dev branch..." -ForegroundColor Yellow

git checkout -b dev
git push -u origin dev
git checkout main

Write-Host "[OK] Dev branch created" -ForegroundColor Green
Write-Host ""

# Step 6: Instructions for backup branch
Write-Host "========================================"
Write-Host "  SUCCESS - BASELINE READY!"
Write-Host "========================================"
Write-Host ""
Write-Host "Repository: $RepoUrl" -ForegroundColor Cyan
Write-Host "Branches:" -ForegroundColor Cyan
Write-Host "  - main: Baseline code (current)" -ForegroundColor White
Write-Host "  - dev: Development branch" -ForegroundColor White
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Create backup branch on OLD repo:" -ForegroundColor Cyan
Write-Host "   cd D:\HUTECH\ccptpm\ShopQuanAo" -ForegroundColor Gray
Write-Host "   git checkout -b backup/sprint1-features" -ForegroundColor Gray
Write-Host "   git push origin backup/sprint1-features" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Team members clone BOTH repos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   # New repo (for development)" -ForegroundColor White
Write-Host "   git clone $RepoUrl" -ForegroundColor Gray
Write-Host "   cd NewShopQuanAo" -ForegroundColor Gray
Write-Host "   git checkout dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Old repo (for reference - replace with actual URL)" -ForegroundColor White
Write-Host "   git clone <OLD-REPO-URL> ShopQuanAo-Reference" -ForegroundColor Gray
Write-Host "   cd ShopQuanAo-Reference" -ForegroundColor Gray
Write-Host "   git checkout backup/sprint1-features" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start pushing features per timeline:" -ForegroundColor Cyan
Write-Host "   Day 1 (06/10): Database migrations" -ForegroundColor White
Write-Host "   Day 2 (07/10): Backend controllers + config" -ForegroundColor White
Write-Host "   Day 3 (08/10): Payment callbacks + frontend services" -ForegroundColor White
Write-Host "   Day 4 (09/10): Frontend UI + final integration" -ForegroundColor White
Write-Host ""
Write-Host "Folders:" -ForegroundColor Yellow
Write-Host "  - ShopQuanAo-Clean: Connected to NEW GitHub repo" -ForegroundColor White
Write-Host "  - ShopQuanAo-Reference: Backup with full features" -ForegroundColor White
Write-Host ""
Write-Host "Good luck with the sprint! 🚀" -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to exit"
