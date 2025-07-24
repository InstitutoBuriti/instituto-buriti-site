# Instituto Buriti - Unified Web Platform

## 📋 Project Overview

This is the unified web platform for Instituto Buriti, featuring both desktop and mobile versions with smart device detection and seamless user experience.

## 🏗️ Project Structure

```
instituto_buriti_unified/
├── index.html                 # Main entry point with device detection
├── 404.html                  # Custom 404 error page
├── desktop/                  # Desktop version files
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── images/
│   └── pages/
├── mobile/                   # Mobile version files
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── dashboard-aluno/
│   ├── dashboard-instrutor/
│   └── dashboard-admin/
├── shared/                   # Shared resources
│   ├── css/
│   └── images/
├── config/                   # Configuration files
│   ├── netlify.toml
│   ├── _headers
│   └── _redirects
└── docs/                     # Documentation
    ├── README.md
    ├── DEPLOYMENT.md
    └── GITHUB_SETUP.md
```

## 🎯 Key Features

### Smart Device Detection
- Automatic detection of mobile vs desktop devices
- User preference storage in localStorage
- Manual version switching capability
- SEO-friendly URL structure (no /mobile routes)

### Performance Optimization
- Optimized loading screens
- Proper caching headers
- Image optimization
- Minified assets

### Security
- HTTPS enforcement
- Security headers implementation
- XSS protection
- Content type validation

## 🚀 Deployment Instructions

### Prerequisites
- GitHub account
- Netlify account (connected to GitHub)
- Domain configured (institutoburiti.com.br)

### Step 1: GitHub Setup
1. Create new repository: `instituto-buriti-unified`
2. Upload all files maintaining folder structure
3. Create branches:
   - `main` (production)
   - `desktop` (desktop-specific updates)
   - `mobile` (mobile-specific updates)
   - `development` (testing)

### Step 2: Netlify Configuration
1. Connect repository to Netlify
2. Set build settings:
   - Build command: `echo 'Static site'`
   - Publish directory: `.`
3. Configure custom domain: `www.institutoburiti.com.br`
4. Enable HTTPS and force redirect

### Step 3: DNS Configuration
Point your domain to Netlify:
- A record: `104.198.14.52`
- CNAME: `www` → `your-site.netlify.app`

## 🔧 Configuration Files

### netlify.toml
Main Netlify configuration with:
- Build settings
- Redirect rules
- Header configuration
- Environment variables

### _headers
Additional header configuration for:
- Security headers
- Cache control
- Performance optimization

### _redirects
URL redirect rules for:
- HTTPS enforcement
- Device-specific routing
- Legacy URL support

## 📱 Device Detection Logic

The platform uses JavaScript-based device detection:

```javascript
function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
    const screenWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return isMobile && !isTablet && screenWidth < 768;
}
```

### Detection Priority:
1. URL parameter (`?version=mobile` or `?version=desktop`)
2. User preference (localStorage)
3. Automatic device detection
4. Default to desktop for tablets

## 🎨 Version Switching

Users can manually switch between versions:
- Add `?version=mobile` or `?version=desktop` to any URL
- Preference is saved and remembered
- Smooth transition between versions

## 🔐 Authentication System

### Mobile Version Features:
- JWT-based authentication
- Role-based dashboards (Student, Instructor, Admin)
- Secure logout functionality
- API integration for real-time data

### Credentials (Demo):
- **Student:** aluno@institutoburiti.com.br / senha123
- **Instructor:** instrutor@institutoburiti.com.br / senha123
- **Admin:** admin@institutoburiti.com.br / senha123

## 📊 Analytics & Monitoring

### Recommended Tools:
- Google Analytics 4
- Netlify Analytics
- Core Web Vitals monitoring
- Error tracking (Sentry)

## 🛠️ Maintenance

### Regular Tasks:
- Monitor Core Web Vitals
- Update dependencies
- Review error logs
- Performance optimization
- Content updates

### Version Updates:
1. Test in development branch
2. Deploy to staging
3. User acceptance testing
4. Deploy to production
5. Monitor for issues

## 📞 Support

For technical support or questions:
- Email: suporte@institutoburiti.com.br
- Documentation: This README file
- GitHub Issues: For bug reports and feature requests

## 📄 License

© 2024 Instituto Buriti. All rights reserved.

---

**Last Updated:** July 2024  
**Version:** 1.0.0  
**Maintainer:** Manus Development Team

