# RSS Feed Aggregation System Architecture

## Overview

The RSS Feed Aggregation System continuously monitors aquascaping competitions, innovations, product releases, and industry news from multiple sources to provide fresh content for the content generation pipeline.

## Core Components

### 1. RSS Feed Manager

```javascript
class RSSFeedManager {
  constructor() {
    this.feedParser = new FeedParser();
    this.scheduler = new CronScheduler();
    this.storage = new LocalContentStorage();
    this.contentProcessor = new ContentProcessor();
    this.duplicateDetector = new DuplicateDetector();
  }

  async addFeed(feedConfig) {
    const feed = {
      id: uuidv4(),
      url: feedConfig.url,
      name: feedConfig.name,
      category: feedConfig.category,
      language: feedConfig.language || 'en',
      pollInterval: feedConfig.pollInterval || '1h',
      isActive: true,
      lastPolled: null,
      totalItems: 0,
      errorCount: 0,
      createdAt: new Date()
    };

    await this.storage.storeFeed(feed);
    this.schedulePolling(feed);
    
    return feed;
  }

  async pollFeed(feedId) {
    const feed = await this.storage.getFeed(feedId);
    if (!feed || !feed.isActive) return;

    try {
      const items = await this.fetchFeedItems(feed.url);
      const newItems = await this.filterNewItems(feedId, items);
      const processedItems = await this.processItems(newItems, feed);
      
      await this.storage.storeFeedItems(feedId, processedItems);
      await this.updateFeedStats(feedId, processedItems.length, 0);
      
      return processedItems;
    } catch (error) {
      await this.handleFeedError(feedId, error);
      throw error;
    }
  }
}
```

### 2. Feed Sources Configuration

```javascript
const AQUASCAPING_FEEDS = [
  // Competitions & Contests
  {
    name: 'AGA Aquascaping Contest',
    url: 'https://aquatic-gardeners.org/feed.xml',
    category: 'competitions',
    tags: ['contest', 'aga', 'competition'],
    pollInterval: '6h',
    priority: 'high'
  },
  {
    name: 'IAPLC (International Aquatic Plants Layout Contest)',
    url: 'https://en.iaplc.com/feed/',
    category: 'competitions',
    tags: ['iaplc', 'contest', 'international'],
    pollInterval: '12h',
    priority: 'high'
  },
  
  // Industry News & Innovation
  {
    name: 'Aquarium Co-Op Blog',
    url: 'https://www.aquariumcoop.com/blogs/aquarium/tagged/aquascaping.atom',
    category: 'education',
    tags: ['education', 'products', 'tips'],
    pollInterval: '2h',
    priority: 'medium'
  },
  {
    name: 'Green Aqua Blog',
    url: 'https://greenaqua.hu/en/blog/rss',
    category: 'products',
    tags: ['products', 'greenaqua', 'partnership'],
    pollInterval: '1h',
    priority: 'high'
  },
  {
    name: 'ADA (Aqua Design Amano) News',
    url: 'https://www.adana.co.jp/en/contents/rss.xml',
    category: 'innovation',
    tags: ['ada', 'innovation', 'premium'],
    pollInterval: '6h',
    priority: 'high'
  },
  {
    name: 'Planted Tank Community',
    url: 'https://www.plantedtank.net/forums/external.php?type=RSS2',
    category: 'community',
    tags: ['community', 'discussion', 'tips'],
    pollInterval: '3h',
    priority: 'medium'
  },
  
  // Product & Equipment News
  {
    name: 'Aquascaping World',
    url: 'https://aquascapingworld.com/feed/',
    category: 'general',
    tags: ['general', 'showcase', 'tutorials'],
    pollInterval: '4h',
    priority: 'medium'
  },
  {
    name: 'UKaps (UK Aquatic Plant Society)',
    url: 'https://www.ukaps.org/forum/external.php?type=RSS2',
    category: 'community',
    tags: ['ukaps', 'community', 'uk'],
    pollInterval: '6h',
    priority: 'medium'
  },
  
  // YouTube Channels RSS
  {
    name: 'Green Aqua YouTube',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCY1U7gMe4w4WHgLRMD-0iig',
    category: 'video',
    tags: ['video', 'greenaqua', 'youtube'],
    pollInterval: '2h',
    priority: 'high'
  },
  {
    name: 'Aquarium Co-Op YouTube',
    url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC46Yxkh5VRKNdAE5RNbTz9g',
    category: 'video',
    tags: ['video', 'education', 'youtube'],
    pollInterval: '4h',
    priority: 'medium'
  }
];
```

### 3. Content Processing Pipeline

```javascript
class ContentProcessor {
  constructor() {
    this.textAnalyzer = new TextAnalyzer();
    this.imageExtractor = new ImageExtractor();
    this.contentEnricher = new ContentEnricher();
    this.translator = new TranslationService();
  }

  async processItems(items, feed) {
    const processedItems = [];
    
    for (const item of items) {
      try {
        const processed = await this.processItem(item, feed);
        if (processed) {
          processedItems.push(processed);
        }
      } catch (error) {
        logger.error(`Error processing item ${item.id}:`, error);
      }
    }
    
    return processedItems;
  }

  async processItem(item, feed) {
    // Extract and clean content
    const cleanContent = await this.textAnalyzer.extractMainContent(item.description);
    const images = await this.imageExtractor.extractImages(item.link);
    
    // Analyze content relevance
    const relevanceScore = await this.analyzeRelevance(cleanContent, feed.category);
    if (relevanceScore < 0.6) {
      return null; // Skip irrelevant content
    }

    // Extract key information
    const keyInfo = await this.extractKeyInformation(cleanContent);
    
    // Translate if needed
    let translations = {};
    if (feed.language !== 'en') {
      translations.en = await this.translator.translate(cleanContent, feed.language, 'en');
    }
    if (feed.language !== 'bg') {
      translations.bg = await this.translator.translate(cleanContent, feed.language, 'bg');
    }

    return {
      id: uuidv4(),
      feedId: feed.id,
      originalId: item.id || item.guid,
      title: item.title,
      description: cleanContent,
      link: item.link,
      publishedAt: new Date(item.pubDate || item.date),
      author: item.author,
      categories: item.categories || [],
      tags: [...(feed.tags || []), ...keyInfo.extractedTags],
      images: images,
      keyInformation: keyInfo,
      translations: translations,
      relevanceScore: relevanceScore,
      contentType: this.determineContentType(item, feed),
      processingStatus: 'processed',
      createdAt: new Date()
    };
  }

  async extractKeyInformation(content) {
    // Use AI to extract key information
    const prompt = `
      Analyze this aquascaping content and extract key information:
      
      Content: ${content}
      
      Extract:
      1. Main topic/theme
      2. Relevant species mentioned
      3. Equipment/products mentioned
      4. Techniques described
      5. Difficulty level (beginner/intermediate/advanced)
      6. Relevant tags (max 10)
      
      Return as JSON.
    `;

    try {
      const result = await this.aiService.analyze(prompt);
      return JSON.parse(result);
    } catch (error) {
      logger.error('AI analysis failed, using fallback extraction');
      return this.fallbackExtraction(content);
    }
  }
}
```

### 4. Database Schema

```sql
-- RSS Feeds configuration
CREATE TABLE rss_feeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    tags TEXT[],
    poll_interval INTERVAL DEFAULT '1 hour',
    priority VARCHAR(20) DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    last_polled TIMESTAMP WITH TIME ZONE,
    total_items INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feed items storage
CREATE TABLE feed_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feed_id UUID REFERENCES rss_feeds(id) ON DELETE CASCADE,
    original_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    link TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    author TEXT,
    categories TEXT[],
    tags TEXT[],
    images JSONB DEFAULT '[]',
    key_information JSONB,
    translations JSONB DEFAULT '{}',
    relevance_score DECIMAL(3,2),
    content_type VARCHAR(50),
    processing_status VARCHAR(50) DEFAULT 'pending',
    is_used_for_content BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(feed_id, original_id)
);

-- Content generation queue from RSS items
CREATE TABLE content_generation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feed_item_id UUID REFERENCES feed_items(id),
    content_type VARCHAR(50) NOT NULL,
    priority INTEGER DEFAULT 5,
    template_preference TEXT,
    target_platforms TEXT[],
    scheduled_for TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'queued',
    generated_content_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Content Curation & Filtering

```javascript
class ContentCurator {
  constructor() {
    this.qualityAnalyzer = new QualityAnalyzer();
    this.trendAnalyzer = new TrendAnalyzer();
    this.audienceAnalyzer = new AudienceAnalyzer();
  }

  async curateContent(items, audienceProfile = 'general') {
    const curatedItems = [];
    
    for (const item of items) {
      const curationScore = await this.calculateCurationScore(item, audienceProfile);
      
      if (curationScore.overall >= 0.7) {
        curatedItems.push({
          ...item,
          curationScore,
          curationReasons: curationScore.reasons,
          suggestedUse: this.suggestContentUse(item, curationScore)
        });
      }
    }
    
    // Sort by curation score and recency
    return curatedItems.sort((a, b) => {
      const scoreA = a.curationScore.overall;
      const scoreB = b.curationScore.overall;
      const dateA = new Date(a.publishedAt);
      const dateB = new Date(b.publishedAt);
      
      if (Math.abs(scoreA - scoreB) < 0.1) {
        return dateB - dateA; // More recent first if scores are similar
      }
      return scoreB - scoreA; // Higher score first
    });
  }

  async calculateCurationScore(item, audienceProfile) {
    const qualityScore = await this.qualityAnalyzer.analyze(item.description);
    const trendScore = await this.trendAnalyzer.analyze(item.tags, item.keyInformation);
    const audienceScore = await this.audienceAnalyzer.analyze(item, audienceProfile);
    const freshnessScore = this.calculateFreshnessScore(item.publishedAt);
    
    const weights = {
      quality: 0.3,
      trend: 0.25,
      audience: 0.25,
      freshness: 0.2
    };

    const overall = (
      qualityScore * weights.quality +
      trendScore * weights.trend +
      audienceScore * weights.audience +
      freshnessScore * weights.freshness
    );

    return {
      overall,
      quality: qualityScore,
      trend: trendScore,
      audience: audienceScore,
      freshness: freshnessScore,
      reasons: this.generateCurationReasons({
        quality: qualityScore,
        trend: trendScore,
        audience: audienceScore,
        freshness: freshnessScore
      })
    };
  }
}
```

### 6. RSS Polling Scheduler

```javascript
class RSSPollingScheduler {
  constructor() {
    this.cron = require('node-cron');
    this.activeJobs = new Map();
    this.feedManager = new RSSFeedManager();
  }

  async startPolling() {
    const feeds = await this.feedManager.getActiveFeeds();
    
    for (const feed of feeds) {
      this.schedulePolling(feed);
    }
    
    // Schedule periodic feed discovery
    this.scheduleFeedDiscovery();
    
    logger.info(`Started polling ${feeds.length} RSS feeds`);
  }

  schedulePolling(feed) {
    const cronExpression = this.intervalToCron(feed.pollInterval);
    
    const job = this.cron.schedule(cronExpression, async () => {
      try {
        await this.feedManager.pollFeed(feed.id);
      } catch (error) {
        logger.error(`Error polling feed ${feed.name}:`, error);
      }
    }, { scheduled: false });

    this.activeJobs.set(feed.id, job);
    job.start();
    
    logger.info(`Scheduled polling for feed ${feed.name} with interval ${feed.pollInterval}`);
  }

  intervalToCron(interval) {
    const intervalMap = {
      '30m': '*/30 * * * *',
      '1h': '0 * * * *',
      '2h': '0 */2 * * *',
      '3h': '0 */3 * * *',
      '4h': '0 */4 * * *',
      '6h': '0 */6 * * *',
      '12h': '0 */12 * * *',
      '24h': '0 0 * * *'
    };
    
    return intervalMap[interval] || '0 * * * *'; // Default to hourly
  }
}
```

### 7. Content Discovery & Auto-Feed Detection

```javascript
class FeedDiscoveryService {
  constructor() {
    this.crawler = new WebCrawler();
    this.feedDetector = new FeedDetector();
    this.relevanceAnalyzer = new RelevanceAnalyzer();
  }

  async discoverAquascapingFeeds() {
    const seedUrls = [
      'https://aquatic-gardeners.org',
      'https://www.plantedtank.net',
      'https://www.ukaps.org',
      'https://aquascapingworld.com',
      'https://greenaqua.hu',
      'https://www.adana.co.jp',
      'https://www.aquariumcoop.com'
    ];

    const discoveredFeeds = [];

    for (const url of seedUrls) {
      try {
        const feeds = await this.discoverFeedsFromSite(url);
        discoveredFeeds.push(...feeds);
      } catch (error) {
        logger.error(`Error discovering feeds from ${url}:`, error);
      }
    }

    // Filter and rank discovered feeds
    const rankedFeeds = await this.rankDiscoveredFeeds(discoveredFeeds);
    
    return rankedFeeds.filter(feed => feed.relevanceScore >= 0.8);
  }

  async discoverFeedsFromSite(siteUrl) {
    const page = await this.crawler.fetchPage(siteUrl);
    const feeds = await this.feedDetector.detectFeeds(page);
    
    const validatedFeeds = [];
    for (const feedUrl of feeds) {
      try {
        const isValid = await this.validateFeed(feedUrl);
        const relevanceScore = await this.relevanceAnalyzer.analyzeFeedRelevance(feedUrl);
        
        if (isValid && relevanceScore >= 0.6) {
          validatedFeeds.push({
            url: feedUrl,
            discoveredFrom: siteUrl,
            relevanceScore,
            lastValidated: new Date()
          });
        }
      } catch (error) {
        logger.debug(`Feed validation failed for ${feedUrl}:`, error);
      }
    }

    return validatedFeeds;
  }
}
```

### 8. API Endpoints

```javascript
// RSS Management API
app.get('/api/rss/feeds', async (req, res) => {
  const { category, active = true } = req.query;
  
  try {
    const feeds = await rssManager.getFeeds({ category, active });
    res.json(feeds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rss/feeds', async (req, res) => {
  try {
    const feed = await rssManager.addFeed(req.body);
    res.status(201).json(feed);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/rss/items', async (req, res) => {
  const { 
    category, 
    limit = 50, 
    offset = 0, 
    minRelevance = 0.6,
    since
  } = req.query;
  
  try {
    const items = await rssManager.getFeedItems({
      category,
      limit: parseInt(limit),
      offset: parseInt(offset),
      minRelevance: parseFloat(minRelevance),
      since: since ? new Date(since) : null
    });
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rss/curated', async (req, res) => {
  const { audienceProfile = 'general', limit = 20 } = req.query;
  
  try {
    const recentItems = await rssManager.getRecentItems(100);
    const curated = await contentCurator.curateContent(recentItems, audienceProfile);
    
    res.json(curated.slice(0, parseInt(limit)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rss/discover', async (req, res) => {
  try {
    const discoveredFeeds = await feedDiscovery.discoverAquascapingFeeds();
    res.json({ discovered: discoveredFeeds.length, feeds: discoveredFeeds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

This RSS aggregation system provides:

- **Comprehensive feed monitoring** from competitions, innovations, and community sources
- **Intelligent content processing** with AI-powered analysis and extraction
- **Multi-language support** with automatic translation
- **Quality curation** with relevance scoring and filtering
- **Automated feed discovery** to find new sources
- **Local-first storage** with efficient duplicate detection
- **Flexible scheduling** with priority-based polling
- **Content enrichment** with key information extraction