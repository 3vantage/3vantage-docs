# Production Deployment Guide

Complete guide for deploying the AquaScene Ecosystem to production environment.

## Prerequisites

- Ubuntu 22.04 LTS server (minimum 2GB RAM, 20GB storage)
- Domain name with DNS access
- SSH access to server
- Git installed on server

## Architecture Overview

```
Production Stack:
┌─────────────────────────────────────┐
│ Nginx (80/443) - Reverse Proxy     │
├─────────────────────────────────────┤
│ Frontend (Next.js) - Static Build  │
│ Backend API (Express.js) - :3001    │
│ AI Pipeline (FastAPI) - :8000      │
│ PostgreSQL Database - :5432        │
│ Monitoring Stack - :9090, :3000    │
└─────────────────────────────────────┘
```

## Step 1: Server Preparation

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
```

### 1.2 Install Docker and Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 1.3 Install Additional Dependencies
```bash
sudo apt install -y nginx certbot python3-certbot-nginx git curl
```

## Step 2: Application Deployment

### 2.1 Clone Application Repositories
```bash
cd /opt
sudo mkdir aquascape-ecosystem
sudo chown $USER:$USER aquascape-ecosystem
cd aquascape-ecosystem

# Clone all application repositories
git clone https://github.com/yourusername/aquascape-social-hub.git
git clone https://github.com/yourusername/aquascape-social-hub-frontend.git
git clone https://github.com/yourusername/aquascape-ai-pipeline.git
git clone https://github.com/yourusername/aquascape-infrastructure.git
```

### 2.2 Configure Environment Variables
```bash
cd aquascape-infrastructure
cp .env.example .env.production
nano .env.production
```

**Required Environment Variables:**
```env
# Application Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com

# Database Configuration
DATABASE_URL=postgresql://aquascape_user:secure_password@postgres:5432/aquascape_db
POSTGRES_DB=aquascape_db
POSTGRES_USER=aquascape_user
POSTGRES_PASSWORD=secure_password

# AI Services
OPENAI_API_KEY=your_openai_api_key
GOOGLE_AI_API_KEY=your_gemini_api_key

# Social Media APIs
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret

# Email Service
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com

# Green Aqua Integration
GREEN_AQUA_API_KEY=your_green_aqua_api_key
GREEN_AQUA_PARTNER_ID=your_partner_id

# JWT Secret
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# Monitoring
GRAFANA_ADMIN_PASSWORD=secure_grafana_password
```

### 2.3 Build and Deploy Applications
```bash
# Deploy infrastructure stack
cd /opt/aquascape-ecosystem/aquascape-infrastructure
docker-compose -f docker-compose.production.yml up -d

# Build and deploy backend
cd /opt/aquascape-ecosystem/aquascape-social-hub
docker build -t aquascape-backend:latest .
docker tag aquascape-backend:latest aquascape-backend:production

# Build and deploy frontend
cd /opt/aquascape-ecosystem/aquascape-social-hub-frontend
docker build -t aquascape-frontend:latest .
docker tag aquascape-frontend:latest aquascape-frontend:production

# Deploy AI pipeline
cd /opt/aquascape-ecosystem/aquascape-ai-pipeline
docker build -t aquascape-ai:latest .
docker tag aquascape-ai:latest aquascape-ai:production

# Start all services
cd /opt/aquascape-ecosystem/aquascape-infrastructure
docker-compose -f docker-compose.production.yml up -d --force-recreate
```

## Step 3: Database Setup

### 3.1 Database Migration
```bash
# Wait for PostgreSQL to be ready
sleep 30

# Run database migrations
docker-compose -f docker-compose.production.yml exec backend npm run migrate

# Seed initial data (optional)
docker-compose -f docker-compose.production.yml exec backend npm run seed
```

### 3.2 Verify Database Connection
```bash
docker-compose -f docker-compose.production.yml exec postgres psql -U aquascape_user -d aquascape_db -c "\\dt"
```

## Step 4: SSL/TLS and Nginx Configuration

### 4.1 Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/aquascape
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Frontend (React App)
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

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # AI Pipeline
    location /ai/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Monitoring (optional - restrict access)
    location /monitoring/ {
        auth_basic "Monitoring";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4.2 Enable Nginx Site
```bash
sudo ln -s /etc/nginx/sites-available/aquascape /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4.3 Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo systemctl enable certbot.timer
```

## Step 5: Production Validation

### 5.1 Health Checks
```bash
# Check all services are running
docker-compose -f docker-compose.production.yml ps

# Test API endpoints
curl -k https://yourdomain.com/api/health
curl -k https://yourdomain.com/ai/health

# Check database connectivity
docker-compose -f docker-compose.production.yml exec backend npm run db:status
```

### 5.2 Application Testing
```bash
# Test AI content generation
curl -X POST https://yourdomain.com/ai/generate-content \
  -H "Content-Type: application/json" \
  -d '{"type": "instagram", "topic": "aquascaping basics"}'

# Test social media integration (with valid tokens)
curl -X GET https://yourdomain.com/api/social/instagram/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5.3 Monitoring Verification
```bash
# Access Grafana dashboard
open https://yourdomain.com/monitoring/

# Check Prometheus targets
curl https://yourdomain.com/monitoring/prometheus/targets
```

## Step 6: Backup and Security

### 6.1 Setup Automated Backups
```bash
# Create backup script
sudo nano /opt/aquascape-ecosystem/backup.sh
```

**Backup Script:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/aquascape"
mkdir -p $BACKUP_DIR

# Database backup
docker-compose -f /opt/aquascape-ecosystem/aquascape-infrastructure/docker-compose.production.yml exec -T postgres pg_dump -U aquascape_user aquascape_db > $BACKUP_DIR/db_backup_$DATE.sql

# Media files backup
tar -czf $BACKUP_DIR/media_backup_$DATE.tar.gz /opt/aquascape-ecosystem/data/media/

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Make executable and add to crontab
sudo chmod +x /opt/aquascape-ecosystem/backup.sh
sudo crontab -e
# Add: 0 2 * * * /opt/aquascape-ecosystem/backup.sh
```

### 6.2 Security Hardening
```bash
# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Secure SSH
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no, PasswordAuthentication no
sudo systemctl restart ssh

# Install fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

## Step 7: Monitoring Setup

### 7.1 Grafana Configuration
```bash
# Access Grafana
open https://yourdomain.com/monitoring/
# Login: admin / (password from environment variables)

# Import AquaScene dashboard
# Dashboard ID: 1860 (Node Exporter Full)
# Custom dashboard: /opt/aquascape-ecosystem/monitoring/grafana-dashboard.json
```

### 7.2 Alerting Setup
```bash
# Configure Grafana alerts for:
# - High CPU/Memory usage
# - Database connection issues
# - API response time alerts
# - Disk space warnings
```

## Production Checklist

- [ ] All services running and healthy
- [ ] SSL certificates installed and auto-renewal configured
- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] Monitoring dashboards accessible
- [ ] Backup procedures automated
- [ ] Security hardening applied
- [ ] Firewall configured
- [ ] Log rotation configured
- [ ] API endpoints responding correctly
- [ ] Social media integrations tested
- [ ] AI content generation working
- [ ] Green Aqua integration functional

## Troubleshooting

For common deployment issues, see [Deployment Troubleshooting](../troubleshooting/deployment-issues.md).

## Maintenance

- **Daily**: Check monitoring dashboards
- **Weekly**: Review logs and system health
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review backup and disaster recovery procedures

## Support

For deployment support:
- Documentation: [Complete Documentation Index](../README.md)
- Issues: GitHub Issues on respective repositories
- Email: support@yourdomain.com