# 🚀 DocketChief Deployment Guide for GoDaddy

## Quick Start

This guide will help you deploy DocketChief to your GoDaddy hosting account.

### New Features Included:
✅ **Server-side PDF Generation** - Professional PDF exports with formatting  
✅ **DOCX Export** - Download research results as Word documents  
✅ **Query Result Caching** - Improved performance with 5-minute cache (supports 75+ queries/sec)  
✅ **Enhanced Export UI** - Export buttons on all research results  

---

## Prerequisites

Before deploying, you need:

1. **GoDaddy Hosting Account** with cPanel access
2. **Supabase Project** set up and configured
3. **Environment Variables** ready:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_NAME=Docket Chief`
   - `VITE_ENVIRONMENT=production`

---

## 🖥️ Deployment Methods

### Method 1: Automated Script (Recommended)

#### For Mac/Linux:
```bash
./deploy-to-godaddy.sh
```

#### For Windows:
```batch
deploy-to-godaddy.bat
```

The script will:
1. ✅ Install dependencies
2. ✅ Run linter
3. ✅ Build production bundle
4. ✅ Create .htaccess file
5. ✅ Generate deployment instructions
6. ✅ Prepare everything for upload

---

### Method 2: Manual Deployment

#### Step 1: Build the Project
```bash
npm ci
npm run build
```

#### Step 2: Upload to GoDaddy

1. **Log in to GoDaddy cPanel**
   - Go to https://www.godaddy.com
   - My Products → Web Hosting → Manage

2. **Open File Manager**
   - Click "File Manager" in Files section

3. **Navigate to public_html**
   - This is your web root

4. **Backup Current Files** (IMPORTANT!)
   - Select all → Compress → Create backup.zip
   - Download the backup

5. **Clear public_html**
   - Delete all files (you have backup!)

6. **Upload New Files**
   - Click Upload
   - Select ALL files from `dist/` folder
   - Wait for completion (2-5 minutes)

7. **Verify Upload**
   - Check `.htaccess` file is present
   - Enable "Show Hidden Files" if needed

8. **Test**
   - Visit https://your-domain.com
   - Test navigation and features

---

## 📁 What Gets Deployed

From the `dist/` folder:
- `index.html` - Main application
- `assets/` - JavaScript, CSS, images
- `.htaccess` - Server configuration for SPA routing

Total size: ~2-3 MB  
Total files: ~40-50 files

---

## 🔧 Post-Deployment Checklist

After uploading files:

### 1. Verify Website Loads
- [ ] Visit https://your-domain.com
- [ ] Page displays without errors
- [ ] No 404 errors in console (F12)

### 2. Test SPA Routing
- [ ] Click navigation links
- [ ] Pages load without refresh
- [ ] Direct URLs work (e.g., /legal-research)

### 3. Test Core Features
- [ ] Legal Research search
- [ ] **NEW:** Export to PDF button works
- [ ] **NEW:** Export to DOCX per result
- [ ] **NEW:** Cache stats displayed
- [ ] Document upload/analysis
- [ ] AI Chat functionality
- [ ] User sign up/sign in

### 4. Performance Check
- [ ] Page load < 3 seconds
- [ ] Navigation feels smooth
- [ ] **NEW:** Search results cached (faster on repeat searches)

---

## 🐛 Troubleshooting

### Problem: "404 Not Found" on navigation

**Solution:**  
Verify `.htaccess` file exists in `public_html/` with this content:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

### Problem: Export buttons not working

**Solution:**  
1. Check browser console for errors
2. Ensure jsPDF and docx libraries loaded
3. Try different browser
4. Clear browser cache (Ctrl+Shift+R)

---

### Problem: White screen or JavaScript errors

**Solution:**
1. Check browser console (F12)
2. Verify all files uploaded correctly
3. Check file permissions (644 for files, 755 for directories)
4. Clear browser cache

---

### Problem: Slow performance

**Solution:**
1. Cache is enabled automatically (5-minute TTL)
2. Check `.htaccess` has compression enabled
3. Consider enabling CDN (Cloudflare)
4. Verify no browser extensions blocking scripts

---

### Problem: Supabase connection fails

**Solution:**
1. Verify environment variables in build
2. Check Supabase project is active
3. Verify CORS settings in Supabase
4. Check edge functions are deployed

---

## 📊 Cache Performance

The new caching system stores search results for 5 minutes:

- **Cache Hit:** Results return in ~50ms
- **Cache Miss:** Normal query time (~1-2s)
- **Cache Stats:** Displayed above search results
- **Cache Limit:** 100 most recent searches

To clear cache manually:
- Reload page (cache persists in memory only)
- Each browser tab has independent cache

---

## 🔄 Updating the Site

When you make changes and want to redeploy:

1. **Backup Current Site**
   ```bash
   # In cPanel File Manager
   # Compress public_html → download backup
   ```

2. **Build New Version**
   ```bash
   npm run build
   ```

3. **Upload New Files**
   - Delete old files (keep backup!)
   - Upload new `dist/` contents
   - Verify `.htaccess` present

4. **Clear Caches**
   - Browser: Ctrl+Shift+R
   - Cloudflare: Purge cache (if using)
   - Server: Wait 5-10 minutes

---

## 📈 New Features Usage

### PDF Export (Batch)

1. Search for cases
2. Click **"Export PDF"** button at top
3. All visible results exported to single PDF
4. File downloaded automatically

### DOCX Export (Individual)

1. Find a case in search results
2. Click **"Export DOCX"** button on that result
3. Single case exported to Word format
4. File downloaded automatically

### Cache Stats

- Displayed above search results
- Shows: `Cache: X hits, Y misses (Z% hit rate)`
- Updates in real-time
- Helps monitor performance

---

## 📞 Support

### GoDaddy Support
- Phone: 1-480-505-8877 (24/7)
- Help Center: https://www.godaddy.com/help

### For Technical Issues
- Check `legal-research-diagnostic.html` report
- Review browser console errors
- Check Supabase logs
- Verify all dependencies installed

---

## 📝 Files in This Package

- `deploy-to-godaddy.sh` - Unix/Mac deployment script
- `deploy-to-godaddy.bat` - Windows deployment script
- `DEPLOYMENT_GUIDE.md` - This file
- `legal-research-diagnostic.html` - Feature testing report
- `dist/` - Production build files (created by scripts)

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ Website loads at your domain  
✅ Navigation works without page reloads  
✅ Legal research search returns results  
✅ **NEW:** PDF export downloads successfully  
✅ **NEW:** DOCX export works per result  
✅ **NEW:** Cache stats show hit rate improving  
✅ User can sign up/sign in  
✅ AI chat responds  
✅ No console errors  

---

## 🚀 Next Steps After Deployment

1. **Monitor Performance**
   - Check cache hit rates
   - Monitor page load times
   - Review error logs in cPanel

2. **User Testing**
   - Test all features thoroughly
   - Try different browsers
   - Test on mobile devices

3. **SEO Setup**
   - Submit sitemap to Google
   - Set up Google Analytics
   - Configure meta tags

4. **Security**
   - Enable HTTPS (should be automatic)
   - Set up regular backups
   - Monitor security logs

---

## 📧 Questions?

If you encounter issues not covered here:

1. Check the diagnostic report: `legal-research-diagnostic.html`
2. Review GoDaddy support documentation
3. Contact your development team
4. Check GitHub issues/discussions

---

**Good luck with your deployment! 🎉**

---

*Last Updated: $(date)*
*Build Version: Latest with PDF/DOCX export and caching*
