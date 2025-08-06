# Social Media Posting Infrastructure Architecture

## Overview

The Social Media Infrastructure provides automated content distribution across Instagram Reels, YouTube Shorts, and Facebook, designed for local-first operation with cloud backup capabilities.

## Architecture Components

### 1. Social Media Service Layer

```javascript
// Core Social Media Manager
class SocialMediaManager {
  constructor() {
    this.platforms = {
      instagram: new InstagramService(),
      youtube: new YouTubeService(), 
      facebook: new FacebookService()
    };
    this.contentQueue = new PriorityQueue();
    this.scheduler = new ContentScheduler();
  }

  async schedulePost(content, platforms, publishAt) {
    const job = {
      id: uuidv4(),
      content,
      platforms,
      publishAt,
      status: 'scheduled',
      retryCount: 0
    };
    
    await this.contentQueue.enqueue(job);
    return job.id;
  }
}
```

### 2. Platform-Specific Services

#### Instagram Reels Service
```javascript
class InstagramService {
  constructor() {
    this.api = new InstagramBasicDisplayAPI();
    this.videoProcessor = new ReelVideoProcessor();
  }

  async uploadReel(videoPath, caption, hashtags) {
    const processedVideo = await this.videoProcessor.optimize({
      path: videoPath,
      format: 'mp4',
      resolution: '1080x1920', // 9:16 aspect ratio
      duration: 'max-90s'
    });

    return await this.api.uploadVideo({
      video: processedVideo,
      caption: this.formatCaption(caption, hashtags),
      location: this.config.defaultLocation
    });
  }

  formatCaption(caption, hashtags) {
    const aquascapeHashtags = [
      '#aquascaping', '#plantedtank', '#aquarium', 
      '#aquascape', '#fishkeeping', '#aquascaper',
      '#plantedaquarium', '#natureaquarium'
    ];
    
    return `${caption}\n\n${hashtags.join(' ')} ${aquascapeHashtags.join(' ')}`;
  }
}
```

#### YouTube Shorts Service
```javascript
class YouTubeService {
  constructor() {
    this.api = new YouTubeDataAPI();
    this.videoProcessor = new ShortsVideoProcessor();
  }

  async uploadShort(videoPath, title, description, tags) {
    const processedVideo = await this.videoProcessor.optimize({
      path: videoPath,
      format: 'mp4',
      resolution: '1080x1920',
      duration: 'max-60s'
    });

    return await this.api.uploadVideo({
      video: processedVideo,
      snippet: {
        title: title.substring(0, 100), // YouTube title limit
        description: this.formatDescription(description, tags),
        tags: [...tags, 'shorts', 'aquascaping', 'aquarium'],
        categoryId: '15' // Pets & Animals
      },
      status: {
        privacyStatus: 'public',
        madeForKids: false
      }
    });
  }
}
```

#### Facebook Service
```javascript
class FacebookService {
  constructor() {
    this.api = new FacebookGraphAPI();
    this.videoProcessor = new FacebookVideoProcessor();
  }

  async uploadVideo(videoPath, message, targetAudience = 'public') {
    const processedVideo = await this.videoProcessor.optimize({
      path: videoPath,
      format: 'mp4',
      resolution: '1280x720', // 16:9 for Facebook
      duration: 'max-240s'
    });

    return await this.api.uploadVideo({
      video: processedVideo,
      message,
      privacy: { value: targetAudience },
      published: true
    });
  }
}
```

### 3. Content Processing Pipeline

```javascript
class VideoContentProcessor {
  constructor() {
    this.ffmpeg = require('fluent-ffmpeg');
    this.stockMusicLibrary = new StockMusicLibrary();
    this.templates = new VideoTemplateEngine();
  }

  async processAquascapeVideo(sourceImages, audioTrack, template) {
    const videoConfig = {
      images: sourceImages,
      audio: audioTrack || await this.stockMusicLibrary.getRandomTrack('calm'),
      template: template || 'slideshow',
      transitions: ['fade', 'slide', 'zoom'],
      duration: 60, // seconds
      fps: 30
    };

    return await this.generateVideo(videoConfig);
  }

  async generateVideo(config) {
    return new Promise((resolve, reject) => {
      const outputPath = `/tmp/generated_${Date.now()}.mp4`;
      
      let command = this.ffmpeg();
      
      // Add images as input
      config.images.forEach((imagePath, index) => {
        command = command.input(imagePath);
      });
      
      // Add audio
      if (config.audio) {
        command = command.input(config.audio);
      }
      
      // Apply video processing
      command
        .complexFilter([
          // Image slideshow with transitions
          ...this.buildTransitionFilters(config.images, config.transitions),
          // Audio mixing
          '[0:a]volume=0.7[audio]'
        ])
        .outputOptions([
          '-map', '[final]',
          '-map', '[audio]',
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '23',
          '-c:a', 'aac',
          '-b:a', '128k',
          '-r', config.fps,
          '-t', config.duration
        ])
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }
}
```

## Database Schema

```sql
-- Social media posts tracking
CREATE TABLE social_media_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID REFERENCES content_items(id),
    platform VARCHAR(50) NOT NULL,
    platform_post_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'scheduled',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    metrics JSONB DEFAULT '{}',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform configurations
CREATE TABLE platform_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL UNIQUE,
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content scheduling queue
CREATE TABLE content_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL,
    content_data JSONB NOT NULL,
    platforms VARCHAR(255)[] NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    priority INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

```javascript
// Social Media API Routes
app.post('/api/social/schedule', async (req, res) => {
  const { content, platforms, publishAt, priority = 5 } = req.body;
  
  try {
    const job = await socialMediaManager.schedulePost(
      content, 
      platforms, 
      new Date(publishAt),
      priority
    );
    
    res.json({ success: true, jobId: job.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/social/analytics/:platform', async (req, res) => {
  const { platform } = req.params;
  const { days = 30 } = req.query;
  
  try {
    const analytics = await socialMediaManager.getAnalytics(platform, days);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/social/content/video', async (req, res) => {
  const { images, audioTrack, template, platforms } = req.body;
  
  try {
    const videoPath = await videoProcessor.processAquascapeVideo(
      images, 
      audioTrack, 
      template
    );
    
    // Schedule for all specified platforms
    const jobs = await Promise.all(
      platforms.map(platform => 
        socialMediaManager.schedulePost({
          type: 'video',
          path: videoPath,
          caption: req.body.caption,
          hashtags: req.body.hashtags
        }, [platform], new Date(req.body.publishAt))
      )
    );
    
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Local Storage Architecture

```javascript
class LocalContentStorage {
  constructor() {
    this.storagePath = process.env.CONTENT_STORAGE_PATH || './content_storage';
    this.db = new SQLite3(`${this.storagePath}/metadata.db`);
    this.fileManager = new LocalFileManager(this.storagePath);
  }

  async storeContent(contentId, files, metadata) {
    const contentDir = `${this.storagePath}/${contentId}`;
    await this.fileManager.createDirectory(contentDir);
    
    const storedFiles = {};
    for (const [key, file] of Object.entries(files)) {
      const storedPath = await this.fileManager.storeFile(file, contentDir);
      storedFiles[key] = storedPath;
    }
    
    await this.db.run(
      'INSERT INTO content_metadata (id, files, metadata, created_at) VALUES (?, ?, ?, ?)',
      [contentId, JSON.stringify(storedFiles), JSON.stringify(metadata), new Date()]
    );
    
    return { contentId, files: storedFiles };
  }
}
```

## Error Handling & Retry Logic

```javascript
class PostingRetryManager {
  constructor() {
    this.maxRetries = 3;
    this.backoffMultiplier = 2;
    this.baseDelay = 1000; // 1 second
  }

  async executeWithRetry(operation, context) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (this.isRetryableError(error) && attempt < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(this.backoffMultiplier, attempt - 1);
          await this.sleep(delay);
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  }

  isRetryableError(error) {
    const retryableCodes = [429, 500, 502, 503, 504];
    return retryableCodes.includes(error.status) || error.code === 'NETWORK_ERROR';
  }
}
```

## Configuration Management

```javascript
// config/social-media.js
module.exports = {
  instagram: {
    apiVersion: 'v18.0',
    scopes: ['instagram_basic', 'instagram_content_publish'],
    videoSpecs: {
      maxDuration: 90,
      aspectRatio: '9:16',
      resolution: '1080x1920',
      formats: ['mp4']
    }
  },
  youtube: {
    apiVersion: 'v3',
    scopes: ['youtube.upload'],
    videoSpecs: {
      maxDuration: 60,
      aspectRatio: '9:16',
      resolution: '1080x1920',
      formats: ['mp4']
    }
  },
  facebook: {
    apiVersion: 'v18.0',
    scopes: ['pages_manage_posts', 'pages_read_engagement'],
    videoSpecs: {
      maxDuration: 240,
      aspectRatio: '16:9',
      resolution: '1280x720',
      formats: ['mp4']
    }
  }
};
```

This architecture provides:
- **Multi-platform support** with platform-specific optimizations
- **Local-first operation** with cloud backup capabilities
- **Robust error handling** with retry mechanisms
- **Content processing pipeline** for video generation
- **Scheduling system** with priority queues
- **Analytics tracking** for performance monitoring