#!/bin/bash

# Netlify Deployment Setup Script
# Helps configure Netlify deployment for DocketChief

set -e

echo "🌐 DocketChief Netlify Deployment Setup"
echo "======================================="

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

echo "✅ Netlify CLI is ready"

# Check authentication
if ! netlify status &> /dev/null; then
    echo "🔐 Logging into Netlify..."
    netlify login
fi

echo "✅ Authenticated with Netlify"

# Function to create or link site
setup_site() {
    local site_name=$1
    local branch=$2
    local env=$3
    
    echo ""
    echo "🚀 Setting up $env site..."
    echo "Site name: $site_name"
    echo "Branch: $branch"
    
    read -p "Create new site or link existing? (create/link/skip): " action
    
    case $action in
        create)
            echo "Creating new Netlify site..."
            netlify sites:create --name "$site_name"
            ;;
        link)
            echo "Available sites:"
            netlify sites:list
            echo ""
            read -p "Enter site ID to link: " site_id
            netlify link --id "$site_id"
            ;;
        skip)
            echo "⏭️  Skipped $env site setup"
            return
            ;;
        *)
            echo "❌ Invalid option"
            return
            ;;
    esac
    
    # Get site info
    SITE_INFO=$(netlify status --json)
    SITE_ID=$(echo "$SITE_INFO" | jq -r '.site.id // empty')
    SITE_URL=$(echo "$SITE_INFO" | jq -r '.site.url // empty')
    
    if [ ! -z "$SITE_ID" ]; then
        echo "✅ Site configured:"
        echo "   ID: $SITE_ID"
        echo "   URL: $SITE_URL"
        echo ""
        echo "📝 Add this to your GitHub secrets:"
        if [ "$env" = "production" ]; then
            echo "   NETLIFY_SITE_ID=$SITE_ID"
        else
            echo "   NETLIFY_STAGING_SITE_ID=$SITE_ID"
        fi
    fi
}

# Production site setup
setup_site "docketchief-prod" "main" "production"

# Staging site setup
read -p "Set up staging site? (y/n): " setup_staging
if [ "$setup_staging" = "y" ]; then
    setup_site "docketchief-staging" "develop" "staging"
fi

echo ""
echo "🔧 Configuring build settings..."

# Create netlify.toml if it doesn't exist or update it
if [ -f "netlify.toml" ]; then
    echo "✅ netlify.toml already exists"
else
    echo "📄 Creating netlify.toml..."
    cat > netlify.toml << EOF
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
  NPM_VERSION = "10"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.supabase.io https://*.supabase.co; font-src 'self' data:;"

# Production-specific settings
[context.production]
  [context.production.environment]
    VITE_ENVIRONMENT = "production"
    VITE_PAYMENTS_ENABLED = "true"

# Staging-specific settings  
[context.branch-deploy]
  [context.branch-deploy.environment]
    VITE_ENVIRONMENT = "staging"
    VITE_PAYMENTS_ENABLED = "false"

# Deploy previews
[context.deploy-preview]
  [context.deploy-preview.environment]
    VITE_ENVIRONMENT = "preview"
    VITE_PAYMENTS_ENABLED = "false"
EOF
    echo "✅ netlify.toml created"
fi

echo ""
echo "🔐 Setting up environment variables..."

# Function to set Netlify environment variable
set_netlify_env() {
    local key=$1
    local description=$2
    
    echo ""
    echo "Setting $key"
    echo "Description: $description"
    read -p "Enter value (or press Enter to skip): " -s value
    echo ""
    
    if [ ! -z "$value" ]; then
        if netlify env:set "$key" "$value"; then
            echo "✅ $key set successfully"
        else
            echo "❌ Failed to set $key"
        fi
    else
        echo "⏭️  Skipped $key"
    fi
}

echo "Configure environment variables in Netlify:"
set_netlify_env "VITE_SUPABASE_URL" "Supabase project URL"
set_netlify_env "VITE_SUPABASE_ANON_KEY" "Supabase anonymous key" 
set_netlify_env "VITE_SENTRY_DSN" "Sentry DSN for error tracking"

echo ""
echo "🎉 Netlify Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Test deployment: git push origin main"
echo "2. Check build logs: netlify open"
echo "3. Configure custom domain (optional)"
echo "4. Set up form handling (if needed)"
echo ""
echo "🔗 Useful Commands:"
echo "   netlify open         # Open site dashboard"
echo "   netlify deploy       # Manual deploy"
echo "   netlify logs         # View build logs"
echo "   netlify env:list     # List environment variables"