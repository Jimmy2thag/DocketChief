# 🚀 Quick Netlify Setup Guide for DocketChief

## Step 1: Authentication & Security

### ⚠️ IMPORTANT: Regenerate Your Token First
1. Go to: https://app.netlify.com/user/applications/personal
2. **Delete** the token you shared (nfp_Lxnna48krwbH22scCFEvkWoXV1pumuGF06b3)
3. **Create new token** with these permissions:
   - Deploy sites
   - Read sites
   - Write sites

### Set Up GitHub Secret
1. Go to: https://github.com/Jimmy2thag/DocketChief/settings/secrets/actions
2. Click "New repository secret"
3. Name: `NETLIFY_AUTH_TOKEN` 
4. Value: Your NEW token (starts with nfp_)
5. Click "Add secret"

## Step 2: Netlify Site Configuration

Run these commands in your terminal:

```bash
# Login to Netlify
netlify login

# Create or link your site
netlify sites:create --name "docketchief-prod"

# Get your site ID (save this!)
netlify status

# Deploy test build
netlify deploy --build
```

## Step 3: Add Site ID to GitHub

After creating the site, you'll get a Site ID. Add it to GitHub secrets:

1. Go back to: https://github.com/Jimmy2thag/DocketChief/settings/secrets/actions
2. Click "New repository secret"
3. Name: `NETLIFY_SITE_ID`
4. Value: Your site ID (looks like: 12345678-1234-5678-9abc-def012345678)
5. Click "Add secret"

## Step 4: Configure Environment Variables

In Netlify dashboard or CLI, add these environment variables:

```bash
# Essential variables
VITE_ENVIRONMENT=production
VITE_APP_NAME=Docket Chief
VITE_PAYMENTS_ENABLED=true

# Add your Supabase configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Step 5: Test Your Setup

```bash
# Test local build
npm run build

# Test Netlify deployment
netlify deploy --prod --build

# Commit and push to trigger CI/CD
git add .
git commit -m "Configure Netlify deployment"
git push origin main
```

## Step 6: Verify Deployment

1. Check GitHub Actions: https://github.com/Jimmy2thag/DocketChief/actions
2. Check Netlify dashboard: https://app.netlify.com/
3. Visit your live site!

## Troubleshooting

If deployment fails:
1. Check GitHub Actions logs
2. Verify secrets are set correctly  
3. Check Netlify build logs
4. Ensure all environment variables are configured

## Next Steps

Once deployment works:
1. Set up custom domain (optional)
2. Configure monitoring (Sentry, UptimeRobot)
3. Set up staging environment
4. Add form handling if needed

---

**Need help?** Check the detailed guides in `.github/` folder or run the validation script:
```bash
./.github/scripts/validate-setup.sh
```