#!/bin/bash
# ==============================================
# DT App - Hostinger VPS Deployment Script
# ==============================================
# Usage: bash hostinger/deploy.sh
# Run this on the VPS after initial setup

set -euo pipefail

APP_DIR="/var/www/dt-app"
REPO_URL="https://github.com/luanvilaar/newsitedradalila.git"
BRANCH="main"
NODE_VERSION="22"

echo "🚀 DT App — Deploy Script"
echo "========================="

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
   echo "⚠️  Run as root or with sudo"
   exit 1
fi

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

step() {
  echo -e "\n${GREEN}▶ $1${NC}"
}

warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# -------------------------------------------
# 1. System dependencies
# -------------------------------------------
step "Updating system packages..."
apt update && apt upgrade -y

step "Installing Nginx and essentials..."
apt install -y nginx curl git build-essential certbot python3-certbot-nginx

# -------------------------------------------
# 2. Node.js via NVM
# -------------------------------------------
if ! command -v node &> /dev/null; then
  step "Installing Node.js ${NODE_VERSION} via NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install ${NODE_VERSION}
  nvm use ${NODE_VERSION}
  nvm alias default ${NODE_VERSION}
else
  step "Node.js already installed: $(node --version)"
fi

# -------------------------------------------
# 3. PM2
# -------------------------------------------
if ! command -v pm2 &> /dev/null; then
  step "Installing PM2..."
  npm install -g pm2
else
  step "PM2 already installed: $(pm2 --version)"
fi

# -------------------------------------------
# 4. Clone or pull repository
# -------------------------------------------
if [ -d "$APP_DIR" ]; then
  step "Updating existing repository..."
  cd "$APP_DIR"
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
else
  step "Cloning repository..."
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
  git checkout "$BRANCH"
fi

# -------------------------------------------
# 5. Environment variables
# -------------------------------------------
if [ ! -f "$APP_DIR/.env.local" ]; then
  warn ".env.local not found!"
  echo "Creating from template. You MUST edit it with real values."
  cp "$APP_DIR/.env.example" "$APP_DIR/.env.local"
  echo ""
  echo "Run: nano $APP_DIR/.env.local"
  echo "Then re-run this script."
  exit 1
else
  step ".env.local found ✓"
fi

# -------------------------------------------
# 6. Install dependencies & build
# -------------------------------------------
step "Installing Node.js dependencies..."
cd "$APP_DIR"
npm ci --production=false

step "Building Next.js app..."
npm run build

# Create logs directory
mkdir -p "$APP_DIR/logs"

# -------------------------------------------
# 7. PM2 setup
# -------------------------------------------
step "Starting app with PM2..."
cd "$APP_DIR"
pm2 delete dt-app 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd -u root --hp /root
pm2 save

# -------------------------------------------
# 8. Nginx configuration
# -------------------------------------------
step "Configuring Nginx..."

# Add rate limiting zone to nginx.conf if not present
if ! grep -q "limit_req_zone.*zone=api" /etc/nginx/nginx.conf; then
  sed -i '/http {/a \    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;' /etc/nginx/nginx.conf
fi

cp "$APP_DIR/hostinger/nginx.conf" /etc/nginx/sites-available/dt-app
ln -sf /etc/nginx/sites-available/dt-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Reload nginx
systemctl reload nginx

# -------------------------------------------
# 9. Firewall
# -------------------------------------------
step "Configuring firewall..."
if command -v ufw &> /dev/null; then
  ufw allow 'Nginx Full'
  ufw allow OpenSSH
  ufw --force enable
  echo "UFW configured ✓"
fi

# -------------------------------------------
# Done
# -------------------------------------------
echo ""
echo "==========================================="
echo -e "${GREEN}✅ Deploy complete!${NC}"
echo "==========================================="
echo ""
echo "Next steps:"
echo "1. Update domain in /etc/nginx/sites-available/dt-app"
echo "   Replace 'seudominio.com.br' with your actual domain"
echo ""
echo "2. Point your domain DNS to this server IP"
echo ""
echo "3. Setup SSL:"
echo "   certbot --nginx -d seudominio.com.br -d www.seudominio.com.br"
echo ""
echo "4. Register Avisa webhook:"
echo "   cd $APP_DIR && npm run avisa:webhook:set -- https://seudominio.com.br/api/webhooks/avisa"
echo ""
echo "5. Verify:"
echo "   pm2 status"
echo "   curl -s http://localhost:3000"
echo ""
