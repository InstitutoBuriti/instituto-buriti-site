# 🐙 GitHub Setup Guide - Instituto Buriti

## Overview
This guide provides detailed instructions for setting up the GitHub repository for the Instituto Buriti unified platform.

## 📋 Prerequisites

### Required Information
- **GitHub Account:** `contatoinstitutoburiti@gmail.com`
- **Password:** `Hdaniel11511@#$%&*()`
- **Repository Name:** `instituto-buriti-unified`
- **Project Files:** Complete .zip package

## 🚀 Step-by-Step Setup

### Step 1: GitHub Account Access

#### 1.1 Login to GitHub
1. **Go to:** https://github.com
2. **Click:** "Sign in"
3. **Enter credentials:**
   - Email: `contatoinstitutoburiti@gmail.com`
   - Password: `Hdaniel11511@#$%&*()`

#### 1.2 Verify Account Status
- [ ] Account is active
- [ ] Email is verified
- [ ] Two-factor authentication (if enabled)

### Step 2: Repository Creation

#### 2.1 Create New Repository
1. **Click:** "New" button (green button)
2. **Repository name:** `instituto-buriti-unified`
3. **Description:** `Unified web platform for Instituto Buriti with smart device detection`
4. **Visibility:** 
   - ✅ **Private** (recommended for production)
   - ⚠️ **Public** (only if open source desired)
5. **Initialize repository:**
   - [ ] Add a README file (we'll upload our own)
   - [ ] Add .gitignore (not needed for static site)
   - [ ] Choose a license (optional)

#### 2.2 Repository Settings
After creation, configure:
- **Topics:** `education`, `website`, `responsive`, `netlify`
- **Website:** `https://www.institutoburiti.com.br`
- **Issues:** Enable for bug tracking
- **Wiki:** Enable for documentation
- **Projects:** Enable for project management

### Step 3: File Upload

#### 3.1 Upload Method Options

**Option A: Web Interface (Recommended for beginners)**
1. **Click:** "uploading an existing file"
2. **Drag and drop** the extracted folder contents
3. **Maintain folder structure** exactly as provided
4. **Commit message:** `Initial commit: Instituto Buriti unified platform`

**Option B: Git Command Line**
```bash
# Clone the repository
git clone https://github.com/contatoinstitutoburiti/instituto-buriti-unified.git

# Navigate to repository
cd instituto-buriti-unified

# Copy all files from extracted zip
cp -r /path/to/extracted/files/* .

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: Instituto Buriti unified platform"

# Push to GitHub
git push origin main
```

#### 3.2 Verify Upload
After upload, verify the structure:
```
instituto-buriti-unified/
├── README.md (auto-generated or uploaded)
├── index.html
├── 404.html
├── desktop/
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── images/
│   └── pages/
├── mobile/
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── dashboard-aluno/
│   ├── dashboard-instrutor/
│   └── dashboard-admin/
├── shared/
│   ├── css/
│   └── images/
├── config/
│   ├── netlify.toml
│   ├── _headers
│   └── _redirects
└── docs/
    ├── README.md
    ├── DEPLOYMENT.md
    └── GITHUB_SETUP.md
```

### Step 4: Branch Management

#### 4.1 Create Development Branches
```bash
# Create and switch to development branch
git checkout -b development

# Create desktop-specific branch
git checkout -b desktop-updates

# Create mobile-specific branch
git checkout -b mobile-updates

# Return to main branch
git checkout main

# Push all branches
git push origin development
git push origin desktop-updates
git push origin mobile-updates
```

#### 4.2 Branch Protection Rules
1. **Go to:** Settings → Branches
2. **Add rule for `main` branch:**
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

### Step 5: Collaboration Setup

#### 5.1 Add Collaborators (if needed)
1. **Go to:** Settings → Manage access
2. **Click:** "Invite a collaborator"
3. **Add team members** with appropriate permissions:
   - **Admin:** Full access
   - **Write:** Push access
   - **Read:** View only

#### 5.2 Team Permissions
- **Hemerson Daniel:** Admin (owner)
- **Development Team:** Write access
- **Content Team:** Write access (if applicable)

### Step 6: Repository Configuration

#### 6.1 Security Settings
1. **Go to:** Settings → Security & analysis
2. **Enable:**
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Secret scanning

#### 6.2 Pages Configuration (Optional)
1. **Go to:** Settings → Pages
2. **Source:** Deploy from a branch
3. **Branch:** `main`
4. **Folder:** `/ (root)`
5. **Custom domain:** `www.institutoburiti.com.br`

### Step 7: Integration Setup

#### 7.1 Netlify Integration
1. **In Netlify dashboard:**
   - Connect to GitHub
   - Select `instituto-buriti-unified` repository
   - Configure build settings
   - Enable automatic deployments

#### 7.2 Webhook Configuration
Netlify will automatically create webhooks for:
- Push events
- Pull request events
- Branch creation/deletion

### Step 8: Documentation

#### 8.1 Update README.md
Replace the auto-generated README with our comprehensive documentation:
```markdown
# Instituto Buriti - Unified Web Platform

[Content from docs/README.md]
```

#### 8.2 Create Issue Templates
1. **Go to:** Settings → Features → Issues
2. **Set up templates** for:
   - Bug reports
   - Feature requests
   - Documentation updates

### Step 9: Workflow Automation

#### 9.1 GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Netlify
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: '.'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🔍 Verification Checklist

### Repository Setup
- [ ] Repository created successfully
- [ ] All files uploaded with correct structure
- [ ] Branches created (main, development, desktop-updates, mobile-updates)
- [ ] Branch protection rules configured
- [ ] Security features enabled

### Integration
- [ ] Netlify connected to repository
- [ ] Automatic deployments working
- [ ] Webhooks configured
- [ ] Domain connected

### Documentation
- [ ] README.md updated
- [ ] Documentation files accessible
- [ ] Issue templates created
- [ ] Wiki configured (if used)

## 🛠️ Maintenance Tasks

### Daily
- [ ] Check for security alerts
- [ ] Review pull requests
- [ ] Monitor deployment status

### Weekly
- [ ] Review open issues
- [ ] Update documentation if needed
- [ ] Check repository insights

### Monthly
- [ ] Review collaborator access
- [ ] Update dependencies
- [ ] Archive completed projects

## 🆘 Troubleshooting

### Common Issues

#### Issue: Upload failed
**Solution:**
- Check file size limits (100MB per file)
- Verify internet connection
- Try uploading in smaller batches

#### Issue: Branch protection preventing merge
**Solution:**
- Create pull request instead of direct push
- Request review from repository admin
- Ensure all status checks pass

#### Issue: Netlify not deploying
**Solution:**
- Check webhook configuration
- Verify repository permissions
- Review build logs in Netlify

## 📞 Support Resources

- **GitHub Docs:** https://docs.github.com
- **GitHub Support:** https://support.github.com
- **Netlify Docs:** https://docs.netlify.com
- **Git Tutorial:** https://git-scm.com/docs/gittutorial

---

**Setup Date:** _To be filled after completion_  
**Setup By:** Hemerson Daniel  
**Repository:** https://github.com/contatoinstitutoburiti/instituto-buriti-unified  
**Next Review:** _30 days after setup_

