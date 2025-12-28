@echo off
REM =============================================================================
REM DocketChief Deployment Script for GoDaddy (Windows)
REM =============================================================================
REM This script guides you through deploying DocketChief to GoDaddy hosting
REM =============================================================================

echo =========================================
echo DocketChief GoDaddy Deployment Script
echo =========================================
echo.

REM Step 1: Verify we're in the right directory
echo Step 1: Verifying project directory...
if not exist "package.json" (
    echo Error: package.json not found. Please run this script from the DocketChief root directory.
    pause
    exit /b 1
)
echo [OK] Project directory verified
echo.

REM Step 2: Install dependencies
echo Step 2: Installing dependencies...
echo Running: npm ci
call npm ci
if errorlevel 1 (
    echo Error: npm ci failed
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Step 3: Run linter
echo Step 3: Running linter...
echo Running: npm run lint
call npm run lint
echo [OK] Lint check complete
echo.

REM Step 4: Build the application
echo Step 4: Building production bundle...
echo Running: npm run build
call npm run build
if errorlevel 1 (
    echo Error: Build failed
    pause
    exit /b 1
)
echo [OK] Production build complete
echo.

REM Step 5: Verify build output
echo Step 5: Verifying build output...
if not exist "dist" (
    echo Error: dist directory not found. Build may have failed.
    pause
    exit /b 1
)

if not exist "dist\index.html" (
    echo Error: dist\index.html not found. Build may be incomplete.
    pause
    exit /b 1
)

echo Build output verified
dir dist
echo [OK] Build output verified
echo.

REM Step 6: Create .htaccess file
echo Step 6: Creating .htaccess file...
(
echo # DocketChief .htaccess configuration for GoDaddy
echo # This file handles SPA routing and security headers
echo.
echo # Enable Rewrite Engine
echo RewriteEngine On
echo.
echo # Force HTTPS
echo RewriteCond %%{HTTPS} !=on
echo RewriteRule ^^ https://%%{HTTP_HOST}%%{REQUEST_URI} [L,R=301]
echo.
echo # SPA Routing - serve index.html for all routes
echo RewriteCond %%{REQUEST_FILENAME} !-f
echo RewriteCond %%{REQUEST_FILENAME} !-d
echo RewriteRule . /index.html [L]
echo.
echo # Security Headers
echo ^<IfModule mod_headers.c^>
echo     Header set X-Frame-Options "DENY"
echo     Header set X-XSS-Protection "1; mode=block"
echo     Header set X-Content-Type-Options "nosniff"
echo     Header set Referrer-Policy "strict-origin-when-cross-origin"
echo     Header set Permissions-Policy "geolocation=(^), microphone=(^), camera=(^)"
echo ^</IfModule^>
echo.
echo # Compression
echo ^<IfModule mod_deflate.c^>
echo     AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
echo ^</IfModule^>
echo.
echo # Browser Caching
echo ^<IfModule mod_expires.c^>
echo     ExpiresActive On
echo     ExpiresByType text/html "access plus 0 seconds"
echo     ExpiresByType text/css "access plus 1 year"
echo     ExpiresByType application/javascript "access plus 1 year"
echo     ExpiresByType image/png "access plus 1 year"
echo     ExpiresByType image/jpg "access plus 1 year"
echo     ExpiresByType image/gif "access plus 1 year"
echo ^</IfModule^>
) > "dist\.htaccess"
echo [OK] .htaccess file created
echo.

REM Step 7: Create deployment instructions
echo Step 7: Creating deployment instructions...
(
echo ================================================================================
echo DOCKETCHIEF GODADDY DEPLOYMENT INSTRUCTIONS ^(Windows^)
echo Generated: %date% %time%
echo ================================================================================
echo.
echo OVERVIEW:
echo This guide will help you deploy DocketChief to your GoDaddy hosting account.
echo.
echo ================================================================================
echo DEPLOYMENT STEPS - FILE MANAGER METHOD ^(EASIEST^):
echo ================================================================================
echo.
echo 1. Log in to GoDaddy cPanel
echo    - Go to https://www.godaddy.com
echo    - Navigate to: My Products ^> Web Hosting ^> Manage
echo.
echo 2. Open File Manager
echo    - Click "File Manager" in the Files section
echo.
echo 3. Navigate to public_html
echo    - Click on "public_html" folder
echo.
echo 4. BACKUP existing files
echo    - Select all files
echo    - Click "Compress" ^> "Zip Archive"
echo    - Name it: backup_%date:~-4%%date:~4,2%%date:~7,2%.zip
echo    - Download this backup
echo.
echo 5. CLEAR public_html
echo    - Delete all existing files ^(keep your backup!^)
echo.
echo 6. Upload new files
echo    - Click "Upload" button
echo    - Select ALL files from the 'dist' folder
echo    - Wait for upload to complete ^(2-5 minutes^)
echo.
echo 7. Verify .htaccess
echo    - Check that .htaccess file exists
echo    - Enable "Show Hidden Files" if needed
echo.
echo 8. Set file permissions
echo    - Select all files
echo    - Directories: 755
echo    - Files: 644
echo.
echo 9. Test the deployment
echo    - Visit: https://your-domain.com
echo    - Test navigation and features
echo.
echo ================================================================================
echo IMPORTANT: ENVIRONMENT VARIABLES
echo ================================================================================
echo.
echo You MUST set these in GoDaddy or rebuild with them:
echo.
echo - VITE_SUPABASE_URL=your-supabase-url
echo - VITE_SUPABASE_ANON_KEY=your-anon-key
echo - VITE_APP_NAME=Docket Chief
echo - VITE_ENVIRONMENT=production
echo - VITE_PAYMENTS_ENABLED=false
echo.
echo ================================================================================
echo TROUBLESHOOTING:
echo ================================================================================
echo.
echo Problem: 404 on navigation
echo Solution: Verify .htaccess file exists with SPA routing rules
echo.
echo Problem: White screen
echo Solution: Check browser console for errors
echo.
echo Problem: Cannot connect to Supabase
echo Solution: Verify environment variables are set correctly
echo.
echo ================================================================================
echo SUPPORT:
echo ================================================================================
echo.
echo GoDaddy Support: 1-480-505-8877 ^(24/7^)
echo.
echo ================================================================================
) > "DEPLOYMENT_INSTRUCTIONS_WINDOWS.txt"
echo [OK] Deployment instructions created
echo.

REM Summary
echo =========================================
echo DEPLOYMENT PREPARATION COMPLETE!
echo =========================================
echo.
echo Your deployment files are ready in the 'dist' folder
echo.
echo NEXT STEPS:
echo.
echo 1. READ the DEPLOYMENT_INSTRUCTIONS_WINDOWS.txt file
echo 2. Go to GoDaddy cPanel File Manager
echo 3. Upload ALL files from the 'dist' folder to public_html/
echo 4. Make sure .htaccess file is included
echo 5. Test your website!
echo.
echo Good luck with your deployment! 
echo.
pause
