# Troubleshooting Guide

## Overview

This comprehensive troubleshooting guide covers common issues, debugging techniques, performance problems, and solutions for the AquaScene aquascaping content generation engine ecosystem. Use this guide to quickly diagnose and resolve issues across all system components.

## Quick Diagnostic Tools

### System Health Check Script

```bash
#!/bin/bash
# health-check.sh - Comprehensive system diagnostic tool

echo "🏥 AquaScene System Health Check"
echo "================================="
echo "Started at: $(date)"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    local status=$1
    local message=$2
    case $status in
        "OK")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
    esac
}

# Check system resources
echo "📊 System Resources"
echo "-------------------"

# Memory check
MEMORY_USAGE=$(free | grep '^Mem:' | awk '{print ($3/$2) * 100.0}')
if (( $(echo "$MEMORY_USAGE < 80" | bc -l) )); then
    print_status "OK" "Memory usage: ${MEMORY_USAGE}%"
else
    print_status "WARNING" "High memory usage: ${MEMORY_USAGE}%"
fi

# Disk space check
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    print_status "OK" "Disk usage: ${DISK_USAGE}%"
else
    print_status "WARNING" "High disk usage: ${DISK_USAGE}%"
fi

# CPU load check
LOAD_AVERAGE=$(uptime | awk -F'load average:' '{print $2}' | cut -d, -f1 | tr -d ' ')
CPU_CORES=$(nproc)
if (( $(echo "$LOAD_AVERAGE < $CPU_CORES" | bc -l) )); then
    print_status "OK" "CPU load average: $LOAD_AVERAGE (${CPU_CORES} cores)"
else
    print_status "WARNING" "High CPU load: $LOAD_AVERAGE (${CPU_CORES} cores)"
fi

echo ""

# Check services
echo "🔧 Service Status"
echo "----------------"

# Check PM2 processes
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 list | grep -E "(online|errored|stopped)")
    if echo "$PM2_STATUS" | grep -q "online"; then
        print_status "OK" "PM2 applications running"
    else
        print_status "ERROR" "PM2 applications not running properly"
        echo "$PM2_STATUS"
    fi
else
    print_status "ERROR" "PM2 not installed or not in PATH"
fi

# Check Nginx
if systemctl is-active --quiet nginx; then
    print_status "OK" "Nginx is running"
else
    print_status "ERROR" "Nginx is not running"
fi

# Check PostgreSQL
if systemctl is-active --quiet postgresql; then
    print_status "OK" "PostgreSQL is running"
else
    print_status "ERROR" "PostgreSQL is not running"
fi

# Check Redis
if systemctl is-active --quiet redis-server; then
    print_status "OK" "Redis is running"
else
    print_status "ERROR" "Redis is not running"
fi

echo ""

# Check network connectivity
echo "🌐 Network Connectivity"
echo "----------------------"

# Check external APIs
check_api() {
    local name=$1
    local url=$2
    local timeout=${3:-10}
    
    if curl -s --max-time $timeout "$url" > /dev/null; then
        print_status "OK" "$name API accessible"
    else
        print_status "ERROR" "$name API not accessible"
    fi
}

check_api "OpenAI" "https://api.openai.com/v1/models" 5
check_api "Resend" "https://api.resend.com/domains" 5
check_api "Green Aqua" "https://greenaqua.hu" 5

echo ""

# Check application endpoints
echo "🚀 Application Endpoints"
echo "------------------------"

# Check main application
if curl -s --max-time 10 http://localhost:3000/api/health > /dev/null; then
    print_status "OK" "Main application health endpoint"
else
    print_status "ERROR" "Main application not responding"
fi

# Check waitlist application
if curl -s --max-time 10 http://localhost:3001/api/health > /dev/null; then
    print_status "OK" "Waitlist application health endpoint"
else
    print_status "ERROR" "Waitlist application not responding"
fi

echo ""

# Check database connectivity
echo "🗄️ Database Connectivity"
echo "------------------------"

# Check PostgreSQL connection
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    print_status "OK" "PostgreSQL connection"
else
    print_status "ERROR" "PostgreSQL connection failed"
fi

# Check Redis connection
if redis-cli ping > /dev/null 2>&1; then
    print_status "OK" "Redis connection"
else
    print_status "ERROR" "Redis connection failed"
fi

echo ""

# Check logs for errors
echo "📋 Recent Error Analysis"
echo "------------------------"

# Check for recent application errors
ERROR_COUNT=$(journalctl --since "1 hour ago" --priority=err | wc -l)
if [ "$ERROR_COUNT" -eq 0 ]; then
    print_status "OK" "No system errors in the last hour"
else
    print_status "WARNING" "$ERROR_COUNT system errors found in the last hour"
    echo "Recent errors:"
    journalctl --since "1 hour ago" --priority=err --no-pager -n 5
fi

echo ""
echo "Health check completed at: $(date)"
echo "================================="
```

## Common Issues and Solutions

### 1. Application Won't Start

#### Symptoms
- PM2 shows applications as stopped or errored
- "Cannot find module" errors
- Port already in use errors
- Environment variable errors

#### Diagnostic Commands
```bash
# Check PM2 status and logs
pm2 status
pm2 logs --lines 50

# Check port usage
netstat -tlnp | grep :3000
lsof -i :3000

# Validate environment variables
env | grep -E "(DATABASE_URL|REDIS_URL|NEXTAUTH_SECRET)"

# Check application logs
tail -f /var/log/pm2/aquascene-main-error.log
```

#### Solutions

**Missing Dependencies:**
```bash
# Clean install dependencies
cd /var/www/aquascene
rm -rf node_modules package-lock.json
npm install --production

# Or with pnpm
rm -rf node_modules pnpm-lock.yaml
pnpm install --frozen-lockfile --production
```

**Port Conflicts:**
```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill -9

# Change application port temporarily
PORT=3002 pm2 start ecosystem.config.js --only aquascene-main
```

**Environment Issues:**
```bash
# Validate environment file
source /etc/aquascene/production.env
echo "Database URL: ${DATABASE_URL:0:50}..."

# Check environment loading in PM2
pm2 env 0
```

### 2. Database Connection Issues

#### Symptoms
- "Connection terminated" errors
- "password authentication failed"
- "database does not exist" errors
- Slow query responses

#### Diagnostic Commands
```bash
# Test PostgreSQL connection
pg_isready -h localhost -p 5432

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Test connection with credentials
psql -h localhost -U aquascene_prod -d aquascene_prod -c "SELECT version();"

# Check database size and connections
psql -h localhost -U aquascene_prod -d aquascene_prod -c "
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size,
    numbackends
FROM pg_database 
LEFT JOIN pg_stat_database ON pg_database.datname = pg_stat_database.datname 
WHERE pg_database.datname = 'aquascene_prod';"
```

#### Solutions

**Connection Refused:**
```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check PostgreSQL configuration
sudo nano /etc/postgresql/15/main/postgresql.conf
# Ensure: listen_addresses = 'localhost,10.0.1.10'

sudo nano /etc/postgresql/15/main/pg_hba.conf
# Ensure: local all all peer
#         host all all 127.0.0.1/32 md5

sudo systemctl restart postgresql
```

**Authentication Issues:**
```bash
# Reset user password
sudo -u postgres psql -c "ALTER USER aquascene_prod PASSWORD 'new-secure-password';"

# Update environment variables
sudo nano /etc/aquascene/production.env
# Update DATABASE_URL with new password
```

**Connection Pool Exhaustion:**
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Kill idle connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE state = 'idle' AND state_change < NOW() - INTERVAL '1 hour';

-- Increase connection limits in postgresql.conf
-- max_connections = 200
```

### 3. Redis Connection Issues

#### Symptoms
- Session data not persisting
- Cache not working
- "NOAUTH Authentication required" errors
- Connection timeout errors

#### Diagnostic Commands
```bash
# Test Redis connection
redis-cli ping

# Check Redis status
redis-cli info server

# Monitor Redis commands
redis-cli monitor

# Check Redis configuration
cat /etc/redis/redis.conf | grep -E "(bind|port|requirepass|maxmemory)"
```

#### Solutions

**Redis Not Starting:**
```bash
# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log

# Start Redis manually to see errors
sudo redis-server /etc/redis/redis.conf

# Fix common issues
sudo chown redis:redis /var/lib/redis
sudo chmod 755 /var/lib/redis

sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**Authentication Issues:**
```bash
# Test with password
redis-cli -a your-redis-password ping

# Update application configuration
# Ensure REDIS_URL includes password: redis://:password@localhost:6379
```

**Memory Issues:**
```bash
# Check Redis memory usage
redis-cli info memory

# Clear Redis cache if needed
redis-cli flushall

# Optimize Redis configuration
sudo nano /etc/redis/redis.conf
# maxmemory 4gb
# maxmemory-policy allkeys-lru
```

### 4. Performance Issues

#### Symptoms
- Slow page load times
- High CPU usage
- Memory leaks
- Database query timeouts

#### Diagnostic Tools

**Performance Monitoring Script:**
```bash
#!/bin/bash
# performance-monitor.sh

echo "📊 Performance Analysis"
echo "======================"

# CPU usage by process
echo "Top CPU processes:"
ps aux --sort=-%cpu | head -10

echo ""

# Memory usage by process
echo "Top memory processes:"
ps aux --sort=-%mem | head -10

echo ""

# Node.js process analysis
echo "Node.js processes:"
pgrep -f node | xargs -I {} sh -c 'echo "PID: {} - $(ps -p {} -o comm= -o args=)"'

echo ""

# Database performance
echo "PostgreSQL performance:"
psql -U aquascene_prod -d aquascene_prod -c "
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    stddev_time
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 5;"

echo ""

# Redis performance
echo "Redis performance:"
redis-cli info stats | grep -E "(total_commands_processed|keyspace_hits|keyspace_misses)"
```

#### Solutions

**High CPU Usage:**
```bash
# Identify CPU-intensive processes
top -c

# Check for infinite loops in application
pm2 monit

# Optimize Node.js applications
# Add to ecosystem.config.js:
node_args: '--max_old_space_size=2048 --optimize-for-size'
```

**Memory Leaks:**
```bash
# Monitor memory usage over time
watch -n 5 'ps aux | grep node'

# Generate heap dumps for analysis
node --inspect-brk=0.0.0.0:9229 app.js

# Use clinic.js for detailed analysis
npm install -g clinic
clinic doctor -- node app.js
```

**Slow Database Queries:**
```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Find slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements 
WHERE mean_time > 1000
ORDER BY total_time DESC;

-- Add missing indexes
EXPLAIN ANALYZE SELECT * FROM your_query_here;
```

### 5. SSL/HTTPS Issues

#### Symptoms
- "Certificate has expired" errors
- "NET::ERR_CERT_AUTHORITY_INVALID" warnings
- Mixed content warnings
- SSL handshake failures

#### Diagnostic Commands
```bash
# Check SSL certificate status
openssl s_client -connect aquascene.com:443 -servername aquascene.com

# Check certificate expiration
echo | openssl s_client -connect aquascene.com:443 -servername aquascene.com 2>/dev/null | openssl x509 -noout -dates

# Check Let's Encrypt certificates
sudo certbot certificates

# Test SSL configuration
curl -vI https://aquascene.com
```

#### Solutions

**Certificate Renewal:**
```bash
# Renew Let's Encrypt certificates
sudo certbot renew --dry-run
sudo certbot renew

# Reload Nginx after renewal
sudo systemctl reload nginx
```

**Certificate Installation Issues:**
```bash
# Reinstall certificates
sudo certbot delete --cert-name aquascene.com
sudo certbot --nginx -d aquascene.com -d www.aquascene.com

# Fix Nginx SSL configuration
sudo nano /etc/nginx/sites-available/aquascene
# Ensure correct certificate paths:
# ssl_certificate /etc/letsencrypt/live/aquascene.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/aquascene.com/privkey.pem;
```

### 6. Email Delivery Issues

#### Symptoms
- Emails not being sent
- Emails going to spam
- API authentication errors
- High bounce rates

#### Diagnostic Commands
```bash
# Test Resend API connection
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "test@aquascene.com",
    "to": ["test@example.com"],
    "subject": "Test Email",
    "text": "This is a test email"
  }'

# Check email logs
grep -E "(email|resend)" /var/log/aquascene/application.log | tail -20

# Test SMTP configuration
telnet smtp.resend.com 587
```

#### Solutions

**API Key Issues:**
```bash
# Verify API key in environment
echo "API Key: ${RESEND_API_KEY:0:10}..."

# Test with a minimal API call
curl "https://api.resend.com/domains" \
  -H "Authorization: Bearer $RESEND_API_KEY"
```

**Domain Configuration:**
```bash
# Check DNS records for email domain
dig TXT aquascene.com
dig MX aquascene.com

# Verify SPF record
dig TXT _dmarc.aquascene.com
```

### 7. Content Generation Issues

#### Symptoms
- AI content generation failures
- OpenAI API rate limit errors
- Poor quality generated content
- Timeout errors during generation

#### Diagnostic Commands
```bash
# Test OpenAI API connectivity
curl -X GET "https://api.openai.com/v1/models" \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check content generation logs
grep -E "(openai|content-generation)" /var/log/aquascene/application.log | tail -20

# Monitor API usage
curl -X GET "https://api.openai.com/v1/usage" \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

#### Solutions

**API Rate Limits:**
```typescript
// Implement retry logic with exponential backoff
const retryWithBackoff = async (fn: Function, maxRetries: number = 3): Promise<any> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};
```

**Quality Control:**
```typescript
// Add content validation
const validateGeneratedContent = (content: string): boolean => {
  // Check minimum length
  if (content.length < 100) return false;
  
  // Check for aquascaping keywords
  const keywords = ['aquascape', 'plant', 'aquarium', 'fish', 'tank'];
  const hasKeywords = keywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  );
  
  return hasKeywords;
};
```

### 8. Theme and Frontend Issues

#### Symptoms
- Themes not loading correctly
- JavaScript errors in console
- CSS not applying properly
- Animation performance issues

#### Diagnostic Commands
```bash
# Check static file serving
curl -I https://aquascene.com/_next/static/css/app.css

# Verify build output
ls -la /var/www/aquascene/.next/static/

# Check for JavaScript errors
# Use browser console or
curl -s https://aquascene.com | grep -i error
```

#### Solutions

**Build Issues:**
```bash
# Clean rebuild
cd /var/www/aquascene
rm -rf .next
npm run build

# Check build logs for errors
npm run build 2>&1 | tee build.log
```

**Theme Loading Issues:**
```typescript
// Add theme loading fallback
const loadTheme = async (themeId: string) => {
  try {
    const theme = await import(`@/themes/${themeId}`);
    return theme.default;
  } catch (error) {
    console.warn(`Failed to load theme ${themeId}, falling back to default`);
    return await import('@/themes/default').then(m => m.default);
  }
};
```

## Monitoring and Alerting

### Setting Up Automated Monitoring

```bash
#!/bin/bash
# setup-monitoring.sh

# Create monitoring script
cat > /usr/local/bin/aquascene-monitor.sh << 'EOF'
#!/bin/bash

# Configuration
ALERT_EMAIL="admin@aquascene.com"
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
LOG_FILE="/var/log/aquascene/monitoring.log"

# Functions
log_message() {
    echo "$(date): $1" >> $LOG_FILE
}

send_alert() {
    local message=$1
    local severity=${2:-"WARNING"}
    
    # Log alert
    log_message "ALERT [$severity]: $message"
    
    # Send email alert
    echo "$message" | mail -s "AquaScene Alert [$severity]" $ALERT_EMAIL
    
    # Send Slack notification
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 AquaScene Alert [$severity]: $message\"}" \
            $SLACK_WEBHOOK
    fi
}

# Check application health
check_health() {
    if ! curl -sf http://localhost:3000/api/health > /dev/null; then
        send_alert "Main application health check failed" "CRITICAL"
        return 1
    fi
    
    if ! curl -sf http://localhost:3001/api/health > /dev/null; then
        send_alert "Waitlist application health check failed" "CRITICAL"
        return 1
    fi
    
    return 0
}

# Check service status
check_services() {
    services=("nginx" "postgresql" "redis-server")
    
    for service in "${services[@]}"; do
        if ! systemctl is-active --quiet $service; then
            send_alert "$service is not running" "CRITICAL"
            # Try to restart service
            systemctl restart $service
            sleep 10
            if systemctl is-active --quiet $service; then
                send_alert "$service has been restarted successfully" "INFO"
            else
                send_alert "Failed to restart $service" "CRITICAL"
            fi
        fi
    done
}

# Check disk space
check_disk_space() {
    disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -gt 90 ]; then
        send_alert "Disk usage is ${disk_usage}%" "CRITICAL"
    elif [ "$disk_usage" -gt 80 ]; then
        send_alert "Disk usage is ${disk_usage}%" "WARNING"
    fi
}

# Check memory usage
check_memory() {
    memory_usage=$(free | grep '^Mem:' | awk '{print ($3/$2) * 100.0}')
    
    if (( $(echo "$memory_usage > 90" | bc -l) )); then
        send_alert "Memory usage is ${memory_usage}%" "CRITICAL"
    elif (( $(echo "$memory_usage > 80" | bc -l) )); then
        send_alert "Memory usage is ${memory_usage}%" "WARNING"
    fi
}

# Main monitoring execution
log_message "Starting monitoring check"

check_health
check_services
check_disk_space
check_memory

log_message "Monitoring check completed"
EOF

# Make script executable
chmod +x /usr/local/bin/aquascene-monitor.sh

# Set up cron job to run every 5 minutes
echo "*/5 * * * * /usr/local/bin/aquascene-monitor.sh" | crontab -

echo "Monitoring setup completed"
```

## Error Log Analysis

### Log Analysis Scripts

```bash
#!/bin/bash
# analyze-logs.sh

echo "📊 Log Analysis Report"
echo "====================="

# Application error analysis
echo "Application Errors (Last 24 hours):"
echo "------------------------------------"
grep -E "(ERROR|FATAL)" /var/log/aquascene/application.log | \
    grep "$(date -d '1 day ago' +%Y-%m-%d)" | \
    awk -F': ' '{print $2}' | \
    sort | uniq -c | sort -nr | head -10

echo ""

# Database error analysis
echo "Database Errors:"
echo "----------------"
sudo grep -E "(ERROR|FATAL)" /var/log/postgresql/postgresql-15-main.log | \
    tail -10

echo ""

# Nginx error analysis
echo "Nginx Errors:"
echo "-------------"
sudo grep -E "(error|crit|alert|emerg)" /var/log/nginx/error.log | \
    tail -10

echo ""

# PM2 error analysis
echo "PM2 Process Errors:"
echo "-------------------"
pm2 logs --err --lines 10

echo ""

# Performance statistics
echo "Performance Statistics:"
echo "----------------------"
echo "Average response time (last 1000 requests):"
grep "HTTP Request" /var/log/aquascene/application.log | \
    tail -1000 | \
    grep -o '"duration":[0-9]*' | \
    cut -d: -f2 | \
    awk '{sum+=$1; count++} END {print "Average: " (sum/count) "ms"}'
```

## Recovery Procedures

### Automated Recovery Scripts

```bash
#!/bin/bash
# auto-recovery.sh

# Configuration
MAX_RESTART_ATTEMPTS=3
RESTART_DELAY=30

# Application restart function
restart_application() {
    local app_name=$1
    local attempt=1
    
    while [ $attempt -le $MAX_RESTART_ATTEMPTS ]; do
        echo "Attempting to restart $app_name (attempt $attempt/$MAX_RESTART_ATTEMPTS)"
        
        pm2 restart $app_name
        sleep $RESTART_DELAY
        
        # Check if application is running
        if pm2 list | grep -q "online.*$app_name"; then
            echo "$app_name restarted successfully"
            return 0
        fi
        
        ((attempt++))
    done
    
    echo "Failed to restart $app_name after $MAX_RESTART_ATTEMPTS attempts"
    return 1
}

# Service recovery function
recover_service() {
    local service_name=$1
    
    echo "Attempting to recover $service_name"
    
    # Try to restart the service
    sudo systemctl restart $service_name
    sleep 10
    
    # Check if service is running
    if systemctl is-active --quiet $service_name; then
        echo "$service_name recovered successfully"
        return 0
    else
        echo "Failed to recover $service_name"
        return 1
    fi
}

# Main recovery logic
echo "🔄 Starting automated recovery process"

# Check and recover applications
if ! curl -sf http://localhost:3000/api/health > /dev/null; then
    echo "Main application is not responding"
    restart_application "aquascene-main"
fi

if ! curl -sf http://localhost:3001/api/health > /dev/null; then
    echo "Waitlist application is not responding"
    restart_application "aquascene-waitlist"
fi

# Check and recover services
services=("nginx" "postgresql" "redis-server")
for service in "${services[@]}"; do
    if ! systemctl is-active --quiet $service; then
        echo "$service is not running"
        recover_service $service
    fi
done

echo "Recovery process completed"
```

## Support Resources

### Getting Help

**Emergency Contacts:**
- **Technical Lead**: gerasimovkris@3vantage.com
- **Emergency Phone**: Available in internal documentation
- **Slack Channel**: #aquascene-support

**Documentation Resources:**
- [API Documentation](./api-documentation.md)
- [Deployment Guide](./deployment-guide.md)
- [Developer Guide](./developer-guide.md)

**External Support:**
- **Vercel Support**: https://vercel.com/support
- **PostgreSQL Community**: https://www.postgresql.org/support/
- **Redis Documentation**: https://redis.io/documentation
- **OpenAI Support**: https://help.openai.com/

### Debug Information Collection

When reporting issues, collect this information:

```bash
#!/bin/bash
# collect-debug-info.sh

DEBUG_DIR="/tmp/aquascene-debug-$(date +%Y%m%d-%H%M%S)"
mkdir -p $DEBUG_DIR

echo "Collecting debug information..."

# System information
uname -a > $DEBUG_DIR/system-info.txt
cat /etc/os-release >> $DEBUG_DIR/system-info.txt

# Service status
systemctl status nginx > $DEBUG_DIR/nginx-status.txt
systemctl status postgresql >> $DEBUG_DIR/postgres-status.txt
systemctl status redis-server >> $DEBUG_DIR/redis-status.txt

# Application status
pm2 list > $DEBUG_DIR/pm2-status.txt
pm2 logs --lines 100 > $DEBUG_DIR/pm2-logs.txt

# Recent logs
tail -1000 /var/log/aquascene/application.log > $DEBUG_DIR/application-logs.txt
sudo tail -100 /var/log/nginx/error.log > $DEBUG_DIR/nginx-errors.txt
sudo tail -100 /var/log/postgresql/postgresql-15-main.log > $DEBUG_DIR/postgres-logs.txt

# Configuration
cp /etc/nginx/sites-available/aquascene $DEBUG_DIR/nginx-config.txt
pm2 ecosystem > $DEBUG_DIR/pm2-config.txt

# Resource usage
ps aux --sort=-%cpu | head -20 > $DEBUG_DIR/top-processes.txt
free -h > $DEBUG_DIR/memory-usage.txt
df -h > $DEBUG_DIR/disk-usage.txt

# Network
netstat -tlnp > $DEBUG_DIR/network-ports.txt

# Create archive
tar -czf "${DEBUG_DIR}.tar.gz" -C /tmp "$(basename $DEBUG_DIR)"
rm -rf $DEBUG_DIR

echo "Debug information collected: ${DEBUG_DIR}.tar.gz"
echo "Please attach this file when reporting issues"
```

This troubleshooting guide provides comprehensive solutions for the most common issues encountered in the AquaScene ecosystem. Use the diagnostic scripts and step-by-step solutions to quickly resolve problems and maintain system reliability.