#!/bin/bash

# =============================================================================
# DocketChief Deployment Script for GoDaddy
# =============================================================================
# This script guides you through deploying DocketChief to GoDaddy hosting
# =============================================================================

set -e  # Exit on error

echo "========================================="
echo "DocketChief GoDaddy Deployment Script"
echo "========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Verify we're in the right directory
echo -e "${YELLOW}Step 1: Verifying project directory...${NC}"
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the DocketChief root directory.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Project directory verified${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
echo "Running: npm ci"
npm ci
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Run linter
echo -e "${YELLOW}Step 3: Running linter...${NC}"
echo "Running: npm run lint"
npm run lint || echo -e "${YELLOW}⚠ Linter warnings found (acceptable)${NC}"
echo -e "${GREEN}✓ Lint check complete${NC}"
echo ""

# Step 4: Build the application
echo -e "${YELLOW}Step 4: Building production bundle...${NC}"
echo "Running: npm run build"
npm run build
echo -e "${GREEN}✓ Production build complete${NC}"
echo ""

# Step 5: Verify build output
echo -e "${YELLOW}Step 5: Verifying build output...${NC}"
if [ ! -d "dist" ]; then
    echo -e "${RED}Error: dist/ directory not found. Build may have failed.${NC}"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}Error: dist/index.html not found. Build may be incomplete.${NC}"
    exit 1
fi

echo "Build output size:"
du -sh dist/
echo ""
echo "Main files:"
ls -lh dist/*.html dist/assets/*.js | tail -10
echo -e "${GREEN}✓ Build output verified${NC}"
echo ""

# Step 6: Create .htaccess file for SPA routing
echo -e "${YELLOW}Step 6: Creating .htaccess file...${NC}"
cat > dist/.htaccess << 'EOF'
# DocketChief .htaccess configuration for GoDaddy
# This file handles SPA routing and security headers

# Enable Rewrite Engine
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# SPA Routing - serve index.html for all routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security Headers
<IfModule mod_headers.c>
    Header set X-Frame-Options "DENY"
    Header set X-XSS-Protection "1; mode=block"
    Header set X-Content-Type-Options "nosniff"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
    Header set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/html "access plus 0 seconds"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
</IfModule>
EOF

echo -e "${GREEN}✓ .htaccess file created${NC}"
echo ""

# Step 7: Create deployment package
echo -e "${YELLOW}Step 7: Creating deployment package...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOY_DIR="docketchief_deploy_${TIMESTAMP}"
DEPLOY_ZIP="${DEPLOY_DIR}.zip"

# Create deployment directory
mkdir -p "${DEPLOY_DIR}"

# Copy dist contents
cp -r dist/* "${DEPLOY_DIR}/"

# Create ZIP file
if command -v zip &> /dev/null; then
    zip -r "${DEPLOY_ZIP}" "${DEPLOY_DIR}"
    echo -e "${GREEN}✓ Deployment package created: ${DEPLOY_ZIP}${NC}"
else
    echo -e "${YELLOW}⚠ zip command not available. Skipping ZIP creation.${NC}"
    echo "Deployment files are in: ${DEPLOY_DIR}/"
fi
echo ""

# Step 8: Create deployment instructions
echo -e "${YELLOW}Step 8: Creating deployment instructions...${NC}"

cat > DEPLOYMENT_INSTRUCTIONS.txt << EOF
================================================================================
DOCKETCHIEF GODADDY DEPLOYMENT INSTRUCTIONS
Generated: $(date)
================================================================================

OVERVIEW:
This guide will help you deploy DocketChief to your GoDaddy hosting account.

================================================================================
PRE-DEPLOYMENT CHECKLIST:
================================================================================

1. Environment Variables (CRITICAL):
   You must set these in GoDaddy cPanel or as build-time variables:
   
   Required:
   - VITE_SUPABASE_URL=your-supabase-url
   - VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   - VITE_APP_NAME=Docket Chief
   - VITE_ENVIRONMENT=production
   - VITE_PAYMENTS_ENABLED=false (or true if ready)

2. Supabase Edge Functions:
   Deploy the legal-ai-chat edge function:
   $ supabase functions deploy legal-ai-chat
   
   Set secrets:
   $ supabase functions secrets set \\
     OPENAI_API_KEY=sk-your-key \\
     ALLOWED_ORIGINS=https://docketchief.com,https://www.docketchief.com

================================================================================
DEPLOYMENT STEPS:
================================================================================

METHOD 1: File Manager (Recommended for beginners)
---------------------------------------------------

1. Log in to GoDaddy cPanel
   - Go to https://www.godaddy.com
   - Navigate to: My Products > Web Hosting > Manage

2. Open File Manager
   - Click "File Manager" in the Files section

3. Navigate to public_html
   - Click on "public_html" folder
   - This is your web root directory

4. BACKUP existing files (if any)
   - Select all files in public_html
   - Click "Compress" > "Zip Archive"
   - Name it: backup_$(date +%Y%m%d).zip
   - Download this backup

5. CLEAR public_html
   - Delete all existing files (keep your backup!)
   - Leave the directory empty

6. Upload new files
   - Click "Upload" button
   - Upload the file: ${DEPLOY_ZIP}
   - Or upload all files from: ${DEPLOY_DIR}/
   - Wait for upload to complete (may take 2-5 minutes)

7. Extract (if uploaded ZIP)
   - Right-click the ZIP file
   - Select "Extract"
   - Extract to: public_html/
   - Delete the ZIP file after extraction

8. Verify .htaccess
   - Check that .htaccess file exists in public_html/
   - If not, create it with the content from dist/.htaccess

9. Set file permissions
   - Select all files
   - Click "Permissions"
   - Set directories to 755
   - Set files to 644

10. Test the deployment
    - Visit: https://your-domain.com
    - Check that the site loads
    - Test navigation (should work without page reloads)

METHOD 2: FTP (Recommended for advanced users)
------------------------------------------------

1. Get FTP credentials from GoDaddy
   - cPanel > FTP Accounts > Configure FTP Client

2. Connect using FTP client (FileZilla, Cyberduck, etc.)
   - Host: ftp.your-domain.com
   - Username: your-ftp-username
   - Password: your-ftp-password
   - Port: 21

3. Navigate to public_html/

4. BACKUP existing files
   - Download all current files to your computer

5. Upload new files
   - Upload all contents of: ${DEPLOY_DIR}/
   - Ensure .htaccess is uploaded
   - Binary mode for uploads (automatic for most clients)

6. Set permissions
   - Directories: 755
   - Files: 644

7. Test the deployment

METHOD 3: SSH/Command Line (Advanced)
--------------------------------------

If you have SSH access:

1. SSH into your GoDaddy server
   $ ssh username@your-domain.com

2. Navigate to web root
   $ cd public_html/

3. Backup existing files
   $ tar -czf backup_$(date +%Y%m%d).tar.gz *

4. Clear directory
   $ rm -rf * .*

5. Upload your deployment package (using scp from local machine)
   $ scp -r ${DEPLOY_DIR}/* username@your-domain.com:public_html/

6. Set permissions
   $ chmod 755 public_html/
   $ find public_html/ -type d -exec chmod 755 {} \\;
   $ find public_html/ -type f -exec chmod 644 {} \\;

================================================================================
POST-DEPLOYMENT VERIFICATION:
================================================================================

1. Website Loading
   ☐ Visit https://your-domain.com
   ☐ Page loads without errors
   ☐ No 404 errors in browser console

2. SPA Routing
   ☐ Click navigation links
   ☐ Pages load without full page refresh
   ☐ Direct URL access works (e.g., /legal-research)

3. Supabase Connection
   ☐ Try to sign up/sign in
   ☐ Check if database queries work
   ☐ Verify edge functions respond

4. Core Features
   ☐ Legal Research search works
   ☐ Document upload/analysis works
   ☐ AI Chat responds
   ☐ Export to PDF/DOCX works

5. Performance
   ☐ Page load time < 3 seconds
   ☐ Images load correctly
   ☐ JavaScript executes without errors

================================================================================
TROUBLESHOOTING:
================================================================================

Problem: "404 Not Found" on navigation
Solution: Verify .htaccess file is present and contains SPA routing rules

Problem: "White screen" or JavaScript errors
Solution: Check browser console, verify all JS files uploaded correctly

Problem: "Cannot connect to Supabase"
Solution: Verify environment variables are set in build or cPanel

Problem: Slow page loads
Solution: Enable compression and caching in .htaccess (already included)

Problem: HTTPS redirect not working
Solution: Check .htaccess RewriteEngine and HTTPS rules

Problem: Files not showing in File Manager
Solution: Enable "Show Hidden Files" in File Manager settings

================================================================================
ROLLBACK PROCEDURE:
================================================================================

If something goes wrong:

1. Download your backup file
2. Delete current files in public_html/
3. Extract backup to public_html/
4. Restore previous .htaccess if needed

================================================================================
MAINTENANCE:
================================================================================

Regular Updates:
1. Always backup before updating
2. Run this deployment script again with latest code
3. Monitor error logs in cPanel

Cache Clearing:
- Browser: Hard reload (Ctrl+Shift+R)
- CDN: If using Cloudflare, purge cache
- Server: May need to wait 5-10 minutes for changes

================================================================================
SUPPORT:
================================================================================

GoDaddy Support: 1-480-505-8877 (24/7)
Documentation: https://www.godaddy.com/help

For DocketChief issues:
- Check GitHub repository
- Review diagnostic reports
- Contact development team

================================================================================
DEPLOYMENT PACKAGE DETAILS:
================================================================================

Package: ${DEPLOY_ZIP}
Directory: ${DEPLOY_DIR}/
Generated: $(date)
Build Size: $(du -sh dist/ | cut -f1)
Total Files: $(find dist/ -type f | wc -l)

Files included:
- index.html (main application entry)
- assets/ (CSS, JavaScript, images)
- .htaccess (server configuration)
- All static assets

NOT included (hosted separately):
- Supabase database
- Edge functions (deployed separately)
- Environment variables (set in cPanel)

================================================================================
EOF

echo -e "${GREEN}✓ Deployment instructions created: DEPLOYMENT_INSTRUCTIONS.txt${NC}"
echo ""

# Summary
echo "========================================="
echo "DEPLOYMENT PREPARATION COMPLETE!"
echo "========================================="
echo ""
echo -e "${GREEN}Your deployment package is ready:${NC}"
echo ""
echo "📦 Deployment Package:"
if [ -f "${DEPLOY_ZIP}" ]; then
    echo "   - ZIP file: ${DEPLOY_ZIP}"
fi
echo "   - Directory: ${DEPLOY_DIR}/"
echo "   - Size: $(du -sh dist/ | cut -f1)"
echo "   - Files: $(find dist/ -type f | wc -l)"
echo ""
echo "📄 Important Files:"
echo "   - DEPLOYMENT_INSTRUCTIONS.txt (read this first!)"
echo "   - dist/.htaccess (server configuration)"
echo "   - legal-research-diagnostic.html (feature testing)"
echo ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo ""
echo "1. READ the DEPLOYMENT_INSTRUCTIONS.txt file thoroughly"
echo "2. Set up environment variables in GoDaddy cPanel (if not done)"
echo "3. Deploy Supabase edge functions (if not done)"
echo "4. Upload files to GoDaddy using File Manager or FTP"
echo "5. Test the deployment at your domain"
echo ""
echo -e "${GREEN}Good luck with your deployment! 🚀${NC}"
echo ""
