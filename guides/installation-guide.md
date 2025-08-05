# Installation Guide

## Overview

This guide provides step-by-step instructions for setting up the complete aquascaping content generation engine ecosystem on your local development environment and production servers.

## System Requirements

### Minimum Requirements
- **OS**: macOS 12+, Ubuntu 20.04+, Windows 10+ (with WSL2)
- **Node.js**: 18.17.0 or higher
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space for development
- **Network**: Stable internet connection for API integrations

### Recommended Development Setup
- **CPU**: Multi-core processor (M1/M2 Mac or modern Intel/AMD)
- **RAM**: 16GB or higher
- **Storage**: SSD with at least 20GB free space
- **Monitor**: 1920x1080 or higher resolution

## Prerequisites Installation

### 1. Node.js and Package Manager

#### Option A: Using Node Version Manager (Recommended)
```bash
# Install nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload terminal
source ~/.bashrc  # or ~/.zshrc

# Install and use Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

#### Option B: Direct Installation
- Download from [nodejs.org](https://nodejs.org/)
- Choose LTS version (18.x.x)
- Follow installer instructions

#### Install pnpm (Recommended Package Manager)
```bash
# Install pnpm globally
npm install -g pnpm@latest

# Verify installation
pnpm --version  # Should show 8.x.x or higher
```

### 2. Database Setup

#### Option A: PostgreSQL with Docker (Recommended for Development)
```bash
# Install Docker Desktop from docker.com

# Create and start PostgreSQL container
docker run --name aquascene-postgres \
  -e POSTGRES_USER=aquascene \
  -e POSTGRES_PASSWORD=development \
  -e POSTGRES_DB=aquascene \
  -p 5432:5432 \
  -d postgres:15

# Verify container is running
docker ps | grep aquascene-postgres
```

#### Option B: Local PostgreSQL Installation
```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql-15 postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE USER aquascene WITH PASSWORD 'development';
CREATE DATABASE aquascene OWNER aquascene;
GRANT ALL PRIVILEGES ON DATABASE aquascene TO aquascene;
\q
```

### 3. Redis (Optional - for caching)
```bash
# macOS with Homebrew
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server

# Docker (cross-platform)
docker run --name aquascene-redis -p 6379:6379 -d redis:7-alpine
```

### 4. Git Configuration
```bash
# Configure Git (if not already done)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Generate SSH key for GitHub (if not already done)
ssh-keygen -t ed25519 -C "your.email@example.com"
cat ~/.ssh/id_ed25519.pub  # Add this to GitHub SSH keys
```

## Project Installation

### 1. Clone Repositories

#### Main Platform
```bash
# Create workspace directory
mkdir ~/aquascene-workspace
cd ~/aquascene-workspace

# Clone main platform
git clone git@github.com:3vantage/aquascene.git
cd aquascene

# Install dependencies
pnpm install

# Return to workspace
cd ..
```

#### Waitlist SPA
```bash
# Clone waitlist application
git clone git@github.com:3vantage/aquascene-waitlist.git
cd aquascene-waitlist

# Install dependencies
pnpm install

# Return to workspace
cd ..
```

#### Content Engine (if available)
```bash
# Clone content generation engine
git clone git@github.com:3vantage/aquascene-content-engine.git
cd aquascene-content-engine

# Install dependencies
pnpm install

# Return to workspace
cd ..
```

#### Documentation
```bash
# Clone documentation
git clone git@github.com:3vantage/3vantage-docs.git
```

### 2. Environment Configuration

#### Main Platform Environment
```bash
cd aquascene

# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local  # or use your preferred editor
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL="postgresql://aquascene:development@localhost:5432/aquascene"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-long-random-secret-key-here"

# Email Service
RESEND_API_KEY="re_your_resend_api_key"
RESEND_FROM_EMAIL="hello@aquascene.com"
RESEND_TO_EMAIL="gerasimovkris@3vantage.com"

# AI Services
OPENAI_API_KEY="sk-your-openai-api-key"

# Social Media (Optional)
INSTAGRAM_ACCESS_TOKEN="your-instagram-access-token"
INSTAGRAM_CLIENT_ID="your-instagram-client-id"
INSTAGRAM_CLIENT_SECRET="your-instagram-client-secret"

# External APIs
GREEN_AQUA_API_KEY="your-green-aqua-api-key"
GREEN_AQUA_API_URL="https://api.greenaqua.hu/v1"

# Analytics (Optional)
GOOGLE_ANALYTICS_ID="GA_MEASUREMENT_ID"
GOOGLE_TAG_MANAGER_ID="GTM-XXXXXXX"

# Upload Service
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"

# Caching (Optional)
REDIS_URL="redis://localhost:6379"

# Development
NODE_ENV="development"
ANALYZE="false"
```

#### Waitlist SPA Environment
```bash
cd ../aquascene-waitlist

# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

**Waitlist Environment Variables:**
```env
# Email Service (Required)
RESEND_API_KEY="re_your_resend_api_key"
RESEND_FROM_EMAIL="waitlist@aquascene.com"
RESEND_TO_EMAIL="gerasimovkris@3vantage.com"

# Application URLs
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

# Admin Access
ADMIN_KEY="your-secure-admin-key"

# Analytics (Optional)
NEXT_PUBLIC_GA_ID="GA_MEASUREMENT_ID"

# Development
NODE_ENV="development"
```

### 3. Database Setup

#### Initialize Main Platform Database
```bash
cd aquascene

# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# Seed development data
pnpm db:seed

# Optional: Open Prisma Studio
pnpm db:studio
```

#### Verify Database Connection
```bash
# Test database connection
pnpm db:test

# Expected output: "✅ Database connection successful"
```

### 4. API Keys and External Services

#### Resend Email Service
1. Sign up at [resend.com](https://resend.com)
2. Create API key
3. Add domain verification (for production)
4. Update environment variables

#### OpenAI API
1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Set usage limits
4. Update environment variables

#### Cloudinary (Image Management)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get cloud name and API credentials
3. Configure upload presets
4. Update environment variables

#### Instagram API (Optional)
1. Create Facebook Developer account
2. Create Instagram Basic Display app
3. Get access tokens
4. Configure webhook endpoints
5. Update environment variables

## Development Server Setup

### 1. Start Individual Services

#### Start Main Platform
```bash
cd aquascene

# Development server with hot reload
pnpm dev

# Server will start on http://localhost:3000
```

#### Start Waitlist SPA
```bash
cd aquascene-waitlist

# Development server
pnpm dev

# Server will start on http://localhost:3001 (or next available port)
```

#### Start Content Engine
```bash
cd aquascene-content-engine

# Development server
pnpm dev

# Background services will start
```

### 2. Verify Installation

#### Health Check Script
```bash
cd aquascene

# Run comprehensive health check
pnpm health:check
```

**Expected Output:**
```
✅ Node.js version: 18.17.0
✅ Dependencies installed
✅ Database connection: OK
✅ Environment variables: OK
✅ External APIs: OK
✅ Email service: OK
✅ Build process: OK
```

#### Test Key Features
```bash
# Test theme switching
curl http://localhost:3000/api/themes

# Test waitlist form
curl -X POST http://localhost:3001/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","experience":"beginner","interests":["3d_design"],"gdprConsent":true}'

# Test content generation
pnpm content:test
```

## Production Installation

### 1. Server Requirements

#### Minimum Production Specs
- **CPU**: 2 vCPUs
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **Bandwidth**: 1TB/month
- **OS**: Ubuntu 20.04+ LTS

#### Recommended Production Specs
- **CPU**: 4 vCPUs
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **Bandwidth**: 2TB/month
- **CDN**: Cloudflare or similar

### 2. Server Setup

#### Initial Server Configuration
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2 for process management
npm install -g pm2

# Install Nginx
sudo apt install nginx

# Install SSL certificate tool
sudo apt install certbot python3-certbot-nginx
```

#### Database Setup (Production)
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create production database
sudo -u postgres psql
CREATE USER aquascene_prod WITH PASSWORD 'secure_production_password';
CREATE DATABASE aquascene_prod OWNER aquascene_prod;
GRANT ALL PRIVILEGES ON DATABASE aquascene_prod TO aquascene_prod;
\q
```

### 3. Application Deployment

#### Clone and Build
```bash
# Create application directory
sudo mkdir -p /var/www/aquascene
sudo chown $USER:$USER /var/www/aquascene

# Clone repository
cd /var/www/aquascene
git clone git@github.com:3vantage/aquascene.git .

# Install dependencies
pnpm install --frozen-lockfile --production

# Build application
pnpm build
```

#### Production Environment
```bash
# Create production environment file
cp .env.example .env.production

# Edit with production values
nano .env.production
```

**Production Environment Variables:**
```env
# Database
DATABASE_URL="postgresql://aquascene_prod:secure_password@localhost:5432/aquascene_prod"

# Authentication
NEXTAUTH_URL="https://aquascene.com"
NEXTAUTH_SECRET="very-long-secure-random-string"

# Email
RESEND_API_KEY="re_production_api_key"
RESEND_FROM_EMAIL="hello@aquascene.com"

# AI Services
OPENAI_API_KEY="sk-production-openai-key"

# Production settings
NODE_ENV="production"
```

#### PM2 Configuration
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'aquascene-main',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/aquascene',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'aquascene-waitlist',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/aquascene-waitlist',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
```

#### Start Services
```bash
# Start applications with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 4. Nginx Configuration

#### Main Site Configuration
```bash
sudo nano /etc/nginx/sites-available/aquascene
```

```nginx
server {
    listen 80;
    server_name aquascene.com www.aquascene.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name waitlist.aquascene.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Enable Site and SSL
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/aquascene /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Setup SSL certificates
sudo certbot --nginx -d aquascene.com -d www.aquascene.com
sudo certbot --nginx -d waitlist.aquascene.com
```

## Verification and Testing

### 1. Development Verification
```bash
# Run all tests
pnpm test

# Check build process
pnpm build

# Verify all services
pnpm health:check
```

### 2. Production Verification
```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs

# Test production endpoints
curl https://aquascene.com/api/health
curl https://waitlist.aquascene.com/api/health
```

### 3. Performance Testing
```bash
# Install testing tools
npm install -g lighthouse artillery

# Run Lighthouse audit
lighthouse https://aquascene.com --output json --output-path ./lighthouse-report.json

# Load testing
artillery quick --count 10 --num 5 https://aquascene.com
```

## Troubleshooting

### Common Installation Issues

#### 1. Node.js Version Issues
```bash
# Check Node.js version
node --version

# If wrong version, use nvm
nvm install 18
nvm use 18
```

#### 2. Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection manually
psql -h localhost -U aquascene -d aquascene
```

#### 3. Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

#### 4. Permission Issues
```bash
# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER /usr/local/lib/node_modules
```

#### 5. Build Failures
```bash
# Clear caches
rm -rf .next node_modules package-lock.json
pnpm install
pnpm build
```

### Environment-Specific Issues

#### Development
- Ensure all environment variables are set
- Check that databases are running
- Verify API keys are valid

#### Production
- Check firewall settings (ports 80, 443)
- Verify SSL certificates
- Monitor system resources
- Check PM2 logs for errors

## Additional Tools and Utilities

### Development Tools
```bash
# Install useful development tools
npm install -g @next/bundle-analyzer
npm install -g prisma
npm install -g vercel

# VS Code extensions (recommended)
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
```

### Monitoring Setup
```bash
# Install monitoring tools
npm install -g pm2
pm2 install pm2-logrotate

# Setup log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## Support and Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Prisma Documentation](https://prisma.io/docs)

### Community Support
- **Email**: [gerasimovkris@3vantage.com](mailto:gerasimovkris@3vantage.com)
- **Issues**: GitHub Issues on respective repositories
- **Updates**: Check documentation regularly for updates

### Professional Support
For enterprise installation and custom configuration, contact 3vantage support team for professional installation services and ongoing maintenance contracts.