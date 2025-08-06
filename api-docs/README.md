# API Documentation

Complete API documentation for all AquaScene Ecosystem services.

## Quick Navigation

### Core APIs
- [Authentication API](./auth-api.md) - User authentication and authorization
- [Content API](./content-api.md) - Content creation and management
- [Social Media API](./social-media-api.md) - Social platform integrations
- [Analytics API](./analytics-api.md) - Performance metrics and reporting

### Specialized Services
- [AI Pipeline API](./ai-pipeline-api.md) - AI content generation services
- [Media API](./media-api.md) - Image and video management
- [RSS Feed API](./rss-api.md) - RSS monitoring and processing
- [Partnership API](./partnership-api.md) - Green Aqua integration

### Integration Guides
- [API Reference](./api-reference.md) - Complete endpoint documentation
- [SDK Documentation](./sdk-docs.md) - Official SDKs and libraries
- [Webhook Guide](./webhooks.md) - Webhook implementation
- [Rate Limits](./rate-limits.md) - API usage limits and best practices

## API Overview

The AquaScene Ecosystem provides RESTful APIs with the following characteristics:

- **Base URL**: `https://api.yourdomain.com`
- **Authentication**: JWT Bearer tokens
- **Format**: JSON request/response
- **Rate Limiting**: Varies by endpoint
- **Versioning**: `/v1/` prefix for all endpoints

## Quick Start

### 1. Authentication

```bash
# Get access token
curl -X POST https://api.yourdomain.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "user123",
    "email": "your-email@example.com",
    "name": "Your Name"
  }
}
```

### 2. Making Authenticated Requests

```bash
# Use the access token in Authorization header
curl -X GET https://api.yourdomain.com/v1/content \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Generate Content

```bash
curl -X POST https://api.yourdomain.com/v1/ai/generate-content \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "instagram_post",
    "topic": "beginner aquascaping setup",
    "language": "en",
    "tone": "educational"
  }'
```

## API Architecture

```
Client Application
       ↓
┌─────────────────┐
│ Nginx (Gateway) │
├─────────────────┤
│ Rate Limiting   │
│ SSL Termination │
│ Load Balancing  │
└─────────────────┘
       ↓
┌─────────────────┐
│ Backend API     │
├─────────────────┤
│ Authentication  │
│ Business Logic  │
│ Data Validation │
└─────────────────┘
       ↓
┌─────────────────────────────────┐
│ Microservices                   │
├─────────────────────────────────┤
│ AI Pipeline │ Social Media API  │
│ Media Proc. │ Analytics Service │
│ RSS Monitor │ Partnership API   │
└─────────────────────────────────┘
       ↓
┌─────────────────┐
│ Database Layer  │
├─────────────────┤
│ PostgreSQL      │
│ Redis Cache     │
│ File Storage    │
└─────────────────┘
```

## Service Endpoints Summary

### Authentication Service
```
POST   /v1/auth/login              # User login
POST   /v1/auth/register           # User registration
POST   /v1/auth/refresh            # Refresh access token
POST   /v1/auth/logout             # User logout
GET    /v1/auth/profile            # Get user profile
PUT    /v1/auth/profile            # Update user profile
```

### Content Management
```
GET    /v1/content                 # List content
POST   /v1/content                 # Create content
GET    /v1/content/:id             # Get specific content
PUT    /v1/content/:id             # Update content
DELETE /v1/content/:id             # Delete content
POST   /v1/content/:id/publish     # Publish content
```

### AI Content Generation
```
POST   /v1/ai/generate-content     # Generate new content
GET    /v1/ai/templates            # List content templates
POST   /v1/ai/analyze-performance  # Analyze content performance
GET    /v1/ai/suggestions          # Get content suggestions
```

### Social Media Integration
```
GET    /v1/social/accounts         # List connected accounts
POST   /v1/social/accounts         # Connect new account
DELETE /v1/social/accounts/:id     # Disconnect account
POST   /v1/social/publish          # Publish to social media
GET    /v1/social/analytics        # Get social media analytics
```

### Media Management
```
POST   /v1/media/upload            # Upload media files
GET    /v1/media                   # List media files
GET    /v1/media/:id               # Get specific media
DELETE /v1/media/:id               # Delete media file
POST   /v1/media/:id/process       # Process media (resize, optimize)
```

### RSS Feed Monitoring
```
GET    /v1/rss/feeds               # List RSS feeds
POST   /v1/rss/feeds               # Add RSS feed
DELETE /v1/rss/feeds/:id           # Remove RSS feed
GET    /v1/rss/items               # Get RSS feed items
POST   /v1/rss/process-item        # Process specific RSS item
```

### Analytics and Reporting
```
GET    /v1/analytics/overview      # Dashboard overview
GET    /v1/analytics/content       # Content performance
GET    /v1/analytics/social        # Social media metrics
GET    /v1/analytics/revenue       # Revenue and commission data
GET    /v1/analytics/export        # Export analytics data
```

## Response Format

All API responses follow this consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully",
  "timestamp": "2025-08-06T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "timestamp": "2025-08-06T10:30:00Z"
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_CREDENTIALS | 401 | Invalid username or password |
| TOKEN_EXPIRED | 401 | Access token has expired |
| INSUFFICIENT_PERMISSIONS | 403 | User lacks required permissions |
| RESOURCE_NOT_FOUND | 404 | Requested resource not found |
| VALIDATION_ERROR | 400 | Request validation failed |
| RATE_LIMIT_EXCEEDED | 429 | API rate limit exceeded |
| INTERNAL_SERVER_ERROR | 500 | Internal server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable |

## Rate Limits

| Endpoint Group | Rate Limit | Window |
|----------------|------------|--------|
| Authentication | 10 requests | 1 minute |
| Content CRUD | 100 requests | 1 hour |
| AI Generation | 20 requests | 1 hour |
| Social Publishing | 50 requests | 1 hour |
| Analytics | 200 requests | 1 hour |
| Media Upload | 50 requests | 1 hour |

## Pagination

For endpoints returning lists, use these parameters:

```
GET /v1/content?page=1&limit=20&sort=created_at&order=desc
```

Response includes pagination metadata:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtering and Search

Most list endpoints support filtering:

```bash
# Filter content by type and status
GET /v1/content?type=instagram_post&status=published

# Search content by title
GET /v1/content?search=aquascaping+basics

# Date range filtering
GET /v1/analytics/content?from=2025-07-01&to=2025-07-31
```

## Webhooks

Configure webhooks to receive real-time notifications:

```bash
POST /v1/webhooks
{
  "url": "https://your-app.com/webhook",
  "events": ["content.published", "social.posted", "analytics.report"],
  "secret": "your-webhook-secret"
}
```

## SDK Libraries

Official SDKs are available for:

- **JavaScript/Node.js**: `npm install @aquascape/api-client`
- **Python**: `pip install aquascape-api`
- **PHP**: `composer require aquascape/api-client`
- **Go**: `go get github.com/aquascape/api-client-go`

## Environment-Specific Endpoints

### Development
- **Base URL**: `https://dev-api.yourdomain.com`
- **Rate Limits**: Relaxed for testing
- **Authentication**: Test credentials available

### Staging
- **Base URL**: `https://staging-api.yourdomain.com`
- **Rate Limits**: Production-like limits
- **Authentication**: Staging credentials

### Production
- **Base URL**: `https://api.yourdomain.com`
- **Rate Limits**: Full production limits
- **Authentication**: Production credentials only

## Support and Resources

- **API Status**: [status.yourdomain.com](https://status.yourdomain.com)
- **Interactive Docs**: [api-docs.yourdomain.com](https://api-docs.yourdomain.com)
- **Postman Collection**: Available in each API guide
- **GitHub Issues**: Report bugs and request features
- **Developer Forum**: Community support and discussions
- **Email Support**: api-support@yourdomain.com

## Testing

All APIs include comprehensive test suites:
- Unit tests for individual endpoints
- Integration tests for workflows
- Load tests for performance validation
- Security tests for vulnerability assessment

## Changelog

- **v1.3.0** (2025-08-06): Partnership API enhancements
- **v1.2.0** (2025-07-15): AI Pipeline improvements
- **v1.1.0** (2025-07-01): Social media API expansion
- **v1.0.0** (2025-06-15): Initial production release

For detailed API documentation, select the specific service from the navigation above.