# Edge Function Troubleshooting Guide

## Problem: "Failed to send a request to the Edge Function"

This error occurs when the application cannot communicate with the Supabase edge functions. Here's how to diagnose and fix it.

---

## Quick Diagnostics

### Step 1: Check if Edge Function is Deployed

```bash
# Check Supabase CLI
supabase functions list

# You should see "legal-ai-chat" in the list
```

**If not listed:** You need to deploy it first.

---

## Solution 1: Deploy the Edge Function

### Prerequisites
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link to your project: `supabase link --project-ref your-project-ref`

### Deploy the Function

```bash
# Navigate to your project root
cd /path/to/DocketChief

# Deploy the edge function
supabase functions deploy legal-ai-chat

# Verify deployment
supabase functions list
```

### Set Environment Variables

```bash
# Set OpenAI API key (REQUIRED)
supabase secrets set OPENAI_API_KEY=sk-your-openai-key-here

# Set allowed origins for CORS
supabase secrets set ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com,http://localhost:5173

# For Vercel deployment, also add your Vercel URL
supabase secrets set ALLOWED_ORIGINS=https://your-domain.com,https://your-project.vercel.app

# Verify secrets are set
supabase secrets list
```

---

## Solution 2: Check Supabase Configuration

### Verify Environment Variables

Check your `.env` or deployment environment variables:

```env
# Required for production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### For Vercel Deployment

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
3. Redeploy the project

### For GoDaddy/cPanel Deployment

The Supabase URL and key should be compiled into your build. Run:

```bash
# Set env vars before building
export VITE_SUPABASE_URL=https://your-project.supabase.co
export VITE_SUPABASE_ANON_KEY=your-anon-key

# Build
npm run build

# Deploy the dist/ folder
```

---

## Solution 3: Fix CORS Issues

If you see "CORS error" in the console:

### Option A: Update Allowed Origins in Edge Function

```bash
# Add your domain to allowed origins
supabase secrets set ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com,https://your-project.vercel.app

# Redeploy the function
supabase functions deploy legal-ai-chat
```

### Option B: Allow All Origins (Development Only)

For testing, you can temporarily allow all origins:

```bash
supabase secrets set ALLOWED_ORIGINS=*
```

⚠️ **Warning:** Don't use `*` in production - specify exact domains.

---

## Solution 4: Verify OpenAI API Key

The edge function requires a valid OpenAI API key.

### Check if Key is Set

```bash
supabase secrets list
```

### Set/Update the Key

```bash
# Get a key from https://platform.openai.com/api-keys
supabase secrets set OPENAI_API_KEY=sk-your-new-key-here

# Redeploy
supabase functions deploy legal-ai-chat
```

---

## Solution 5: Test the Edge Function Directly

### Using cURL

```bash
# Get your anon key from Supabase dashboard
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ANON_KEY=your-anon-key

# Test the function
curl -X POST \
  "${SUPABASE_URL}/functions/v1/legal-ai-chat" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, test message"}
    ]
  }'
```

### Expected Response

```json
{
  "content": "Response from AI...",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 15,
    "total_tokens": 25
  }
}
```

### Common Error Responses

**404 Not Found:**
- Function not deployed
- Solution: Deploy with `supabase functions deploy legal-ai-chat`

**500 Internal Server Error:**
- Missing OPENAI_API_KEY
- Solution: Set with `supabase secrets set OPENAI_API_KEY=sk-...`

**CORS Error:**
- Origin not in ALLOWED_ORIGINS
- Solution: Add your domain to ALLOWED_ORIGINS

---

## Solution 6: Check Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Edge Functions** in the sidebar
4. Verify:
   - ✅ `legal-ai-chat` function is listed
   - ✅ Function has "Active" status
   - ✅ Recent invocations show no errors
5. Click on the function to see logs

### View Function Logs

```bash
# Stream logs in real-time
supabase functions logs legal-ai-chat --follow

# See recent logs
supabase functions logs legal-ai-chat
```

---

## Solution 7: Rebuild and Redeploy

Sometimes a fresh build and deploy fixes issues:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Build
npm run build

# Deploy edge function
supabase functions deploy legal-ai-chat

# Redeploy to Vercel (if using)
vercel --prod

# Or upload dist/ to GoDaddy
```

---

## Common Error Messages and Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Edge function not deployed" | Function not in Supabase | Deploy with `supabase functions deploy legal-ai-chat` |
| "CORS error" | Domain not allowed | Add domain to `ALLOWED_ORIGINS` secret |
| "Authentication failed" | Invalid Supabase key | Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| "OPENAI_API_KEY missing" | Missing API key | Set with `supabase secrets set OPENAI_API_KEY=sk-...` |
| "No response from edge function" | Function timeout or crash | Check function logs |

---

## Still Having Issues?

### Debug Checklist

- [ ] Edge function deployed: `supabase functions list`
- [ ] Secrets set: `supabase secrets list`
- [ ] Environment variables correct in `.env` or Vercel
- [ ] ALLOWED_ORIGINS includes your domain
- [ ] OpenAI API key is valid and has credits
- [ ] Function logs show no errors: `supabase functions logs legal-ai-chat`
- [ ] Browser console shows detailed error message
- [ ] Network tab shows request to Supabase functions endpoint

### Get More Help

1. Check function logs: `supabase functions logs legal-ai-chat`
2. Check browser console (F12) for detailed errors
3. Test function directly with cURL (see above)
4. Check Supabase dashboard for function status

---

## For Production Deployment

### Recommended Setup

1. **Deploy Edge Function:**
   ```bash
   supabase functions deploy legal-ai-chat
   ```

2. **Set Production Secrets:**
   ```bash
   supabase secrets set OPENAI_API_KEY=sk-prod-key
   supabase secrets set ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

3. **Build Frontend with Production Vars:**
   ```bash
   export VITE_SUPABASE_URL=https://your-project.supabase.co
   export VITE_SUPABASE_ANON_KEY=your-prod-anon-key
   npm run build
   ```

4. **Deploy Frontend:**
   - Vercel: `vercel --prod`
   - GoDaddy: Upload `dist/` to `public_html/`

5. **Test:**
   - Visit your live site
   - Try the Document Analyzer
   - Check for errors in console

---

## Quick Fix Summary

```bash
# 1. Deploy function
supabase functions deploy legal-ai-chat

# 2. Set secrets
supabase secrets set OPENAI_API_KEY=sk-your-key
supabase secrets set ALLOWED_ORIGINS=https://yourdomain.com

# 3. Verify
supabase functions list
supabase secrets list

# 4. Test
curl -X POST \
  "https://your-project.supabase.co/functions/v1/legal-ai-chat" \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}]}'
```

---

**Last Updated:** 2025-11-09  
**Version:** 1.0  
**Applies To:** DocketChief AI Document Analyzer
