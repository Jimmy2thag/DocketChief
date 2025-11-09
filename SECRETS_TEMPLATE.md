# GitHub Secrets Configuration Template

This file provides a template for all GitHub secrets needed for CI/CD.

## Instructions

1. Copy this template
2. Fill in your actual values (replace the placeholders)
3. Add each secret to GitHub: `Settings > Secrets and variables > Actions > New repository secret`
4. **NEVER COMMIT THIS FILE WITH REAL VALUES**

## Required Secrets

### Netlify Deployment

```
Secret Name: NETLIFY_AUTH_TOKEN
Value: [Get from: Netlify > User Settings > Applications > New access token]
Example: nfp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

```
Secret Name: NETLIFY_SITE_ID
Value: [Get from: Netlify > Site Settings > General > Site ID]
Example: 12345678-1234-1234-1234-123456789abc
```

### Supabase Configuration

```
Secret Name: VITE_SUPABASE_URL
Value: [Get from: Supabase > Project Settings > API > Project URL]
Example: https://xxxxxxxxxxxxx.supabase.co
```

```
Secret Name: VITE_SUPABASE_ANON_KEY
Value: [Get from: Supabase > Project Settings > API > anon key]
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

## Optional Secrets

```
Secret Name: VITE_APP_NAME
Value: Docket Chief
```

```
Secret Name: VITE_PAYMENTS_ENABLED
Value: false
```

```
Secret Name: PRODUCTION_URL
Value: https://docketchief.com
```

## How to Add Secrets to GitHub

### Via GitHub Web Interface

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. In left sidebar, click **Secrets and variables** > **Actions**
4. Click **New repository secret** button
5. Enter the **Name** (e.g., `NETLIFY_AUTH_TOKEN`)
6. Enter the **Secret** (the actual value)
7. Click **Add secret**
8. Repeat for all secrets listed above

### Via GitHub CLI (Optional)

If you have GitHub CLI installed:

```bash
# Netlify secrets
gh secret set NETLIFY_AUTH_TOKEN
# (paste your token and press Enter, then Ctrl+D)

gh secret set NETLIFY_SITE_ID
# (paste your site ID and press Enter, then Ctrl+D)

# Supabase secrets
gh secret set VITE_SUPABASE_URL
# (paste your URL and press Enter, then Ctrl+D)

gh secret set VITE_SUPABASE_ANON_KEY
# (paste your key and press Enter, then Ctrl+D)

# Optional secrets
gh secret set VITE_APP_NAME -b "Docket Chief"
gh secret set VITE_PAYMENTS_ENABLED -b "false"
gh secret set PRODUCTION_URL -b "https://docketchief.com"
```

## How to Get Each Secret Value

### NETLIFY_AUTH_TOKEN

1. Log in to Netlify: https://app.netlify.com
2. Click on your avatar (top right)
3. Go to **User settings**
4. Click **Applications** in the left sidebar
5. Scroll to **Personal access tokens**
6. Click **New access token**
7. Enter a description: "GitHub Actions CI/CD"
8. Click **Generate token**
9. **Copy the token immediately** (you won't be able to see it again)

### NETLIFY_SITE_ID

1. Log in to Netlify: https://app.netlify.com
2. Click on your site
3. Go to **Site settings**
4. Look for **Site information** section
5. Copy the **Site ID**

Alternative: If you haven't created a Netlify site yet:
1. Go to Netlify dashboard
2. Click **Add new site** > **Import an existing project**
3. Connect your GitHub repository
4. Deploy the site
5. Then get the Site ID from Site settings

### VITE_SUPABASE_URL

1. Log in to Supabase: https://supabase.com
2. Select your project (or create one if needed)
3. Click on **Settings** icon (⚙️) in the left sidebar
4. Click **API** in the settings menu
5. Find **Project URL** under "Configuration"
6. Copy the URL (e.g., `https://xxxxxxxxxxxxx.supabase.co`)

### VITE_SUPABASE_ANON_KEY

1. In the same **API** settings page
2. Scroll down to **Project API keys**
3. Find the **anon** **public** key
4. Click to reveal and copy the key
5. This is a public key, safe to use in the browser

**Note**: Do NOT use the `service_role` key for frontend/CI - it bypasses Row Level Security!

## Verification Checklist

After adding all secrets, verify:

- [ ] All required secrets are added (4 total minimum)
- [ ] Secret names match exactly (case-sensitive)
- [ ] No extra spaces in secret values
- [ ] Netlify token is valid and not expired
- [ ] Netlify site ID is correct
- [ ] Supabase URL is correct format
- [ ] Supabase key is the anon/public key (not service_role)

## Testing Secrets

After adding secrets, you can test them by:

1. Push a commit to `main` or `develop` branch
2. Go to **Actions** tab in GitHub
3. Watch the workflow run
4. If build succeeds, secrets are configured correctly
5. If build fails, check the logs for error messages

## Security Best Practices

- ✅ Never commit secrets to version control
- ✅ Use separate keys for development and production
- ✅ Rotate secrets every 90 days
- ✅ Use minimum required permissions for tokens
- ✅ Enable 2FA on Netlify and Supabase accounts
- ✅ Regularly audit who has access to secrets
- ✅ Monitor secret usage in logs

## Troubleshooting

### "Secret not found" Error
- Verify secret name matches exactly (case-sensitive)
- Check secret was saved in correct repository
- Ensure you're using repository secrets, not environment secrets

### "Authentication failed" Error
- Verify token/key is copied completely (no truncation)
- Check token hasn't expired
- Regenerate token if needed

### Build Succeeds but Deployment Fails
- Verify Netlify site ID is correct
- Check Netlify account has access to the site
- Ensure Netlify token has deployment permissions

## Additional Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Netlify API Authentication](https://docs.netlify.com/api/get-started/#authentication)
- [Supabase API Keys](https://supabase.com/docs/guides/api#api-keys)

## Support

If you encounter issues:
1. Review the full [CI_CD_SETUP.md](CI_CD_SETUP.md) guide
2. Check GitHub Actions logs for specific errors
3. Verify each secret individually
4. Test locally with `.env` file first (copy from `.env.example`)

---

**⚠️ IMPORTANT**: This template file should remain in the repository as a reference, but never commit it with actual secret values filled in. Secrets should only exist in:
- GitHub repository secrets (for CI/CD)
- Local `.env` file (for development - never committed)
- Netlify environment variables (for production)
