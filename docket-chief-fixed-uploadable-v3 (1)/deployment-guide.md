# Docket Chief Deployment Guide

## Deploying to docketchief.com

### Option 1: Vercel (Recommended)
1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Build and Deploy**:
   ```bash
   npm run build
   vercel --prod
   ```

3. **Connect Domain**:
   - Go to Vercel dashboard
   - Select your project
   - Go to Settings > Domains
   - Add `docketchief.com` and `www.docketchief.com`
   - Update your domain's DNS to point to Vercel

### Option 2: Netlify
1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy**:
   - Drag `dist` folder to netlify.com/drop
   - Or connect GitHub repo for auto-deploy

3. **Custom Domain**:
   - Go to Site settings > Domain management
   - Add custom domain: `docketchief.com`

### Environment Variables
Set these in your hosting platform:
- `VITE_SUPABASE_URL`: https://ooftpivvgpjkwwtvdjrk.supabase.co
- `VITE_SUPABASE_ANON_KEY`: sb_publishable_ib4vQAUpRbFM-4mpiu5X7Q_E0JGA7T8

### DNS Configuration
Point your domain to your hosting provider:
- **Vercel**: Add CNAME record pointing to `cname.vercel-dns.com`
- **Netlify**: Add CNAME record pointing to your Netlify subdomain

## Testing Account Creation
1. Once deployed, visit your site
2. Click "Sign Up" in the top right
3. Enter email and password
4. Check email for verification link
5. After verification, you can log in and test all features

The application includes:
- User authentication via Supabase
- Document management
- AI chat integration
- Conversation import from ChatGPT/Gemini
- Advanced search
- Collaboration tools
- Email integration