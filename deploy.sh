#!/bin/bash

# 🚀 Thailand Packing List - Quick Deploy Script
echo "🎒 Thailand Packing List - Deploy to Vercel"
echo "=========================================="

# Check current Git configuration
echo "🔍 Current Git configuration:"
echo "Name: $(git config --global user.name)"
echo "Email: $(git config --global user.email)"
echo ""

# Warning about company accounts
echo "⚠️  IMPORTANT: Make sure you're using your PERSONAL GitHub account!"
echo "   If the email above is your company email, you may want to:"
echo "   1. Use incognito browser window for GitHub"
echo "   2. Sign into your personal GitHub account"
echo "   3. Or temporarily change git config:"
echo "      git config --global user.email 'your-personal@email.com'"
echo ""

read -p "✅ Are you ready to continue with PERSONAL account? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled. Please configure your personal GitHub account first."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Add all files
echo "📤 Adding files to Git..."
git add .

# Create commit
echo "💾 Creating commit..."
git commit -m "Deploy: Thailand Packing List app

🎒 Family packing list with local file persistence
✅ Auto-save functionality 
🌐 Vercel-ready serverless deployment
🔧 Fixed state management and data persistence

🚀 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

echo ""
echo "✅ Ready for deployment!"
echo ""
echo "🔒 SECURE DEPLOYMENT STEPS:"
echo "1. Open INCOGNITO/PRIVATE browser window"
echo "2. Go to: https://github.com/new"
echo "3. VERIFY owner shows YOUR PERSONAL account (not risup!)"
echo "4. Create repository named: thailand-packing-list"
echo "5. Run: git remote add origin https://github.com/YOUR-PERSONAL-USERNAME/thailand-packing-list.git"
echo "6. Run: git push -u origin main"
echo "7. Deploy to Vercel: https://vercel.com (import from GitHub)"
echo ""
echo "🌴 Have an amazing trip to Thailand! ✈️"