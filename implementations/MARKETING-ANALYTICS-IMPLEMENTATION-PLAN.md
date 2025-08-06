# Marketing Analytics Implementation Plan
## AquaScene Content Engine - Complete Marketing Instrumentation Strategy

**Version:** 1.0  
**Date:** August 2025  
**Status:** Ready for Implementation  
**Investment Required:** $200-300/month  
**Expected ROI:** 300-500% within 6 months

---

## Executive Summary

This implementation plan provides a complete roadmap for establishing comprehensive marketing analytics across the AquaScene ecosystem. The plan addresses all key requirements: email tracking, website analytics, social media metrics, and revenue attribution - all while maintaining privacy compliance and cost-effectiveness.

**Key Deliverables:**
- Complete marketing analytics service (new microservice)
- Unified marketing dashboard with real-time metrics
- Multi-channel attribution tracking
- Privacy-compliant user tracking
- Revenue and conversion analytics

---

## Phase 1: Foundation (Weeks 1-2)
### Immediate Implementation - Core Tracking

#### 1.1 Website Analytics Setup
**Tool:** Plausible Analytics  
**Cost:** $19/month  
**Implementation:**

```javascript
// Add to aquascene-waitlist index.html
<script defer data-domain="aquascene.bg" src="https://plausible.io/js/script.js"></script>

// Custom event tracking
window.plausible = window.plausible || function() { 
  (window.plausible.q = window.plausible.q || []).push(arguments) 
}

// Track newsletter signup
plausible('Newsletter Signup', {
  props: {
    source: document.referrer,
    plan: 'free'
  }
});
```

#### 1.2 Email Analytics Integration
**Tool:** Brevo (formerly Sendinblue)  
**Cost:** Free initially, then $25/month  
**Implementation:**

```python
# services/marketing-analytics/src/integrations/brevo_client.py
import sib_api_v3_sdk
from datetime import datetime

class BrevoAnalytics:
    def __init__(self, api_key: str):
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = api_key
        self.api_instance = sib_api_v3_sdk.EmailCampaignsApi(
            sib_api_v3_sdk.ApiClient(configuration)
        )
    
    async def track_campaign_metrics(self, campaign_id: int):
        """Fetch and store campaign performance metrics"""
        stats = self.api_instance.get_email_campaign(campaign_id)
        return {
            'sent': stats.statistics.global_stats.sent,
            'delivered': stats.statistics.global_stats.delivered,
            'opens': stats.statistics.global_stats.unique_clicks,
            'clicks': stats.statistics.global_stats.clicks,
            'bounces': stats.statistics.global_stats.soft_bounces + 
                       stats.statistics.global_stats.hard_bounces,
            'unsubscribes': stats.statistics.global_stats.unsubscriptions
        }
```

#### 1.3 Enhanced Social Media Tracking
**Enhancement:** Existing Instagram automation  
**Cost:** $0 (using existing APIs)  
**Implementation:**

```python
# Enhance existing Instagram analytics
class EnhancedInstagramAnalytics:
    async def track_post_performance(self, post_id: str):
        """Enhanced tracking with attribution"""
        metrics = await self.get_post_insights(post_id)
        
        # Add UTM tracking for link clicks
        utm_params = {
            'utm_source': 'instagram',
            'utm_medium': 'social',
            'utm_campaign': f'post_{post_id}',
            'utm_content': metrics.get('post_type')
        }
        
        # Store in analytics database
        await self.store_metrics({
            'platform': 'instagram',
            'post_id': post_id,
            'impressions': metrics['impressions'],
            'reach': metrics['reach'],
            'engagement': metrics['engagement'],
            'utm_params': utm_params,
            'timestamp': datetime.utcnow()
        })
```

---

## Phase 2: Analytics Service Development (Weeks 3-4)
### New Microservice Implementation

#### 2.1 Marketing Analytics Service Structure
```
services/marketing-analytics/
├── src/
│   ├── api/                    # API endpoints
│   │   ├── events.py           # Event tracking endpoints
│   │   ├── campaigns.py        # Campaign management
│   │   ├── attribution.py      # Attribution analysis
│   │   └── dashboards.py       # Dashboard data endpoints
│   ├── models/                 # Data models
│   │   ├── events.py           # Event schemas
│   │   ├── campaigns.py        # Campaign models
│   │   └── attribution.py      # Attribution models
│   ├── integrations/          # External service integrations
│   │   ├── plausible.py       # Website analytics
│   │   ├── brevo.py           # Email marketing
│   │   └── instagram.py       # Social media
│   ├── analytics/             # Analytics engine
│   │   ├── attribution.py     # Multi-touch attribution
│   │   ├── cohorts.py         # Cohort analysis
│   │   └── predictions.py     # Predictive analytics
│   └── main.py                # FastAPI application
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

#### 2.2 Database Schema
```sql
-- PostgreSQL operational data
CREATE TABLE marketing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    properties JSONB,
    timestamp TIMESTAMP NOT NULL,
    source VARCHAR(50),
    medium VARCHAR(50),
    campaign VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attribution_touchpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    touchpoint_type VARCHAR(50),
    channel VARCHAR(50),
    campaign_id VARCHAR(100),
    interaction_time TIMESTAMP,
    conversion_value DECIMAL(10,2),
    attribution_credit DECIMAL(5,4)
);

-- ClickHouse for analytics (high-volume data)
CREATE TABLE analytics.events (
    event_date Date,
    event_time DateTime,
    event_type String,
    user_id String,
    properties String, -- JSON string
    source String,
    medium String,
    campaign String
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time, user_id);
```

#### 2.3 Core API Endpoints
```python
# src/api/events.py
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import asyncio

router = APIRouter(prefix="/api/v1/analytics")

@router.post("/events")
async def track_event(
    event_type: str,
    properties: Dict[str, Any],
    user_id: str = None,
    session_id: str = None
):
    """Track custom marketing events"""
    event = {
        'event_type': event_type,
        'properties': properties,
        'user_id': user_id,
        'session_id': session_id,
        'timestamp': datetime.utcnow()
    }
    
    # Real-time processing
    await redis_stream.add(event)
    
    # Batch processing queue
    await event_queue.put(event)
    
    return {"status": "tracked", "event_id": event['id']}

@router.get("/attribution/{user_id}")
async def get_attribution(user_id: str, model: str = "last_touch"):
    """Get attribution analysis for a user"""
    touchpoints = await get_user_touchpoints(user_id)
    
    attribution_models = {
        'first_touch': first_touch_attribution,
        'last_touch': last_touch_attribution,
        'linear': linear_attribution,
        'time_decay': time_decay_attribution,
        'position_based': position_based_attribution
    }
    
    model_func = attribution_models.get(model, last_touch_attribution)
    attribution = model_func(touchpoints)
    
    return {
        'user_id': user_id,
        'model': model,
        'attribution': attribution,
        'total_touchpoints': len(touchpoints)
    }
```

---

## Phase 3: Dashboard Implementation (Weeks 5-6)
### Marketing Dashboard Components

#### 3.1 React Dashboard Components
```javascript
// admin-dashboard/src/components/MarketingDashboard.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Chart } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const MarketingOverview = () => {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // WebSocket for real-time updates
    const ws = new WebSocket('ws://localhost:8005/ws/metrics');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMetrics(data);
    };

    // Initial data fetch
    fetchMarketingMetrics();
    
    return () => ws.close();
  }, []);

  return (
    <div className="marketing-dashboard">
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Subscribers"
              value={metrics.subscribers}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix={`+${metrics.subscriber_growth}%`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Email Open Rate"
              value={metrics.open_rate}
              precision={1}
              suffix="%"
              valueStyle={{ 
                color: metrics.open_rate > 25 ? '#3f8600' : '#cf1322' 
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="CAC"
              value={metrics.cac}
              precision={2}
              prefix="$"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="LTV"
              value={metrics.ltv}
              precision={2}
              prefix="$"
            />
          </Card>
        </Col>
      </Row>
      
      {/* Attribution Sankey Diagram */}
      <Card title="Multi-Channel Attribution">
        <AttributionFlow data={metrics.attribution} />
      </Card>
      
      {/* Campaign Performance Table */}
      <Card title="Active Campaigns">
        <CampaignTable campaigns={metrics.campaigns} />
      </Card>
    </div>
  );
};
```

#### 3.2 Grafana Integration
```yaml
# docker-compose.yml addition
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_INSTALL_PLUGINS=redis-datasource,clickhouse-datasource
    volumes:
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources
```

---

## Phase 4: Advanced Features (Weeks 7-8)
### Attribution & Optimization

#### 4.1 Multi-Touch Attribution Implementation
```python
# src/analytics/attribution.py
from typing import List, Dict
from datetime import datetime, timedelta

class AttributionEngine:
    def __init__(self):
        self.models = {
            'first_touch': self.first_touch,
            'last_touch': self.last_touch,
            'linear': self.linear,
            'time_decay': self.time_decay,
            'position_based': self.position_based
        }
    
    def calculate_attribution(
        self, 
        touchpoints: List[Dict], 
        model: str = 'time_decay'
    ) -> Dict[str, float]:
        """Calculate attribution credits for each channel"""
        if not touchpoints:
            return {}
        
        # Sort by timestamp
        touchpoints.sort(key=lambda x: x['timestamp'])
        
        # Apply selected model
        attribution_func = self.models.get(model, self.time_decay)
        return attribution_func(touchpoints)
    
    def time_decay(
        self, 
        touchpoints: List[Dict], 
        half_life_days: int = 7
    ) -> Dict[str, float]:
        """Time-decay attribution model"""
        conversion_time = touchpoints[-1]['timestamp']
        credits = {}
        total_weight = 0
        
        for touchpoint in touchpoints:
            days_before = (conversion_time - touchpoint['timestamp']).days
            weight = 2 ** (-days_before / half_life_days)
            total_weight += weight
            
            channel = touchpoint['channel']
            credits[channel] = credits.get(channel, 0) + weight
        
        # Normalize to sum to 1
        for channel in credits:
            credits[channel] /= total_weight
        
        return credits
```

#### 4.2 A/B Testing Framework
```python
# src/analytics/ab_testing.py
from scipy import stats
import numpy as np

class ABTestAnalyzer:
    def analyze_test(
        self,
        control_conversions: int,
        control_visitors: int,
        variant_conversions: int,
        variant_visitors: int,
        confidence_level: float = 0.95
    ):
        """Statistical analysis of A/B test results"""
        # Calculate conversion rates
        control_rate = control_conversions / control_visitors
        variant_rate = variant_conversions / variant_visitors
        
        # Perform chi-square test
        observed = [[control_conversions, control_visitors - control_conversions],
                   [variant_conversions, variant_visitors - variant_conversions]]
        chi2, p_value = stats.chi2_contingency(observed)[:2]
        
        # Calculate uplift
        uplift = (variant_rate - control_rate) / control_rate * 100
        
        # Determine significance
        is_significant = p_value < (1 - confidence_level)
        
        return {
            'control_rate': control_rate,
            'variant_rate': variant_rate,
            'uplift_percentage': uplift,
            'p_value': p_value,
            'is_significant': is_significant,
            'confidence': confidence_level * 100
        }
```

---

## Cost Analysis & ROI

### Monthly Costs
| Service | Cost/Month | Purpose |
|---------|------------|---------|
| Plausible Analytics | $19 | Website tracking |
| Brevo Email | $25 | Email analytics |
| ClickHouse (small) | $50 | Analytics database |
| PostHog (optional) | $0-50 | Product analytics |
| **Total** | **$94-144** | Complete analytics |

### Expected ROI
- **Month 1-2**: Setup and baseline metrics
- **Month 3-4**: 20% improvement in conversion rates
- **Month 5-6**: 30% reduction in CAC
- **Month 7-12**: 300-500% ROI through optimization

### Key Performance Improvements
1. **Email Open Rate**: From 15% → 25%+ (industry-beating)
2. **Click-Through Rate**: From 2% → 4%+
3. **Conversion Rate**: From 1% → 2.5%+
4. **Customer Acquisition Cost**: -30% reduction
5. **Lifetime Value**: +40% increase

---

## Privacy & Compliance

### GDPR Implementation
```python
# src/privacy/consent_manager.py
class ConsentManager:
    async def check_consent(self, user_id: str) -> bool:
        """Check if user has given tracking consent"""
        consent = await db.get_consent(user_id)
        return consent and consent.analytics_enabled
    
    async def delete_user_data(self, user_id: str):
        """GDPR right to be forgotten"""
        # Delete from PostgreSQL
        await db.delete_user_events(user_id)
        
        # Delete from ClickHouse
        await clickhouse.execute(
            f"ALTER TABLE events DELETE WHERE user_id = '{user_id}'"
        )
        
        # Remove from cache
        await redis.delete(f"user:{user_id}:*")
```

---

## Testing Strategy

### Unit Testing
```python
# tests/test_attribution.py
def test_time_decay_attribution():
    touchpoints = [
        {'channel': 'email', 'timestamp': datetime(2025, 1, 1)},
        {'channel': 'social', 'timestamp': datetime(2025, 1, 7)},
        {'channel': 'direct', 'timestamp': datetime(2025, 1, 14)}
    ]
    
    engine = AttributionEngine()
    credits = engine.time_decay(touchpoints)
    
    assert credits['direct'] > credits['social']
    assert credits['social'] > credits['email']
    assert sum(credits.values()) == pytest.approx(1.0)
```

### Integration Testing
- Test API endpoints with mock data
- Verify data pipeline end-to-end
- Validate dashboard real-time updates
- Check privacy compliance features

---

## Deployment & Monitoring

### Docker Deployment
```yaml
# docker-compose.yml
version: '3.8'

services:
  marketing-analytics:
    build: ./services/marketing-analytics
    ports:
      - "8005:8005"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/analytics
      - CLICKHOUSE_URL=clickhouse://clickhouse:9000
      - REDIS_URL=redis://redis:6379
      - PLAUSIBLE_API_KEY=${PLAUSIBLE_API_KEY}
      - BREVO_API_KEY=${BREVO_API_KEY}
    depends_on:
      - postgres
      - clickhouse
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8005/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Monitoring Setup
```python
# src/monitoring/health.py
@router.get("/health")
async def health_check():
    checks = {
        'database': await check_database(),
        'clickhouse': await check_clickhouse(),
        'redis': await check_redis(),
        'external_apis': await check_external_apis()
    }
    
    status = 'healthy' if all(checks.values()) else 'unhealthy'
    return {
        'status': status,
        'checks': checks,
        'timestamp': datetime.utcnow()
    }
```

---

## Success Metrics

### Technical KPIs
- API response time < 200ms
- Dashboard load time < 2 seconds
- Data pipeline latency < 5 minutes
- System uptime > 99.9%

### Business KPIs
- Marketing attribution accuracy > 95%
- Campaign ROI visibility within 24 hours
- User journey mapping completion > 90%
- Cost per tracked event < $0.001

---

## Next Steps

1. **Week 1**: Set up Plausible and Brevo accounts
2. **Week 2**: Deploy marketing-analytics service
3. **Week 3**: Implement core tracking
4. **Week 4**: Build dashboards
5. **Week 5**: Test attribution models
6. **Week 6**: Launch to production
7. **Week 7-8**: Optimize and iterate

This implementation plan provides everything needed to establish comprehensive marketing analytics for AquaScene, enabling data-driven decision making and demonstrating clear ROI to stakeholders.