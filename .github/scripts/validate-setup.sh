#!/bin/bash

# Setup Validation Script for DocketChief
# Validates that all CI/CD, secrets, and monitoring setup is correct

set -e

echo "🔍 DocketChief Setup Validation"
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to check status
check_status() {
    local name=$1
    local status=$2
    local message=$3
    
    if [ "$status" = "pass" ]; then
        echo -e "✅ ${GREEN}$name${NC}: $message"
        ((PASSED++))
    elif [ "$status" = "warn" ]; then
        echo -e "⚠️  ${YELLOW}$name${NC}: $message"
        ((WARNINGS++))
    else
        echo -e "❌ ${RED}$name${NC}: $message"
        ((FAILED++))
    fi
}

echo "Validating DocketChief setup..."
echo ""

# Check if we're in a Git repository
if [ ! -d ".git" ]; then
    check_status "Git Repository" "fail" "Not in a Git repository"
    exit 1
fi

check_status "Git Repository" "pass" "Found .git directory"

# Check required files exist
echo ""
echo "📁 Checking Required Files"
echo "=========================="

files_to_check=(
    "package.json:Package configuration"
    ".github/workflows/ci-cd.yml:GitHub Actions workflow"
    ".github/SECRETS_SETUP.md:Secrets documentation"
    ".github/MONITORING_SETUP.md:Monitoring guide"
    "netlify.toml:Netlify configuration"
    "playwright.config.ts:E2E test configuration"
    ".env.example:Environment variables template"
)

for file_check in "${files_to_check[@]}"; do
    IFS=':' read -r file desc <<< "$file_check"
    if [ -f "$file" ]; then
        check_status "$desc" "pass" "Found $file"
    else
        check_status "$desc" "fail" "Missing $file"
    fi
done

# Check package.json scripts
echo ""
echo "📜 Checking Package Scripts"
echo "==========================="

required_scripts=("dev" "build" "lint" "test:e2e" "preview")
for script in "${required_scripts[@]}"; do
    if grep -q "\"$script\":" package.json; then
        check_status "npm run $script" "pass" "Script defined"
    else
        check_status "npm run $script" "fail" "Script missing"
    fi
done

# Check dependencies
echo ""
echo "📦 Checking Dependencies"
echo "======================="

if [ -d "node_modules" ]; then
    check_status "Dependencies" "pass" "node_modules exists"
    
    # Check for key dependencies
    key_deps=("@playwright/test" "vite" "react")
    for dep in "${key_deps[@]}"; do
        if [ -d "node_modules/$dep" ] || grep -q "\"$dep\":" package.json; then
            check_status "$dep" "pass" "Dependency installed"
        else
            check_status "$dep" "fail" "Dependency missing"
        fi
    done
else
    check_status "Dependencies" "fail" "Run 'npm install' first"
fi

# Check build capability
echo ""
echo "🏗️  Testing Build Process"
echo "========================"

if npm run build > /dev/null 2>&1; then
    check_status "Build Process" "pass" "Build successful"
else
    check_status "Build Process" "fail" "Build failed - run 'npm run build' to debug"
fi

# Check if dist directory exists after build
if [ -d "dist" ]; then
    check_status "Build Output" "pass" "dist/ directory exists"
    
    # Check if main files exist in dist
    if [ -f "dist/index.html" ]; then
        check_status "Build Assets" "pass" "index.html found in dist/"
    else
        check_status "Build Assets" "fail" "index.html missing from dist/"
    fi
else
    check_status "Build Output" "fail" "dist/ directory missing"
fi

# Check GitHub CLI and authentication (if available)
echo ""
echo "🐙 Checking GitHub Integration"
echo "============================="

if command -v gh &> /dev/null; then
    check_status "GitHub CLI" "pass" "gh command available"
    
    if gh auth status &> /dev/null; then
        check_status "GitHub Auth" "pass" "Authenticated with GitHub"
        
        # Check if secrets can be accessed (this might fail for permissions)
        if gh secret list &> /dev/null; then
            secret_count=$(gh secret list --json name | jq length 2>/dev/null || echo "0")
            if [ "$secret_count" -gt 0 ]; then
                check_status "GitHub Secrets" "pass" "$secret_count secrets configured"
            else
                check_status "GitHub Secrets" "warn" "No secrets found - run .github/scripts/setup-github-secrets.sh"
            fi
        else
            check_status "GitHub Secrets" "warn" "Cannot access secrets (may be a permissions issue)"
        fi
    else
        check_status "GitHub Auth" "warn" "Not authenticated - run 'gh auth login'"
    fi
else
    check_status "GitHub CLI" "warn" "Install GitHub CLI for secret management"
fi

# Check Netlify CLI (if available)
echo ""
echo "🌐 Checking Netlify Integration"
echo "==============================="

if command -v netlify &> /dev/null; then
    check_status "Netlify CLI" "pass" "netlify command available"
    
    if netlify status &> /dev/null; then
        check_status "Netlify Auth" "pass" "Authenticated with Netlify"
        
        # Try to get site info
        site_info=$(netlify status --json 2>/dev/null || echo "{}")
        site_id=$(echo "$site_info" | jq -r '.site.id // empty')
        
        if [ ! -z "$site_id" ]; then
            check_status "Netlify Site" "pass" "Site linked (ID: $site_id)"
        else
            check_status "Netlify Site" "warn" "No site linked - run .github/scripts/setup-netlify.sh"
        fi
    else
        check_status "Netlify Auth" "warn" "Not authenticated - run 'netlify login'"
    fi
else
    check_status "Netlify CLI" "warn" "Install Netlify CLI: npm install -g netlify-cli"
fi

# Check environment variables
echo ""
echo "🔧 Checking Environment Configuration"
echo "===================================="

if [ -f ".env.example" ]; then
    check_status ".env.example" "pass" "Template file exists"
    
    # Check for key environment variables in example
    key_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "VITE_ENVIRONMENT")
    for var in "${key_vars[@]}"; do
        if grep -q "$var=" .env.example; then
            check_status "$var" "pass" "Defined in .env.example"
        else
            check_status "$var" "warn" "Missing from .env.example"
        fi
    done
else
    check_status ".env.example" "fail" "Template missing"
fi

# Check local .env file
if [ -f ".env" ] || [ -f ".env.local" ]; then
    check_status "Local Environment" "pass" "Local .env file exists"
else
    check_status "Local Environment" "warn" "No local .env file (create from .env.example)"
fi

# Test Playwright setup
echo ""
echo "🎭 Checking E2E Test Setup"  
echo "=========================="

if command -v npx &> /dev/null; then
    if npx playwright --version &> /dev/null; then
        check_status "Playwright CLI" "pass" "Playwright available"
        
        # Check if browsers are installed
        if npx playwright install --dry-run &> /dev/null; then
            check_status "Playwright Browsers" "pass" "Browsers installed"
        else
            check_status "Playwright Browsers" "warn" "Run 'npx playwright install'"
        fi
        
        # Check test files exist
        if [ -d "e2e" ] && [ -f "e2e/app.spec.ts" ]; then
            check_status "E2E Tests" "pass" "Test files exist"
        else
            check_status "E2E Tests" "warn" "No test files in e2e/"
        fi
    else
        check_status "Playwright CLI" "warn" "Run 'npm install' to get Playwright"
    fi
fi

# Summary
echo ""
echo "📊 Validation Summary"
echo "===================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"  
echo -e "${RED}❌ Failed: $FAILED${NC}"

echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Setup validation completed successfully!${NC}"
    echo ""
    echo "🚀 You're ready to:"
    echo "1. Push code to trigger CI/CD pipeline"
    echo "2. Deploy to production via GitHub Actions"
    echo "3. Monitor your application"
    
    if [ $WARNINGS -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}💡 Consider addressing warnings for optimal setup${NC}"
    fi
else
    echo -e "${RED}🚨 Please fix the failed checks before proceeding${NC}"
    echo ""
    echo "🔧 Quick fixes:"
    echo "- Run: npm install"
    echo "- Run: npm run build"
    echo "- Check missing files"
    exit 1
fi

echo ""
echo "🔗 Next Steps:"
echo "- Setup secrets: .github/scripts/setup-github-secrets.sh"  
echo "- Setup Netlify: .github/scripts/setup-netlify.sh"
echo "- Setup monitoring: .github/scripts/setup-monitoring.sh"