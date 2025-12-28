#!/bin/bash

# GitHub Secrets Setup Script for DocketChief
# This script helps set up repository secrets using GitHub CLI

set -e

echo "🔐 DocketChief GitHub Secrets Setup"
echo "=================================="

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Please install it first:"
    echo "   https://cli.github.com/"
    exit 1
fi

# Check if user is logged in
if ! gh auth status &> /dev/null; then
    echo "❌ Not logged into GitHub CLI. Please run:"
    echo "   gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is ready"

# Get repository info
REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
echo "📂 Repository: $REPO"

echo ""
echo "🚀 Setting up secrets..."
echo ""

# Function to set secret with validation
set_secret() {
    local name=$1
    local description=$2
    local example=$3
    
    echo "Setting up: $name"
    echo "Description: $description"
    if [ ! -z "$example" ]; then
        echo "Example: $example"
    fi
    echo ""
    
    read -p "Enter value for $name (or press Enter to skip): " -s value
    echo ""
    
    if [ ! -z "$value" ]; then
        if gh secret set "$name" --body "$value"; then
            echo "✅ $name set successfully"
        else
            echo "❌ Failed to set $name"
        fi
    else
        echo "⏭️  Skipped $name"
    fi
    echo ""
}

# Required secrets for deployment
echo "📦 DEPLOYMENT SECRETS"
echo "===================="

set_secret "NETLIFY_AUTH_TOKEN" "Netlify personal access token" "nfp_..."
set_secret "NETLIFY_SITE_ID" "Netlify site ID" "abcd1234-5678-90ef-ghij-klmnopqrstuv"
set_secret "NETLIFY_STAGING_SITE_ID" "Netlify staging site ID (optional)" "efgh5678-90ab-cdef-1234-567890abcdef"

echo "🔧 SUPABASE CONFIGURATION"
echo "========================="

set_secret "VITE_SUPABASE_URL" "Supabase project URL" "https://your-project-id.supabase.co"
set_secret "VITE_SUPABASE_ANON_KEY" "Supabase anonymous key" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
set_secret "SUPABASE_SERVICE_ROLE_KEY" "Supabase service role key (keep secret!)" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

echo "🤖 AI & API SERVICES"
echo "===================="

set_secret "OPENAI_API_KEY" "OpenAI API key for AI features" "sk-..."
set_secret "COURTLISTENER_API_TOKEN" "CourtListener API token" ""

echo "💳 PAYMENT PROCESSING"
echo "====================="

set_secret "STRIPE_SECRET_KEY" "Stripe secret key" "sk_live_... or sk_test_..."
set_secret "STRIPE_WEBHOOK_SECRET" "Stripe webhook secret" "whsec_..."
set_secret "STRIPE_PUBLISHABLE_KEY" "Stripe publishable key" "pk_live_... or pk_test_..."

echo "📊 MONITORING & ANALYTICS"
echo "========================="

set_secret "VITE_SENTRY_DSN" "Sentry DSN for error tracking" "https://...@sentry.io/..."
set_secret "SENTRY_AUTH_TOKEN" "Sentry auth token for uploads" ""
set_secret "VITE_GA_MEASUREMENT_ID" "Google Analytics measurement ID" "G-XXXXXXXXXX"

echo ""
echo "🎉 GitHub Secrets Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Verify secrets in GitHub: https://github.com/$REPO/settings/secrets/actions"
echo "2. Test deployment by pushing to main branch"
echo "3. Set up monitoring using .github/MONITORING_SETUP.md"
echo ""
echo "🔍 To validate your setup, run:"
echo "   .github/scripts/validate-setup.sh"