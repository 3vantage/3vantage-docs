# Comprehensive Data Flow Diagrams - Aquascape Content Ecosystem

## Overview

This document provides detailed data flow diagrams for the entire aquascape content ecosystem, showing how data moves between components and the relationships between different services.

## 1. High-Level System Architecture

```mermaid
graph TB
    %% External Data Sources
    RSS[RSS Feeds<br/>Competitions & News] --> RSSP[RSS Polling Service]
    USER[User Input<br/>Manual Content] --> CT[Content Tool UI]
    
    %% Core Processing Layer
    RSSP --> QUEUE[Master Content Queue]
    CT --> QUEUE
    QUEUE --> CG[Content Generation<br/>Pipeline]
    
    %% Content Processing
    CG --> AI[AI Content Service<br/>GPT-4 + Gemini]
    CG --> ML[Music Library<br/>Stock Music API]
    CG --> IMG[Image Processing<br/>& Enhancement]
    
    %% Storage Layer
    AI --> STORE[(Local Storage<br/>SQLite + Files)]
    ML --> STORE
    IMG --> STORE
    
    %% Distribution Layer
    STORE --> SCHED[Content Scheduler<br/>Time Optimization]
    SCHED --> SOCIAL[Social Media APIs<br/>IG, YT, FB]
    SCHED --> EMAIL[Email Service<br/>Newsletter System]
    
    %% Analytics & Feedback
    SOCIAL --> METRICS[Analytics<br/>Engagement Tracking]
    EMAIL --> METRICS
    METRICS --> STORE
    
    %% Backup & Sync
    STORE --> BACKUP[Backup Manager<br/>Local + Cloud]
    STORE --> SYNC[Cloud Sync<br/>Dropbox/GDrive]
    
    classDef external fill:#e1f5fe
    classDef processing fill:#f3e5f5
    classDef storage fill:#e8f5e8
    classDef distribution fill:#fff3e0
    classDef analytics fill:#fce4ec
    
    class RSS,USER external
    class RSSP,CG,AI,ML,IMG,SCHED processing
    class STORE,BACKUP,SYNC storage
    class SOCIAL,EMAIL distribution
    class METRICS analytics
```

## 2. RSS Feed Processing Data Flow

```mermaid
sequenceDiagram
    participant CRON as Cron Scheduler
    participant RSS as RSS Poller
    participant FEED as RSS Feed Source
    participant PROC as Content Processor
    participant AI as AI Analyzer
    participant DB as Local Database
    participant QUEUE as Generation Queue
    
    CRON->>RSS: Trigger feed poll (scheduled)
    RSS->>FEED: HTTP GET /feed.xml
    FEED-->>RSS: RSS XML Response
    RSS->>PROC: Process feed items
    
    loop For each new item
        PROC->>AI: Analyze relevance & mood
        AI-->>PROC: Analysis results (score, tags, mood)
        
        alt Relevance score > 0.6
            PROC->>DB: Store processed item
            PROC->>QUEUE: Queue for content generation
        else
            PROC->>DB: Store with low priority
        end
    end
    
    RSS->>DB: Update feed statistics
    RSS->>CRON: Schedule next poll
```

## 3. Content Generation Pipeline Data Flow

```mermaid
flowchart TD
    START([Content Generation Trigger]) --> SOURCE{Source Type}
    
    %% RSS Branch
    SOURCE -->|RSS Item| RSS_DATA[Extract RSS Content<br/>- Title, Description<br/>- Images, Links<br/>- Publication Date]
    
    %% Manual Branch
    SOURCE -->|Manual| MANUAL_DATA[User Input<br/>- Topic/Theme<br/>- Target Platforms<br/>- Content Type]
    
    %% Scheduled Branch
    SOURCE -->|Scheduled| SCHED_DATA[Template Data<br/>- Recurring Pattern<br/>- Content Template<br/>- Historical Data]
    
    RSS_DATA --> ANALYZE[AI Content Analysis<br/>- Mood Detection<br/>- Key Topics<br/>- Visual Elements]
    MANUAL_DATA --> ANALYZE
    SCHED_DATA --> ANALYZE
    
    ANALYZE --> RESEARCH[Research Phase<br/>- Related Content<br/>- Trending Topics<br/>- Context Enrichment]
    
    RESEARCH --> GENERATE[Content Generation<br/>- AI Text Generation<br/>- Template Application<br/>- Multi-platform Adaptation]
    
    GENERATE --> MEDIA{Needs Media?}
    MEDIA -->|Yes| MEDIA_SELECT[Media Selection<br/>- Stock Images<br/>- Generated Images<br/>- Video Assets]
    MEDIA -->|No| ENHANCE
    
    MEDIA_SELECT --> MUSIC{Video Content?}
    MUSIC -->|Yes| MUSIC_SELECT[Music Selection<br/>- Mood Matching<br/>- Duration Fitting<br/>- License Check]
    MUSIC -->|No| ENHANCE
    
    MUSIC_SELECT --> ENHANCE[Content Enhancement<br/>- Platform Optimization<br/>- Quality Check<br/>- SEO Enhancement]
    
    ENHANCE --> REVIEW[Quality Review<br/>- Automated Checks<br/>- Content Validation<br/>- Brand Consistency]
    
    REVIEW --> APPROVE{Needs Approval?}
    APPROVE -->|Yes| MANUAL_REVIEW[Manual Review<br/>- Human Oversight<br/>- Final Edits]
    APPROVE -->|No| SCHEDULE
    
    MANUAL_REVIEW --> APPROVE_STATUS{Approved?}
    APPROVE_STATUS -->|Yes| SCHEDULE[Schedule Publishing<br/>- Optimal Time Selection<br/>- Platform Distribution<br/>- Conflict Resolution]
    APPROVE_STATUS -->|No| REVISE[Revise Content]
    
    REVISE --> GENERATE
    SCHEDULE --> PUBLISH[Publish Content<br/>- API Calls<br/>- Status Tracking<br/>- Error Handling]
    
    PUBLISH --> MONITOR[Monitor Performance<br/>- Engagement Metrics<br/>- Error Detection<br/>- Success Tracking]
    
    MONITOR --> END([Process Complete])
    
    classDef process fill:#e3f2fd
    classDef decision fill:#fff3e0
    classDef data fill:#e8f5e8
    classDef manual fill:#fce4ec
    
    class ANALYZE,RESEARCH,GENERATE,ENHANCE,REVIEW,SCHEDULE,PUBLISH,MONITOR process
    class SOURCE,MEDIA,MUSIC,APPROVE,APPROVE_STATUS decision
    class RSS_DATA,MANUAL_DATA,SCHED_DATA,MEDIA_SELECT,MUSIC_SELECT data
    class MANUAL_REVIEW,REVISE manual
```

## 4. Social Media Publishing Data Flow

```mermaid
graph LR
    CONTENT[Generated Content] --> ADAPT[Platform Adaptation]
    
    ADAPT --> INSTAGRAM[Instagram Adapter<br/>- Image: 1080x1080<br/>- Video: 1080x1920<br/>- Caption: 2200 chars<br/>- Hashtags: 30 max]
    
    ADAPT --> YOUTUBE[YouTube Adapter<br/>- Video: 1920x1080<br/>- Title: 100 chars<br/>- Description: 5000 chars<br/>- Tags optimization]
    
    ADAPT --> FACEBOOK[Facebook Adapter<br/>- Image: 1200x630<br/>- Video: 1280x720<br/>- Post: unlimited<br/>- Link preview]
    
    INSTAGRAM --> IG_API[Instagram Graph API<br/>- Media Upload<br/>- Container Creation<br/>- Publishing]
    
    YOUTUBE --> YT_API[YouTube Data API<br/>- Video Upload<br/>- Metadata Setting<br/>- Publishing]
    
    FACEBOOK --> FB_API[Facebook Graph API<br/>- Media Upload<br/>- Post Creation<br/>- Publishing]
    
    IG_API --> WEBHOOK_IG[Instagram Webhooks<br/>- Status Updates<br/>- Engagement Data]
    
    YT_API --> WEBHOOK_YT[YouTube Analytics<br/>- View Metrics<br/>- Engagement Data]
    
    FB_API --> WEBHOOK_FB[Facebook Webhooks<br/>- Reaction Data<br/>- Share Metrics]
    
    WEBHOOK_IG --> ANALYTICS[(Analytics Database)]
    WEBHOOK_YT --> ANALYTICS
    WEBHOOK_FB --> ANALYTICS
    
    ANALYTICS --> OPTIMIZER[Performance Optimizer<br/>- Timing Analysis<br/>- Content Analysis<br/>- Strategy Refinement]
    
    classDef content fill:#e8f5e8
    classDef adapter fill:#e3f2fd
    classDef api fill:#fff3e0
    classDef webhook fill:#f3e5f5
    classDef analytics fill:#fce4ec
    
    class CONTENT content
    class INSTAGRAM,YOUTUBE,FACEBOOK adapter
    class IG_API,YT_API,FB_API api
    class WEBHOOK_IG,WEBHOOK_YT,WEBHOOK_FB webhook
    class ANALYTICS,OPTIMIZER analytics
```

## 5. Music Integration Data Flow

```mermaid
sequenceDiagram
    participant VG as Video Generator
    participant MS as Music Selector
    participant LIB as Local Library
    participant YT as YouTube Audio
    participant FS as Freesound API
    participant AI as AI Analyzer
    participant PROC as Audio Processor
    participant LIC as License Manager
    
    VG->>MS: Request music for video
    Note over VG,MS: Duration: 60s, Mood: peaceful, Style: aquascape
    
    MS->>LIB: Search local library
    LIB-->>MS: Local matches (3 tracks)
    
    MS->>YT: Search YouTube Audio Library
    YT-->>MS: YT matches (5 tracks)
    
    MS->>FS: Search Freesound
    FS-->>MS: FS matches (2 tracks)
    
    MS->>AI: Analyze all tracks for compatibility
    AI-->>MS: Scored recommendations
    
    MS->>LIC: Validate license for top pick
    LIC-->>MS: License approved + attribution
    
    MS->>PROC: Process audio for video
    Note over PROC: Trim, fade, normalize volume
    PROC-->>MS: Processed audio file
    
    MS-->>VG: Return optimized music track
    
    VG->>LIC: Record usage for compliance
    LIC-->>VG: Usage logged
```

## 6. Local Storage Architecture Data Flow

```mermaid
graph TB
    APP[Application Layer] --> MANAGER[Storage Manager]
    
    MANAGER --> MAIN_DB[(main.sqlite<br/>Content & Metadata)]
    MANAGER --> CONTENT_DB[(content.sqlite<br/>Generated Content)]
    MANAGER --> CACHE_DB[(cache.sqlite<br/>Temporary Data)]
    MANAGER --> ANALYTICS_DB[(analytics.sqlite<br/>Performance Data)]
    
    MANAGER --> FILE_MANAGER[File Manager]
    
    FILE_MANAGER --> IMAGES[/media/images/<br/>- raw/<br/>- processed/<br/>- thumbnails/]
    FILE_MANAGER --> VIDEOS[/media/videos/<br/>- source/<br/>- processed/<br/>- preview/]
    FILE_MANAGER --> AUDIO[/media/audio/<br/>- music/<br/>- effects/<br/>- generated/]
    
    MANAGER --> BACKUP_MGR[Backup Manager]
    BACKUP_MGR --> DAILY[/backups/daily/]
    BACKUP_MGR --> WEEKLY[/backups/weekly/]
    BACKUP_MGR --> EXPORT[/backups/exports/]
    
    MANAGER --> SYNC_MGR[Cloud Sync Manager]
    SYNC_MGR --> DROPBOX[Dropbox Sync]
    SYNC_MGR --> GDRIVE[Google Drive Sync]
    SYNC_MGR --> ICLOUD[iCloud Sync]
    
    %% Configuration Management
    MANAGER --> CONFIG_MGR[Config Manager]
    CONFIG_MGR --> APP_CONFIG[/config/app.json]
    CONFIG_MGR --> INTEGRATION_CONFIG[/config/integrations.json]
    CONFIG_MGR --> FEED_CONFIG[/config/feeds.json]
    CONFIG_MGR --> TEMPLATE_CONFIG[/config/templates.json]
    
    %% Data Flow Arrows
    MAIN_DB -.-> BACKUP_MGR
    CONTENT_DB -.-> BACKUP_MGR
    IMAGES -.-> BACKUP_MGR
    VIDEOS -.-> BACKUP_MGR
    AUDIO -.-> BACKUP_MGR
    
    MAIN_DB -.-> SYNC_MGR
    CONFIG_MGR -.-> SYNC_MGR
    
    classDef database fill:#e8f5e8
    classDef storage fill:#e3f2fd
    classDef backup fill:#fff3e0
    classDef sync fill:#f3e5f5
    classDef config fill:#fce4ec
    
    class MAIN_DB,CONTENT_DB,CACHE_DB,ANALYTICS_DB database
    class IMAGES,VIDEOS,AUDIO,FILE_MANAGER storage
    class BACKUP_MGR,DAILY,WEEKLY,EXPORT backup
    class SYNC_MGR,DROPBOX,GDRIVE,ICLOUD sync
    class CONFIG_MGR,APP_CONFIG,INTEGRATION_CONFIG,FEED_CONFIG,TEMPLATE_CONFIG config
```

## 7. Content Scheduling Timeline

```mermaid
gantt
    title Content Generation & Publishing Timeline
    dateFormat  HH:mm
    axisFormat %H:%M
    
    section RSS Monitoring
    Feed Polling (Hourly)    :rss1, 06:00, 1h
    Feed Polling (Hourly)    :rss2, 07:00, 1h
    Feed Polling (Hourly)    :rss3, 08:00, 1h
    Feed Polling (Hourly)    :rss4, 09:00, 1h
    
    section Content Generation
    AI Analysis              :gen1, 09:15, 15m
    Content Creation         :gen2, 09:30, 20m
    Media Selection          :gen3, 09:50, 10m
    Quality Check            :gen4, 10:00, 5m
    
    section Publishing Optimization
    Audience Analysis        :opt1, 10:05, 10m
    Time Slot Selection      :opt2, 10:15, 5m
    Platform Adaptation      :opt3, 10:20, 15m
    
    section Distribution
    Instagram Post           :pub1, 12:00, 2m
    Facebook Post            :pub2, 15:00, 2m
    YouTube Upload           :pub3, 19:00, 5m
    Newsletter Queue         :pub4, 20:00, 1m
    
    section Monitoring
    Engagement Tracking      :mon1, 12:00, 8h
    Performance Analysis     :mon2, 20:00, 30m
    Optimization Updates     :mon3, 20:30, 15m
```

## 8. Error Handling and Recovery Flow

```mermaid
flowchart TD
    ERROR[Error Detected] --> CLASSIFY{Error Classification}
    
    CLASSIFY -->|Network| NETWORK_ERROR[Network Error<br/>- API Timeout<br/>- Connection Failed<br/>- Rate Limited]
    
    CLASSIFY -->|Content| CONTENT_ERROR[Content Error<br/>- Generation Failed<br/>- Quality Check Failed<br/>- Invalid Format]
    
    CLASSIFY -->|System| SYSTEM_ERROR[System Error<br/>- Database Error<br/>- File System Error<br/>- Resource Exhaustion]
    
    NETWORK_ERROR --> RETRY[Retry Logic<br/>- Exponential Backoff<br/>- Max 3 Attempts<br/>- Circuit Breaker]
    
    CONTENT_ERROR --> FALLBACK[Fallback Strategy<br/>- Use Template<br/>- Simplify Content<br/>- Manual Override]
    
    SYSTEM_ERROR --> ALERT[Alert System<br/>- Log Critical Error<br/>- Notify Administrator<br/>- Graceful Degradation]
    
    RETRY --> SUCCESS{Retry Successful?}
    SUCCESS -->|Yes| CONTINUE[Continue Processing]
    SUCCESS -->|No| QUEUE_RETRY[Queue for Later Retry]
    
    FALLBACK --> VALIDATE[Validate Fallback Content]
    VALIDATE --> CONTINUE
    
    ALERT --> MAINTENANCE[Enter Maintenance Mode]
    MAINTENANCE --> MANUAL_INTERVENTION[Manual Intervention Required]
    
    QUEUE_RETRY --> DELAY[Apply Delay<br/>- Increase Priority<br/>- Schedule Retry<br/>- Update Status]
    
    DELAY --> END_RETRY[End Retry Process]
    CONTINUE --> END_SUCCESS[Process Complete]
    MANUAL_INTERVENTION --> END_MANUAL[Manual Resolution]
    
    classDef error fill:#ffebee
    classDef retry fill:#fff3e0
    classDef fallback fill:#e8f5e8
    classDef alert fill:#fce4ec
    classDef success fill:#e3f2fd
    
    class ERROR,NETWORK_ERROR,CONTENT_ERROR,SYSTEM_ERROR error
    class RETRY,QUEUE_RETRY,DELAY retry
    class FALLBACK,VALIDATE fallback
    class ALERT,MAINTENANCE,MANUAL_INTERVENTION alert
    class CONTINUE,END_SUCCESS,END_RETRY,END_MANUAL success
```

## 9. Analytics and Feedback Loop

```mermaid
graph LR
    PUBLISH[Published Content] --> PLATFORMS[Social Media Platforms]
    
    PLATFORMS --> METRICS[Raw Metrics<br/>- Views<br/>- Likes<br/>- Shares<br/>- Comments<br/>- CTR]
    
    METRICS --> COLLECTOR[Metrics Collector<br/>- API Polling<br/>- Webhook Processing<br/>- Data Normalization]
    
    COLLECTOR --> ANALYTICS_DB[(Analytics Database<br/>- Time Series Data<br/>- Engagement Metrics<br/>- Performance Scores)]
    
    ANALYTICS_DB --> ANALYZER[Performance Analyzer<br/>- Trend Detection<br/>- Pattern Recognition<br/>- Anomaly Detection]
    
    ANALYZER --> INSIGHTS[Insights Generation<br/>- Best Posting Times<br/>- Top Performing Content<br/>- Audience Preferences]
    
    INSIGHTS --> OPTIMIZER[Content Optimizer<br/>- Template Refinement<br/>- Topic Prioritization<br/>- Platform Strategy]
    
    OPTIMIZER --> FEEDBACK[Feedback Loop<br/>- Update AI Prompts<br/>- Adjust Scheduling<br/>- Refine Music Selection]
    
    FEEDBACK --> RSS_FILTER[RSS Filter Tuning]
    FEEDBACK --> CONTENT_GEN[Content Generation Tuning]
    FEEDBACK --> SCHEDULING[Scheduling Optimization]
    
    RSS_FILTER --> IMPROVED_CONTENT[Improved Content Quality]
    CONTENT_GEN --> IMPROVED_CONTENT
    SCHEDULING --> IMPROVED_CONTENT
    
    IMPROVED_CONTENT --> PUBLISH
    
    classDef publish fill:#e8f5e8
    classDef metrics fill:#e3f2fd
    classDef analysis fill:#fff3e0
    classDef optimization fill:#f3e5f5
    classDef feedback fill:#fce4ec
    
    class PUBLISH,IMPROVED_CONTENT publish
    class PLATFORMS,METRICS,COLLECTOR,ANALYTICS_DB metrics
    class ANALYZER,INSIGHTS analysis
    class OPTIMIZER,SCHEDULING,CONTENT_GEN,RSS_FILTER optimization
    class FEEDBACK,IMPROVED_CONTENT feedback
```

## 10. System Integration Overview

```mermaid
graph TB
    subgraph "External Services"
        RSS_FEEDS[RSS Feeds<br/>AGA, IAPLC, Green Aqua]
        SOCIAL_APIS[Social Media APIs<br/>Instagram, YouTube, Facebook]
        AI_APIS[AI Services<br/>OpenAI GPT-4, Google Gemini]
        MUSIC_APIS[Music APIs<br/>Freesound, YouTube Audio]
        CLOUD_STORAGE[Cloud Storage<br/>Dropbox, Google Drive]
    end
    
    subgraph "Core Application Layer"
        MAIN_APP[Aquascape Content Tool<br/>Next.js Frontend]
        BACKEND[Express.js Backend<br/>API Server]
        SCHEDULER[Master Scheduler<br/>Cron + Priority Queue]
    end
    
    subgraph "Processing Services"
        RSS_SERVICE[RSS Aggregation Service]
        CONTENT_SERVICE[Content Generation Service]
        MUSIC_SERVICE[Music Integration Service]
        SOCIAL_SERVICE[Social Media Service]
        ANALYTICS_SERVICE[Analytics Service]
    end
    
    subgraph "Local Storage Layer"
        SQLITE_DBS[(SQLite Databases<br/>Main, Content, Cache, Analytics)]
        FILE_STORAGE[File Storage<br/>Media, Audio, Templates]
        CONFIG_FILES[Configuration Files<br/>Settings, Credentials, Templates]
    end
    
    subgraph "Infrastructure Services"
        BACKUP_SERVICE[Backup Manager]
        SYNC_SERVICE[Cloud Sync Manager]
        MONITORING[Health Monitoring]
        LOGGING[Logging Service]
    end
    
    %% External connections
    RSS_FEEDS --> RSS_SERVICE
    SOCIAL_APIS --> SOCIAL_SERVICE
    AI_APIS --> CONTENT_SERVICE
    MUSIC_APIS --> MUSIC_SERVICE
    CLOUD_STORAGE --> SYNC_SERVICE
    
    %% Core app connections
    MAIN_APP --> BACKEND
    BACKEND --> SCHEDULER
    
    %% Service connections
    SCHEDULER --> RSS_SERVICE
    SCHEDULER --> CONTENT_SERVICE
    SCHEDULER --> SOCIAL_SERVICE
    RSS_SERVICE --> CONTENT_SERVICE
    CONTENT_SERVICE --> MUSIC_SERVICE
    SOCIAL_SERVICE --> ANALYTICS_SERVICE
    
    %% Storage connections
    RSS_SERVICE --> SQLITE_DBS
    CONTENT_SERVICE --> SQLITE_DBS
    CONTENT_SERVICE --> FILE_STORAGE
    MUSIC_SERVICE --> FILE_STORAGE
    SOCIAL_SERVICE --> SQLITE_DBS
    ANALYTICS_SERVICE --> SQLITE_DBS
    BACKEND --> CONFIG_FILES
    
    %% Infrastructure connections
    SQLITE_DBS --> BACKUP_SERVICE
    FILE_STORAGE --> BACKUP_SERVICE
    CONFIG_FILES --> BACKUP_SERVICE
    SQLITE_DBS --> SYNC_SERVICE
    CONFIG_FILES --> SYNC_SERVICE
    
    classDef external fill:#ffebee
    classDef core fill:#e8f5e8
    classDef processing fill:#e3f2fd
    classDef storage fill:#fff3e0
    classDef infrastructure fill:#f3e5f5
    
    class RSS_FEEDS,SOCIAL_APIS,AI_APIS,MUSIC_APIS,CLOUD_STORAGE external
    class MAIN_APP,BACKEND,SCHEDULER core
    class RSS_SERVICE,CONTENT_SERVICE,MUSIC_SERVICE,SOCIAL_SERVICE,ANALYTICS_SERVICE processing
    class SQLITE_DBS,FILE_STORAGE,CONFIG_FILES storage
    class BACKUP_SERVICE,SYNC_SERVICE,MONITORING,LOGGING infrastructure
```

These data flow diagrams illustrate:

1. **Complete system architecture** with all major components
2. **Sequential processing flows** for RSS ingestion and content generation
3. **Multi-platform publishing workflows** with platform-specific adaptations
4. **Local-first storage architecture** with backup and sync capabilities
5. **Error handling and recovery mechanisms** for robust operation
6. **Analytics feedback loops** for continuous optimization
7. **Service integration patterns** showing how all components work together

The diagrams demonstrate how data flows through the entire ecosystem, from RSS feed ingestion to final social media publication, with comprehensive error handling, analytics, and optimization feedback loops.