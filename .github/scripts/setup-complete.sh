#!/bin/bash

# DocketChief Setup Master Script
# Guides you through the complete setup process

echo "🚀 DocketChief Complete Setup Guide"
echo "===================================="
echo ""

echo "This script will guide you through setting up:"
echo "1. 🔐 GitHub Secrets"
echo "2. 🌐 Netlify Deployment" 
echo "3. 📊 Monitoring & Analytics"
echo "4. ✅ Validation"
echo ""

read -p "Continue with setup? (y/n): " continue_setup
if [ "$continue_setup" != "y" ]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "📋 Prerequisites Check"
echo "====================="

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: v$NPM_VERSION"
else
    echo "❌ npm not found"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🔧 Step 1: GitHub Secrets Setup"
echo "==============================="
echo "This will help you configure repository secrets for CI/CD"
echo ""

read -p "Set up GitHub secrets? (y/n): " setup_secrets
if [ "$setup_secrets" = "y" ]; then
    if [ -f ".github/scripts/setup-github-secrets.sh" ]; then
        .github/scripts/setup-github-secrets.sh
    else
        echo "❌ GitHub secrets script not found"
    fi
fi

echo ""
echo "🌐 Step 2: Netlify Deployment"
echo "============================="
echo "This will configure Netlify deployment for your app"
echo ""

read -p "Set up Netlify deployment? (y/n): " setup_netlify
if [ "$setup_netlify" = "y" ]; then
    if [ -f ".github/scripts/setup-netlify.sh" ]; then
        .github/scripts/setup-netlify.sh
    else
        echo "❌ Netlify setup script not found"
    fi
fi

echo ""
echo "📊 Step 3: Monitoring Setup"  
echo "==========================="
echo "This will configure error tracking and monitoring"
echo ""

read -p "Set up monitoring? (y/n): " setup_monitoring
if [ "$setup_monitoring" = "y" ]; then
    if [ -f ".github/scripts/setup-monitoring.sh" ]; then
        .github/scripts/setup-monitoring.sh
    else
        echo "❌ Monitoring setup script not found"
    fi
fi

echo ""
echo "🎭 Step 4: E2E Testing"
echo "====================="
echo "Installing Playwright for end-to-end testing..."

if ! npx playwright --version &> /dev/null; then
    echo "Installing Playwright browsers..."
    npx playwright install
else
    echo "✅ Playwright already installed"
fi

echo ""
echo "✅ Step 5: Final Validation"
echo "=========================="

echo "Running build test..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful"
else
    echo "❌ Build failed - check for errors"
    echo "   Run 'npm run build' to see details"
fi

echo "Running lint check..."  
if npm run lint > /dev/null 2>&1; then
    echo "✅ Lint passed"
else
    echo "⚠️  Lint warnings found - run 'npm run lint' to see details"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📁 Files created:"
echo "   ✅ .github/workflows/ci-cd.yml (GitHub Actions)"
echo "   ✅ .github/scripts/ (Setup automation)"
echo "   ✅ playwright.config.ts (E2E testing)"
echo "   ✅ e2e/app.spec.ts (Sample tests)"
echo "   ✅ netlify.toml (Deployment config)"
echo ""
echo "🚀 Next Steps:"
echo "1. Commit and push your changes:"
echo "   git add ."
echo "   git commit -m 'Add CI/CD and monitoring setup'"
echo "   git push origin main"
echo ""
echo "2. Watch GitHub Actions run your first deployment!"
echo "   https://github.com/$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null || echo 'YOUR-USERNAME/DocketChief')/actions"
echo ""
echo "3. Monitor your application:"
echo "   - Netlify: https://app.netlify.com/"
echo "   - Sentry: https://sentry.io/ (if configured)"
echo "   - UptimeRobot: https://uptimerobot.com/ (if configured)"
echo ""
echo "📚 Documentation:"
echo "   - Secrets: .github/SECRETS_SETUP.md"
echo "   - Monitoring: .github/MONITORING_SETUP.md"  
echo "   - E2E Tests: .github/E2E_TESTING_GUIDE.md"
echo "   - CI/CD Custom: .github/CI_CD_CUSTOMIZATION.md"
echo ""
echo "🆘 Need help?"
echo "   - Run individual setup scripts in .github/scripts/"
echo "   - Check documentation files in .github/"
echo "   - Test locally: npm run build && npm run test:e2e"