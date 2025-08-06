# API Integration Examples

Complete examples and SDKs for integrating with the AquaScene Ecosystem APIs.

## Quick Start Integration

### JavaScript/Node.js SDK

```javascript
// Installation
npm install @aquascape/api-client

// Basic usage
import { AquaScapeClient } from '@aquascape/api-client';

const client = new AquaScapeClient({
  apiUrl: 'https://api.yourdomain.com',
  apiKey: 'your-api-key'
});

// Generate content
const content = await client.content.generate({
  type: 'instagram_post',
  topic: 'beginner aquascaping',
  language: 'en',
  tone: 'educational'
});

console.log('Generated content:', content);
```

### Python SDK

```python
# Installation
pip install aquascape-api

# Basic usage
from aquascape_api import AquaScapeClient

client = AquaScapeClient(
    api_url="https://api.yourdomain.com",
    api_key="your-api-key"
)

# Generate content
content = await client.content.generate({
    "type": "instagram_post",
    "topic": "beginner aquascaping",
    "language": "en",
    "tone": "educational"
})

print("Generated content:", content)
```

## Authentication Examples

### JWT Token Authentication

```javascript
// Login and get tokens
const authResponse = await fetch('https://api.yourdomain.com/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'your-email@example.com',
    password: 'your-password'
  })
});

const { accessToken, refreshToken } = await authResponse.json();

// Use access token for API calls
const apiResponse = await fetch('https://api.yourdomain.com/v1/content', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Token Refresh

```javascript
async function refreshAccessToken(refreshToken) {
  const response = await fetch('https://api.yourdomain.com/v1/auth/refresh', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${refreshToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    const { accessToken } = await response.json();
    return accessToken;
  }
  
  throw new Error('Token refresh failed');
}

// Auto-refresh wrapper
async function apiCall(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (response.status === 401) {
    // Token expired, refresh and retry
    accessToken = await refreshAccessToken(refreshToken);
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }
  
  return response;
}
```

## Content Generation Examples

### Instagram Post Generation

```javascript
const instagramPost = await client.ai.generateContent({
  type: 'instagram_post',
  topic: 'CO2 injection in planted aquariums',
  parameters: {
    tone: 'educational',
    length: 'medium',
    includeHashtags: true,
    includeCTA: true,
    targetAudience: 'beginners'
  },
  language: 'en'
});

console.log('Instagram Post:', instagramPost);
/*
Output:
{
  "id": "content_123",
  "type": "instagram_post",
  "content": {
    "caption": "🌿 CO2 injection is a game-changer for planted aquariums! Here's what you need to know:\n\n✅ Boosts plant growth significantly\n✅ Reduces algae when balanced properly\n✅ Creates lush, vibrant underwater landscapes\n\nStart with 1 bubble per second and adjust based on your tank size. What's your experience with CO2? 💬\n\n#aquascaping #plantedtank #co2injection #aquariumlife",
    "hashtags": ["#aquascaping", "#plantedtank", "#co2injection", "#aquariumlife", "#aquariumplants"],
    "callToAction": "What's your experience with CO2? 💬",
    "metadata": {
      "estimatedReach": "500-1000",
      "bestPostTime": "7:00 PM",
      "imageRecommendations": ["close-up of CO2 bubbles", "before/after plant growth"]
    }
  },
  "createdAt": "2025-08-06T10:30:00Z"
}
*/
```

### Multi-Platform Content Generation

```javascript
const multiPlatformContent = await client.ai.generateMultiPlatform({
  baseTopic: 'aquarium lighting setup',
  platforms: ['instagram', 'facebook', 'youtube'],
  sourceContent: {
    type: 'blog_post',
    url: 'https://example.com/lighting-guide'
  }
});

console.log('Multi-platform content:', multiPlatformContent);
/*
Output:
{
  "id": "multi_456",
  "platforms": {
    "instagram": {
      "type": "carousel",
      "slides": [
        {
          "image": "lighting_setup_1.jpg",
          "caption": "The foundation of any thriving planted tank? LIGHTING! 💡\n\nSlide to see the complete setup guide ➡️"
        }
      ]
    },
    "facebook": {
      "type": "post",
      "content": "Complete guide to aquarium lighting for planted tanks...",
      "recommendedImageSize": "1200x630"
    },
    "youtube": {
      "type": "community_post",
      "content": "Which lighting setup works best for your planted tank?",
      "poll": {
        "question": "Your current lighting type?",
        "options": ["LED", "T5 Fluorescent", "Metal Halide", "Other"]
      }
    }
  }
}
*/
```

### Content with Green Aqua Products

```javascript
const productIntegratedContent = await client.ai.generateWithProducts({
  topic: 'beginner aquascaping kit',
  partnerProducts: true,
  partner: 'green_aqua',
  contentType: 'educational_guide'
});

console.log('Product-integrated content:', productIntegratedContent);
/*
Output includes automatic affiliate links and product recommendations
*/
```

## Social Media Integration Examples

### Instagram Publishing

```javascript
// Connect Instagram account
const instagramAuth = await client.social.connectAccount({
  platform: 'instagram',
  accountType: 'business',
  redirectUri: 'https://yourapp.com/callback'
});

// Publish post to Instagram
const publishResult = await client.social.publish({
  platform: 'instagram',
  accountId: 'your_instagram_account_id',
  content: {
    type: 'photo',
    imageUrl: 'https://yourcdn.com/image.jpg',
    caption: 'Your aquascaping journey starts here! 🌿 #aquascaping',
    location: {
      name: 'Budapest, Hungary',
      coordinates: { lat: 47.4979, lng: 19.0402 }
    }
  },
  scheduledAt: '2025-08-07T19:00:00Z' // Optional
});

console.log('Publish result:', publishResult);
```

### Multi-Platform Publishing

```javascript
const multiPlatformPublish = await client.social.publishMultiPlatform({
  platforms: ['instagram', 'facebook', 'youtube'],
  content: {
    instagram: {
      type: 'reel',
      videoUrl: 'https://yourcdn.com/reel.mp4',
      caption: 'Time-lapse of our latest aquascape! 🎥 #aquascaping #timelapse',
      coverImageUrl: 'https://yourcdn.com/cover.jpg'
    },
    facebook: {
      type: 'video',
      videoUrl: 'https://yourcdn.com/video.mp4',
      description: 'Watch this amazing aquascaping time-lapse!',
      thumbnailUrl: 'https://yourcdn.com/thumbnail.jpg'
    },
    youtube: {
      type: 'short',
      videoUrl: 'https://yourcdn.com/short.mp4',
      title: 'Aquascaping Time-lapse #Shorts',
      description: 'Creating a beautiful underwater landscape in 60 seconds!'
    }
  },
  scheduledAt: '2025-08-07T20:00:00Z'
});
```

## RSS Feed Integration Examples

### RSS Feed Monitoring

```javascript
// Add RSS feed
const rssfeed = await client.rss.addFeed({
  url: 'https://iaplc.com/feed',
  category: 'competition',
  relevanceThreshold: 0.7,
  autoProcess: true
});

// Get recent RSS items
const recentItems = await client.rss.getItems({
  feedId: rsseed.id,
  limit: 10,
  processed: false
});

// Process RSS item into content
const processedContent = await client.rss.processItem({
  itemId: recentItems[0].id,
  targetPlatforms: ['instagram', 'blog'],
  generateImages: true
});
```

### Automated RSS-to-Content Pipeline

```javascript
// Setup automated RSS processing
const automation = await client.automation.create({
  name: 'IAPLC Competition Updates',
  trigger: {
    type: 'rss_new_item',
    feedUrl: 'https://iaplc.com/feed',
    keywords: ['competition', 'winner', 'gallery']
  },
  actions: [
    {
      type: 'generate_content',
      platforms: ['instagram', 'facebook'],
      parameters: {
        tone: 'exciting',
        includeProducts: true
      }
    },
    {
      type: 'schedule_post',
      delay: '2 hours',
      optimalTiming: true
    }
  ]
});

console.log('Automation created:', automation);
```

## Analytics and Reporting Examples

### Content Performance Analytics

```javascript
// Get content performance metrics
const analytics = await client.analytics.getContentPerformance({
  dateRange: {
    from: '2025-07-01',
    to: '2025-07-31'
  },
  platforms: ['instagram', 'facebook'],
  metrics: ['reach', 'engagement', 'clicks', 'saves']
});

console.log('Content performance:', analytics);
/*
Output:
{
  "summary": {
    "totalReach": 125000,
    "totalEngagement": 8500,
    "averageEngagementRate": 6.8,
    "topPerformingContent": "content_789"
  },
  "platformBreakdown": {
    "instagram": {
      "reach": 85000,
      "engagement": 6200,
      "engagementRate": 7.3
    },
    "facebook": {
      "reach": 40000,
      "engagement": 2300,
      "engagementRate": 5.8
    }
  },
  "contentDetails": [...]
}
*/
```

### Revenue Analytics

```javascript
// Get partnership revenue data
const revenueData = await client.analytics.getRevenue({
  dateRange: {
    from: '2025-07-01',
    to: '2025-07-31'
  },
  partners: ['green_aqua'],
  breakdown: 'daily'
});

console.log('Revenue analytics:', revenueData);
/*
Output includes:
- Total commission earned
- Sales attribution by content
- Conversion rates
- Top-performing products
*/
```

## Webhook Integration Examples

### Setting Up Webhooks

```javascript
// Register webhook endpoint
const webhook = await client.webhooks.create({
  url: 'https://yourapp.com/webhook/aquascape',
  events: [
    'content.generated',
    'content.published',
    'social.posted',
    'analytics.daily_report'
  ],
  secret: 'your-webhook-secret'
});

// Webhook handler (Express.js example)
app.post('/webhook/aquascape', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-aquascape-signature'];
  const payload = req.body;
  
  // Verify webhook signature
  const computedSignature = crypto
    .createHmac('sha256', 'your-webhook-secret')
    .update(payload)
    .digest('hex');
  
  if (signature !== `sha256=${computedSignature}`) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(payload);
  
  switch (event.type) {
    case 'content.generated':
      handleContentGenerated(event.data);
      break;
    case 'content.published':
      handleContentPublished(event.data);
      break;
    case 'social.posted':
      handleSocialPosted(event.data);
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }
  
  res.status(200).send('OK');
});

// Event handlers
function handleContentGenerated(data) {
  console.log('New content generated:', data.contentId);
  // Send notification to content managers
  // Update your database
  // Trigger review workflow
}

function handleContentPublished(data) {
  console.log('Content published:', data.contentId, 'on', data.platform);
  // Update analytics dashboard
  // Notify stakeholders
}
```

## Custom Integration Examples

### WordPress Plugin Integration

```php
<?php
// WordPress plugin for AquaScene integration

class AquaScapeWordPress {
    private $client;
    
    public function __construct($api_key) {
        $this->client = new AquaScapeAPIClient($api_key);
    }
    
    // Generate content for WordPress post
    public function generatePostContent($topic) {
        $response = $this->client->post('/v1/ai/generate-content', [
            'type' => 'blog_post',
            'topic' => $topic,
            'length' => 'long',
            'seo_optimized' => true
        ]);
        
        return $response['data']['content'];
    }
    
    // Auto-generate social media posts when publishing
    public function onPostPublish($post_id) {
        $post = get_post($post_id);
        
        $social_content = $this->client->post('/v1/ai/generate-content', [
            'type' => 'instagram_post',
            'source_content' => $post->post_content,
            'include_link' => get_permalink($post_id)
        ]);
        
        // Schedule social media post
        $this->client->post('/v1/social/schedule', [
            'platform' => 'instagram',
            'content' => $social_content['data'],
            'scheduled_at' => date('Y-m-d H:i:s', strtotime('+2 hours'))
        ]);
    }
}

// Hook into WordPress
add_action('publish_post', function($post_id) {
    $aquascape = new AquaScapeWordPress(get_option('aquascape_api_key'));
    $aquascape->onPostPublish($post_id);
});
?>
```

### Shopify Integration

```javascript
// Shopify app integration
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ['read_products', 'write_content'],
  hostName: process.env.HOST,
  apiVersion: LATEST_API_VERSION,
});

// Generate product content for aquascaping products
async function generateProductContent(session, productId) {
  const client = new shopify.clients.Rest({ session });
  
  // Get product details
  const product = await client.get({
    path: `products/${productId}`,
  });
  
  // Generate content using AquaScene API
  const aquascapeClient = new AquaScapeClient({
    apiKey: process.env.AQUASCAPE_API_KEY
  });
  
  const content = await aquascapeClient.ai.generateContent({
    type: 'product_description',
    product: {
      name: product.body.product.title,
      features: product.body.product.tags,
      category: 'aquascaping'
    },
    style: 'compelling',
    includeUseCases: true
  });
  
  // Update product description
  await client.put({
    path: `products/${productId}`,
    data: {
      product: {
        id: productId,
        body_html: content.html_description
      }
    }
  });
  
  return content;
}
```

## Error Handling Examples

### Robust Error Handling

```javascript
class AquaScapeAPIClient {
  constructor(config) {
    this.config = config;
    this.retryConfig = {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelay: 1000
    };
  }
  
  async makeRequest(endpoint, options = {}) {
    let attempt = 0;
    
    while (attempt < this.retryConfig.maxRetries) {
      try {
        const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
        
        if (response.ok) {
          return await response.json();
        }
        
        // Handle specific error cases
        if (response.status === 401) {
          throw new AuthenticationError('Invalid or expired token');
        } else if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          await this.delay(retryAfter * 1000 || this.calculateBackoff(attempt));
        } else if (response.status >= 500) {
          // Server error - retry
          await this.delay(this.calculateBackoff(attempt));
        } else {
          // Client error - don't retry
          const errorData = await response.json();
          throw new APIError(`API Error: ${errorData.message}`, response.status);
        }
        
      } catch (error) {
        if (attempt === this.retryConfig.maxRetries - 1) {
          throw error;
        }
        
        if (error instanceof AuthenticationError) {
          // Try to refresh token
          await this.refreshToken();
        }
        
        await this.delay(this.calculateBackoff(attempt));
      }
      
      attempt++;
    }
  }
  
  calculateBackoff(attempt) {
    return this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt);
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class AuthenticationError extends Error {}
class APIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
```

## Testing Integration Examples

### Unit Testing API Calls

```javascript
// Jest tests for API integration
const { AquaScapeClient } = require('@aquascape/api-client');

describe('AquaScape API Integration', () => {
  let client;
  
  beforeEach(() => {
    client = new AquaScapeClient({
      apiUrl: 'https://api.test.aquascape.com',
      apiKey: 'test-api-key'
    });
  });
  
  test('should generate Instagram content', async () => {
    const mockResponse = {
      id: 'content_123',
      type: 'instagram_post',
      content: {
        caption: 'Test caption',
        hashtags: ['#aquascaping']
      }
    };
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockResponse })
    });
    
    const result = await client.content.generate({
      type: 'instagram_post',
      topic: 'test topic'
    });
    
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.test.aquascape.com/v1/ai/generate-content',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-api-key'
        })
      })
    );
  });
});
```

### Integration Testing

```javascript
// Integration test with real API (for testing environment)
describe('Real API Integration', () => {
  const client = new AquaScapeClient({
    apiUrl: process.env.TEST_API_URL,
    apiKey: process.env.TEST_API_KEY
  });
  
  test('end-to-end content generation and publishing', async () => {
    // Generate content
    const content = await client.content.generate({
      type: 'instagram_post',
      topic: 'aquascaping test'
    });
    
    expect(content).toHaveProperty('id');
    expect(content).toHaveProperty('content.caption');
    
    // Schedule post (without actually publishing)
    const scheduled = await client.social.schedule({
      platform: 'instagram',
      contentId: content.id,
      scheduledAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      dryRun: true // Test mode
    });
    
    expect(scheduled).toHaveProperty('scheduledId');
    expect(scheduled.status).toBe('scheduled');
  }, 30000); // 30 second timeout for API calls
});
```

## SDK Reference

### Available SDKs

| Language | Package | Installation |
|----------|---------|-------------|
| JavaScript/Node.js | `@aquascape/api-client` | `npm install @aquascape/api-client` |
| Python | `aquascape-api` | `pip install aquascape-api` |
| PHP | `aquascape/api-client` | `composer require aquascape/api-client` |
| Go | `github.com/aquascape/go-client` | `go get github.com/aquascape/go-client` |
| C# | `AquaScape.ApiClient` | `dotnet add package AquaScape.ApiClient` |

### SDK Features

All SDKs provide:
- Authentication handling (JWT tokens)
- Automatic retries and error handling
- Rate limiting compliance
- Request/response type safety
- Webhook verification utilities
- Response caching options

## Support and Resources

### Documentation
- [Complete API Reference](./api-reference.md)
- [Authentication Guide](./auth-api.md)
- [Webhook Documentation](./webhooks.md)

### Developer Resources
- [Postman Collection](./postman/aquascape-api.json)
- [OpenAPI Specification](./openapi.yaml)
- [Code Samples Repository](https://github.com/aquascape/code-samples)

### Support Channels
- **Developer Forum**: [developers.aquascape.com](https://developers.aquascape.com)
- **Email Support**: developers@aquascape.com
- **GitHub Issues**: Report bugs and request features
- **Discord Community**: Real-time developer chat

### Rate Limits and Best Practices

- **Respect rate limits**: Check headers and implement exponential backoff
- **Use webhooks**: Prefer webhooks over polling for real-time updates
- **Cache responses**: Cache frequently requested data
- **Batch operations**: Use batch endpoints when available
- **Monitor usage**: Track API usage and optimize calls

For more examples and advanced use cases, check our [GitHub repository](https://github.com/aquascape/api-examples) with complete working examples.