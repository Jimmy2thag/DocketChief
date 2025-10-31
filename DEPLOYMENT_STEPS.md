# Quick Deployment Steps for docketchief.com

## Step 1: Choose Your Deployment Method

### Option A: Vercel (Easiest)
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your GitHub repository (or upload files)
5. Vercel will auto-detect it's a Vite React app
6. Click "Deploy"

### Option B: Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login
3. Drag and drop your `dist` folder after running `npm run build`
4. Or connect your GitHub repo for auto-deploy

## Step 2: Connect Your Domain
1. In your hosting dashboard, go to Domain settings
2. Add custom domain: `docketchief.com`
3. Follow the DNS instructions provided

## Step 3: Update DNS Records
In your domain registrar (where you bought docketchief.com):
- **For Vercel**: Add CNAME record: `www` → `cname.vercel-dns.com`
- **For Netlify**: Add CNAME record: `www` → `your-site-name.netlify.app`
- Add A record: `@` → IP provided by your hosting service

## Step 4: Set Environment Variables
In your hosting dashboard, add these environment variables:
```
VITE_SUPABASE_URL=https://ooftpivvgpjkwwtvdjrk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_ib4vQAUpRbFM-4mpiu5X7Q_E0JGA7T8
```

## Step 5: Test Your Site
1. Visit `https://docketchief.com`
2. Click "Sign Up" to create an account
3. Check your email for verification
4. Log in and test the features

## Need Help?
- Vercel docs: https://vercel.com/docs
- Netlify docs: https://docs.netlify.com
- DNS usually takes 24-48 hours to propagate worldwide