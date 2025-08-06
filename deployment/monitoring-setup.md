# Monitoring Setup Guide

Comprehensive monitoring setup for the AquaScene Ecosystem using Prometheus, Grafana, and Loki.

## Overview

The monitoring stack provides:
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and alerting dashboards
- **Loki**: Log aggregation and analysis
- **Node Exporter**: System metrics
- **Custom Exporters**: Application-specific metrics

## Architecture

```
Monitoring Stack:
┌─────────────────────────────────────┐
│ Grafana (3000) - Dashboards        │
├─────────────────────────────────────┤
│ Prometheus (9090) - Metrics        │
│ Loki (3100) - Logs                 │
│ Node Exporter (9100) - System      │
│ App Exporters - Custom Metrics     │
└─────────────────────────────────────┘
```

## Installation

### 1. Docker Compose Configuration

The monitoring stack is included in the main deployment. Ensure these services are enabled in `docker-compose.production.yml`:

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
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
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning

  loki:
    image: grafana/loki:latest
    container_name: loki
    ports:
      - "3100:3100"
    volumes:
      - ./monitoring/loki.yml:/etc/loki/local-config.yaml
      - loki_data:/tmp/loki
    command: -config.file=/etc/loki/local-config.yaml

  promtail:
    image: grafana/promtail:latest
    container_name: promtail
    volumes:
      - ./monitoring/promtail.yml:/etc/promtail/config.yml
      - /var/log:/var/log
      - /var/lib/docker/containers:/var/lib/docker/containers
    command: -config.file=/etc/promtail/config.yml

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
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

volumes:
  prometheus_data:
  grafana_data:
  loki_data:
```

### 2. Prometheus Configuration

Create `monitoring/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'aquascape-backend'
    metrics_path: '/api/metrics'
    static_configs:
      - targets: ['backend:3001']

  - job_name: 'aquascape-ai'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['ai-pipeline:8000']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### 3. Grafana Configuration

Create `monitoring/grafana/provisioning/datasources/prometheus.yml`:

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
```

Create `monitoring/grafana/provisioning/dashboards/dashboard.yml`:

```yaml
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /etc/grafana/provisioning/dashboards
```

## Custom Dashboards

### AquaScene Application Dashboard

Create `monitoring/grafana/dashboards/aquascape-dashboard.json`:

```json
{
  "dashboard": {
    "title": "AquaScene Ecosystem Monitoring",
    "tags": ["aquascape", "production"],
    "timezone": "UTC",
    "panels": [
      {
        "title": "API Response Times",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=\"aquascape-backend\"}[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Content Generation Metrics",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(content_generated_total[5m])",
            "legendFormat": "Content/min"
          }
        ]
      },
      {
        "title": "Social Media Posts",
        "type": "graph",
        "targets": [
          {
            "expr": "increase(social_posts_total[1h])",
            "legendFormat": "Posts/hour"
          }
        ]
      },
      {
        "title": "AI Service Status",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"aquascape-ai\"}",
            "legendFormat": "AI Pipeline"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

### System Resources Dashboard

Key metrics to monitor:
- CPU usage per service
- Memory consumption
- Disk space and I/O
- Network traffic
- Database connections
- Response times

## Application Metrics

### Backend API Metrics

Add to your Express.js application:

```javascript
const prometheus = require('prom-client');

// Create metrics
const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route']
});

const contentGeneratedTotal = new prometheus.Counter({
  name: 'content_generated_total',
  help: 'Total content pieces generated',
  labelNames: ['type', 'platform']
});

const socialPostsTotal = new prometheus.Counter({
  name: 'social_posts_total',
  help: 'Total social media posts published',
  labelNames: ['platform', 'status']
});

// Metrics endpoint
app.get('/api/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

### AI Pipeline Metrics

Add to your FastAPI application:

```python
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

# Metrics
ai_requests_total = Counter('ai_requests_total', 'Total AI requests', ['service', 'status'])
ai_request_duration = Histogram('ai_request_duration_seconds', 'AI request duration')
ai_tokens_used = Counter('ai_tokens_used_total', 'Total AI tokens consumed', ['service'])

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
```

## Alerting Rules

Create `monitoring/alert_rules.yml`:

```yaml
groups:
  - name: aquascape_alerts
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80% for more than 2 minutes"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 85% for more than 5 minutes"

      - alert: ApplicationDown
        expr: up{job=~"aquascape-.*"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "AquaScene service is down"
          description: "{{ $labels.job }} has been down for more than 1 minute"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API response time"
          description: "95th percentile response time is above 2 seconds"

      - alert: DatabaseConnectionError
        expr: increase(database_connection_errors_total[5m]) > 5
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection issues"
          description: "Multiple database connection errors detected"
```

## Log Management with Loki

### Loki Configuration

Create `monitoring/loki.yml`:

```yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
  chunk_idle_period: 1h
  max_chunk_age: 1h
  chunk_target_size: 1048576
  chunk_retain_period: 30s
  max_transfer_retries: 0

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /tmp/loki/boltdb-shipper-active
    cache_location: /tmp/loki/boltdb-shipper-cache
    shared_store: filesystem
  filesystem:
    directory: /tmp/loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 0s

table_manager:
  retention_deletes_enabled: false
  retention_period: 0s
```

### Promtail Configuration

Create `monitoring/promtail.yml`:

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: varlogs
          __path__: /var/log/*log

  - job_name: containers
    static_configs:
      - targets:
          - localhost
        labels:
          job: containerlogs
          __path__: /var/lib/docker/containers/*/*log
    pipeline_stages:
      - json:
          expressions:
            output: log
            stream: stream
            attrs:
      - labels:
          stream:
```

## Monitoring Best Practices

### 1. Key Metrics to Monitor

**Application Performance:**
- Response times (95th percentile < 500ms)
- Error rates (< 1%)
- Throughput (requests per second)
- Database query times

**System Health:**
- CPU usage (< 80%)
- Memory usage (< 85%)
- Disk space (> 20% free)
- Network latency

**Business Metrics:**
- Content generation rate
- Social media engagement
- User registrations
- Partnership revenue

### 2. Alert Configuration

**Critical Alerts (Immediate Response):**
- Service downtime
- Database connection failures
- API error spikes
- Security incidents

**Warning Alerts (Within 30 minutes):**
- High resource usage
- Slow response times
- Backup failures
- SSL certificate expiration

### 3. Dashboard Organization

**Executive Dashboard:**
- Business KPIs
- Revenue metrics
- User growth
- System uptime

**Operations Dashboard:**
- System health
- Performance metrics
- Error rates
- Resource usage

**Development Dashboard:**
- Application metrics
- Performance trends
- Error analysis
- Deployment status

## Access and Security

### 1. Grafana Authentication

```bash
# Set admin password
export GF_SECURITY_ADMIN_PASSWORD=your_secure_password

# Configure OAuth (optional)
# Google, GitHub, or other providers
```

### 2. Network Security

```bash
# Restrict monitoring access
# Add to Nginx configuration
location /monitoring/ {
    auth_basic "Monitoring Access";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://localhost:3000/;
}
```

### 3. HTTPS Configuration

Ensure all monitoring endpoints are accessible via HTTPS only.

## Maintenance

### Daily Tasks
- Review critical alerts
- Check system performance
- Verify backup status

### Weekly Tasks
- Analyze performance trends
- Review capacity planning
- Update dashboards

### Monthly Tasks
- Security review
- Performance optimization
- Documentation updates

## Troubleshooting

### Common Issues

1. **Prometheus not collecting metrics:**
   - Check service discovery
   - Verify network connectivity
   - Check firewall rules

2. **Grafana dashboard not loading:**
   - Check data source configuration
   - Verify Prometheus connectivity
   - Check query syntax

3. **Loki not receiving logs:**
   - Check Promtail configuration
   - Verify log file permissions
   - Check Loki storage

### Debug Commands

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Test metric queries
curl 'http://localhost:9090/api/v1/query?query=up'

# Check Grafana health
curl http://localhost:3000/api/health

# View Loki logs
docker logs loki
```

## Performance Tuning

### Prometheus Optimization
- Configure appropriate retention periods
- Use recording rules for complex queries
- Optimize scrape intervals

### Grafana Optimization
- Use efficient queries
- Implement query caching
- Optimize dashboard refresh rates

### Storage Management
- Configure log rotation
- Implement data retention policies
- Monitor disk usage

For additional monitoring support, see [Troubleshooting Guide](../troubleshooting/monitoring-issues.md).