# 🚀 QUICK START - Deploy to GoDaddy in 5 Minutes

## For Mac/Linux Users

```bash
# 1. Run the deployment script
chmod +x deploy-to-godaddy.sh
./deploy-to-godaddy.sh

# 2. Wait for it to complete (builds everything)

# 3. Go to GoDaddy cPanel → File Manager

# 4. Upload all files from 'dist/' folder to 'public_html/'

# 5. Done! Visit https://your-domain.com
```

---

## For Windows Users

```batch
REM 1. Double-click: deploy-to-godaddy.bat

REM 2. Wait for it to complete

REM 3. Go to GoDaddy cPanel → File Manager

REM 4. Upload all files from 'dist' folder to 'public_html'

REM 5. Done! Visit https://your-domain.com
```

---

## What the Script Does

✅ Installs all dependencies  
✅ Runs linter to check code  
✅ Builds production version  
✅ Creates .htaccess for routing  
✅ Generates detailed instructions  
✅ Prepares everything for upload  

---

## Upload to GoDaddy (3 Steps)

### Step 1: Login to cPanel
- Go to https://www.godaddy.com
- My Products → Web Hosting → Manage

### Step 2: Open File Manager
- Click "File Manager"
- Navigate to "public_html"
- **BACKUP** existing files first!
- Delete old files

### Step 3: Upload New Files
- Click "Upload"
- Select ALL files from `dist/` folder
- Wait for upload (2-5 min)
- Done!

---

## ⚠️ IMPORTANT: Before Deploying

Make sure you have these environment variables set:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=Docket Chief
VITE_ENVIRONMENT=production
```

If not set, the build will use default values (may not work).

---

## ✅ Verify Deployment

After upload, check:

1. Visit https://your-domain.com
2. Page loads without errors
3. Click navigation links (should work)
4. Try legal research search
5. Test export PDF/DOCX buttons

---

## 🐛 Quick Fixes

**404 errors on navigation?**
→ Make sure .htaccess file was uploaded

**White screen?**
→ Check browser console (F12), clear cache

**Export not working?**
→ Clear browser cache (Ctrl+Shift+R)

---

## 📞 Need Help?

1. Read: `DEPLOYMENT_GUIDE.md` (full details)
2. Check: `legal-research-diagnostic.html` (feature tests)
3. Contact: GoDaddy Support (1-480-505-8877)

---

## 🎉 New Features Included

✅ **PDF Export** - Export search results to PDF  
✅ **DOCX Export** - Download cases as Word docs  
✅ **Caching** - 24x faster repeat searches  
✅ **Cache Stats** - See performance in real-time  

---

**That's it! Your site should be live in ~5 minutes.**

---

*For detailed instructions, see DEPLOYMENT_GUIDE.md*
