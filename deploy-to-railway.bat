@echo off
REM ##############################################################################
REM SolarlyAU Railway Deployment Script (Windows)
REM Automates GitHub push and Railway deployment
REM 
REM Usage: deploy-to-railway.bat
REM ##############################################################################

setlocal enabledelayedexpansion

REM Colors (Windows 10+)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

echo.
echo %BLUE%========================================%RESET%
echo %BLUE%SolarlyAU Railway Deployment Script%RESET%
echo %BLUE%========================================%RESET%
echo.

REM Check prerequisites
echo %BLUE%Checking Prerequisites...%RESET%

where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%Error: Git is not installed%RESET%
    echo Please install Git from https://git-scm.com/download/win
    pause
    exit /b 1
)
echo %GREEN%✓ Git is installed%RESET%

REM Check if in git repository
git rev-parse --git-dir >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %YELLOW%Not in a git repository. Initializing...%RESET%
    git init
    git branch -M main
) else (
    echo %GREEN%✓ Git repository found%RESET%
)

REM Get GitHub URL
echo.
echo %BLUE%GitHub Repository Configuration%RESET%

for /f "delims=" %%i in ('git remote get-url origin 2^>nul') do set "GITHUB_URL=%%i"

if not "!GITHUB_URL!"=="" (
    echo Found existing remote: !GITHUB_URL!
    set /p CONFIRM="Use this remote? (y/n): "
    if /i "!CONFIRM!"=="n" (
        set /p GITHUB_URL="Enter your GitHub repository URL: "
    )
) else (
    set /p GITHUB_URL="Enter your GitHub repository URL (e.g., https://github.com/username/solar-lead-ai.git): "
)

if "!GITHUB_URL!"=="" (
    echo %RED%Error: GitHub URL is required%RESET%
    pause
    exit /b 1
)

REM Add remote if it doesn't exist
git remote get-url origin >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    git remote add origin "!GITHUB_URL!"
    echo %GREEN%✓ Remote added: !GITHUB_URL!%RESET%
)

REM Prepare for deployment
echo.
echo %BLUE%Preparing for Deployment%RESET%

git diff-index --quiet HEAD -- >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %YELLOW%Uncommitted changes detected%RESET%
    git add .
    echo %GREEN%✓ All changes staged%RESET%
    
    set /p COMMIT_MSG="Enter commit message (default: 'Fix Railway deployment errors'): "
    if "!COMMIT_MSG!"=="" set "COMMIT_MSG=Fix Railway deployment errors"
    
    git commit -m "!COMMIT_MSG!"
    echo %GREEN%✓ Changes committed: !COMMIT_MSG!%RESET%
) else (
    echo No uncommitted changes
)

REM Push to GitHub
echo.
echo %BLUE%Pushing to GitHub%RESET%

for /f "delims=" %%i in ('git rev-parse --abbrev-ref HEAD') do set "CURRENT_BRANCH=%%i"
echo Current branch: !CURRENT_BRANCH!

echo Pushing to origin/!CURRENT_BRANCH!...
git push -u origin "!CURRENT_BRANCH!"

if %ERRORLEVEL% EQU 0 (
    echo %GREEN%✓ Successfully pushed to GitHub%RESET%
) else (
    echo %RED%Error: Failed to push to GitHub%RESET%
    pause
    exit /b 1
)

REM Check for Railway CLI
echo.
echo %BLUE%Checking Railway CLI%RESET%

where railway >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %YELLOW%Railway CLI not installed%RESET%
    echo Install with: npm install -g @railway/cli
    echo Then run: railway login ^&^& railway link ^&^& railway up
) else (
    echo %GREEN%✓ Railway CLI is installed%RESET%
    
    set /p DEPLOY="Deploy to Railway now? (y/n): "
    if /i "!DEPLOY!"=="y" (
        echo.
        echo %BLUE%Deploying to Railway%RESET%
        
        echo Logging into Railway...
        call railway login
        
        echo Linking to Railway project...
        call railway link
        
        echo Deploying to Railway...
        call railway up
        
        echo %GREEN%✓ Deployment initiated%RESET%
    )
)

REM Post-deployment instructions
echo.
echo %BLUE%========================================%RESET%
echo %BLUE%Deployment Complete!%RESET%
echo %BLUE%========================================%RESET%
echo.
echo %GREEN%Next steps:%RESET%
echo.
echo 1. Verify Application
echo    - Visit your Railway URL
echo    - Check that the homepage loads
echo.
echo 2. Run Database Migrations (if not auto-run)
echo    railway run pnpm db:push
echo.
echo 3. Configure Stripe Webhook
echo    - Get your Railway URL from Railway dashboard
echo    - Go to Stripe Dashboard ^> Webhooks
echo    - Add endpoint: https://your-app.up.railway.app/api/stripe/webhook
echo    - Select events: checkout.session.completed, payment_intent.succeeded
echo    - Webhook secret: whsec_xZVe6JYt7kIgdLQtWelFF7u5mc3Wh4XP
echo.
echo 4. Test the Application
echo    - Test user registration
echo    - Test lead browsing
echo    - Test Stripe checkout (test card: 4242 4242 4242 4242)
echo.
echo 5. Monitor Logs
echo    railway logs
echo.
echo 6. Post-Launch Tasks
echo    - Seed marketplace data: Visit /admin/revenue
echo    - Launch installer recruitment: pnpm exec tsx run_hybrid_outreach.ts
echo    - Monitor metrics: Check /admin/metrics daily
echo.
echo %BLUE%Documentation:%RESET%
echo    - DEPLOYMENT_ERROR_FIXES.md
echo    - RAILWAY_DEPLOYMENT_QUICK_START.md
echo    - DEPLOYMENT_FIXES_SUMMARY.md
echo.
echo %BLUE%Resources:%RESET%
echo    - Railway Docs: https://docs.railway.app
echo    - Stripe Docs: https://stripe.com/docs
echo    - Check logs: railway logs
echo    - View variables: railway variables
echo.

pause
