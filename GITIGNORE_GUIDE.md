# Git Ignore Setup Guide - Fleet Management System

## 📋 Overview

This project has a comprehensive .gitignore setup to keep your repository clean and secure. The ignore files are strategically placed to handle different parts of the application.

## 📁 File Structure

```
Fleet Management System/
├── .gitignore                 # Root level - covers entire project
├── frontend/.gitignore        # Frontend specific ignores
├── backend/.gitignore         # Backend specific ignores
└── GITIGNORE_GUIDE.md        # This guide
```

## 🎯 What's Being Ignored

### 🔒 **Security & Sensitive Data**
- Environment variables (`.env*`)
- SSL certificates (`*.pem`, `*.key`, `*.crt`)
- Database files (`*.db`, `*.sqlite`)
- Session files
- API keys and secrets

### 📦 **Dependencies & Build Artifacts**
- `node_modules/` directories
- Build outputs (`dist/`, `build/`)
- Package manager caches
- TypeScript build info

### 📝 **Development Files**
- IDE configurations (`.vscode/`, `.idea/`)
- Editor temporary files (`*.swp`, `*.swo`)
- OS generated files (`.DS_Store`, `Thumbs.db`)
- Log files (`*.log`)

### 🧪 **Testing & Coverage**
- Coverage reports (`coverage/`)
- Test results
- Playwright reports

### 📤 **User Generated Content**
- Upload directories (`uploads/`)
- Media files
- Generated reports
- Backup files

## 🛠 **Customization**

### Package Manager Lock Files
The .gitignore includes commented sections for package manager lock files:

```gitignore
# Keep the one you're using, comment out others:
# package-lock.json
# yarn.lock
# pnpm-lock.yaml
```

**Recommendation**: Uncomment the lock file you're NOT using to ignore it.

### Environment-Specific Ignores
Add project-specific files to the "FLEET MANAGEMENT SPECIFIC" section:

```gitignore
# ===== FLEET MANAGEMENT SPECIFIC =====
# Add your custom ignores here
custom-config.json
local-settings.js
```

## 🔧 **Best Practices**

### 1. **Never Commit Sensitive Data**
- Always add new environment files to .gitignore
- Use `.env.example` for environment variable templates
- Keep API keys and secrets out of the repository

### 2. **Keep Dependencies Out**
- Never commit `node_modules/`
- Use lock files for dependency management
- Let package managers handle installations

### 3. **Ignore Build Artifacts**
- Build outputs should be generated, not committed
- Use CI/CD for production builds
- Keep source code, not compiled code

### 4. **Clean Development Environment**
- Ignore IDE-specific files
- Don't commit personal editor configurations
- Use `.vscode/extensions.json` for recommended extensions

## 📋 **Verification**

To check what files are being ignored:

```bash
# See all ignored files
git status --ignored

# Check if a specific file is ignored
git check-ignore path/to/file

# See what would be added (dry run)
git add --dry-run .
```

## 🚨 **Common Issues**

### File Already Tracked
If a file is already tracked by Git, adding it to .gitignore won't ignore it:

```bash
# Remove from tracking but keep local file
git rm --cached filename

# Remove directory from tracking
git rm -r --cached directory/
```

### Global Git Ignore
For personal preferences (like IDE files), consider a global .gitignore:

```bash
# Set global gitignore
git config --global core.excludesfile ~/.gitignore_global
```

## 🔄 **Maintenance**

### Regular Updates
- Review .gitignore when adding new tools
- Update when project structure changes
- Add new file types as needed

### Team Coordination
- Discuss .gitignore changes with team
- Document project-specific ignore rules
- Keep .gitignore in version control

## 📚 **Resources**

- [Git Documentation - gitignore](https://git-scm.com/docs/gitignore)
- [GitHub's gitignore templates](https://github.com/github/gitignore)
- [gitignore.io - Generate .gitignore files](https://www.toptal.com/developers/gitignore)

## ✅ **Quick Checklist**

- [ ] Root .gitignore covers project-wide ignores
- [ ] Frontend .gitignore handles React/Vite specifics
- [ ] Backend .gitignore covers Node.js/Express specifics
- [ ] Environment variables are ignored
- [ ] Build outputs are ignored
- [ ] Dependencies are ignored
- [ ] Sensitive files are ignored
- [ ] Team has reviewed ignore rules

---

**Note**: This .gitignore setup is comprehensive and covers most common scenarios for a React + Node.js fleet management system. Adjust as needed for your specific requirements.
