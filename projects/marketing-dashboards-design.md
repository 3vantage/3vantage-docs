# Marketing Analytics Dashboards Design for AquaScene Ecosystem

**Version:** 1.0  
**Date:** August 6, 2025  
**Author:** Claude Code  
**Status:** Design Document

## Executive Summary

This document outlines the design for comprehensive marketing analytics dashboards within the AquaScene ecosystem. Building upon the existing admin dashboard architecture (React + Ant Design + Recharts), we'll create five specialized marketing dashboards that provide actionable insights across email campaigns, website analytics, social media performance, and revenue attribution.

### Key Design Principles

- **Unified Experience**: Seamless integration with existing AquaScene admin dashboard
- **Real-time Insights**: Live data updates with smart caching strategies  
- **Mobile-First**: Responsive design optimized for all device sizes
- **Actionable Intelligence**: Focus on metrics that drive marketing decisions
- **Performance Optimized**: Efficient data loading and visualization rendering

## Current Dashboard Architecture Analysis

### Existing Foundation
Based on analysis of `/Users/kg/aquascene-content-engine/admin-dashboard/`, the current system provides:

```yaml
Technology Stack:
  - Frontend: React 18.2.0 + Ant Design 5.3.0
  - Routing: React Router DOM 6.8.1
  - Charts: Recharts 2.5.0
  - HTTP Client: Axios 1.3.4
  - Real-time: Socket.io Client 4.8.1
  - Date Handling: Moment.js 2.29.4

Current Architecture:
  - Service-based navigation (8 services)
  - Health monitoring system
  - Real-time status updates
  - Responsive card-based layout
  - API proxy configuration (port 8000)
```

### Integration Strategy
The marketing dashboards will extend the current menu structure by adding a "Marketing Analytics" section with sub-navigation for each specialized dashboard.

## Dashboard Design Specifications

## 1. Marketing Overview Dashboard

### Purpose
High-level marketing performance overview providing C-suite and marketing leadership with key metrics and trends.

### Layout Wireframe
```
┌─────────────────────────────────────────────────────────────┐
│ Marketing Analytics Overview                    [Refresh] [⚙]│
├─────────────────────────────────────────────────────────────┤
│ KPI Cards Row                                               │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │Subscribers│ │ CAC     │ │  LTV    │ │  ROAS   │ │Conv Rate││
│ │  12,456  │ │ $34.50  │ │ $245.80 │ │  4.2x   │ │  3.4%   ││
│ │  ↑ 12.3% │ │ ↓ 8.2%  │ │ ↑ 15.6% │ │ ↑ 22.1% │ │ ↑ 5.7%  ││
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘│
├─────────────────────────────────────────────────────────────┤
│ Revenue & Attribution Row                                   │
│ ┌──────────────────────┐ ┌─────────────────────────────────┐│
│ │ Multi-Channel        │ │ Revenue Tracking                ││
│ │ Attribution Chart    │ │ ┌─────────────────────────────┐ ││
│ │ [Sankey Diagram]     │ │ │     Monthly Revenue         │ ││
│ │                      │ │ │     [Line Chart]            │ ││
│ │ Social → Email       │ │ │                             │ ││
│ │   ↓      ↓          │ │ │ Target: $45K | Actual: $52K │ ││
│ │   Conversion         │ │ └─────────────────────────────┘ ││
│ └──────────────────────┘ └─────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ Campaign Performance & Real-time Activity                  │
│ ┌──────────────────────┐ ┌─────────────────────────────────┐│
│ │ Top Campaigns        │ │ Live Activity Feed              ││
│ │ ┌──────────────────┐ │ │ ● Newsletter sent (2,456 opens) ││
│ │ │Summer Sale    ROI││ │ ● Instagram post (145 clicks)   ││
│ │ │              4.2x││ │ ● Website signup (aquascape101) ││
│ │ │Beginner Guide 3.8x││ │ ● Email click → Product page    ││
│ │ │Plant Care    3.1x││ │ ● Social → Newsletter signup    ││
│ │ └──────────────────┘ │ └─────────────────────────────────┘│
│ └──────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘
```

### Component Specifications

#### KPI Cards Component
```javascript
const KPICards = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const kpiConfig = [
    {
      title: "Total Subscribers",
      key: "subscribers",
      icon: <UserOutlined />,
      color: "#3f8600",
      format: "number",
      comparison: true
    },
    {
      title: "Customer Acquisition Cost", 
      key: "cac",
      icon: <DollarOutlined />,
      color: "#fa8c16", 
      format: "currency",
      comparison: true,
      inverse: true // Lower is better
    },
    {
      title: "Lifetime Value",
      key: "ltv", 
      icon: <TrophyOutlined />,
      color: "#722ed1",
      format: "currency",
      comparison: true
    },
    {
      title: "Return on Ad Spend",
      key: "roas",
      icon: <LineChartOutlined />,
      color: "#1890ff",
      format: "multiplier", 
      comparison: true
    },
    {
      title: "Conversion Rate",
      key: "conversionRate",
      icon: <PercentageOutlined />,
      color: "#52c41a",
      format: "percentage",
      comparison: true
    }
  ];

  return (
    <Row gutter={[16, 16]}>
      {kpiConfig.map(config => (
        <Col span={4.8} key={config.key}>
          <Card>
            <Statistic
              title={config.title}
              value={metrics?.[config.key]?.current || 0}
              prefix={config.icon}
              valueStyle={{ color: config.color }}
              formatter={value => formatValue(value, config.format)}
            />
            <div className="metric-comparison">
              <TrendIndicator 
                current={metrics?.[config.key]?.current}
                previous={metrics?.[config.key]?.previous}
                inverse={config.inverse}
              />
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};
```

#### Multi-Channel Attribution Visualization
```javascript
const AttributionSankey = ({ data, timeRange }) => {
  const sankeyData = useMemo(() => ({
    nodes: [
      { id: "social", name: "Social Media" },
      { id: "email", name: "Email Marketing" }, 
      { id: "organic", name: "Organic Search" },
      { id: "direct", name: "Direct Traffic" },
      { id: "conversion", name: "Conversions" }
    ],
    links: data?.attribution_flows || []
  }), [data]);

  return (
    <Card title="Multi-Channel Attribution Flow">
      <ResponsiveContainer width="100%" height={300}>
        <Sankey
          data={sankeyData}
          nodePadding={50}
          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
        >
          <Tooltip formatter={(value, name) => [`${value} conversions`, name]} />
        </Sankey>
      </ResponsiveContainer>
    </Card>
  );
};
```

### Data Requirements
- Real-time subscriber count from subscriber-manager service
- Campaign performance metrics from marketing-analytics service
- Revenue data from Stripe/payment integration
- Attribution data from user journey tracking
- Live activity stream from Redis pub/sub

### Update Frequency
- KPI metrics: Every 15 minutes
- Attribution data: Every hour
- Live activity: Real-time via WebSocket
- Revenue tracking: Every 5 minutes

---

## 2. Email Analytics Dashboard

### Purpose
Comprehensive email marketing performance analysis including campaign metrics, subscriber engagement, and automation effectiveness.

### Layout Wireframe
```
┌─────────────────────────────────────────────────────────────┐
│ Email Marketing Analytics                   [Campaign ▼] [📊]│
├─────────────────────────────────────────────────────────────┤
│ Email Performance Summary                                   │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │ Sent    │ │Delivered│ │ Opened  │ │ Clicked │ │Unsubscr.││
│ │ 15,234  │ │ 14,892  │ │  5,234  │ │  1,156  │ │   23    ││
│ │  100%   │ │  97.8%  │ │  35.1%  │ │   7.6%  │ │  0.15%  ││
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘│
├─────────────────────────────────────────────────────────────┤
│ Trends & Campaign Performance                              │
│ ┌──────────────────────┐ ┌─────────────────────────────────┐│
│ │ Open Rate Trends     │ │ Campaign Performance Table      ││
│ │ [Line Chart]         │ │ Campaign      │ Sent │ Open │CTR││
│ │                      │ │ Summer Tips   │5,234 │35.1%│7.2%││
│ │ 30 days: 34.2%       │ │ Plant Care    │3,892 │41.2%│9.1%││
│ │ Industry: 31.8%      │ │ Weekly Digest │2,156 │28.7%│5.4%││
│ │                      │ │ Beginner Guide│1,445 │38.9%│8.7%││
│ └──────────────────────┘ └─────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ Subscriber Analysis & Segmentation                         │
│ ┌──────────────────────┐ ┌─────────────────────────────────┐│
│ │ Growth Over Time     │ │ Engagement Segmentation         ││
│ │ [Area Chart]         │ │ ┌─────────────────────────────┐ ││
│ │                      │ │ │ Highly Engaged    │ 2,456   │ ││
│ │ Net Growth: +1,234   │ │ │ Moderately Active │ 4,789   │ ││
│ │ Churn Rate: 2.1%     │ │ │ Low Engagement    │ 3,234   │ ││
│ │                      │ │ │ At Risk           │ 1,678   │ ││
│ │                      │ │ └─────────────────────────────┘ ││
│ └──────────────────────┘ └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Component Specifications

#### Campaign Performance Table
```javascript
const CampaignPerformanceTable = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    {
      title: 'Campaign',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {moment(record.sentDate).format('MMM DD, YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Recipients',
      dataIndex: 'recipients',
      key: 'recipients',
      render: count => count.toLocaleString(),
      sorter: (a, b) => a.recipients - b.recipients,
    },
    {
      title: 'Open Rate',
      dataIndex: 'openRate',
      key: 'openRate', 
      render: rate => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Progress
            percent={rate}
            size="small"
            status={rate > 30 ? 'success' : rate > 20 ? 'normal' : 'exception'}
            style={{ flex: 1, marginRight: 8 }}
          />
          <span>{rate}%</span>
        </div>
      ),
      sorter: (a, b) => a.openRate - b.openRate,
    },
    {
      title: 'Click Rate',
      dataIndex: 'clickRate',
      key: 'clickRate',
      render: rate => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Progress
            percent={rate}
            size="small"
            status={rate > 8 ? 'success' : rate > 4 ? 'normal' : 'exception'}
            style={{ flex: 1, marginRight: 8 }}
          />
          <span>{rate}%</span>
        </div>
      ),
      sorter: (a, b) => a.clickRate - b.clickRate,
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: revenue => `$${revenue.toLocaleString()}`,
      sorter: (a, b) => a.revenue - b.revenue,
    },
    {
      title: 'ROI',
      dataIndex: 'roi',
      key: 'roi',
      render: roi => (
        <Tag color={roi > 300 ? 'green' : roi > 200 ? 'blue' : 'orange'}>
          {roi}%
        </Tag>
      ),
      sorter: (a, b) => a.roi - b.roi,
    }
  ];

  return (
    <Card 
      title="Campaign Performance"
      extra={
        <Space>
          <RangePicker onChange={handleDateRangeChange} />
          <Button icon={<ExportOutlined />}>Export</Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={campaigns}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
      />
    </Card>
  );
};
```

#### Subscriber Engagement Heatmap
```javascript
const EngagementHeatmap = ({ data }) => {
  return (
    <Card title="Engagement Activity Heatmap">
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Bar yAxisId="left" dataKey="opens" fill="#1890ff" name="Opens" />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="clicks" 
              stroke="#52c41a" 
              name="Clicks" 
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: 16, textAlign: 'center', color: '#666' }}>
        <Text type="secondary">
          Best sending time: 2:00 PM - 4:00 PM (based on 30-day average)
        </Text>
      </div>
    </Card>
  );
};
```

---

## 3. Website Analytics Dashboard

### Purpose
Comprehensive website performance analysis including traffic sources, conversion funnels, user behavior, and A/B testing results.

### Layout Wireframe
```
┌─────────────────────────────────────────────────────────────┐
│ Website Analytics                         [Plausible ⚡] [🔗]│
├─────────────────────────────────────────────────────────────┤
│ Traffic Overview                                            │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │Visitors │ │PageViews│ │SessionDur│ │BounceRate│ │ Goals   ││
│ │ 8,456   │ │ 15,234  │ │  4m 23s │ │  34.2%  │ │  234    ││
│ │ ↑ 15.3% │ │ ↑ 12.7% │ │ ↑ 18.4% │ │ ↓ 5.1%  │ │ ↑ 28.9% ││
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘│
├─────────────────────────────────────────────────────────────┤
│ Traffic Sources & Conversion Funnel                        │
│ ┌──────────────────────┐ ┌─────────────────────────────────┐│
│ │ Traffic Sources      │ │ Conversion Funnel               ││
│ │ [Pie Chart]          │ │ Landing Page    │ 8,456 │ 100%  ││
│ │                      │ │      ↓          │       │       ││
│ │ Organic: 45.2%       │ │ Product View    │ 3,234 │ 38.2% ││
│ │ Social: 28.7%        │ │      ↓          │       │       ││
│ │ Email: 15.1%         │ │ Add to Cart     │ 1,456 │ 17.2% ││
│ │ Direct: 8.3%         │ │      ↓          │       │       ││
│ │ Paid: 2.7%           │ │ Newsletter      │   234 │  2.8% ││
│ └──────────────────────┘ └─────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ User Behavior & A/B Testing                               │
│ ┌──────────────────────┐ ┌─────────────────────────────────┐│
│ │ User Flow Diagram    │ │ A/B Testing Results             ││
│ │                      │ │ Test: Newsletter CTA            ││
│ │ Home → Guide         │ │ ┌─────────────────────────────┐ ││
│ │   ↓      ↓          │ │ │ Variant A │ 234/1000 │ 23.4%││
│ │ Newsletter Signup    │ │ │ Variant B │ 287/1000 │ 28.7%││
│ │                      │ │ │ Confidence: 95% (Winner: B) │ ││
│ │ Path Analysis        │ │ └─────────────────────────────┘ ││
│ │ [Interactive Flow]   │ │ Impact: +18.7% conversion       ││
│ └──────────────────────┘ └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Component Specifications

#### Conversion Funnel Visualization
```javascript
const ConversionFunnel = ({ funnelData }) => {
  const calculateConversionRate = (current, total) => 
    ((current / total) * 100).toFixed(1);

  const FunnelStep = ({ step, index, totalSteps }) => {
    const conversionRate = calculateConversionRate(step.visitors, funnelData[0].visitors);
    const dropOffRate = index > 0 ? 
      calculateConversionRate(funnelData[index-1].visitors - step.visitors, funnelData[index-1].visitors) : 0;

    return (
      <div style={{ 
        textAlign: 'center', 
        margin: '16px 0',
        position: 'relative'
      }}>
        <div style={{
          background: `linear-gradient(135deg, #1890ff, #722ed1)`,
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          width: `${100 - (index * 15)}%`,
          margin: '0 auto',
          position: 'relative'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {step.name}
          </div>
          <div style={{ fontSize: '20px', margin: '8px 0' }}>
            {step.visitors.toLocaleString()}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            {conversionRate}% of total
          </div>
          {index > 0 && (
            <div style={{
              position: 'absolute',
              right: '-60px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: dropOffRate > 50 ? '#ff4d4f' : '#fa8c16',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              -{dropOffRate}%
            </div>
          )}
        </div>
        {index < totalSteps - 1 && (
          <DownOutlined style={{ 
            fontSize: '16px', 
            color: '#1890ff', 
            margin: '8px 0' 
          }} />
        )}
      </div>
    );
  };

  return (
    <Card title="Conversion Funnel Analysis">
      <div style={{ padding: '16px' }}>
        {funnelData.map((step, index) => (
          <FunnelStep 
            key={step.name} 
            step={step} 
            index={index} 
            totalSteps={funnelData.length} 
          />
        ))}
      </div>
      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        background: '#f5f5f5', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <Statistic
          title="Overall Conversion Rate"
          value={calculateConversionRate(
            funnelData[funnelData.length - 1].visitors,
            funnelData[0].visitors
          )}
          suffix="%"
          precision={1}
          valueStyle={{ color: '#3f8600', fontSize: '24px' }}
        />
      </div>
    </Card>
  );
};
```

#### Real-time Page Performance
```javascript
const RealTimePageMetrics = () => {
  const [liveData, setLiveData] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('/website-analytics');
    setSocket(newSocket);

    newSocket.on('live_metrics', (data) => {
      setLiveData(data);
    });

    return () => newSocket.close();
  }, []);

  return (
    <Card 
      title="Live Website Activity" 
      extra={<Badge status="processing" text="Live" />}
    >
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Statistic
            title="Active Visitors"
            value={liveData?.activeVisitors || 0}
            prefix={<EyeOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Page Views/Min"
            value={liveData?.pageViewsPerMinute || 0}
            prefix={<BarChartOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Conversions Today"
            value={liveData?.dailyConversions || 0}
            prefix={<TrophyOutlined />}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Col>
      </Row>
      
      <div style={{ marginTop: '24px' }}>
        <h4>Most Popular Pages (Right Now)</h4>
        <List
          size="small"
          dataSource={liveData?.topPages || []}
          renderItem={(page, index) => (
            <List.Item>
              <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                <Badge 
                  count={index + 1} 
                  style={{ backgroundColor: '#1890ff' }}
                />
                <div style={{ flex: 1, marginLeft: '12px' }}>
                  <Text strong>{page.title}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {page.path}
                  </Text>
                </div>
                <Statistic 
                  value={page.visitors} 
                  suffix=" visitors"
                  valueStyle={{ fontSize: '14px' }}
                />
              </div>
            </List.Item>
          )}
        />
      </div>
    </Card>
  );
};
```

---

## 4. Social Media Dashboard

### Purpose
Cross-platform social media performance tracking with focus on Instagram automation, content performance, and engagement optimization.

### Layout Wireframe
```
┌─────────────────────────────────────────────────────────────┐
│ Social Media Analytics                    [Platform ▼] [📱]│
├─────────────────────────────────────────────────────────────┤
│ Cross-Platform Metrics                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │Followers│ │ Reach   │ │Engagement│ │ Clicks  │ │ Mentions││
│ │ 15,456  │ │125,234  │ │  8.7%   │ │ 2,345   │ │   89    ││
│ │ ↑ 5.2%  │ │ ↑ 12.1% │ │ ↑ 0.8%  │ │ ↑ 18.3% │ │ ↑ 15.6% ││
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘│
├─────────────────────────────────────────────────────────────┤
│ Content Performance & Hashtag Analysis                     │
│ ┌──────────────────────┐ ┌─────────────────────────────────┐│
│ │ Content Heatmap      │ │ Top Performing Hashtags         ││
│ │ [Calendar Heatmap]   │ │ #aquascaping     │ 2.3K │  8.9% ││
│ │                      │ │ #plantedtank     │ 1.9K │  7.2% ││
│ │ Best Times:          │ │ #freshwateraq... │ 1.5K │  6.8% ││
│ │ Weekdays: 2-4 PM     │ │ #aquariumlife    │ 1.2K │  5.4% ││
│ │ Weekends: 10-12 AM   │ │ #fishkeeping     │ 987  │  4.1% ││
│ │                      │ │                 │      │       ││
│ │ Engagement Score:    │ │ Hashtag Effectiveness           ││
│ │ [Gauge: 8.7/10]      │ │ [Performance Matrix]            ││
│ └──────────────────────┘ └─────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ Automation Status & Engagement Trends                      │
│ ┌──────────────────────┐ ┌─────────────────────────────────┐│
│ │ Automation Queue     │ │ Engagement Trends (30 Days)    ││
│ │ ┌──────────────────┐ │ │ [Multi-line Chart]              ││
│ │ │Scheduled: 12     │ │ │                                 ││
│ │ │Published: 45     │ │ │ Likes ────                      ││
│ │ │Failed: 2         │ │ │ Comments ····                   ││
│ │ │Queue Health: 92% │ │ │ Shares ──·─                     ││
│ │ └──────────────────┘ │ │ Website Clicks ═══              ││
│ │                      │ │                                 ││
│ │ Next Post: 2:30 PM   │ │ Peak Engagement: Tue 2-4 PM     ││
│ │ Content: Plant Care  │ │ Lowest: Sun 6-8 AM              ││
│ └──────────────────────┘ └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Component Specifications

#### Content Performance Heatmap
```javascript
const ContentPerformanceHeatmap = ({ posts }) => {
  const [selectedMetric, setSelectedMetric] = useState('engagement_rate');
  
  const heatmapData = useMemo(() => {
    const data = [];
    const now = moment();
    
    for (let i = 0; i < 365; i++) {
      const date = now.clone().subtract(i, 'days');
      const dateStr = date.format('YYYY-MM-DD');
      const dayPosts = posts.filter(post => 
        moment(post.published_date).format('YYYY-MM-DD') === dateStr
      );
      
      if (dayPosts.length > 0) {
        const avgMetric = dayPosts.reduce((sum, post) => 
          sum + post[selectedMetric], 0) / dayPosts.length;
        
        data.push({
          date: dateStr,
          count: dayPosts.length,
          value: avgMetric,
          posts: dayPosts
        });
      }
    }
    
    return data;
  }, [posts, selectedMetric]);

  const getHeatmapColor = (value, maxValue) => {
    const intensity = value / maxValue;
    const hue = Math.floor((1 - intensity) * 120); // Red to green scale
    return `hsl(${hue}, 70%, 50%)`;
  };

  return (
    <Card 
      title="Content Performance Calendar"
      extra={
        <Select 
          value={selectedMetric} 
          onChange={setSelectedMetric}
          style={{ width: 150 }}
        >
          <Option value="engagement_rate">Engagement Rate</Option>
          <Option value="reach">Reach</Option>
          <Option value="impressions">Impressions</Option>
          <Option value="saves">Saves</Option>
        </Select>
      }
    >
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <CalendarHeatmap
            startDate={moment().subtract(1, 'year')}
            endDate={moment()}
            values={heatmapData}
            classForValue={(value) => {
              if (!value) return 'color-empty';
              if (value.value < 0.02) return 'color-scale-1';
              if (value.value < 0.05) return 'color-scale-2';
              if (value.value < 0.08) return 'color-scale-3';
              return 'color-scale-4';
            }}
            tooltipDataAttrs={(value) => ({
              'data-tip': value.date 
                ? `${value.date}: ${value.value}% engagement, ${value.count} posts`
                : 'No posts'
            })}
          />
        </ResponsiveContainer>
      </div>
      
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Text strong>Best Day: </Text>
          <Text>Tuesday (avg 8.9% engagement)</Text>
        </div>
        <div>
          <Text strong>Best Time: </Text>
          <Text>2:00 PM - 4:00 PM</Text>
        </div>
      </div>
    </Card>
  );
};
```

#### Hashtag Performance Analytics
```javascript
const HashtagAnalytics = ({ hashtagData }) => {
  const [sortBy, setSortBy] = useState('engagement_rate');
  const [timeRange, setTimeRange] = useState('30d');

  const columns = [
    {
      title: 'Hashtag',
      dataIndex: 'tag',
      key: 'tag',
      render: (tag, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Tag color="blue">{tag}</Tag>
          {record.trending && <FireOutlined style={{ color: '#ff4d4f' }} />}
        </div>
      ),
    },
    {
      title: 'Usage',
      dataIndex: 'usage_count',
      key: 'usage',
      render: count => count.toLocaleString(),
      sorter: (a, b) => a.usage_count - b.usage_count,
    },
    {
      title: 'Avg Reach',
      dataIndex: 'avg_reach',
      key: 'reach',
      render: reach => reach.toLocaleString(),
      sorter: (a, b) => a.avg_reach - b.avg_reach,
    },
    {
      title: 'Engagement Rate',
      dataIndex: 'engagement_rate',
      key: 'engagement',
      render: rate => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Progress
            percent={rate * 10} // Scale for display
            size="small"
            status={rate > 0.08 ? 'success' : rate > 0.05 ? 'normal' : 'exception'}
            style={{ flex: 1, marginRight: 8 }}
          />
          <span>{(rate * 100).toFixed(1)}%</span>
        </div>
      ),
      sorter: (a, b) => a.engagement_rate - b.engagement_rate,
    },
    {
      title: 'Effectiveness Score',
      dataIndex: 'effectiveness_score',
      key: 'score',
      render: score => (
        <Rate 
          disabled 
          value={score / 2} 
          style={{ fontSize: '14px' }}
        />
      ),
      sorter: (a, b) => a.effectiveness_score - b.effectiveness_score,
    }
  ];

  const topPerformingTags = hashtagData
    .filter(tag => tag.usage_count >= 3)
    .sort((a, b) => b.effectiveness_score - a.effectiveness_score)
    .slice(0, 20);

  return (
    <Card
      title="Hashtag Performance Analysis"
      extra={
        <Space>
          <Select value={timeRange} onChange={setTimeRange}>
            <Option value="7d">Last 7 days</Option>
            <Option value="30d">Last 30 days</Option>
            <Option value="90d">Last 90 days</Option>
          </Select>
          <Button icon={<DownloadOutlined />}>Export</Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={topPerformingTags}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
      />
      
      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        background: '#f5f5f5', 
        borderRadius: '8px' 
      }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Most Effective Hashtag"
              value={topPerformingTags[0]?.tag || '-'}
              valueStyle={{ color: '#1890ff', fontSize: '16px' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Avg Engagement with Hashtags"
              value={(topPerformingTags.reduce((sum, tag) => 
                sum + tag.engagement_rate, 0) / topPerformingTags.length * 100).toFixed(1)}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Hashtags Analyzed"
              value={hashtagData.length}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
        </Row>
      </div>
    </Card>
  );
};
```

---

## 5. Attribution Dashboard

### Purpose
Advanced marketing attribution analysis showing complete customer journeys, channel contribution, and ROI optimization insights.

### Layout Wireframe
```
┌─────────────────────────────────────────────────────────────┐
│ Attribution Analysis                    [Model ▼] [🎯] [⚙️]│
├─────────────────────────────────────────────────────────────┤
│ Attribution Model Comparison                               │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Revenue Attribution by Channel                          ││
│ │ Model: First Touch │ Last Touch │ Linear │ Time Decay   ││
│ │ Social    $12,456  │   $8,234   │$10,345 │   $9,567    ││
│ │ Email     $8,234   │  $15,678   │$11,956 │  $13,234    ││
│ │ Organic   $15,678  │  $12,456   │$14,067 │  $14,789    ││
│ │ Direct    $5,432   │   $9,876   │ $7,654 │   $6,543    ││
│ └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ Customer Journey Visualization                              │
│ ┌──────────────────────┐ ┌─────────────────────────────────┐│
│ │ Journey Map          │ │ Touchpoint Analysis             ││
│ │ [Sankey Diagram]     │ │ ┌─────────────────────────────┐ ││
│ │                      │ │ │Avg Journey Length: 12.3 days│ ││
│ │ Social Media         │ │ │Avg Touchpoints: 5.7         │ ││
│ │    ↓                 │ │ │Most Common Path:            │ ││
│ │ Email Newsletter     │ │ │ Social → Email → Website    │ ││
│ │    ↓                 │ │ │Conversion Rate by Path:     │ ││
│ │ Website Visit        │ │ │ Direct: 8.9%                │ ││
│ │    ↓                 │ │ │ Social+Email: 12.4%         │ ││
│ │ Conversion           │ │ │ Organic+Email: 15.2%        │ ││
│ └──────────────────────┘ └─────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ ROI Analysis & Channel Optimization                        │
│ ┌──────────────────────┐ ┌─────────────────────────────────┐│
│ │ Channel ROI Matrix   │ │ Budget Optimization Recommendations│
│ │ [Bubble Chart]       │ │ ┌─────────────────────────────┐ ││
│ │                      │ │ │🔺 Increase Social Media    │ ││
│ │    High ROI          │ │ │   Budget: +$2,500 (+25%)   │ ││
│ │ ●Email  ●Organic     │ │ │   Expected ROI: +32%       │ ││
│ │                      │ │ │                           │ ││
│ │         ●Social      │ │ │🔻 Decrease Paid Ads       │ ││
│ │    ●Direct           │ │ │   Budget: -$1,200 (-30%)  │ ││
│ │    Low ROI           │ │ │   Redirect to Social       │ ││
│ │                      │ │ └─────────────────────────────┘ ││
│ └──────────────────────┘ └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Component Specifications

#### Multi-Touch Attribution Comparison
```javascript
const AttributionModelComparison = () => {
  const [models] = useState(['first_touch', 'last_touch', 'linear', 'time_decay', 'position_based']);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [attributionData, setAttributionData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAttributionData = useCallback(async () => {
    setLoading(true);
    try {
      const promises = models.map(model => 
        apiClient.get(`/analytics/attribution/revenue`, {
          params: { model, period: selectedTimeRange }
        })
      );
      
      const results = await Promise.all(promises);
      
      const formattedData = results.reduce((acc, result, index) => {
        acc[models[index]] = result.data;
        return acc;
      }, {});
      
      setAttributionData(formattedData);
    } catch (error) {
      message.error('Failed to load attribution data');
    } finally {
      setLoading(false);
    }
  }, [models, selectedTimeRange]);

  useEffect(() => {
    fetchAttributionData();
  }, [fetchAttributionData]);

  const ComparisonTable = () => {
    if (!attributionData) return null;

    const channels = [...new Set(
      Object.values(attributionData)
        .flat()
        .map(item => item.channel)
    )];

    const tableData = channels.map(channel => {
      const row = { channel };
      models.forEach(model => {
        const channelData = attributionData[model]?.find(item => item.channel === channel);
        row[model] = channelData?.revenue || 0;
      });
      row.variance = Math.max(...models.map(m => row[m])) - Math.min(...models.map(m => row[m]));
      return row;
    });

    const columns = [
      {
        title: 'Channel',
        dataIndex: 'channel',
        key: 'channel',
        fixed: 'left',
        width: 120,
        render: channel => (
          <Tag color={getChannelColor(channel)}>
            {channel.charAt(0).toUpperCase() + channel.slice(1)}
          </Tag>
        ),
      },
      ...models.map(model => ({
        title: formatModelName(model),
        dataIndex: model,
        key: model,
        render: value => `$${value.toLocaleString()}`,
        sorter: (a, b) => a[model] - b[model],
      })),
      {
        title: 'Variance',
        dataIndex: 'variance',
        key: 'variance',
        render: variance => (
          <span style={{ 
            color: variance > 5000 ? '#ff4d4f' : variance > 2000 ? '#fa8c16' : '#52c41a' 
          }}>
            ${variance.toLocaleString()}
          </span>
        ),
        sorter: (a, b) => a.variance - b.variance,
      }
    ];

    return (
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={false}
        scroll={{ x: 800 }}
        summary={() => (
          <Table.Summary>
            <Table.Summary.Row style={{ background: '#f5f5f5' }}>
              <Table.Summary.Cell><strong>Total</strong></Table.Summary.Cell>
              {models.map(model => (
                <Table.Summary.Cell key={model}>
                  <strong>
                    ${tableData.reduce((sum, row) => sum + row[model], 0).toLocaleString()}
                  </strong>
                </Table.Summary.Cell>
              ))}
              <Table.Summary.Cell>
                <strong>
                  ${tableData.reduce((sum, row) => sum + row.variance, 0).toLocaleString()}
                </strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    );
  };

  return (
    <Card
      title="Attribution Model Comparison"
      extra={
        <Space>
          <Select 
            value={selectedTimeRange} 
            onChange={setSelectedTimeRange}
            style={{ width: 120 }}
          >
            <Option value="7d">7 days</Option>
            <Option value="30d">30 days</Option>
            <Option value="90d">90 days</Option>
          </Select>
          <Tooltip title="Download comparison report">
            <Button icon={<DownloadOutlined />} />
          </Tooltip>
        </Space>
      }
      loading={loading}
    >
      <ComparisonTable />
      
      <div style={{ marginTop: '24px' }}>
        <Alert
          message="Attribution Insights"
          description={
            <div>
              <p><strong>Highest Variance:</strong> Email marketing shows significant differences between models, suggesting multi-touch interactions are crucial.</p>
              <p><strong>Recommendation:</strong> Use Time Decay or Linear attribution for more balanced channel investment decisions.</p>
            </div>
          }
          type="info"
          showIcon
        />
      </div>
    </Card>
  );
};
```

#### Customer Journey Visualization
```javascript
const CustomerJourneyFlow = ({ journeyData }) => {
  const [selectedJourney, setSelectedJourney] = useState('all');
  const [viewMode, setViewMode] = useState('sankey'); // 'sankey' or 'path'

  const processJourneyData = useMemo(() => {
    if (!journeyData) return { nodes: [], links: [] };

    // Create nodes for each unique touchpoint
    const touchpointCounts = {};
    journeyData.forEach(journey => {
      journey.touchpoints.forEach((touchpoint, index) => {
        const nodeId = `${touchpoint.channel}_${index}`;
        touchpointCounts[nodeId] = (touchpointCounts[nodeId] || 0) + 1;
      });
    });

    const nodes = Object.keys(touchpointCounts).map(nodeId => {
      const [channel, position] = nodeId.split('_');
      return {
        id: nodeId,
        name: `${channel} (${position === '0' ? 'First' : position === '1' ? 'Second' : `${parseInt(position) + 1}th`} Touch)`,
        channel,
        position: parseInt(position),
        count: touchpointCounts[nodeId]
      };
    });

    // Create links between consecutive touchpoints
    const links = [];
    journeyData.forEach(journey => {
      for (let i = 0; i < journey.touchpoints.length - 1; i++) {
        const source = `${journey.touchpoints[i].channel}_${i}`;
        const target = `${journey.touchpoints[i + 1].channel}_${i + 1}`;
        
        const existingLink = links.find(l => l.source === source && l.target === target);
        if (existingLink) {
          existingLink.value += 1;
        } else {
          links.push({ source, target, value: 1 });
        }
      }
    });

    return { nodes, links };
  }, [journeyData]);

  const JourneyPathAnalysis = () => (
    <div>
      <Title level={4}>Most Common Journey Paths</Title>
      {journeyData?.common_paths?.map((path, index) => (
        <div key={index} style={{ 
          marginBottom: '16px', 
          padding: '12px', 
          border: '1px solid #d9d9d9', 
          borderRadius: '6px',
          background: index === 0 ? '#f6ffed' : 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <Badge 
              count={index + 1} 
              style={{ backgroundColor: index === 0 ? '#52c41a' : '#1890ff' }}
            />
            <span style={{ marginLeft: '12px', fontSize: '16px', fontWeight: 'bold' }}>
              {path.steps.join(' → ')}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>
              <Text type="secondary">Frequency: </Text>
              <strong>{path.count.toLocaleString()} users ({path.percentage}%)</strong>
            </span>
            <span>
              <Text type="secondary">Avg Journey Time: </Text>
              <strong>{path.avg_duration} days</strong>
            </span>
            <span>
              <Text type="secondary">Conversion Rate: </Text>
              <strong style={{ color: path.conversion_rate > 0.1 ? '#52c41a' : '#fa8c16' }}>
                {(path.conversion_rate * 100).toFixed(1)}%
              </strong>
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card
      title="Customer Journey Analysis"
      extra={
        <Space>
          <Radio.Group value={viewMode} onChange={e => setViewMode(e.target.value)}>
            <Radio.Button value="sankey">Flow Diagram</Radio.Button>
            <Radio.Button value="path">Path Analysis</Radio.Button>
          </Radio.Group>
        </Space>
      }
    >
      {viewMode === 'sankey' ? (
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={processJourneyData}
              nodePadding={20}
              nodeWidth={15}
              linkCurvature={0.67}
              iterations={32}
            >
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value} users`,
                  props.payload.name || name
                ]}
              />
            </Sankey>
          </ResponsiveContainer>
        </div>
      ) : (
        <JourneyPathAnalysis />
      )}
      
      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        background: '#f0f2f5', 
        borderRadius: '8px' 
      }}>
        <Row gutter={24}>
          <Col span={6}>
            <Statistic
              title="Avg Journey Length"
              value={journeyData?.avg_journey_days || 0}
              suffix=" days"
              precision={1}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Avg Touchpoints"
              value={journeyData?.avg_touchpoints || 0}
              precision={1}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Multi-touch Journeys"
              value={journeyData?.multitouch_percentage || 0}
              suffix="%"
              precision={1}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Direct Conversions"
              value={journeyData?.direct_conversion_rate || 0}
              suffix="%"
              precision={1}
            />
          </Col>
        </Row>
      </div>
    </Card>
  );
};
```

## Integration Architecture

### API Integration Layer

```javascript
// /src/utils/marketingApiClient.js
class MarketingAnalyticsClient {
  constructor(baseURL = '/api/v1/analytics') {
    this.baseURL = baseURL;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async request(endpoint, params = {}, useCache = true) {
    const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
    
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, { params });
      
      if (useCache) {
        this.cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }
      
      return response.data;
    } catch (error) {
      console.error(`Marketing API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Dashboard-specific methods
  async getOverviewMetrics(timeRange = '30d') {
    return this.request('/metrics/overview', { period: timeRange });
  }

  async getEmailCampaignStats(campaignId = null, timeRange = '30d') {
    return this.request('/email/campaigns', { 
      campaign_id: campaignId,
      period: timeRange 
    });
  }

  async getWebsiteAnalytics(timeRange = '30d') {
    return this.request('/website/stats', { period: timeRange });
  }

  async getSocialMediaMetrics(platform = 'all', timeRange = '30d') {
    return this.request('/social/metrics', { 
      platform,
      period: timeRange 
    });
  }

  async getAttributionData(model = 'linear', timeRange = '30d') {
    return this.request('/attribution/revenue', { 
      model,
      period: timeRange 
    });
  }

  async getUserJourneys(userId = null, timeRange = '30d') {
    return this.request('/journeys', {
      user_id: userId,
      period: timeRange
    });
  }
}

export const marketingApi = new MarketingAnalyticsClient();
```

### Real-time Data Updates

```javascript
// /src/hooks/useRealTimeMetrics.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useRealTimeMetrics = (endpoint, initialData = null) => {
  const [data, setData] = useState(initialData);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const socket = io('/marketing-analytics', {
      transports: ['websocket']
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('subscribe', endpoint);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on(`update_${endpoint}`, (newData) => {
      setData(prevData => ({
        ...prevData,
        ...newData
      }));
      setLastUpdate(Date.now());
    });

    socket.on('error', (error) => {
      console.error('Real-time connection error:', error);
    });

    return () => {
      socket.emit('unsubscribe', endpoint);
      socket.disconnect();
    };
  }, [endpoint]);

  return { data, connected, lastUpdate };
};
```

## Mobile-Responsive Design

### Responsive Layout Strategy

```javascript
// /src/components/ResponsiveGrid.js
import { useMediaQuery } from '@ant-design/pro-utils';

const ResponsiveGrid = ({ children, minCardWidth = 300 }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const getColSpan = () => {
    if (isMobile) return 24; // Full width on mobile
    if (isTablet) return 12; // Half width on tablet
    return 8; // Third width on desktop
  };

  const getGutter = () => {
    if (isMobile) return [8, 8];
    if (isTablet) return [12, 12]; 
    return [16, 16];
  };

  return (
    <Row gutter={getGutter()}>
      {React.Children.map(children, (child, index) => (
        <Col 
          span={getColSpan()} 
          key={index}
          style={{ marginBottom: isMobile ? '16px' : '24px' }}
        >
          {child}
        </Col>
      ))}
    </Row>
  );
};

// Mobile-optimized card component
const MobileOptimizedCard = ({ title, children, ...props }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <Card 
      {...props}
      title={title}
      size={isMobile ? 'small' : 'default'}
      style={{
        ...(props.style || {}),
        fontSize: isMobile ? '14px' : '16px'
      }}
      headStyle={{
        padding: isMobile ? '8px 12px' : '16px 24px',
        fontSize: isMobile ? '16px' : '18px'
      }}
      bodyStyle={{
        padding: isMobile ? '12px' : '24px'
      }}
    >
      {children}
    </Card>
  );
};
```

### Mobile Navigation Enhancement

```javascript
// /src/components/MobileMarketingNav.js
const MobileMarketingNav = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!isMobile) return null;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <DashboardOutlined /> },
    { key: 'email', label: 'Email', icon: <MailOutlined /> },
    { key: 'website', label: 'Website', icon: <GlobalOutlined /> },
    { key: 'social', label: 'Social', icon: <InstagramOutlined /> },
    { key: 'attribution', label: 'Attribution', icon: <PartitionOutlined /> }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid #f0f0f0',
      padding: '8px 0',
      zIndex: 1000
    }}>
      <Row justify="center">
        {tabs.map(tab => (
          <Col key={tab.key} style={{ textAlign: 'center', flex: 1 }}>
            <Button
              type={activeTab === tab.key ? 'primary' : 'text'}
              icon={tab.icon}
              size="small"
              onClick={() => setActiveTab(tab.key)}
              style={{
                height: 'auto',
                padding: '8px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: 'none',
                background: 'none'
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>
                {tab.icon}
              </div>
              <div style={{ fontSize: '10px' }}>
                {tab.label}
              </div>
            </Button>
          </Col>
        ))}
      </Row>
    </div>
  );
};
```

## Performance Optimization Strategy

### Smart Data Loading

```javascript
// /src/hooks/useOptimizedData.js
export const useOptimizedData = (apiCall, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const {
    refreshInterval = 0,
    retryCount = 3,
    retryDelay = 1000,
    cacheKey = null,
    fallbackData = null
  } = options;

  const loadData = useCallback(async (retries = retryCount) => {
    try {
      setLoading(true);
      setError(null);

      // Check localStorage cache first
      if (cacheKey) {
        const cached = localStorage.getItem(`marketing_cache_${cacheKey}`);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 minutes
            setData(cachedData);
            setLoading(false);
            // Still fetch fresh data in background
            apiCall().then(freshData => {
              setData(freshData);
              localStorage.setItem(`marketing_cache_${cacheKey}`, JSON.stringify({
                data: freshData,
                timestamp: Date.now()
              }));
            });
            return;
          }
        }
      }

      const result = await apiCall();
      setData(result);
      
      // Cache the result
      if (cacheKey) {
        localStorage.setItem(`marketing_cache_${cacheKey}`, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));
      }
      
    } catch (err) {
      if (retries > 0) {
        setTimeout(() => loadData(retries - 1), retryDelay);
        return;
      }
      
      setError(err);
      if (fallbackData) {
        setData(fallbackData);
      }
    } finally {
      setLoading(false);
    }
  }, [...dependencies, apiCall, retryCount, retryDelay, cacheKey, fallbackData]);

  useEffect(() => {
    loadData();
    
    if (refreshInterval > 0) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadData, refreshInterval]);

  return { data, loading, error, refresh: loadData };
};
```

### Chart Performance Optimization

```javascript
// /src/components/OptimizedChart.js
const OptimizedChart = memo(({ data, type, height = 300, ...props }) => {
  const [processedData, setProcessedData] = useState([]);
  const containerRef = useRef();
  const [containerWidth, setContainerWidth] = useState(0);

  // Data processing optimization
  useEffect(() => {
    if (!data) return;

    // Debounce data processing for large datasets
    const timeoutId = setTimeout(() => {
      // Sample data for large datasets to improve performance
      const maxDataPoints = 1000;
      let processed = data;
      
      if (data.length > maxDataPoints) {
        const step = Math.ceil(data.length / maxDataPoints);
        processed = data.filter((_, index) => index % step === 0);
      }
      
      setProcessedData(processed);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [data]);

  // Responsive width detection
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setContainerWidth(width);
    });

    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

  const ChartComponent = useMemo(() => {
    const chartProps = {
      width: containerWidth,
      height,
      data: processedData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
      ...props
    };

    switch (type) {
      case 'line':
        return <LineChart {...chartProps} />;
      case 'bar':
        return <BarChart {...chartProps} />;
      case 'area':
        return <AreaChart {...chartProps} />;
      case 'pie':
        return <PieChart {...chartProps} />;
      default:
        return <LineChart {...chartProps} />;
    }
  }, [type, containerWidth, height, processedData, props]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <ResponsiveContainer width="100%" height={height}>
        {ChartComponent}
      </ResponsiveContainer>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  return (
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
    prevProps.type === nextProps.type &&
    prevProps.height === nextProps.height
  );
});
```

## Grafana Integration

### Dashboard Export Configuration

```javascript
// /src/utils/grafanaIntegration.js
export const generateGrafanaDashboard = (dashboardConfig) => {
  const grafanaDashboard = {
    dashboard: {
      id: null,
      title: `Marketing Analytics - ${dashboardConfig.title}`,
      tags: ['marketing', 'aquaScene', 'analytics'],
      timezone: 'browser',
      refresh: '30s',
      time: {
        from: 'now-30d',
        to: 'now'
      },
      panels: dashboardConfig.panels.map((panel, index) => ({
        id: index + 1,
        title: panel.title,
        type: panel.type,
        gridPos: {
          h: panel.height || 8,
          w: panel.width || 12,
          x: (index % 2) * 12,
          y: Math.floor(index / 2) * 8
        },
        targets: panel.queries.map(query => ({
          expr: query.prometheus || query.query,
          legendFormat: query.legend,
          refId: query.refId || 'A'
        })),
        fieldConfig: {
          defaults: {
            color: {
              mode: 'palette-classic'
            },
            custom: {
              axisLabel: panel.yAxisLabel || '',
              axisPlacement: 'auto',
              barAlignment: 0,
              drawStyle: 'line',
              fillOpacity: panel.fillOpacity || 10,
              gradientMode: 'none',
              hideFrom: {
                legend: false,
                tooltip: false,
                vis: false
              },
              lineInterpolation: 'linear',
              lineWidth: 1,
              pointSize: 5,
              scaleDistribution: {
                type: 'linear'
              },
              showPoints: 'never',
              spanNulls: false,
              stacking: {
                group: 'A',
                mode: 'none'
              },
              thresholdsStyle: {
                mode: 'off'
              }
            },
            mappings: [],
            thresholds: {
              mode: 'absolute',
              steps: [
                {
                  color: 'green',
                  value: null
                },
                {
                  color: 'red',
                  value: 80
                }
              ]
            },
            unit: panel.unit || 'short'
          }
        },
        options: {
          legend: {
            calcs: [],
            displayMode: 'list',
            placement: 'bottom'
          },
          tooltip: {
            mode: 'single'
          }
        }
      }))
    },
    folderId: null,
    overwrite: true
  };

  return grafanaDashboard;
};

export const exportToGrafana = async (dashboardConfig, grafanaUrl, apiKey) => {
  const dashboard = generateGrafanaDashboard(dashboardConfig);
  
  try {
    const response = await fetch(`${grafanaUrl}/api/dashboards/db`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dashboard)
    });

    if (response.ok) {
      const result = await response.json();
      message.success(`Dashboard exported to Grafana successfully! URL: ${result.url}`);
      return result;
    } else {
      throw new Error(`Failed to export: ${response.statusText}`);
    }
  } catch (error) {
    message.error(`Failed to export dashboard to Grafana: ${error.message}`);
    throw error;
  }
};
```

### Prometheus Metrics Integration

```javascript
// /src/utils/prometheusQueries.js
export const marketingMetricsQueries = {
  totalRevenue: 'sum(marketing_revenue_total)',
  revenueByChannel: 'sum by (channel) (marketing_revenue_by_channel)',
  conversionRate: 'marketing_conversions_total / marketing_visitors_total * 100',
  emailOpenRate: 'marketing_email_opens_total / marketing_email_sent_total * 100',
  socialEngagement: 'sum(marketing_social_engagement_total)',
  websiteTraffic: 'marketing_website_visitors_total',
  attributionFirstTouch: 'sum by (channel) (marketing_attribution_first_touch)',
  attributionLastTouch: 'sum by (channel) (marketing_attribution_last_touch)',
  customerAcquisitionCost: 'marketing_spend_total / marketing_new_customers_total',
  returnOnAdSpend: 'marketing_revenue_total / marketing_spend_total'
};

export const buildPrometheusQuery = (metric, timeRange = '30d', filters = {}) => {
  let query = marketingMetricsQueries[metric];
  
  if (!query) {
    throw new Error(`Unknown metric: ${metric}`);
  }

  // Add time range
  if (timeRange) {
    query += `[${timeRange}]`;
  }

  // Add filters
  Object.entries(filters).forEach(([key, value]) => {
    query = query.replace(
      new RegExp(`\\b${key}\\b`, 'g'),
      `${key}="${value}"`
    );
  });

  return query;
};
```

## Testing Strategy

### Component Testing
```javascript
// /src/components/__tests__/MarketingOverview.test.js
import { render, screen, waitFor } from '@testing-library/react';
import { MarketingOverview } from '../MarketingOverview';
import { marketingApi } from '../../utils/marketingApiClient';

jest.mock('../../utils/marketingApiClient');

describe('MarketingOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<MarketingOverview />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays KPI cards with correct data', async () => {
    const mockData = {
      subscribers: { current: 12456, previous: 11103 },
      cac: { current: 34.50, previous: 37.25 },
      ltv: { current: 245.80, previous: 213.45 },
      roas: { current: 4.2, previous: 3.45 },
      conversionRate: { current: 3.4, previous: 3.22 }
    };

    marketingApi.getOverviewMetrics.mockResolvedValue(mockData);

    render(<MarketingOverview />);

    await waitFor(() => {
      expect(screen.getByText('12,456')).toBeInTheDocument();
      expect(screen.getByText('$34.50')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    marketingApi.getOverviewMetrics.mockRejectedValue(new Error('API Error'));

    render(<MarketingOverview />);

    await waitFor(() => {
      expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
    });
  });
});
```

### Integration Testing
```javascript
// /src/__tests__/integration/DashboardFlow.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';

describe('Marketing Dashboard Integration', () => {
  it('navigates between different marketing dashboards', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Navigate to marketing analytics
    fireEvent.click(screen.getByText(/marketing analytics/i));

    await waitFor(() => {
      expect(screen.getByText(/overview/i)).toBeInTheDocument();
    });

    // Switch to email analytics
    fireEvent.click(screen.getByText(/email/i));

    await waitFor(() => {
      expect(screen.getByText(/email marketing analytics/i)).toBeInTheDocument();
    });
  });
});
```

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Set up marketing analytics service integration
- [ ] Implement basic dashboard routing and navigation
- [ ] Create responsive grid system and mobile components
- [ ] Build marketing API client with caching
- [ ] Implement real-time WebSocket connections

### Phase 2: Core Dashboards (Weeks 5-8)
- [ ] Marketing Overview Dashboard implementation
- [ ] Email Analytics Dashboard with campaign performance
- [ ] Website Analytics Dashboard with Plausible integration
- [ ] Basic attribution modeling (first-touch, last-touch)

### Phase 3: Advanced Features (Weeks 9-12)
- [ ] Social Media Dashboard with Instagram automation
- [ ] Advanced Attribution Dashboard with multi-touch models
- [ ] Customer journey visualization
- [ ] A/B testing results integration

### Phase 4: Optimization & Integration (Weeks 13-16)
- [ ] Performance optimization and code splitting
- [ ] Grafana dashboard export functionality
- [ ] Mobile app optimization
- [ ] Advanced analytics and predictive insights

## Success Metrics

### Technical KPIs
- Dashboard load time: <2 seconds (95th percentile)
- Mobile responsiveness: 100% feature parity
- Real-time update latency: <5 seconds
- API response caching: 80% cache hit rate
- Component test coverage: >90%

### Business Impact
- Marketing team adoption: >90% daily active usage
- Decision-making speed: 50% reduction in time to insight
- Campaign optimization frequency: 3x improvement
- Attribution accuracy: >95% vs current last-touch model
- ROI visibility: 100% campaign tracking coverage

---

This comprehensive design document provides the foundation for implementing world-class marketing analytics dashboards within the AquaScene ecosystem. The design leverages established patterns from the existing admin dashboard while introducing advanced analytics capabilities that will drive data-driven marketing decisions and improved ROI across all channels.

**Next Steps:**
1. Technical review and architecture approval
2. UI/UX design mockups for key dashboard screens
3. API integration planning with marketing-analytics service
4. Development environment setup and Phase 1 implementation