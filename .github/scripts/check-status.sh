#!/bin/bash

# Quick setup status checker
echo "🔍 DocketChief Setup Status"
echo "=========================="
echo ""

# Check if build works
echo "📦 Testing Build Process..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build: Working"
else
    echo "❌ Build: Failed (run 'npm run build' to debug)"
fi

# Check GitHub CLI
echo ""
echo "🐙 GitHub Integration..."
if command -v gh &> /dev/null; then
    if gh auth status &> /dev/null; then
        echo "✅ GitHub CLI: Authenticated"
        
        # Try to check if we can access the repo
        REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null)
        if [ ! -z "$REPO" ]; then
            echo "✅ Repository: $REPO"
        else
            echo "⚠️  Repository: Access may be limited"
        fi
    else
        echo "❌ GitHub CLI: Not authenticated (run 'gh auth login')"
    fi
else
    echo "❌ GitHub CLI: Not installed"
fi

# Check Netlify CLI  
echo ""
echo "🌐 Netlify Integration..."
if command -v netlify &> /dev/null; then
    echo "✅ Netlify CLI: Installed"
    
    if netlify status &> /dev/null; then
        echo "✅ Netlify: Authenticated"
        
        # Try to get site info
        SITE_INFO=$(netlify status --json 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo "✅ Netlify Site: Connected"
        else
            echo "⚠️  Netlify Site: Not connected (run 'netlify login' then 'netlify link')"
        fi
    else
        echo "❌ Netlify: Not authenticated (run 'netlify login')"
    fi
else
    echo "❌ Netlify CLI: Not installed (run 'npm install -g netlify-cli')"
fi

# Check required files
echo ""
echo "📁 Configuration Files..."
required_files=(".github/workflows/ci-cd.yml" "netlify.toml" "playwright.config.ts")

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file: Found"
    else
        echo "❌ $file: Missing"
    fi
done

echo ""
echo "📋 Next Steps:"
echo "1. Follow NETLIFY_SETUP_QUICK.md for deployment setup"
echo "2. Add secrets to GitHub: https://github.com/Jimmy2thag/DocketChief/settings/secrets/actions"
echo "3. Push to main branch to trigger deployment"
echo "4. Monitor deployment: https://github.com/Jimmy2thag/DocketChief/actions"