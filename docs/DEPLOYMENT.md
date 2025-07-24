# 🚀 Deployment Guide - Instituto Buriti

## Overview
This guide provides step-by-step instructions for deploying the Instituto Buriti unified platform to production using GitHub and Netlify.

## 📋 Pre-Deployment Checklist

### ✅ Required Accounts & Access
- [x] GitHub account: `contatoinstitutoburiti@gmail.com`
- [x] Netlify account (connected via GitHub)
- [x] Domain access: `institutoburiti.com.br`
- [x] DNS management access

### ✅ Files Verification
- [x] Desktop version complete
- [x] Mobile version complete
- [x] Device detection implemented
- [x] Configuration files ready
- [x] Documentation complete

## 🔧 Step-by-Step Deployment

### Step 1: GitHub Repository Setup

#### 1.1 Create New Repository
```bash
# Repository name: instituto-buriti-unified
# Description: Unified web platform for Instituto Buriti
# Visibility: Private (recommended)
```

#### 1.2 Upload Project Files
1. **Extract the provided .zip file**
2. **Upload all files maintaining the exact folder structure:**
   ```
   instituto_buriti_unified/
   ├── index.html
   ├── 404.html
   ├── desktop/
   ├── mobile/
   ├── shared/
   ├── config/
   └── docs/
   ```

#### 1.3 Create Branch Structure
```bash
# Main branches to create:
- main (production)
- development (testing)
- desktop-updates (desktop-specific changes)
- mobile-updates (mobile-specific changes)
```

### Step 2: Netlify Configuration

#### 2.1 Connect Repository
1. **Login to Netlify** using GitHub account
2. **Click "New site from Git"**
3. **Select GitHub** as provider
4. **Choose repository:** `instituto-buriti-unified`
5. **Configure build settings:**
   - Branch to deploy: `main`
   - Build command: `echo 'Static site deployment'`
   - Publish directory: `.`

#### 2.2 Domain Configuration
1. **Go to Site Settings** → Domain management
2. **Add custom domain:** `www.institutoburiti.com.br`
3. **Add domain alias:** `institutoburiti.com.br`
4. **Enable HTTPS** and force redirect
5. **Wait for SSL certificate** provisioning

#### 2.3 Build Settings
```toml
# These settings are automatically applied from netlify.toml
[build]
  publish = "."
  command = "echo 'Static site - no build required'"

[build.environment]
  NODE_VERSION = "18"
```

### Step 3: DNS Configuration

#### 3.1 DNS Records Setup
Configure the following DNS records in your domain provider:

```dns
# A Records
@ → 75.2.60.5
www → 75.2.60.5

# CNAME Record (alternative)
www → your-netlify-site.netlify.app

# TXT Record (for verification)
_netlify → your-verification-code
```

#### 3.2 Verification
- **DNS propagation:** 24-48 hours maximum
- **SSL certificate:** Automatic after DNS propagation
- **Test both:** `http://institutoburiti.com.br` and `http://www.institutoburiti.com.br`

### Step 4: Configuration Files Deployment

#### 4.1 Netlify Configuration
The following files are automatically processed:

**netlify.toml** (main configuration):
- Build settings
- Redirect rules
- Header configuration
- Environment variables

**_headers** (additional headers):
- Security headers
- Cache control
- Performance optimization

**_redirects** (URL redirects):
- HTTPS enforcement
- Device routing
- Legacy URL support

#### 4.2 Verification Commands
```bash
# Test redirects
curl -I https://institutoburiti.com.br
curl -I https://www.institutoburiti.com.br

# Test headers
curl -I https://www.institutoburiti.com.br/desktop/index.html
curl -I https://www.institutoburiti.com.br/mobile/index.html
```

### Step 5: Testing & Validation

#### 5.1 Device Detection Testing
1. **Desktop browser:** Should load desktop version
2. **Mobile browser:** Should load mobile version
3. **Manual switching:** Test `?version=mobile` and `?version=desktop`
4. **Preference storage:** Verify localStorage persistence

#### 5.2 Functionality Testing
**Desktop Version:**
- [x] Homepage loading
- [x] Navigation menu
- [x] Contact forms
- [x] Responsive design
- [x] Image loading

**Mobile Version:**
- [x] Homepage loading
- [x] Login system
- [x] Dashboard access (all 3 types)
- [x] API integration
- [x] Logout functionality

#### 5.3 Performance Testing
```bash
# Tools to use:
- Google PageSpeed Insights
- GTmetrix
- WebPageTest
- Lighthouse (Chrome DevTools)

# Target metrics:
- First Contentful Paint: < 2s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms
```

### Step 6: Post-Deployment Configuration

#### 6.1 Analytics Setup
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

#### 6.2 Search Console Setup
1. **Add property** in Google Search Console
2. **Verify ownership** using HTML tag method
3. **Submit sitemap:** `https://www.institutoburiti.com.br/sitemap.xml`

#### 6.3 Monitoring Setup
- **Netlify Analytics:** Enable in site dashboard
- **Uptime monitoring:** Set up external monitoring
- **Error tracking:** Configure error reporting

## 🔍 Troubleshooting

### Common Issues & Solutions

#### Issue: DNS not propagating
**Solution:**
```bash
# Check DNS propagation
nslookup institutoburiti.com.br
dig institutoburiti.com.br

# Clear DNS cache
ipconfig /flushdns (Windows)
sudo dscacheutil -flushcache (macOS)
```

#### Issue: SSL certificate not provisioning
**Solution:**
1. Verify DNS records are correct
2. Wait 24-48 hours for propagation
3. Contact Netlify support if needed

#### Issue: Device detection not working
**Solution:**
1. Check browser console for JavaScript errors
2. Verify `shared/css/device-detection.css` is loading
3. Test with different user agents

#### Issue: Mobile login not working
**Solution:**
1. Verify backend API is accessible
2. Check CORS configuration
3. Test API endpoints directly

## 📊 Monitoring & Maintenance

### Daily Checks
- [ ] Site accessibility
- [ ] SSL certificate status
- [ ] Error logs review

### Weekly Checks
- [ ] Performance metrics
- [ ] Analytics review
- [ ] User feedback review

### Monthly Checks
- [ ] Security updates
- [ ] Content updates
- [ ] Backup verification

## 🆘 Emergency Procedures

### Site Down
1. **Check Netlify status:** status.netlify.com
2. **Verify DNS:** Use DNS checker tools
3. **Check build logs:** Netlify dashboard
4. **Rollback if needed:** Deploy previous version

### Performance Issues
1. **Check Core Web Vitals**
2. **Review recent changes**
3. **Optimize images if needed**
4. **Check third-party scripts**

## 📞 Support Contacts

- **Netlify Support:** support@netlify.com
- **GitHub Support:** support@github.com
- **Domain Provider:** Check your registrar
- **Development Team:** Manus Development Team

---

**Deployment Date:** _To be filled after deployment_  
**Deployed By:** Hemerson Daniel  
**Version:** 1.0.0  
**Next Review:** _30 days after deployment_

