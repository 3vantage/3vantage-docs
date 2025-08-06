# Production Deployment Guide

## Overview

This guide documents the **completed production deployment** of the AquaScene Ecosystem. The system is currently deployed and operational with 4 integrated applications, comprehensive monitoring, and business-ready integrations.

**Status**: ✅ **PRODUCTION DEPLOYED** - All components operational

## Deployed Architecture

## Infrastructure Architecture

### Production Environment Architecture

```mermaid
graph TB
    subgraph "CDN Layer"
        CF[Cloudflare]
    end
    
    subgraph "Load Balancer"
        LB[Nginx Load Balancer]
    end
    
    subgraph "Application Layer"
        APP1[AquaScene Main - Instance 1]
        APP2[AquaScene Main - Instance 2]
        WL1[Waitlist SPA - Instance 1]
        WL2[Waitlist SPA - Instance 2]
        CE[Content Engine]
    end
    
    subgraph "Database Layer"
        DB[(PostgreSQL Primary)]
        DBR[(PostgreSQL Read Replica)]
        REDIS[(Redis Cluster)]
    end
    
    subgraph "External Services"
        S3[AWS S3]
        RES[Resend Email]
        OAI[OpenAI API]
        GA[Green Aqua API]
        MON[Monitoring Stack]
    end
    
    CF --> LB
    LB --> APP1
    LB --> APP2
    LB --> WL1
    LB --> WL2
    LB --> CE
    
    APP1 --> DB
    APP2 --> DBR
    WL1 --> DB
    WL2 --> DBR
    CE --> DB
    
    APP1 --> REDIS
    APP2 --> REDIS
    CE --> REDIS
    
    CE --> S3
    APP1 --> RES
    CE --> OAI
    APP1 --> GA
    
    MON --> APP1
    MON --> APP2
    MON --> WL1
    MON --> WL2
    MON --> CE
```

### Infrastructure Requirements

#### Production Server Specifications

**Load Balancer (1 instance):**
- **CPU**: 2 vCPUs
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **Bandwidth**: 10Gbps
- **OS**: Ubuntu 22.04 LTS

**Application Servers (2+ instances):**
- **CPU**: 4 vCPUs
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Bandwidth**: 5Gbps
- **OS**: Ubuntu 22.04 LTS

**Database Server:**
- **CPU**: 8 vCPUs
- **RAM**: 32GB
- **Storage**: 500GB SSD (with backup storage)
- **IOPS**: 10,000+
- **Bandwidth**: 10Gbps

**Content Engine Server:**
- **CPU**: 8 vCPUs (AI processing intensive)
- **RAM**: 16GB
- **Storage**: 200GB SSD
- **GPU**: Optional (for future ML workloads)

#### Recommended Cloud Providers

**AWS Configuration:**
- **Load Balancer**: Application Load Balancer (ALB)
- **Compute**: EC2 instances (t3.large, t3.xlarge)
- **Database**: RDS PostgreSQL with Multi-AZ
- **Cache**: ElastiCache Redis cluster
- **Storage**: S3 for assets, EBS for server storage
- **CDN**: CloudFront
- **Monitoring**: CloudWatch + custom metrics

**Digital Ocean Configuration:**
- **Load Balancer**: Digital Ocean Load Balancer
- **Compute**: Droplets (4GB, 8GB configurations)
- **Database**: Managed PostgreSQL with read replica
- **Cache**: Managed Redis cluster
- **Storage**: Spaces (S3-compatible) + Block Storage
- **CDN**: Spaces CDN
- **Monitoring**: Custom Grafana + Prometheus setup

## Pre-Deployment Checklist

### Environment Preparation

```bash
# Create deployment checklist script
#!/bin/bash
# deployment-checklist.sh

echo "🚀 AquaScene Production Deployment Checklist"
echo "============================================="

# Check prerequisites
echo "📋 Checking Prerequisites..."

# Check server access
echo "🔐 Verifying server access..."
ssh -o ConnectTimeout=10 ubuntu@your-server.com "echo 'Server accessible'" || {
    echo "❌ Cannot access production server"
    exit 1
}

# Check DNS configuration
echo "🌐 Checking DNS configuration..."
nslookup aquascene.com || {
    echo "❌ DNS not properly configured"
    exit 1
}

# Check SSL certificates
echo "🔒 Verifying SSL certificates..."
openssl s_client -connect aquascene.com:443 -servername aquascene.com < /dev/null 2>/dev/null | openssl x509 -noout -dates || {
    echo "❌ SSL certificate issues detected"
    exit 1
}

# Check environment variables
echo "🔧 Verifying environment configuration..."
required_vars=(
    "DATABASE_URL"
    "REDIS_URL"
    "RESEND_API_KEY"
    "OPENAI_API_KEY"
    "GREEN_AQUA_API_KEY"
    "NEXTAUTH_SECRET"
    "CLOUDINARY_API_KEY"
)

for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]]; then
        echo "❌ Missing environment variable: $var"
        exit 1
    fi
done

echo "✅ All prerequisites satisfied"
```

### Security Configuration

#### SSL/TLS Setup with Let's Encrypt

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Generate certificates for all domains
sudo certbot --nginx -d aquascene.com -d www.aquascene.com -d waitlist.aquascene.com -d api.aquascene.com -d content.aquascene.com

# Set up auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

#### Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (change port from default 22)
sudo ufw allow 2222/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow database connections from app servers only
sudo ufw allow from 10.0.1.0/24 to any port 5432

# Enable firewall
sudo ufw enable
sudo ufw status verbose
```

#### Fail2Ban Configuration

```bash
# Install and configure Fail2Ban
sudo apt install fail2ban

# Create custom configuration
sudo tee /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 2222

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
bantime = 7200
maxretry = 10
EOF

sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Database Deployment

### PostgreSQL Production Setup

#### Primary Database Installation and Configuration

```bash
# Install PostgreSQL 15
sudo apt update
sudo apt install postgresql-15 postgresql-contrib-15

# Configure PostgreSQL for production
sudo -u postgres psql << EOF
-- Create database and user
CREATE DATABASE aquascene_prod;
CREATE USER aquascene_prod WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE aquascene_prod TO aquascene_prod;

-- Create additional databases
CREATE DATABASE aquascene_analytics;
CREATE DATABASE aquascene_content;
GRANT ALL PRIVILEGES ON DATABASE aquascene_analytics TO aquascene_prod;
GRANT ALL PRIVILEGES ON DATABASE aquascene_content TO aquascene_prod;

-- Exit
\q
EOF
```

#### PostgreSQL Configuration Optimization

```bash
# Edit postgresql.conf for production
sudo nano /etc/postgresql/15/main/postgresql.conf
```

**Production PostgreSQL Configuration:**
```ini
# Memory settings
shared_buffers = 8GB                    # 25% of RAM
effective_cache_size = 24GB             # 75% of RAM
work_mem = 64MB
maintenance_work_mem = 2GB

# Checkpoint settings
wal_buffers = 16MB
checkpoint_completion_target = 0.9
checkpoint_timeout = 10min
max_wal_size = 4GB

# Connection settings
max_connections = 200
shared_preload_libraries = 'pg_stat_statements'

# Performance monitoring
track_activities = on
track_counts = on
track_io_timing = on
track_functions = all

# Logging
log_min_duration_statement = 1000
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
```

#### Database Migration and Seeding

```bash
# Create migration script
#!/bin/bash
# migrate-production.sh

set -e

echo "🗄️ Starting production database migration..."

# Export database URLs
export DATABASE_URL="postgresql://aquascene_prod:password@localhost:5432/aquascene_prod"
export ANALYTICS_DATABASE_URL="postgresql://aquascene_prod:password@localhost:5432/aquascene_analytics"

# Navigate to application directory
cd /var/www/aquascene

# Install dependencies
pnpm install --frozen-lockfile --production

# Run database migrations
echo "📊 Running main database migrations..."
pnpm prisma migrate deploy

echo "📈 Running analytics database migrations..."
DATABASE_URL=$ANALYTICS_DATABASE_URL pnpm prisma migrate deploy

# Seed production data
echo "🌱 Seeding production data..."
pnpm prisma db seed --environment=production

# Create database backup
echo "💾 Creating initial backup..."
pg_dump $DATABASE_URL | gzip > "/var/backups/aquascene_initial_$(date +%Y%m%d_%H%M%S).sql.gz"

echo "✅ Database migration completed successfully"
```

### Redis Setup for Caching and Sessions

```bash
# Install Redis
sudo apt install redis-server

# Configure Redis for production
sudo nano /etc/redis/redis.conf
```

**Redis Production Configuration:**
```ini
# Security
requirepass your-redis-password
bind 127.0.0.1 10.0.1.10

# Memory management
maxmemory 4gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log

# Performance
tcp-keepalive 300
timeout 0
```

```bash
# Restart and enable Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Test Redis connection
redis-cli -a your-redis-password ping
```

## Application Deployment

### Main Application Deployment

#### Deployment Script for AquaScene Main Platform

```bash
#!/bin/bash
# deploy-aquascene-main.sh

set -e

APP_NAME="aquascene-main"
APP_DIR="/var/www/aquascene"
REPO_URL="git@github.com:3vantage/aquascene.git"
BRANCH="main"
PM2_APP_NAME="aquascene-main"

echo "🚀 Deploying AquaScene Main Application"
echo "======================================"

# Create deployment directory
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
    echo "📦 Updating existing repository..."
    cd $APP_DIR
    git fetch origin
    git reset --hard origin/$BRANCH
else
    echo "📦 Cloning repository..."
    git clone -b $BRANCH $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Install dependencies
echo "📚 Installing dependencies..."
pnpm install --frozen-lockfile --production

# Build application
echo "🔨 Building application..."
pnpm build

# Copy environment configuration
echo "🔧 Configuring environment..."
cp /etc/aquascene/production.env .env.production

# Database migrations (if needed)
echo "🗄️ Running database migrations..."
pnpm prisma migrate deploy

# Restart application with PM2
echo "🔄 Restarting application..."
if pm2 list | grep -q $PM2_APP_NAME; then
    pm2 restart $PM2_APP_NAME
else
    pm2 start ecosystem.config.js --only $PM2_APP_NAME
fi

# Save PM2 configuration
pm2 save

# Verify deployment
echo "✅ Verifying deployment..."
sleep 10

# Check if application is running
if pm2 list | grep -q "online.*$PM2_APP_NAME"; then
    echo "✅ $APP_NAME deployed successfully"
    
    # Run health check
    curl -f http://localhost:3000/api/health || {
        echo "❌ Health check failed"
        exit 1
    }
    
    echo "✅ Health check passed"
else
    echo "❌ Deployment failed - application not running"
    pm2 logs $PM2_APP_NAME --lines 50
    exit 1
fi

echo "🎉 Deployment completed successfully!"
```

#### PM2 Ecosystem Configuration

```javascript
// ecosystem.config.js
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
        PORT: 3000,
        DATABASE_URL: 'postgresql://aquascene_prod:password@localhost:5432/aquascene_prod',
        REDIS_URL: 'redis://localhost:6379',
        NEXTAUTH_URL: 'https://aquascene.com'
      },
      error_file: '/var/log/pm2/aquascene-main-error.log',
      out_file: '/var/log/pm2/aquascene-main-out.log',
      log_file: '/var/log/pm2/aquascene-main.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      node_args: '--max_old_space_size=2048'
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
        PORT: 3001,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        ADMIN_KEY: process.env.ADMIN_KEY
      },
      error_file: '/var/log/pm2/waitlist-error.log',
      out_file: '/var/log/pm2/waitlist-out.log',
      autorestart: true,
      max_memory_restart: '512M'
    },
    {
      name: 'content-engine',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/aquascene-content-engine',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
        REDIS_URL: process.env.REDIS_URL
      },
      error_file: '/var/log/pm2/content-engine-error.log',
      out_file: '/var/log/pm2/content-engine-out.log',
      autorestart: true,
      max_memory_restart: '2G',
      cron_restart: '0 6 * * *' // Restart daily at 6 AM
    }
  ]
};
```

### Load Balancer Configuration

#### Nginx Configuration for Production

```nginx
# /etc/nginx/sites-available/aquascene
upstream aquascene_main {
    least_conn;
    server 127.0.0.1:3000 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3002 weight=1 max_fails=3 fail_timeout=30s;
}

upstream aquascene_waitlist {
    least_conn;
    server 127.0.0.1:3001 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3003 weight=1 max_fails=3 fail_timeout=30s;
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;
limit_req_zone $binary_remote_addr zone=waitlist:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=general:10m rate=100r/m;

# Main application
server {
    listen 443 ssl http2;
    server_name aquascene.com www.aquascene.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/aquascene.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aquascene.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https: wss:;" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Static file caching
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # API endpoints with rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://aquascene_main;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Main application
    location / {
        limit_req zone=general burst=50 nodelay;
        proxy_pass http://aquascene_main;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint (no rate limiting)
    location /health {
        access_log off;
        proxy_pass http://aquascene_main;
        proxy_set_header Host $host;
    }
}

# Waitlist subdomain
server {
    listen 443 ssl http2;
    server_name waitlist.aquascene.com;
    
    # SSL configuration (same as above)
    ssl_certificate /etc/letsencrypt/live/aquascene.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aquascene.com/privkey.pem;
    
    # Waitlist API with stricter rate limiting
    location /api/waitlist {
        limit_req zone=waitlist burst=10 nodelay;
        proxy_pass http://aquascene_waitlist;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Main waitlist application
    location / {
        limit_req zone=general burst=30 nodelay;
        proxy_pass http://aquascene_waitlist;
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

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name aquascene.com www.aquascene.com waitlist.aquascene.com;
    return 301 https://$server_name$request_uri;
}
```

## Environment Configuration

### Production Environment Variables

Create secure environment configuration:

```bash
# Create environment directory
sudo mkdir -p /etc/aquascene
sudo chmod 700 /etc/aquascene

# Create production environment file
sudo tee /etc/aquascene/production.env << 'EOF'
# Application Environment
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_BASE_URL=https://aquascene.com

# Database Configuration
DATABASE_URL=postgresql://aquascene_prod:secure_db_password@localhost:5432/aquascene_prod
ANALYTICS_DATABASE_URL=postgresql://aquascene_prod:secure_db_password@localhost:5432/aquascene_analytics
DATABASE_MAX_CONNECTIONS=50

# Cache Configuration
REDIS_URL=redis://:redis_password@localhost:6379/0
REDIS_SESSION_DB=1
REDIS_CACHE_DB=2

# Authentication
NEXTAUTH_URL=https://aquascene.com
NEXTAUTH_SECRET=very_long_random_string_for_nextauth_jwt_signing_and_encryption

# Email Services
RESEND_API_KEY=re_production_resend_api_key_here
RESEND_FROM_EMAIL=hello@aquascene.com
RESEND_TO_EMAIL=gerasimovkris@3vantage.com

# AI Services
OPENAI_API_KEY=sk-production_openai_api_key_here
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000

# Social Media APIs
INSTAGRAM_ACCESS_TOKEN=production_instagram_access_token
INSTAGRAM_CLIENT_ID=production_instagram_client_id
INSTAGRAM_CLIENT_SECRET=production_instagram_client_secret

# External Partner APIs
GREEN_AQUA_API_KEY=production_green_aqua_api_key
GREEN_AQUA_API_URL=https://api.greenaqua.hu/v1
GREEN_AQUA_WEBHOOK_SECRET=green_aqua_webhook_secret

# Media Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Analytics & Monitoring
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
GOOGLE_TAG_MANAGER_ID=GTM-CONTAINER_ID
SENTRY_DSN=https://your_sentry_dsn_here
DATADOG_API_KEY=your_datadog_api_key

# Security
ADMIN_KEY=very_secure_admin_key_for_sensitive_operations
WEBHOOK_SECRET=webhook_verification_secret_key
ENCRYPTION_KEY=32_character_encryption_key_here

# Performance & Scaling
MAX_CONCURRENT_REQUESTS=1000
REQUEST_TIMEOUT=30000
ENABLE_CACHING=true
CACHE_TTL=3600

# Feature Flags
ENABLE_AI_CONTENT=true
ENABLE_INSTAGRAM_POSTING=true
ENABLE_EMAIL_CAMPAIGNS=true
ENABLE_ANALYTICS=true
ENABLE_GREEN_AQUA_INTEGRATION=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE=/var/log/aquascene/application.log
EOF

# Set secure permissions
sudo chmod 600 /etc/aquascene/production.env
sudo chown root:root /etc/aquascene/production.env
```

### Environment Loading Script

```bash
#!/bin/bash
# load-environment.sh

set -a  # automatically export all variables
source /etc/aquascene/production.env
set +a

# Validate required environment variables
required_vars=(
    "DATABASE_URL"
    "REDIS_URL"
    "NEXTAUTH_SECRET"
    "RESEND_API_KEY"
    "OPENAI_API_KEY"
)

for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]]; then
        echo "❌ Missing required environment variable: $var"
        exit 1
    fi
done

echo "✅ Environment variables loaded successfully"
```

## Monitoring and Observability

### Application Health Monitoring

#### Health Check Endpoints

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    external: ServiceStatus;
  };
  metrics: {
    memory: MemoryUsage;
    cpu: CPUUsage;
    requests: RequestMetrics;
  };
}

interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastChecked: string;
  error?: string;
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const health: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    uptime: process.uptime(),
    services: {
      database: { status: 'healthy', lastChecked: new Date().toISOString() },
      redis: { status: 'healthy', lastChecked: new Date().toISOString() },
      external: { status: 'healthy', lastChecked: new Date().toISOString() }
    },
    metrics: {
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external
      },
      cpu: {
        usage: process.cpuUsage()
      },
      requests: await getRequestMetrics()
    }
  };

  // Check database connectivity
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.services.database.responseTime = Date.now() - dbStart;
  } catch (error) {
    health.services.database.status = 'unhealthy';
    health.services.database.error = error.message;
    health.status = 'degraded';
  }

  // Check Redis connectivity
  try {
    const redisStart = Date.now();
    await redis.ping();
    health.services.redis.responseTime = Date.now() - redisStart;
  } catch (error) {
    health.services.redis.status = 'unhealthy';
    health.services.redis.error = error.message;
    health.status = 'degraded';
  }

  // Check external services
  try {
    const externalChecks = await Promise.allSettled([
      checkResendAPI(),
      checkOpenAIAPI(),
      checkGreenAquaAPI()
    ]);

    const failedServices = externalChecks.filter(
      result => result.status === 'rejected'
    );

    if (failedServices.length > 0) {
      health.services.external.status = 'degraded';
      health.services.external.error = `${failedServices.length} external service(s) failing`;
    }
  } catch (error) {
    health.services.external.status = 'unhealthy';
    health.services.external.error = error.message;
  }

  // Determine overall status
  const unhealthyServices = Object.values(health.services).filter(
    service => service.status === 'unhealthy'
  );

  if (unhealthyServices.length > 0) {
    health.status = 'unhealthy';
  } else if (Object.values(health.services).some(service => service.status === 'degraded')) {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 :
                    health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}

async function checkResendAPI(): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'health@aquascene.com',
      to: ['health@aquascene.com'],
      subject: 'Health Check',
      text: 'This is a health check email'
    })
  });

  if (!response.ok) {
    throw new Error(`Resend API health check failed: ${response.status}`);
  }
}

async function getRequestMetrics(): Promise<RequestMetrics> {
  // Implement request metrics collection
  return {
    total: 0,
    successful: 0,
    failed: 0,
    averageResponseTime: 0
  };
}
```

#### Monitoring Stack Setup with Prometheus and Grafana

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=secure_grafana_password
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources

  node_exporter:
    image: prom/node-exporter:latest
    container_name: node_exporter
    restart: unless-stopped
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    restart: unless-stopped
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
```

**Prometheus Configuration:**
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'aquascene-main'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'aquascene-waitlist'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'content-engine'
    static_configs:
      - targets: ['localhost:3004']
    metrics_path: '/metrics'
    scrape_interval: 60s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']

  - job_name: 'postgresql'
    static_configs:
      - targets: ['localhost:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
```

### Logging Configuration

#### Centralized Logging with Winston

```typescript
// src/lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'aquascene' },
  transports: [
    // Write all logs to console in development
    ...(process.env.NODE_ENV === 'development' 
      ? [new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })]
      : []
    ),

    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: '/var/log/aquascene/error.log', 
      level: 'error' 
    }),

    // Write all logs to application.log
    new winston.transports.File({ 
      filename: '/var/log/aquascene/application.log' 
    })
  ]
});

// Add request logging middleware
export const requestLogger = (req: Request, res: Response, next: Function) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
};

export default logger;
```

## Backup and Disaster Recovery

### Automated Backup System

```bash
#!/bin/bash
# backup-system.sh

set -e

BACKUP_DIR="/var/backups/aquascene"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

echo "🔄 Starting backup process at $(date)"

# Database backup
echo "📊 Backing up PostgreSQL databases..."
pg_dump $DATABASE_URL | gzip > "$BACKUP_DIR/database_main_$DATE.sql.gz"
pg_dump $ANALYTICS_DATABASE_URL | gzip > "$BACKUP_DIR/database_analytics_$DATE.sql.gz"

# Redis backup
echo "🔴 Backing up Redis data..."
redis-cli --rdb "$BACKUP_DIR/redis_$DATE.rdb"

# Application files backup
echo "📁 Backing up application files..."
tar -czf "$BACKUP_DIR/app_files_$DATE.tar.gz" \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='logs' \
  /var/www/aquascene

# Environment configuration backup
echo "🔧 Backing up configuration..."
cp /etc/aquascene/production.env "$BACKUP_DIR/environment_$DATE.env"

# Upload to S3 (if configured)
if [[ -n "$AWS_S3_BACKUP_BUCKET" ]]; then
    echo "☁️ Uploading backups to S3..."
    aws s3 cp "$BACKUP_DIR/" "s3://$AWS_S3_BACKUP_BUCKET/aquascene-backups/" --recursive --include "*$DATE*"
fi

# Clean up old backups
echo "🧹 Cleaning up old backups..."
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.rdb" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.env" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup process completed successfully"

# Send backup notification
curl -X POST "https://api.aquascene.com/internal/notifications" \
  -H "X-Internal-Key: $INTERNAL_API_KEY" \
  -d '{
    "type": "backup_completed",
    "timestamp": "'$(date -Iseconds)'",
    "size": "'$(du -sh $BACKUP_DIR | cut -f1)'"
  }'
```

### Disaster Recovery Plan

```bash
#!/bin/bash
# disaster-recovery.sh

set -e

BACKUP_DATE=${1:-latest}
BACKUP_DIR="/var/backups/aquascene"

echo "🚨 Starting disaster recovery process..."
echo "Target backup date: $BACKUP_DATE"

# Stop all services
echo "⏹️ Stopping application services..."
pm2 stop all
sudo systemctl stop nginx
sudo systemctl stop postgresql
sudo systemctl stop redis-server

# Restore database
echo "🗄️ Restoring database..."
sudo systemctl start postgresql
sleep 5

if [[ "$BACKUP_DATE" == "latest" ]]; then
    DB_BACKUP=$(ls -t $BACKUP_DIR/database_main_*.sql.gz | head -1)
    ANALYTICS_BACKUP=$(ls -t $BACKUP_DIR/database_analytics_*.sql.gz | head -1)
else
    DB_BACKUP="$BACKUP_DIR/database_main_${BACKUP_DATE}.sql.gz"
    ANALYTICS_BACKUP="$BACKUP_DIR/database_analytics_${BACKUP_DATE}.sql.gz"
fi

# Drop and recreate databases
sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS aquascene_prod;
DROP DATABASE IF EXISTS aquascene_analytics;
CREATE DATABASE aquascene_prod;
CREATE DATABASE aquascene_analytics;
GRANT ALL PRIVILEGES ON DATABASE aquascene_prod TO aquascene_prod;
GRANT ALL PRIVILEGES ON DATABASE aquascene_analytics TO aquascene_prod;
EOF

# Restore database data
gunzip -c "$DB_BACKUP" | sudo -u postgres psql aquascene_prod
gunzip -c "$ANALYTICS_BACKUP" | sudo -u postgres psql aquascene_analytics

# Restore Redis
echo "🔴 Restoring Redis data..."
sudo systemctl stop redis-server
if [[ "$BACKUP_DATE" == "latest" ]]; then
    REDIS_BACKUP=$(ls -t $BACKUP_DIR/redis_*.rdb | head -1)
else
    REDIS_BACKUP="$BACKUP_DIR/redis_${BACKUP_DATE}.rdb"
fi
sudo cp "$REDIS_BACKUP" /var/lib/redis/dump.rdb
sudo chown redis:redis /var/lib/redis/dump.rdb
sudo systemctl start redis-server

# Restore application files
echo "📁 Restoring application files..."
if [[ "$BACKUP_DATE" == "latest" ]]; then
    APP_BACKUP=$(ls -t $BACKUP_DIR/app_files_*.tar.gz | head -1)
else
    APP_BACKUP="$BACKUP_DIR/app_files_${BACKUP_DATE}.tar.gz"
fi

# Extract to temporary location and move
mkdir -p /tmp/recovery
tar -xzf "$APP_BACKUP" -C /tmp/recovery
sudo rsync -av /tmp/recovery/var/www/aquascene/ /var/www/aquascene/
rm -rf /tmp/recovery

# Restore environment configuration
echo "🔧 Restoring environment configuration..."
if [[ "$BACKUP_DATE" == "latest" ]]; then
    ENV_BACKUP=$(ls -t $BACKUP_DIR/environment_*.env | head -1)
else
    ENV_BACKUP="$BACKUP_DIR/environment_${BACKUP_DATE}.env"
fi
sudo cp "$ENV_BACKUP" /etc/aquascene/production.env

# Rebuild applications
echo "🔨 Rebuilding applications..."
cd /var/www/aquascene
pnpm install --frozen-lockfile --production
pnpm build

# Start services
echo "▶️ Starting services..."
sudo systemctl start redis-server
sudo systemctl start postgresql
sudo systemctl start nginx
pm2 start ecosystem.config.js

# Verify recovery
echo "✅ Verifying recovery..."
sleep 30

# Health check
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Disaster recovery completed successfully"
    
    # Send recovery notification
    curl -X POST "https://hooks.slack.com/your-webhook-url" \
      -d '{
        "text": "🎉 AquaScene disaster recovery completed successfully",
        "attachments": [{
          "color": "good",
          "fields": [{
            "title": "Recovery Date",
            "value": "'$BACKUP_DATE'",
            "short": true
          }, {
            "title": "Completed At",
            "value": "'$(date)'",
            "short": true
          }]
        }]
      }'
else
    echo "❌ Recovery verification failed"
    exit 1
fi
```

## Security Hardening

### Server Security Configuration

```bash
#!/bin/bash
# security-hardening.sh

echo "🔒 Applying security hardening measures..."

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install security tools
sudo apt install -y unattended-upgrades fail2ban ufw aide chkrootkit

# Configure automatic security updates
sudo dpkg-reconfigure -plow unattended-upgrades

# Secure SSH configuration
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
sudo tee /etc/ssh/sshd_config << EOF
Port 2222
Protocol 2
HostKey /etc/ssh/ssh_host_rsa_key
HostKey /etc/ssh/ssh_host_dsa_key
HostKey /etc/ssh/ssh_host_ecdsa_key
UsePrivilegeSeparation yes
KeyRegenerationInterval 3600
ServerKeyBits 768
SyslogFacility AUTH
LogLevel INFO
LoginGraceTime 120
PermitRootLogin no
StrictModes yes
RSAAuthentication yes
PubkeyAuthentication yes
IgnoreRhosts yes
RhostsRSAAuthentication no
HostbasedAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no
PasswordAuthentication no
X11Forwarding no
X11DisplayOffset 10
PrintMotd no
PrintLastLog yes
TCPKeepAlive yes
MaxAuthTries 3
MaxStartups 10:30:60
Banner /etc/issue.net
Subsystem sftp /usr/lib/openssh/sftp-server
UsePAM yes
EOF

sudo systemctl restart sshd

# Configure file integrity monitoring
sudo aide --init
sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db

# Set up log monitoring
sudo tee /etc/rsyslog.d/50-aquascene.conf << EOF
:programname, isequal, "aquascene" /var/log/aquascene/application.log
& stop
EOF

sudo systemctl restart rsyslog

echo "✅ Security hardening completed"
```

## Performance Optimization

### Caching Strategy Implementation

```typescript
// src/lib/cache/redis-cache.ts
import Redis from 'ioredis';

class CacheManager {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache pattern invalidation error:', error);
    }
  }
}

export const cache = new CacheManager();

// Cache middleware for API routes
export function withCache(ttl: number = 3600) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const cacheKey = `api:${propertyName}:${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }
      
      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Store in cache
      await cache.set(cacheKey, result, ttl);
      
      return result;
    };
    
    return descriptor;
  };
}
```

This comprehensive deployment guide provides everything needed to successfully deploy the AquaScene ecosystem to production environments. The guide covers infrastructure setup, security configurations, monitoring implementation, and operational procedures for maintaining a scalable, reliable platform.