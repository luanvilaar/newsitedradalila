#!/bin/bash
# ==============================================
# DT App — Quick Update Script
# ==============================================
# Usage: bash hostinger/update.sh
# Pulls latest code, rebuilds, and restarts

set -euo pipefail

APP_DIR="/var/www/dt-app"

echo "🔄 DT App — Updating..."

cd "$APP_DIR"

# Pull latest
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies (in case of changes)
echo "📦 Installing dependencies..."
npm ci --production=false

# Build
echo "🔨 Building..."
npm run build

# Restart PM2
echo "♻️  Restarting PM2..."
pm2 restart dt-app

echo "✅ Update complete!"
echo ""
pm2 status
