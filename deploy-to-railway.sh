#!/bin/bash

##############################################################################
# SolarlyAU Railway Deployment Script
# Automates GitHub push and Railway deployment
# 
# Usage: bash deploy-to-railway.sh
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    print_success "Git is installed"
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_warning "Not in a git repository. Initializing..."
        git init
        git branch -M main
    else
        print_success "Git repository found"
    fi
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Install with: npm install -g @railway/cli"
        print_info "You can still push to GitHub, but Railway deployment requires Railway CLI"
    else
        print_success "Railway CLI is installed"
    fi
}

# Get GitHub repository URL
get_github_url() {
    print_header "GitHub Repository Configuration"
    
    # Check if remote already exists
    if git remote get-url origin &> /dev/null; then
        GITHUB_URL=$(git remote get-url origin)
        print_success "Found existing remote: $GITHUB_URL"
        read -p "Use this remote? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter your GitHub repository URL: " GITHUB_URL
        fi
    else
        read -p "Enter your GitHub repository URL (e.g., https://github.com/username/solar-lead-ai.git): " GITHUB_URL
    fi
    
    if [ -z "$GITHUB_URL" ]; then
        print_error "GitHub URL is required"
        exit 1
    fi
    
    # Add remote if it doesn't exist
    if ! git remote get-url origin &> /dev/null; then
        git remote add origin "$GITHUB_URL"
        print_success "Remote added: $GITHUB_URL"
    fi
}

# Prepare for deployment
prepare_deployment() {
    print_header "Preparing for Deployment"
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        print_info "Uncommitted changes detected"
        git add .
        print_success "All changes staged"
        
        read -p "Enter commit message (default: 'Fix Railway deployment errors'): " COMMIT_MSG
        COMMIT_MSG=${COMMIT_MSG:-"Fix Railway deployment errors"}
        
        git commit -m "$COMMIT_MSG"
        print_success "Changes committed: $COMMIT_MSG"
    else
        print_info "No uncommitted changes"
    fi
}

# Push to GitHub
push_to_github() {
    print_header "Pushing to GitHub"
    
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    print_info "Current branch: $CURRENT_BRANCH"
    
    print_info "Pushing to origin/$CURRENT_BRANCH..."
    git push -u origin "$CURRENT_BRANCH"
    
    print_success "Successfully pushed to GitHub"
}

# Deploy to Railway
deploy_to_railway() {
    print_header "Deploying to Railway"
    
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not installed"
        print_info "Install with: npm install -g @railway/cli"
        print_info "Then run: railway login && railway link && railway up"
        return
    fi
    
    read -p "Do you want to deploy to Railway now? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Skipping Railway deployment"
        return
    fi
    
    print_info "Logging into Railway..."
    railway login
    
    print_info "Linking to Railway project..."
    railway link
    
    print_info "Deploying to Railway..."
    railway up
    
    print_success "Deployment initiated"
}

# Verify deployment
verify_deployment() {
    print_header "Verifying Deployment"
    
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not available for verification"
        return
    fi
    
    read -p "Check Railway logs? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return
    fi
    
    print_info "Fetching Railway logs..."
    railway logs --tail 50
}

# Post-deployment instructions
post_deployment_instructions() {
    print_header "Post-Deployment Instructions"
    
    cat << 'EOF'

✅ DEPLOYMENT COMPLETE!

Next steps:

1. **Verify Application**
   - Visit your Railway URL
   - Check that the homepage loads
   - Verify no errors in logs

2. **Run Database Migrations** (if not auto-run)
   railway run pnpm db:push

3. **Configure Stripe Webhook**
   - Get your Railway URL from Railway dashboard
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: https://your-app.up.railway.app/api/stripe/webhook
   - Select events: checkout.session.completed, payment_intent.succeeded
   - Webhook secret already configured: whsec_xZVe6JYt7kIgdLQtWelFF7u5mc3Wh4XP

4. **Test the Application**
   - Test user registration
   - Test lead browsing
   - Test Stripe checkout (test card: 4242 4242 4242 4242)

5. **Monitor Logs**
   railway logs

6. **Post-Launch Tasks**
   - Seed marketplace data: Visit /admin/revenue → Seed 20 New Leads
   - Launch installer recruitment: pnpm exec tsx run_hybrid_outreach.ts
   - Monitor metrics: Check /admin/metrics daily

📚 Documentation:
   - DEPLOYMENT_ERROR_FIXES.md - Technical details
   - RAILWAY_DEPLOYMENT_QUICK_START.md - Full deployment guide
   - DEPLOYMENT_FIXES_SUMMARY.md - Summary of all fixes

🔗 Resources:
   - Railway Docs: https://docs.railway.app
   - Stripe Docs: https://stripe.com/docs
   - Check logs: railway logs
   - View variables: railway variables

EOF
}

# Main execution
main() {
    print_header "SolarlyAU Railway Deployment Script"
    print_info "Version 1.0.0"
    echo
    
    check_prerequisites
    get_github_url
    prepare_deployment
    push_to_github
    deploy_to_railway
    verify_deployment
    post_deployment_instructions
    
    print_header "Deployment Script Complete"
    print_success "Your application is being deployed to Railway!"
}

# Run main function
main
