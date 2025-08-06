# API Integrations Design for Scheduled Social Media Posting

## Overview

The API Integrations system provides a unified interface for scheduling and publishing content across multiple social media platforms, with robust authentication, rate limiting, and error handling.

## Platform API Integration Architecture

### 1. Universal Social Media API Interface

```javascript
class UniversalSocialMediaAPI {
  constructor() {
    this.platforms = {
      instagram: new InstagramGraphAPI(),
      youtube: new YouTubeDataAPI(),
      facebook: new FacebookGraphAPI(),
      twitter: new TwitterAPI(),
      tiktok: new TikTokAPI(),
      linkedin: new LinkedInAPI()
    };
    
    this.authManager = new AuthenticationManager();
    this.rateLimiter = new RateLimitManager();
    this.retryManager = new RetryManager();
    this.webhookManager = new WebhookManager();
  }

  async schedulePost(platformConfig) {
    const {
      platform,
      content,
      media,
      scheduledTime,
      options = {}
    } = platformConfig;

    // Validate platform support
    if (!this.platforms[platform]) {
      throw new Error(`Platform ${platform} not supported`);
    }

    // Check authentication
    const auth = await this.authManager.getValidAuth(platform);
    if (!auth) {
      throw new Error(`Authentication required for ${platform}`);
    }

    // Apply rate limiting
    await this.rateLimiter.checkLimit(platform, 'post');

    // Schedule the post
    const job = {
      id: uuidv4(),
      platform,
      content,
      media,
      scheduledTime,
      options,
      status: 'scheduled',
      createdAt: new Date()
    };

    return await this.platforms[platform].schedulePost(job, auth);
  }

  async publishNow(platformConfig) {
    const job = { ...platformConfig, scheduledTime: new Date() };
    return await this.schedulePost(job);
  }
}
```

### 2. Instagram Graph API Integration

```javascript
class InstagramGraphAPI {
  constructor() {
    this.baseUrl = 'https://graph.facebook.com/v18.0';
    this.mediaTypes = ['image', 'video', 'carousel'];
    this.maxVideoSize = 100 * 1024 * 1024; // 100MB
    this.maxImageSize = 8 * 1024 * 1024;   // 8MB
  }

  async schedulePost(job, auth) {
    const { content, media, scheduledTime, options } = job;
    
    try {
      // Upload media first
      const mediaIds = await this.uploadMedia(media, auth);
      
      // Create media container
      const containerId = await this.createMediaContainer({
        caption: this.formatCaption(content.caption, content.hashtags),
        mediaIds,
        locationId: options.locationId,
        accessToken: auth.accessToken
      });

      // Schedule or publish
      if (scheduledTime > new Date()) {
        return await this.scheduleContainer(containerId, scheduledTime, auth);
      } else {
        return await this.publishContainer(containerId, auth);
      }
    } catch (error) {
      throw new InstagramAPIError(error.message, error.code);
    }
  }

  async uploadMedia(mediaFiles, auth) {
    const mediaIds = [];
    
    for (const mediaFile of mediaFiles) {
      const mediaId = await this.uploadSingleMedia(mediaFile, auth);
      mediaIds.push(mediaId);
    }
    
    return mediaIds;
  }

  async uploadSingleMedia(mediaFile, auth) {
    const { type, buffer, mimeType } = mediaFile;
    
    // Validate file size and type
    this.validateMediaFile(mediaFile);
    
    if (type === 'image') {
      return await this.uploadImage(buffer, auth);
    } else if (type === 'video') {
      return await this.uploadVideo(buffer, auth);
    }
    
    throw new Error(`Unsupported media type: ${type}`);
  }

  async uploadImage(imageBuffer, auth) {
    const form = new FormData();
    form.append('image', imageBuffer);
    form.append('access_token', auth.accessToken);

    const response = await fetch(`${this.baseUrl}/${auth.userId}/media`, {
      method: 'POST',
      body: form
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Instagram image upload failed: ${result.error.message}`);
    }

    return result.id;
  }

  async uploadVideo(videoBuffer, auth) {
    // Instagram requires two-phase video upload
    
    // Phase 1: Initialize upload session
    const initResponse = await fetch(`${this.baseUrl}/${auth.userId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'VIDEO',
        access_token: auth.accessToken
      })
    });

    const initResult = await initResponse.json();
    if (!initResponse.ok) {
      throw new Error(`Video upload initialization failed: ${initResult.error.message}`);
    }

    // Phase 2: Upload video data
    const uploadResponse = await fetch(initResult.upload_url, {
      method: 'POST',
      headers: {
        'Authorization': `OAuth ${auth.accessToken}`,
        'file_offset': '0',
        'Content-Type': 'application/octet-stream'
      },
      body: videoBuffer
    });

    if (!uploadResponse.ok) {
      throw new Error(`Video upload failed: ${uploadResponse.statusText}`);
    }

    return initResult.video_id;
  }

  async createMediaContainer({ caption, mediaIds, locationId, accessToken }) {
    const containerData = {
      caption,
      access_token: accessToken
    };

    if (mediaIds.length === 1) {
      // Single media post
      containerData.media_type = mediaIds[0].type;
      containerData.media_url = mediaIds[0].url;
    } else {
      // Carousel post
      containerData.media_type = 'CAROUSEL';
      containerData.children = mediaIds.map(id => ({ media_id: id }));
    }

    if (locationId) {
      containerData.location_id = locationId;
    }

    const response = await fetch(`${this.baseUrl}/${auth.userId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(containerData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Media container creation failed: ${result.error.message}`);
    }

    return result.id;
  }

  formatCaption(caption, hashtags = []) {
    const aquascapeHashtags = [
      '#aquascaping', '#plantedtank', '#aquarium',
      '#aquascape', '#fishkeeping', '#aquascaper',
      '#plantedaquarium', '#natureaquarium', '#aquascapedesign'
    ];

    const allHashtags = [...new Set([...hashtags, ...aquascapeHashtags])];
    const hashtagString = allHashtags.slice(0, 30).join(' '); // Instagram limit

    return `${caption}\n\n${hashtagString}`;
  }
}
```

### 3. YouTube Data API Integration

```javascript
class YouTubeDataAPI {
  constructor() {
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    this.uploadUrl = 'https://www.googleapis.com/upload/youtube/v3/videos';
    this.maxFileSize = 256 * 1024 * 1024 * 1024; // 256GB
    this.supportedFormats = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'];
  }

  async schedulePost(job, auth) {
    const { content, media, scheduledTime, options } = job;
    
    // YouTube doesn't support native scheduling via API for regular users
    // We'll upload as private and schedule publication separately
    
    try {
      const videoFile = media.find(m => m.type === 'video');
      if (!videoFile) {
        throw new Error('YouTube posts require a video file');
      }

      const uploadResult = await this.uploadVideo({
        videoData: videoFile.buffer,
        snippet: {
          title: content.title.substring(0, 100), // YouTube limit
          description: this.formatDescription(content.description, content.hashtags),
          tags: this.formatTags(content.tags),
          categoryId: options.categoryId || '15', // Pets & Animals
          defaultLanguage: options.language || 'en',
          defaultAudioLanguage: options.language || 'en'
        },
        status: {
          privacyStatus: scheduledTime > new Date() ? 'private' : 'public',
          publishAt: scheduledTime > new Date() ? scheduledTime.toISOString() : null,
          madeForKids: false,
          selfDeclaredMadeForKids: false
        }
      }, auth);

      // Schedule publication if needed
      if (scheduledTime > new Date()) {
        await this.schedulePublication(uploadResult.id, scheduledTime, auth);
      }

      return {
        platform: 'youtube',
        platformPostId: uploadResult.id,
        status: scheduledTime > new Date() ? 'scheduled' : 'published',
        scheduledFor: scheduledTime,
        url: `https://youtube.com/watch?v=${uploadResult.id}`
      };
    } catch (error) {
      throw new YouTubeAPIError(error.message, error.code);
    }
  }

  async uploadVideo(videoConfig, auth) {
    const { videoData, snippet, status } = videoConfig;
    
    const form = new FormData();
    form.append('snippet', JSON.stringify(snippet));
    form.append('status', JSON.stringify(status));
    form.append('videoFile', videoData, { filename: 'video.mp4' });

    const response = await fetch(`${this.uploadUrl}?part=snippet,status&uploadType=multipart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.accessToken}`,
        'Accept': 'application/json'
      },
      body: form
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`YouTube upload failed: ${result.error.message}`);
    }

    return result;
  }

  formatDescription(description, hashtags = []) {
    const aquascapeHashtags = [
      'aquascaping', 'plantedtank', 'aquarium', 'aquascape',
      'fishkeeping', 'aquascaper', 'plantedaquarium', 'natureaquarium'
    ];

    const allTags = [...new Set([...hashtags, ...aquascapeHashtags])];
    const tagString = allTags.slice(0, 15).map(tag => `#${tag}`).join(' ');

    return `${description}\n\n${tagString}\n\nMusic licensed from our stock library.`;
  }
}
```

### 4. Authentication Management System

```javascript
class AuthenticationManager {
  constructor() {
    this.storage = new SecureCredentialStorage();
    this.refreshHandlers = new Map();
    this.tokenCache = new Map();
  }

  async authenticateUser(platform, authConfig) {
    const authHandler = this.getAuthHandler(platform);
    
    try {
      const tokens = await authHandler.authenticate(authConfig);
      await this.storage.storeTokens(platform, tokens);
      
      // Set up automatic refresh if needed
      if (tokens.refreshToken) {
        this.setupTokenRefresh(platform, tokens);
      }
      
      return tokens;
    } catch (error) {
      throw new AuthenticationError(`${platform} authentication failed: ${error.message}`);
    }
  }

  async getValidAuth(platform) {
    // Check cache first
    if (this.tokenCache.has(platform)) {
      const cached = this.tokenCache.get(platform);
      if (cached.expiresAt > new Date()) {
        return cached;
      }
    }

    // Load from storage
    const stored = await this.storage.getTokens(platform);
    if (!stored) {
      return null;
    }

    // Check if token needs refresh
    if (stored.expiresAt <= new Date()) {
      if (stored.refreshToken) {
        return await this.refreshTokens(platform, stored);
      } else {
        // Token expired and no refresh token available
        await this.storage.removeTokens(platform);
        return null;
      }
    }

    // Cache valid token
    this.tokenCache.set(platform, stored);
    return stored;
  }

  async refreshTokens(platform, tokens) {
    const authHandler = this.getAuthHandler(platform);
    
    try {
      const refreshed = await authHandler.refreshToken(tokens.refreshToken);
      await this.storage.storeTokens(platform, refreshed);
      this.tokenCache.set(platform, refreshed);
      
      return refreshed;
    } catch (error) {
      // Refresh failed, remove invalid tokens
      await this.storage.removeTokens(platform);
      this.tokenCache.delete(platform);
      throw new Error(`Token refresh failed for ${platform}: ${error.message}`);
    }
  }

  getAuthHandler(platform) {
    const handlers = {
      instagram: new InstagramOAuth(),
      youtube: new GoogleOAuth(),
      facebook: new FacebookOAuth(),
      twitter: new TwitterOAuth(),
      tiktok: new TikTokOAuth(),
      linkedin: new LinkedInOAuth()
    };

    if (!handlers[platform]) {
      throw new Error(`Authentication handler not found for platform: ${platform}`);
    }

    return handlers[platform];
  }
}

class InstagramOAuth {
  constructor() {
    this.authUrl = 'https://api.instagram.com/oauth/authorize';
    this.tokenUrl = 'https://api.instagram.com/oauth/access_token';
    this.scopes = ['user_profile', 'user_media', 'instagram_basic'];
  }

  async authenticate({ clientId, clientSecret, redirectUri, code }) {
    const tokenResponse = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code
      })
    });

    const result = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      throw new Error(`Instagram OAuth failed: ${result.error_description}`);
    }

    // Get long-lived token
    const longLivedToken = await this.getLongLivedToken(result.access_token);
    
    return {
      accessToken: longLivedToken.access_token,
      tokenType: 'Bearer',
      expiresAt: new Date(Date.now() + longLivedToken.expires_in * 1000),
      userId: result.user_id,
      username: result.username
    };
  }

  async getLongLivedToken(shortToken) {
    const response = await fetch(`https://graph.instagram.com/access_token`, {
      method: 'GET',
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        access_token: shortToken
      }
    });

    return await response.json();
  }
}
```

### 5. Rate Limiting System

```javascript
class RateLimitManager {
  constructor() {
    this.limits = new Map();
    this.windows = new Map();
    this.platformLimits = {
      instagram: { posts: 25, window: '24h' }, // 25 posts per day
      youtube: { uploads: 6, window: '24h' },   // 6 uploads per day for new channels
      facebook: { posts: 200, window: '1h' },  // 200 posts per hour
      twitter: { tweets: 300, window: '15m' }, // 300 tweets per 15 minutes
      tiktok: { videos: 10, window: '24h' },   // Conservative limit
      linkedin: { posts: 100, window: '24h' }  // 100 posts per day
    };
  }

  async checkLimit(platform, operation = 'post') {
    const platformLimit = this.platformLimits[platform];
    if (!platformLimit) {
      return true; // No limit defined, allow
    }

    const key = `${platform}:${operation}`;
    const now = Date.now();
    const windowMs = this.parseWindow(platformLimit.window);
    const windowStart = now - windowMs;

    // Clean old entries
    if (this.windows.has(key)) {
      this.windows.set(key, 
        this.windows.get(key).filter(timestamp => timestamp > windowStart)
      );
    } else {
      this.windows.set(key, []);
    }

    const currentCount = this.windows.get(key).length;
    
    if (currentCount >= platformLimit[operation]) {
      const oldestRequest = Math.min(...this.windows.get(key));
      const waitTime = (oldestRequest + windowMs) - now;
      
      throw new RateLimitError(
        `Rate limit exceeded for ${platform}. Wait ${Math.ceil(waitTime / 1000)}s`,
        waitTime
      );
    }

    // Record this request
    this.windows.get(key).push(now);
    return true;
  }

  parseWindow(window) {
    const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const match = window.match(/^(\d+)([smhd])$/);
    
    if (!match) {
      throw new Error(`Invalid window format: ${window}`);
    }

    return parseInt(match[1]) * units[match[2]];
  }

  async waitForSlot(platform, operation = 'post') {
    try {
      await this.checkLimit(platform, operation);
      return true;
    } catch (error) {
      if (error instanceof RateLimitError) {
        await this.sleep(error.waitTime);
        return this.waitForSlot(platform, operation);
      }
      throw error;
    }
  }
}
```

### 6. Webhook Management for Platform Updates

```javascript
class WebhookManager {
  constructor() {
    this.webhooks = new Map();
    this.server = express();
    this.setupRoutes();
  }

  setupRoutes() {
    // Instagram webhooks
    this.server.post('/webhooks/instagram', async (req, res) => {
      const { object, entry } = req.body;
      
      if (object === 'instagram') {
        for (const change of entry) {
          await this.handleInstagramWebhook(change);
        }
      }
      
      res.sendStatus(200);
    });

    // YouTube webhooks (PubSubHubbub)
    this.server.post('/webhooks/youtube', async (req, res) => {
      const feed = req.body;
      await this.handleYouTubeWebhook(feed);
      res.sendStatus(200);
    });

    // Generic platform webhooks
    this.server.post('/webhooks/:platform', async (req, res) => {
      const { platform } = req.params;
      await this.handleGenericWebhook(platform, req.body);
      res.sendStatus(200);
    });
  }

  async handleInstagramWebhook(change) {
    if (change.field === 'media') {
      for (const mediaChange of change.value) {
        await this.updateMediaStatus(mediaChange);
      }
    }
  }

  async updateMediaStatus(mediaChange) {
    const { media_id, status } = mediaChange;
    
    // Update local database with publication status
    await this.database.run(`
      UPDATE publications 
      SET status = ?, published_at = CURRENT_TIMESTAMP 
      WHERE platform_id = ? AND platform = 'instagram'
    `, [status, media_id]);
    
    // Notify subscribers
    this.emit('mediaStatusChanged', {
      platform: 'instagram',
      mediaId: media_id,
      status
    });
  }

  async subscribeToWebhooks(platform, topics = []) {
    const handler = this.getWebhookHandler(platform);
    
    if (handler && handler.subscribe) {
      await handler.subscribe(topics);
    }
  }
}
```

### 7. Content Adaptation System

```javascript
class ContentAdaptationService {
  constructor() {
    this.imageProcessor = new ImageProcessor();
    this.videoProcessor = new VideoProcessor();
    this.textProcessor = new TextProcessor();
  }

  async adaptContent(content, targetPlatform) {
    const adaptedContent = { ...content };
    
    // Adapt text content
    adaptedContent.caption = await this.adaptText(
      content.caption, 
      targetPlatform
    );
    
    // Adapt media
    if (content.media && content.media.length > 0) {
      adaptedContent.media = await this.adaptMedia(
        content.media, 
        targetPlatform
      );
    }
    
    // Add platform-specific elements
    adaptedContent.platformSpecific = await this.addPlatformSpecifics(
      adaptedContent,
      targetPlatform
    );
    
    return adaptedContent;
  }

  async adaptText(text, platform) {
    const limits = {
      instagram: { caption: 2200, hashtags: 30 },
      youtube: { title: 100, description: 5000 },
      facebook: { post: 63206 },
      twitter: { tweet: 280 },
      tiktok: { caption: 150 },
      linkedin: { post: 3000 }
    };

    const limit = limits[platform];
    if (!limit) return text;

    if (platform === 'instagram') {
      return this.adaptForInstagram(text, limit);
    } else if (platform === 'youtube') {
      return this.adaptForYouTube(text, limit);
    } else if (platform === 'twitter') {
      return this.adaptForTwitter(text, limit);
    }
    
    return text.substring(0, limit.post || limit.caption || 1000);
  }

  async adaptMedia(mediaFiles, platform) {
    const adaptedMedia = [];
    
    for (const media of mediaFiles) {
      const adapted = await this.adaptSingleMedia(media, platform);
      adaptedMedia.push(adapted);
    }
    
    return adaptedMedia;
  }

  async adaptSingleMedia(media, platform) {
    const specs = this.getMediaSpecs(platform);
    
    if (media.type === 'image') {
      return await this.imageProcessor.processForPlatform(media, specs.image);
    } else if (media.type === 'video') {
      return await this.videoProcessor.processForPlatform(media, specs.video);
    }
    
    return media;
  }

  getMediaSpecs(platform) {
    const specs = {
      instagram: {
        image: { maxWidth: 1080, maxHeight: 1080, aspectRatio: '1:1' },
        video: { maxWidth: 1080, maxHeight: 1920, aspectRatio: '9:16', maxDuration: 90 }
      },
      youtube: {
        video: { maxWidth: 1920, maxHeight: 1080, aspectRatio: '16:9', maxDuration: 3600 }
      },
      facebook: {
        image: { maxWidth: 1200, maxHeight: 630, aspectRatio: '1.91:1' },
        video: { maxWidth: 1280, maxHeight: 720, aspectRatio: '16:9', maxDuration: 240 }
      }
    };
    
    return specs[platform] || specs.facebook; // Default fallback
  }
}
```

This API integrations design provides:

- **Unified interface** for all social media platforms
- **Robust authentication** with automatic token refresh
- **Rate limiting** to prevent API quota exhaustion
- **Content adaptation** for platform-specific requirements
- **Webhook management** for real-time status updates
- **Error handling** with retry mechanisms
- **Secure credential storage** with encryption
- **Platform-specific optimization** for maximum engagement