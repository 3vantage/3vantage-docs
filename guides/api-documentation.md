# API Documentation - Complete Reference

## Overview

The AquaScene ecosystem provides comprehensive APIs for managing aquascaping content, user interactions, e-commerce operations, and AI-powered services. This documentation covers all available endpoints, authentication methods, request/response formats, and integration examples.

## Base URLs and Environments

### Production Environment
- **Main API**: `https://api.aquascene.com/v1`
- **Waitlist API**: `https://waitlist.aquascene.com/api`
- **Content API**: `https://content.aquascene.com/api`
- **Analytics API**: `https://analytics.aquascene.com/api`

### Staging Environment
- **Main API**: `https://staging-api.aquascene.com/v1`
- **Waitlist API**: `https://staging-waitlist.aquascene.com/api`

### Development Environment
- **Main API**: `http://localhost:3000/api`
- **Waitlist API**: `http://localhost:3001/api`

## Authentication

### API Key Authentication
Most endpoints require API key authentication via header:

```http
Authorization: Bearer {API_KEY}
```

### JWT Token Authentication
User-specific endpoints use JWT tokens:

```http
Authorization: Bearer {JWT_TOKEN}
```

### Admin Authentication
Admin endpoints require additional admin key:

```http
X-Admin-Key: {ADMIN_KEY}
```

## Core APIs

### 1. Waitlist Management API

#### POST /api/waitlist
Subscribe a user to the waitlist.

**Request:**
```http
POST /api/waitlist
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "experience": "intermediate",
  "interests": ["3d_design", "ai_assistant"],
  "gdprConsent": true,
  "marketingConsent": true,
  "referralSource": "twitter",
  "honeypot": ""
}
```

**Request Schema:**
```typescript
interface WaitlistRequest {
  name: string;                    // 2-100 chars, letters/spaces only
  email: string;                   // Valid email, max 255 chars
  experience: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  interests: Interest[];           // Min 1 item
  gdprConsent: boolean;           // Must be true
  marketingConsent?: boolean;     // Optional
  referralSource?: string;        // Optional
  honeypot?: string;              // Must be empty (anti-spam)
}

type Interest = '3d_design' | 'calculations' | 'community' | 'mobile_app' | 'ai_assistant';
```

**Success Response (201 Created):**
```json
{
  "message": "Successfully joined the waitlist!",
  "position": 42,
  "totalSubscribers": 42,
  "referralCode": "AQUA-2024-JD42",
  "estimatedLaunchDate": "2024-06-01T00:00:00Z"
}
```

**Error Responses:**

*400 Bad Request - Validation Error:*
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address"
    },
    {
      "field": "interests",
      "message": "Please select at least one feature of interest"
    }
  ]
}
```

*409 Conflict - Email Already Exists:*
```json
{
  "message": "This email is already on the waitlist",
  "position": 15,
  "referralCode": "AQUA-2024-JD15"
}
```

*429 Too Many Requests:*
```json
{
  "message": "Too many requests. Please try again later.",
  "remainingAttempts": 0,
  "resetTime": "2024-01-15T11:00:00Z"
}
```

#### GET /api/waitlist
Retrieve waitlist statistics (Admin only).

**Request:**
```http
GET /api/waitlist?key={ADMIN_KEY}
```

**Success Response (200 OK):**
```json
{
  "totalEntries": 150,
  "recentEntries": [
    {
      "id": "abc123def456",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "experience": "advanced",
      "position": 150,
      "createdAt": "2024-01-15T10:30:00Z",
      "referralCode": "AQUA-2024-JS150"
    }
  ],
  "experienceBreakdown": {
    "beginner": 45,
    "intermediate": 67,
    "advanced": 32,
    "professional": 6
  },
  "marketingConsentCount": 120,
  "topInterests": {
    "3d_design": 89,
    "ai_assistant": 76,
    "calculations": 65,
    "community": 54,
    "mobile_app": 43
  },
  "referralStats": {
    "totalReferrals": 23,
    "topReferrers": [
      {
        "referralCode": "AQUA-2024-AB01",
        "referrals": 8,
        "name": "Alex Brown"
      }
    ]
  },
  "growthMetrics": {
    "dailySignups": 5.2,
    "weeklyGrowth": 12.5,
    "conversionRate": 0.25
  }
}
```

### 2. Theme Management API

#### GET /api/themes
Retrieve all available themes.

**Request:**
```http
GET /api/themes
Authorization: Bearer {API_KEY}
```

**Success Response (200 OK):**
```json
{
  "themes": [
    {
      "id": "underwater",
      "name": "Underwater Paradise",
      "description": "Deep ocean blues with coral accents",
      "version": "2.1.0",
      "category": "nature",
      "colors": {
        "primary": "#1E40AF",
        "secondary": "#0EA5E9",
        "accent": "#F59E0B",
        "background": "#0F172A",
        "foreground": "#F8FAFC"
      },
      "features": {
        "animations": true,
        "particleEffects": true,
        "soundEffects": false,
        "customizableElements": 15
      },
      "compatibility": {
        "mobile": true,
        "tablet": true,
        "desktop": true,
        "minScreenWidth": 320
      },
      "performance": {
        "loadTime": 1.2,
        "memoryUsage": "low",
        "cpuIntensive": false
      },
      "preview": {
        "thumbnail": "https://cdn.aquascene.com/themes/underwater/thumbnail.jpg",
        "demo": "https://demo.aquascene.com/themes/underwater",
        "screenshots": [
          "https://cdn.aquascene.com/themes/underwater/screenshot1.jpg",
          "https://cdn.aquascene.com/themes/underwater/screenshot2.jpg"
        ]
      },
      "popularity": {
        "usageCount": 1245,
        "rating": 4.8,
        "reviewCount": 89
      },
      "lastUpdated": "2024-01-10T00:00:00Z"
    }
  ],
  "totalThemes": 15,
  "categories": ["nature", "minimalist", "vibrant", "professional"],
  "featuredTheme": "underwater"
}
```

#### GET /api/themes/{themeId}
Get detailed information about a specific theme.

**Request:**
```http
GET /api/themes/underwater
Authorization: Bearer {API_KEY}
```

**Success Response (200 OK):**
```json
{
  "id": "underwater",
  "name": "Underwater Paradise",
  "description": "Immerse your audience in the depths of aquascaping with flowing animations and ocean-inspired colors",
  "longDescription": "The Underwater Paradise theme creates an immersive aquascaping experience...",
  "version": "2.1.0",
  "author": "3vantage Design Team",
  "category": "nature",
  "tags": ["underwater", "blue", "animated", "nature", "peaceful"],
  
  "colors": {
    "primary": {
      "50": "#eff6ff",
      "500": "#3b82f6",
      "900": "#1e3a8a"
    },
    "secondary": {
      "50": "#f0f9ff",
      "500": "#0ea5e9",
      "900": "#0c4a6e"
    }
  },
  
  "typography": {
    "fontFamily": {
      "sans": ["Inter", "system-ui", "sans-serif"],
      "serif": ["Playfair Display", "serif"],
      "mono": ["JetBrains Mono", "monospace"]
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem"
    }
  },
  
  "animations": {
    "duration": {
      "fast": "150ms",
      "normal": "300ms",
      "slow": "500ms"
    },
    "easing": {
      "default": "cubic-bezier(0.4, 0, 0.2, 1)",
      "smooth": "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
    },
    "effects": [
      {
        "name": "bubble-rise",
        "description": "Floating bubbles animation",
        "performance": "low",
        "customizable": true
      },
      {
        "name": "water-ripple",
        "description": "Ripple effect on hover",
        "performance": "medium",
        "customizable": true
      }
    ]
  },
  
  "components": {
    "header": {
      "variants": ["default", "transparent", "colored"],
      "customizableProps": ["logo", "navigation", "background"]
    },
    "hero": {
      "variants": ["video", "image", "animated"],
      "customizableProps": ["title", "subtitle", "cta", "background"]
    }
  },
  
  "customization": {
    "colorCustomization": true,
    "fontCustomization": true,
    "animationToggle": true,
    "layoutOptions": ["standard", "wide", "compact"],
    "customCSS": true
  },
  
  "usage": {
    "installations": 1245,
    "activeUsers": 892,
    "rating": 4.8,
    "reviews": [
      {
        "user": "AquascapeExpert",
        "rating": 5,
        "comment": "Beautiful underwater effects, perfect for my portfolio",
        "date": "2024-01-08T00:00:00Z"
      }
    ]
  },
  
  "technical": {
    "fileSize": "245KB",
    "dependencies": ["framer-motion", "three.js"],
    "browserSupport": ["Chrome 80+", "Firefox 75+", "Safari 13+", "Edge 80+"],
    "performanceScore": 95,
    "accessibilityScore": 98
  },
  
  "installation": {
    "instructions": "npm install @aquascene/theme-underwater",
    "configuration": {
      "required": ["themeId"],
      "optional": ["customColors", "animationSettings"]
    },
    "examples": [
      {
        "title": "Basic Usage",
        "code": "import { UnderwaterTheme } from '@aquascene/theme-underwater';"
      }
    ]
  }
}
```

#### POST /api/themes/{themeId}/activate
Activate a theme for the user's account.

**Request:**
```http
POST /api/themes/underwater/activate
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "customization": {
    "primaryColor": "#1E40AF",
    "animationsEnabled": true,
    "layout": "wide"
  }
}
```

**Success Response (200 OK):**
```json
{
  "message": "Theme activated successfully",
  "themeId": "underwater",
  "activatedAt": "2024-01-15T10:30:00Z",
  "customization": {
    "primaryColor": "#1E40AF",
    "animationsEnabled": true,
    "layout": "wide"
  },
  "previewUrl": "https://preview.aquascene.com/user/preview?theme=underwater"
}
```

### 3. User Management API

#### POST /api/auth/register
Register a new user account.

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "experience": "intermediate",
  "interests": ["3d_design", "calculations"],
  "gdprConsent": true,
  "marketingConsent": false
}
```

**Success Response (201 Created):**
```json
{
  "message": "Account created successfully",
  "user": {
    "id": "user_123456",
    "name": "John Doe",
    "email": "john@example.com",
    "experience": "intermediate",
    "createdAt": "2024-01-15T10:30:00Z",
    "emailVerified": false
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

#### POST /api/auth/login
Authenticate user and get access tokens.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_123456",
    "name": "John Doe",
    "email": "john@example.com",
    "experience": "intermediate",
    "lastLoginAt": "2024-01-15T10:30:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "preferences": {
    "theme": "underwater",
    "language": "en",
    "notifications": true
  }
}
```

#### GET /api/user/profile
Get current user profile information.

**Request:**
```http
GET /api/user/profile
Authorization: Bearer {JWT_TOKEN}
```

**Success Response (200 OK):**
```json
{
  "id": "user_123456",
  "name": "John Doe",
  "email": "john@example.com",
  "experience": "intermediate",
  "interests": ["3d_design", "calculations"],
  "createdAt": "2024-01-15T10:30:00Z",
  "lastLoginAt": "2024-01-15T10:30:00Z",
  "emailVerified": true,
  "subscription": {
    "plan": "premium",
    "status": "active",
    "expiresAt": "2024-12-15T10:30:00Z"
  },
  "preferences": {
    "theme": "underwater",
    "language": "en",
    "notifications": {
      "email": true,
      "push": false,
      "marketing": false
    },
    "privacy": {
      "profileVisibility": "public",
      "showEmail": false
    }
  },
  "stats": {
    "projectsCreated": 12,
    "themesUsed": 5,
    "referrals": 3,
    "joinedChallenges": 8
  }
}
```

### 4. Content Management API

#### GET /api/content/blog
Retrieve blog posts with filtering and pagination.

**Request:**
```http
GET /api/content/blog?page=1&limit=10&category=beginner&sort=recent
Authorization: Bearer {API_KEY}
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (max: 50, default: 10)
- `category` (string): Filter by difficulty level
- `tags` (string): Comma-separated tags
- `sort` (string): Sort order (`recent`, `popular`, `alphabetical`)
- `search` (string): Search query

**Success Response (200 OK):**
```json
{
  "posts": [
    {
      "id": "post_123",
      "title": "Getting Started with Iwagumi Layouts",
      "slug": "getting-started-iwagumi-layouts",
      "excerpt": "Learn the fundamentals of creating stunning Iwagumi aquascapes with proper stone placement and plant selection.",
      "content": "Full post content in markdown...",
      "author": {
        "id": "author_456",
        "name": "Sarah Johnson",
        "avatar": "https://cdn.aquascene.com/avatars/sarah.jpg",
        "bio": "Professional aquascaper with 10 years experience"
      },
      "category": "intermediate",
      "tags": ["iwagumi", "layout", "stones", "minimalist"],
      "difficulty": "intermediate",
      "readingTime": 8,
      "publishedAt": "2024-01-10T00:00:00Z",
      "updatedAt": "2024-01-12T00:00:00Z",
      "featured": true,
      "images": {
        "featured": "https://cdn.aquascene.com/posts/iwagumi-featured.jpg",
        "thumbnail": "https://cdn.aquascene.com/posts/iwagumi-thumb.jpg",
        "gallery": [
          "https://cdn.aquascene.com/posts/iwagumi-1.jpg",
          "https://cdn.aquascene.com/posts/iwagumi-2.jpg"
        ]
      },
      "seo": {
        "metaTitle": "Iwagumi Aquascaping Guide - Stone Layout Techniques",
        "metaDescription": "Master the art of Iwagumi aquascaping with our comprehensive guide to stone selection, placement, and plant choices.",
        "keywords": ["iwagumi", "aquascaping", "stone layout", "minimalist"]
      },
      "engagement": {
        "views": 1250,
        "likes": 89,
        "comments": 23,
        "shares": 15
      },
      "equipment": [
        {
          "name": "Dragon Stone",
          "category": "hardscape",
          "affiliate": true,
          "url": "https://partner.greenaqua.com/dragon-stone"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "categories": ["beginner", "intermediate", "advanced", "professional"],
    "tags": ["iwagumi", "dutch", "nature", "planted", "hardscape"],
    "authors": ["Sarah Johnson", "Mike Chen", "Elena Rodriguez"]
  }
}
```

#### POST /api/content/blog
Create a new blog post (Admin/Editor only).

**Request:**
```http
POST /api/content/blog
Authorization: Bearer {JWT_TOKEN}
X-Admin-Key: {ADMIN_KEY}
Content-Type: application/json

{
  "title": "Advanced CO2 Management Techniques",
  "slug": "advanced-co2-management-techniques",
  "content": "Full blog post content in markdown...",
  "excerpt": "Master advanced CO2 injection techniques...",
  "category": "advanced",
  "tags": ["co2", "advanced", "technique", "chemistry"],
  "difficulty": "advanced",
  "featured": false,
  "publishedAt": "2024-01-20T10:00:00Z",
  "seo": {
    "metaTitle": "Advanced CO2 Management for Planted Aquariums",
    "metaDescription": "Learn professional CO2 injection techniques...",
    "keywords": ["co2 injection", "planted aquarium", "advanced"]
  },
  "images": {
    "featured": "https://cdn.aquascene.com/posts/co2-featured.jpg"
  }
}
```

**Success Response (201 Created):**
```json
{
  "message": "Blog post created successfully",
  "post": {
    "id": "post_789",
    "title": "Advanced CO2 Management Techniques",
    "slug": "advanced-co2-management-techniques",
    "status": "published",
    "publishedAt": "2024-01-20T10:00:00Z",
    "url": "https://aquascene.com/blog/advanced-co2-management-techniques"
  }
}
```

### 5. Green Aqua Integration API

#### GET /api/products
Retrieve products from Green Aqua catalog.

**Request:**
```http
GET /api/products?category=plants&page=1&limit=20
Authorization: Bearer {API_KEY}
```

**Query Parameters:**
- `category` (string): Product category
- `brand` (string): Filter by brand
- `price_min` (number): Minimum price
- `price_max` (number): Maximum price
- `in_stock` (boolean): Only show in-stock items
- `page` (integer): Page number
- `limit` (integer): Items per page

**Success Response (200 OK):**
```json
{
  "products": [
    {
      "id": "ga_prod_123",
      "sku": "GA-PLANT-001",
      "name": "Anubias Barteri var. Nana",
      "description": "Hardy aquatic plant perfect for beginners",
      "category": "plants",
      "subcategory": "anubias",
      "brand": "Green Aqua",
      "price": {
        "amount": 12.50,
        "currency": "EUR",
        "formatted": "€12.50"
      },
      "images": [
        {
          "url": "https://cdn.greenaqua.com/anubias-nana-1.jpg",
          "alt": "Anubias Barteri var. Nana - front view",
          "primary": true
        },
        {
          "url": "https://cdn.greenaqua.com/anubias-nana-2.jpg",
          "alt": "Anubias Barteri var. Nana - leaf detail",
          "primary": false
        }
      ],
      "specifications": {
        "difficulty": "Easy",
        "lightRequirement": "Low to Medium",
        "co2Requirement": "Not required",
        "placement": "Foreground to Midground",
        "growthRate": "Slow",
        "maxHeight": "15cm"
      },
      "care": {
        "temperature": "20-28°C",
        "ph": "6.0-8.0",
        "hardness": "2-15 dGH",
        "lighting": "30-50 μmol/s/m²",
        "fertilization": "Root tabs recommended"
      },
      "stock": {
        "available": true,
        "quantity": 25,
        "restockDate": null
      },
      "shipping": {
        "weight": 0.05,
        "dimensions": {
          "length": 10,
          "width": 8,
          "height": 15
        },
        "shippingClass": "live-plants"
      },
      "partnership": {
        "commissionRate": 15,
        "trackingId": "aquascene_ref_001"
      },
      "seo": {
        "slug": "anubias-barteri-nana",
        "metaTitle": "Anubias Barteri var. Nana - Easy Aquarium Plant",
        "metaDescription": "Hardy Anubias perfect for beginners. Low light, no CO2 required."
      },
      "addedAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "pages": 23
  },
  "filters": {
    "categories": ["plants", "equipment", "hardscape", "fish"],
    "brands": ["Green Aqua", "ADA", "Tropica", "Chihiros"],
    "priceRanges": [
      {"min": 0, "max": 25, "label": "Under €25"},
      {"min": 25, "max": 50, "label": "€25 - €50"}
    ]
  }
}
```

#### POST /api/orders
Create a new order through Green Aqua partnership.

**Request:**
```http
POST /api/orders
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "items": [
    {
      "productId": "ga_prod_123",
      "quantity": 2,
      "price": 12.50
    },
    {
      "productId": "ga_prod_456",
      "quantity": 1,
      "price": 45.00
    }
  ],
  "shipping": {
    "address": {
      "firstName": "John",
      "lastName": "Doe",
      "street": "123 Main St",
      "city": "Sofia",
      "postalCode": "1000",
      "country": "Bulgaria"
    },
    "method": "standard"
  },
  "payment": {
    "method": "stripe",
    "token": "tok_1234567890"
  }
}
```

**Success Response (201 Created):**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": "order_789123",
    "status": "pending",
    "subtotal": 70.00,
    "shipping": 8.50,
    "tax": 15.70,
    "total": 94.20,
    "currency": "EUR",
    "items": [
      {
        "productId": "ga_prod_123",
        "name": "Anubias Barteri var. Nana",
        "quantity": 2,
        "price": 12.50,
        "total": 25.00
      }
    ],
    "tracking": {
      "number": null,
      "url": null,
      "estimatedDelivery": "2024-01-22T00:00:00Z"
    },
    "commission": {
      "rate": 15,
      "amount": 10.50,
      "status": "pending"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 6. AI Content Generation API

#### POST /api/ai/generate/blog
Generate blog post content using AI.

**Request:**
```http
POST /api/ai/generate/blog
Authorization: Bearer {API_KEY}
Content-Type: application/json

{
  "topic": "Iwagumi layout techniques",
  "difficulty": "intermediate",
  "targetLength": 1500,
  "keywords": ["iwagumi", "stone placement", "aquascaping"],
  "audience": "intermediate aquascapers",
  "tone": "educational and engaging",
  "includeImages": true,
  "includeSEO": true
}
```

**Success Response (200 OK):**
```json
{
  "content": {
    "title": "Master the Art of Iwagumi: Stone Placement Techniques for Stunning Aquascapes",
    "slug": "master-iwagumi-stone-placement-techniques",
    "content": "# Master the Art of Iwagumi: Stone Placement Techniques for Stunning Aquascapes\n\nThe Iwagumi style represents the pinnacle of minimalist aquascaping...",
    "excerpt": "Learn the fundamental principles of Iwagumi stone placement and create breathtaking minimalist aquascapes that embody Japanese aesthetic principles.",
    "wordCount": 1487,
    "readingTime": 7,
    "difficulty": "intermediate",
    "seo": {
      "metaTitle": "Iwagumi Aquascaping: Master Stone Placement Techniques",
      "metaDescription": "Learn professional Iwagumi stone placement techniques. Create stunning minimalist aquascapes with proper stone selection and layout principles.",
      "keywords": ["iwagumi", "stone placement", "aquascaping", "minimalist", "layout"],
      "headings": [
        {
          "level": 1,
          "text": "Master the Art of Iwagumi: Stone Placement Techniques for Stunning Aquascapes"
        },
        {
          "level": 2,
          "text": "Understanding Iwagumi Principles"
        }
      ]
    },
    "images": [
      {
        "placeholder": "[IMAGE: Iwagumi aquascape overview showing three-stone layout]",
        "description": "Wide shot of completed Iwagumi aquascape",
        "position": "after-introduction",
        "alt": "Perfect Iwagumi aquascape with three dragon stones and carpet plants"
      }
    ],
    "outline": [
      {
        "heading": "Understanding Iwagumi Principles",
        "subheadings": ["Golden Ratio in Stone Placement", "The Rule of Thirds"]
      },
      {
        "heading": "Selecting the Perfect Stones",
        "subheadings": ["Stone Types and Characteristics", "Size Relationships"]
      }
    ],
    "equipment": [
      {
        "name": "Dragon Stone",
        "description": "Primary hardscape material for Iwagumi layouts",
        "category": "hardscape",
        "partnerLink": "https://partner.greenaqua.com/dragon-stone"
      }
    ],
    "tags": ["iwagumi", "stone-placement", "minimalist", "layout", "hardscape"],
    "estimatedEngagement": {
      "readability": 82,
      "seoScore": 95,
      "uniqueness": 98
    }
  },
  "generation": {
    "model": "gpt-4",
    "tokensUsed": 2341,
    "processingTime": 8.7,
    "qualityScore": 94,
    "confidence": 0.96,
    "generatedAt": "2024-01-15T10:30:00Z"
  },
  "recommendations": [
    "Consider adding more specific stone size measurements",
    "Include common beginner mistakes section",
    "Add maintenance tips for Iwagumi layouts"
  ]
}
```

#### POST /api/ai/generate/social
Generate social media content.

**Request:**
```http
POST /api/ai/generate/social
Authorization: Bearer {API_KEY}
Content-Type: application/json

{
  "platform": "instagram",
  "contentType": "caption",
  "topic": "CO2 injection tips",
  "audience": "beginner",
  "imageDescription": "Aquarium with visible CO2 bubbles",
  "tone": "friendly and educational",
  "includeHashtags": true,
  "callToAction": "engagement"
}
```

**Success Response (200 OK):**
```json
{
  "content": {
    "text": "Ever wondered why your plants aren't pearling? 🌱 The secret might be in your CO2 injection! \n\nHere's a beginner-friendly tip: Start with 1 bubble per second for every 10 gallons and adjust based on your plants' response. Watch for those magical oxygen bubbles - that's when you know your plants are thriving! \n\nPro tip: Always monitor your fish behavior when adjusting CO2. Happy fish = sustainable aquascape! 🐠\n\nWhat's your biggest CO2 challenge? Drop a comment below! 👇",
    "platform": "instagram",
    "type": "caption",
    "characterCount": 456,
    "hashtags": [
      "#aquascaping",
      "#plantedtank",
      "#co2injection",
      "#aquariumplants",
      "#beginnertips",
      "#plantedaquarium",
      "#aquascaper",
      "#freshwateraquarium",
      "#aquariumhobby",
      "#planthealth"
    ],
    "callToAction": "What's your biggest CO2 challenge? Drop a comment below! 👇",
    "engagementElements": {
      "question": "What's your biggest CO2 challenge?",
      "emojis": ["🌱", "🐠", "👇"],
      "interactiveWords": ["challenge", "comment", "tips"]
    },
    "estimatedPerformance": {
      "engagementScore": 87,
      "readabilityScore": 94,
      "hashtagRelevance": 92,
      "platformOptimization": 96
    }
  },
  "alternatives": [
    {
      "text": "CO2 injection doesn't have to be scary! 💭 Here's my foolproof method for beginners...",
      "focus": "reassuring tone"
    },
    {
      "text": "Your plants are trying to tell you something! 🗣️ Poor growth? Yellow leaves? Time to check your CO2...",
      "focus": "problem-solution approach"
    }
  ],
  "generation": {
    "model": "gpt-4",
    "processingTime": 3.2,
    "confidence": 0.91,
    "generatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 7. Analytics API

#### GET /api/analytics/overview
Get comprehensive analytics overview.

**Request:**
```http
GET /api/analytics/overview?period=30d&metrics=all
Authorization: Bearer {API_KEY}
```

**Query Parameters:**
- `period` (string): Time period (`7d`, `30d`, `90d`, `1y`)
- `metrics` (string): Specific metrics or `all`
- `platform` (string): Filter by platform

**Success Response (200 OK):**
```json
{
  "period": "30d",
  "overview": {
    "totalUsers": 12450,
    "activeUsers": 8930,
    "newSignups": 1250,
    "conversionRate": 12.5,
    "revenueGenerated": 45600.00,
    "contentPublished": 42,
    "emailsSent": 15600,
    "socialPosts": 89
  },
  "growth": {
    "userGrowth": 15.3,
    "revenueGrowth": 23.1,
    "engagementGrowth": 8.7,
    "contentGrowth": 12.9
  },
  "platforms": {
    "website": {
      "visitors": 45600,
      "pageViews": 123400,
      "bounceRate": 34.2,
      "avgSessionDuration": 245,
      "conversionRate": 2.3
    },
    "instagram": {
      "followers": 8900,
      "posts": 28,
      "engagement": 4.7,
      "reach": 89000,
      "impressions": 234000
    },
    "email": {
      "subscribers": 12450,
      "campaigns": 8,
      "openRate": 23.4,
      "clickRate": 3.2,
      "unsubscribeRate": 0.8
    }
  },
  "content": {
    "blogPosts": {
      "published": 12,
      "totalViews": 34500,
      "avgReadTime": 6.7,
      "topPost": {
        "title": "Getting Started with Iwagumi",
        "views": 5600,
        "engagement": 12.3
      }
    },
    "products": {
      "featured": 145,
      "clicks": 2340,
      "conversions": 89,
      "commissionEarned": 1245.60
    }
  },
  "demographics": {
    "ageGroups": {
      "18-24": 15.2,
      "25-34": 34.7,
      "35-44": 28.1,
      "45-54": 15.8,
      "55+": 6.2
    },
    "experience": {
      "beginner": 42.3,
      "intermediate": 35.1,
      "advanced": 18.7,
      "professional": 3.9
    },
    "locations": {
      "Bulgaria": 45.2,
      "Hungary": 18.7,
      "Romania": 12.3,
      "Germany": 8.9,
      "Other": 14.9
    }
  },
  "trends": [
    {
      "metric": "user_signups",
      "trend": "increasing",
      "change": 15.3,
      "period": "vs_previous_30d"
    },
    {
      "metric": "content_engagement",
      "trend": "stable",
      "change": 2.1,
      "period": "vs_previous_30d"
    }
  ]
}
```

## Error Handling

### Standard Error Response Format
All API errors follow this consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Please enter a valid email address",
        "value": "invalid-email"
      }
    ],
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **422 Unprocessable Entity**: Validation failed
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error
- **503 Service Unavailable**: Service temporarily unavailable

### Common Error Codes

```typescript
enum ErrorCodes {
  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_EMAIL = 'INVALID_EMAIL',
  PASSWORD_TOO_WEAK = 'PASSWORD_TOO_WEAK',
  
  // Resource errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  CONTENT_NOT_FOUND = 'CONTENT_NOT_FOUND',
  THEME_NOT_FOUND = 'THEME_NOT_FOUND',
  
  // Business logic errors
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
  FEATURE_NOT_AVAILABLE = 'FEATURE_NOT_AVAILABLE',
  
  // External service errors
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  EMAIL_DELIVERY_FAILED = 'EMAIL_DELIVERY_FAILED',
  PARTNER_API_ERROR = 'PARTNER_API_ERROR',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED'
}
```

## Rate Limiting

### Rate Limit Headers
All responses include rate limiting information:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642680000
X-RateLimit-Window: 3600
```

### Rate Limits by Endpoint Type

| Endpoint Type | Limit | Window |
|---------------|-------|---------|
| Authentication | 5 requests | 15 minutes |
| Waitlist | 5 requests | 1 hour |
| Content Read | 1000 requests | 1 hour |
| Content Write | 100 requests | 1 hour |
| AI Generation | 50 requests | 1 hour |
| User Actions | 500 requests | 1 hour |

## Webhooks

### Webhook Events
The API can send webhooks for various events:

```typescript
interface WebhookEvent {
  id: string;
  type: 'user.created' | 'order.completed' | 'content.published' | 'payment.succeeded';
  data: any;
  timestamp: string;
  signature: string;
}
```

### Webhook Endpoints Configuration

**Request to configure webhooks:**
```http
POST /api/webhooks
Authorization: Bearer {API_KEY}
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/aquascene",
  "events": ["user.created", "order.completed"],
  "secret": "your_webhook_secret"
}
```

### Example Webhook Payload

```json
{
  "id": "evt_123456789",
  "type": "user.created",
  "data": {
    "user": {
      "id": "user_123456",
      "email": "john@example.com",
      "name": "John Doe",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "signature": "sha256=abc123def456..."
}
```

## SDK and Integration Examples

### JavaScript/TypeScript SDK

```bash
npm install @aquascene/api-client
```

```typescript
import { AquaSceneClient } from '@aquascene/api-client';

const client = new AquaSceneClient({
  apiKey: 'your_api_key',
  environment: 'production' // or 'staging', 'development'
});

// Subscribe to waitlist
const subscription = await client.waitlist.subscribe({
  name: 'John Doe',
  email: 'john@example.com',
  experience: 'intermediate',
  interests: ['3d_design'],
  gdprConsent: true
});

// Get themes
const themes = await client.themes.list();

// Generate content
const blogPost = await client.ai.generateBlog({
  topic: 'Iwagumi techniques',
  difficulty: 'intermediate',
  targetLength: 1500
});
```

### Python SDK

```bash
pip install aquascene-api
```

```python
from aquascene_api import AquaSceneClient

client = AquaSceneClient(
    api_key='your_api_key',
    environment='production'
)

# Subscribe to waitlist
subscription = client.waitlist.subscribe(
    name='John Doe',
    email='john@example.com',
    experience='intermediate',
    interests=['3d_design'],
    gdpr_consent=True
)

# Get analytics
analytics = client.analytics.overview(period='30d')
```

### cURL Examples

#### Subscribe to Waitlist
```bash
curl -X POST https://waitlist.aquascene.com/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "experience": "intermediate",
    "interests": ["3d_design"],
    "gdprConsent": true
  }'
```

#### Get Themes
```bash
curl -X GET https://api.aquascene.com/v1/themes \
  -H "Authorization: Bearer your_api_key"
```

#### Generate AI Content
```bash
curl -X POST https://api.aquascene.com/v1/ai/generate/blog \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Iwagumi layout techniques",
    "difficulty": "intermediate",
    "targetLength": 1500
  }'
```

## Support and Resources

### API Status Page
Monitor API availability: https://status.aquascene.com

### Documentation Updates
Stay updated with API changes: https://developers.aquascene.com/changelog

### Support Channels
- **Email**: api-support@aquascene.com
- **Discord**: https://discord.gg/aquascene-dev
- **GitHub Issues**: https://github.com/aquascene/api-issues

### Rate Limits and Quotas
For enterprise usage and higher limits, contact sales@aquascene.com

This comprehensive API documentation provides complete coverage of all available endpoints, authentication methods, and integration examples for the AquaScene ecosystem.