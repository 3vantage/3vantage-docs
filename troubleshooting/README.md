# Troubleshooting Guide

Common issues and solutions for the AquaScene Ecosystem.

## Quick Diagnostic

### System Health Check
```bash
# Check all services status
docker-compose ps

# Check API health endpoints
curl https://yourdomain.com/api/health
curl https://yourdomain.com/ai/health

# Check database connectivity
docker-compose exec backend npm run db:status
```

### Common Error Patterns
- **500 Internal Server Error**: Check application logs
- **Authentication Failed**: Verify JWT tokens and permissions
- **Rate Limited**: Check API usage and implement backoff
- **Database Connection Error**: Verify database status and credentials

## Issue Categories

### Application Issues
- [Authentication Problems](./auth-issues.md) - Login, token, and permission issues
- [Content Generation Issues](./content-issues.md) - AI generation and content creation problems
- [Social Media Problems](./social-media-issues.md) - Platform integration and posting issues
- [Performance Issues](./performance-issues.md) - Slow response times and optimization

### Infrastructure Issues
- [Deployment Issues](./deployment-issues.md) - Production deployment problems
- [Database Issues](./database-issues.md) - PostgreSQL and data-related problems
- [Monitoring Issues](./monitoring-issues.md) - Prometheus, Grafana, and alerting issues
- [Security Issues](./security-issues.md) - SSL, firewall, and security-related problems

### Integration Issues
- [API Integration Issues](./api-integration-issues.md) - External API problems
- [Webhook Issues](./webhook-issues.md) - Webhook delivery and processing
- [Partnership Issues](./partnership-issues.md) - Green Aqua integration problems

## Most Common Issues

### 1. Docker Services Not Starting

**Symptoms:**
- Services fail to start with `docker-compose up`
- Port conflicts or container exits immediately

**Solutions:**
```bash
# Check port conflicts
sudo netstat -tlnp | grep :3000

# View container logs
docker-compose logs backend
docker-compose logs ai-pipeline

# Reset containers
docker-compose down -v
docker-compose up -d --force-recreate
```

### 2. Authentication Token Expired

**Symptoms:**
- 401 Unauthorized responses
- "Token expired" error messages

**Solutions:**
```bash
# Refresh token via API
curl -X POST https://api.yourdomain.com/v1/auth/refresh \
  -H "Authorization: Bearer REFRESH_TOKEN"

# Or re-login to get new tokens
curl -X POST https://api.yourdomain.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### 3. AI Content Generation Failing

**Symptoms:**
- Content generation requests timeout
- "AI service unavailable" errors
- Poor quality generated content

**Solutions:**
```bash
# Check AI service health
curl https://yourdomain.com/ai/health

# Verify API keys in environment
echo $OPENAI_API_KEY
echo $GOOGLE_AI_API_KEY

# Restart AI service
docker-compose restart ai-pipeline
```

### 4. Social Media Publishing Errors

**Symptoms:**
- Posts not appearing on social platforms
- "Invalid credentials" for social accounts
- Image upload failures

**Solutions:**
```bash
# Re-authenticate social accounts
# Via dashboard: Settings → Integrations → Reconnect

# Check image format and size
# Instagram: JPG/PNG, max 8MB, 1080x1080px recommended
# Facebook: JPG/PNG, max 4MB
# YouTube: JPG/PNG, max 2MB for community posts
```

### 5. Database Connection Issues

**Symptoms:**
- "Database connection refused" errors
- Slow query performance
- Data not persisting

**Solutions:**
```bash
# Check PostgreSQL status
docker-compose logs postgres

# Test database connection
docker-compose exec postgres psql -U aquascape_user -d aquascape_db -c "SELECT 1;"

# Check database disk space
df -h /var/lib/docker/volumes/

# Restart database (caution: may cause downtime)
docker-compose restart postgres
```

## Diagnostic Tools

### Log Collection Script
```bash
#!/bin/bash
# collect-logs.sh - Collect diagnostic information

DATE=$(date +%Y%m%d_%H%M%S)
LOG_DIR="/tmp/aquascape-logs-$DATE"
mkdir -p $LOG_DIR

# System information
docker-compose ps > $LOG_DIR/services-status.txt
docker version > $LOG_DIR/docker-version.txt
docker-compose version > $LOG_DIR/compose-version.txt

# Application logs
docker-compose logs --tail=1000 backend > $LOG_DIR/backend.log
docker-compose logs --tail=1000 frontend > $LOG_DIR/frontend.log
docker-compose logs --tail=1000 ai-pipeline > $LOG_DIR/ai-pipeline.log
docker-compose logs --tail=1000 postgres > $LOG_DIR/postgres.log

# System resources
df -h > $LOG_DIR/disk-usage.txt
free -m > $LOG_DIR/memory-usage.txt
ps aux > $LOG_DIR/processes.txt

# Network and ports
netstat -tlnp > $LOG_DIR/network-ports.txt
curl -s -o $LOG_DIR/api-health.json https://yourdomain.com/api/health

# Create archive
tar -czf "aquascape-diagnostics-$DATE.tar.gz" -C /tmp $LOG_DIR
echo "Diagnostic package created: aquascape-diagnostics-$DATE.tar.gz"
```

### Health Check Script
```bash
#!/bin/bash
# health-check.sh - Quick system health verification

echo "=== AquaScene System Health Check ==="
echo "Date: $(date)"
echo

# Check Docker services
echo "1. Docker Services Status:"
docker-compose ps | grep -E "(Up|Exit)"
echo

# Check API endpoints
echo "2. API Health Checks:"
curl -s -f https://yourdomain.com/api/health && echo "✓ Backend API: OK" || echo "✗ Backend API: FAILED"
curl -s -f https://yourdomain.com/ai/health && echo "✓ AI Pipeline: OK" || echo "✗ AI Pipeline: FAILED"
echo

# Check database
echo "3. Database Connectivity:"
docker-compose exec -T postgres pg_isready -U aquascape_user && echo "✓ PostgreSQL: OK" || echo "✗ PostgreSQL: FAILED"
echo

# Check disk space
echo "4. Disk Space:"
df -h | grep -E "(Filesystem|/dev/|docker)"
echo

# Check SSL certificate
echo "5. SSL Certificate:"
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com </dev/null 2>/dev/null | openssl x509 -noout -dates
echo

echo "Health check completed at $(date)"
```

## Performance Optimization

### Query Performance
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE mean_time > 100 
ORDER BY mean_time DESC 
LIMIT 10;

-- Database maintenance
VACUUM ANALYZE;
REINDEX DATABASE aquascape_db;
```

### Memory Optimization
```bash
# Check memory usage by service
docker stats --no-stream

# Adjust container memory limits in docker-compose.yml
services:
  backend:
    mem_limit: 1g
    mem_reservation: 512m
```

### Monitoring Commands
```bash
# Monitor API response times
curl -w "@curl-format.txt" -s -o /dev/null https://yourdomain.com/api/content

# curl-format.txt content:
#      time_namelookup:  %{time_namelookup}\n
#         time_connect:  %{time_connect}\n
#      time_appconnect:  %{time_appconnect}\n
#     time_pretransfer:  %{time_pretransfer}\n
#        time_redirect:  %{time_redirect}\n
#   time_starttransfer:  %{time_starttransfer}\n
#                     ----------\n
#           time_total:  %{time_total}\n
```

## Emergency Procedures

### System Recovery
```bash
# Stop all services safely
docker-compose down

# Backup current data
./scripts/backup.sh

# Pull latest images and restart
docker-compose pull
docker-compose up -d

# Verify system health
./scripts/health-check.sh
```

### Database Recovery
```bash
# Restore from backup (if needed)
docker-compose exec postgres psql -U aquascape_user -d aquascape_db < backup.sql

# Check data integrity
docker-compose exec backend npm run db:verify

# Re-run migrations if necessary
docker-compose exec backend npm run migrate
```

### SSL Certificate Issues
```bash
# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout | grep "Not After"

# Renew certificate manually
sudo certbot renew --nginx

# Restart nginx
sudo systemctl reload nginx
```

## Getting Help

### Before Contacting Support
1. Run diagnostic script: `./collect-logs.sh`
2. Check system health: `./health-check.sh`
3. Review relevant troubleshooting guide section
4. Check recent changes to configuration or environment

### Contact Information
- **Technical Support**: tech-support@aquascene.com
- **Emergency Hotline**: Available for critical production issues
- **Community Forum**: [community.aquascene.com](https://community.aquascene.com)
- **GitHub Issues**: Report bugs and feature requests

### Information to Include in Support Requests
- Error messages (complete, unedited)
- Steps to reproduce the issue
- Expected vs. actual behavior
- Environment details (production/staging)
- Recent changes or deployments
- Diagnostic logs (from collect-logs.sh)

## Preventive Maintenance

### Daily Tasks
- [ ] Check monitoring dashboards
- [ ] Review error logs
- [ ] Verify backup completion
- [ ] Monitor disk space usage

### Weekly Tasks
- [ ] Review performance metrics
- [ ] Check SSL certificate validity
- [ ] Update dependencies (development environment first)
- [ ] Review security logs

### Monthly Tasks
- [ ] Full system health audit
- [ ] Performance optimization review
- [ ] Security vulnerability scan
- [ ] Disaster recovery test

## Status Page

Monitor real-time system status at: [status.aquascene.com](https://status.aquascene.com)

- Current system status
- Scheduled maintenance windows
- Recent incidents and resolutions
- Performance metrics
- Service level metrics