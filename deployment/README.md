# Deployment Documentation

This directory contains comprehensive production deployment guides and scripts for the AquaScene Ecosystem.

## Quick Navigation

### Production Setup
- [Production Deployment Guide](./production-setup.md) - Complete production deployment instructions
- [VPS Setup Guide](./vps-setup.md) - Server configuration and security setup
- [Domain and SSL Configuration](./domain-ssl-setup.md) - DNS, domain, and SSL certificate setup

### Infrastructure Management
- [Docker Orchestration](./docker-deployment.md) - Docker Compose production deployment
- [Database Migration](./database-migration.md) - PostgreSQL setup and data migration
- [Environment Configuration](./environment-config.md) - Production environment variables

### Monitoring and Maintenance
- [Monitoring Setup](./monitoring-setup.md) - Prometheus, Grafana, and Loki configuration
- [Backup Procedures](./backup-procedures.md) - Automated backup and recovery
- [Security Hardening](./security-guide.md) - Production security best practices

### Deployment Scripts
- [Automated Deployment](./scripts/) - Deployment automation scripts
- [Health Checks](./health-monitoring.md) - System health monitoring and alerting
- [Rolling Updates](./rolling-updates.md) - Zero-downtime deployment procedures

## Deployment Architecture

The AquaScene Ecosystem is designed for cost-effective deployment on a single VPS while maintaining enterprise-level capabilities:

```
Production Environment (Single VPS - $5-10/month)
├── Nginx Reverse Proxy (SSL/TLS termination)
├── Backend API (Express.js + Node.js)
├── Frontend Dashboard (Next.js static build)
├── AI Pipeline (Python FastAPI)
├── PostgreSQL Database
├── Monitoring Stack (Prometheus/Grafana)
└── Log Aggregation (Loki)
```

## Quick Start

1. **Server Setup**: Follow [VPS Setup Guide](./vps-setup.md)
2. **Application Deployment**: Run [Production Setup](./production-setup.md)
3. **Monitoring**: Configure [Monitoring Stack](./monitoring-setup.md)
4. **Security**: Apply [Security Hardening](./security-guide.md)

## Support

For deployment issues, see [Troubleshooting](../troubleshooting/deployment-issues.md).