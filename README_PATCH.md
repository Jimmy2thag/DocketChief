# Quick Start (Patched Build)

1) **Set environment variables**
Frontend (Vite):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_NAME`
- `VITE_ENVIRONMENT=production`
- `VITE_PAYMENTS_ENABLED=false`

Supabase Edge Function secrets:
- `OPENAI_API_KEY=sk-...`
- `GOOGLE_AI_API_KEY=your_gemini_key...` (Optional: for Google Gemini AI support)
- `ALLOWED_ORIGINS=https://docketchief.com,https://www.docketchief.com`

2) **Deploy edge function**
```
supabase functions deploy legal-ai-chat
# Set required secrets (add GOOGLE_AI_API_KEY for Gemini AI support)
supabase secrets set OPENAI_API_KEY=sk-... ALLOWED_ORIGINS=https://docketchief.com,https://www.docketchief.com
# Optional: Enable Gemini AI
supabase secrets set GOOGLE_AI_API_KEY=your_gemini_key...
```

3) **Install & build**
```
npm ci
npm run build
```

4) **Deploy frontend to cPanel**
- Upload **contents of `dist/`** into `public_html/` (not the source).
- Create `/public_html/.htaccess` with:
```
RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```
