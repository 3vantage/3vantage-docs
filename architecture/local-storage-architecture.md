# Local Persistent Storage Architecture

## Overview

The Local Persistent Storage Architecture provides a robust, local-first data management system that consolidates content, media assets, configurations, and operational data while maintaining sync capabilities with cloud services.

## Core Architecture

### 1. Storage Layer Hierarchy

```
Local Storage Root: ~/.aquascape-ecosystem/
├── data/                           # Core database files
│   ├── main.sqlite                # Primary application database
│   ├── content.sqlite             # Content and media metadata
│   ├── cache.sqlite               # Temporary and cache data
│   └── analytics.sqlite           # Local analytics and metrics
├── media/                         # Media assets storage
│   ├── images/                    # Original images
│   │   ├── raw/                   # Unprocessed uploads
│   │   ├── processed/             # Optimized images
│   │   └── thumbnails/            # Generated thumbnails
│   ├── videos/                    # Video content
│   │   ├── source/                # Original video files
│   │   ├── processed/             # Platform-optimized videos
│   │   └── preview/               # Video previews and GIFs
│   ├── audio/                     # Stock music and audio
│   │   ├── music/                 # Background music tracks
│   │   ├── effects/               # Sound effects
│   │   └── generated/             # AI-generated audio
│   └── templates/                 # Design templates and assets
├── content/                       # Generated content storage
│   ├── newsletters/               # Email templates and exports
│   ├── social-media/              # Social media posts and campaigns
│   ├── blog-posts/                # Generated blog content
│   └── drafts/                    # Work-in-progress content
├── config/                        # Configuration files
│   ├── app.json                   # Application settings
│   ├── integrations.json          # API keys and integrations
│   ├── feeds.json                 # RSS feed configurations
│   └── templates.json             # Template preferences
├── backups/                       # Automated backups
│   ├── daily/                     # Daily incremental backups
│   ├── weekly/                    # Weekly full backups
│   └── exports/                   # Manual exports
└── logs/                         # Application logs
    ├── application.log            # General application logs
    ├── errors.log                 # Error logs
    └── performance.log            # Performance metrics
```

### 2. Database Schema Design

```sql
-- Main application database schema
-- File: ~/.aquascape-ecosystem/data/main.sqlite

-- Core content items
CREATE TABLE content_items (
    id TEXT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    metadata JSON,
    tags TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    language VARCHAR(10) DEFAULT 'en',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME,
    expires_at DATETIME
);

-- Media assets tracking
CREATE TABLE media_assets (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_filename TEXT,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    dimensions JSON, -- {width, height} for images/videos
    duration INTEGER, -- for videos/audio in seconds
    checksum TEXT,
    metadata JSON,
    tags TEXT,
    usage_count INTEGER DEFAULT 0,
    last_used DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Content and media relationships
CREATE TABLE content_media_relations (
    content_id TEXT REFERENCES content_items(id),
    media_id TEXT REFERENCES media_assets(id),
    relation_type VARCHAR(50), -- 'featured', 'inline', 'background', 'thumbnail'
    position INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (content_id, media_id, relation_type)
);

-- RSS feed items (separate from content)
CREATE TABLE rss_items (
    id TEXT PRIMARY KEY,
    feed_id TEXT NOT NULL,
    original_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    link TEXT,
    published_at DATETIME,
    author TEXT,
    categories TEXT,
    tags TEXT,
    relevance_score REAL,
    processing_status VARCHAR(20) DEFAULT 'pending',
    content_extracted TEXT,
    key_information JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(feed_id, original_id)
);

-- Content generation queue
CREATE TABLE generation_queue (
    id TEXT PRIMARY KEY,
    source_type VARCHAR(50), -- 'rss', 'manual', 'scheduled'
    source_id TEXT, -- reference to RSS item or other source
    content_type VARCHAR(50), -- 'newsletter', 'social_post', 'blog_post'
    template TEXT,
    parameters JSON,
    priority INTEGER DEFAULT 5,
    status VARCHAR(20) DEFAULT 'queued',
    scheduled_for DATETIME,
    started_at DATETIME,
    completed_at DATETIME,
    result JSON,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Publication tracking
CREATE TABLE publications (
    id TEXT PRIMARY KEY,
    content_id TEXT REFERENCES content_items(id),
    platform VARCHAR(50), -- 'instagram', 'facebook', 'youtube', 'email'
    platform_id TEXT, -- ID from the platform
    status VARCHAR(20), -- 'scheduled', 'published', 'failed'
    scheduled_for DATETIME,
    published_at DATETIME,
    metrics JSON, -- engagement metrics
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Local user preferences and settings
CREATE TABLE user_preferences (
    key TEXT PRIMARY KEY,
    value JSON,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Background jobs and tasks
CREATE TABLE background_jobs (
    id TEXT PRIMARY KEY,
    job_type VARCHAR(50),
    parameters JSON,
    status VARCHAR(20) DEFAULT 'pending',
    priority INTEGER DEFAULT 5,
    max_attempts INTEGER DEFAULT 3,
    attempt_count INTEGER DEFAULT 0,
    scheduled_for DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME,
    error_message TEXT,
    result JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Storage Manager Implementation

```javascript
class LocalStorageManager {
  constructor() {
    this.storageRoot = path.join(os.homedir(), '.aquascape-ecosystem');
    this.databases = {};
    this.fileManager = new LocalFileManager(this.storageRoot);
    this.backupManager = new BackupManager(this.storageRoot);
    this.syncManager = new CloudSyncManager();
    
    this.initializeStorage();
  }

  async initializeStorage() {
    // Ensure directory structure exists
    await this.fileManager.ensureDirectories([
      'data', 'media/images/raw', 'media/images/processed', 'media/images/thumbnails',
      'media/videos/source', 'media/videos/processed', 'media/videos/preview',
      'media/audio/music', 'media/audio/effects', 'media/audio/generated',
      'media/templates', 'content/newsletters', 'content/social-media',
      'content/blog-posts', 'content/drafts', 'config', 'backups/daily',
      'backups/weekly', 'backups/exports', 'logs'
    ]);

    // Initialize databases
    this.databases.main = await this.openDatabase('main.sqlite');
    this.databases.content = await this.openDatabase('content.sqlite');
    this.databases.cache = await this.openDatabase('cache.sqlite');
    this.databases.analytics = await this.openDatabase('analytics.sqlite');

    // Run migrations
    await this.runMigrations();

    // Start background maintenance tasks
    this.startMaintenanceTasks();
  }

  async openDatabase(filename) {
    const dbPath = path.join(this.storageRoot, 'data', filename);
    const db = new SQLite3.Database(dbPath);
    
    // Enable WAL mode for better performance
    await db.run('PRAGMA journal_mode = WAL');
    await db.run('PRAGMA synchronous = NORMAL');
    await db.run('PRAGMA cache_size = 10000');
    await db.run('PRAGMA temp_store = MEMORY');
    
    return db;
  }

  async storeContent(contentData) {
    const contentId = uuidv4();
    const transaction = this.databases.main.transaction();
    
    try {
      // Store main content record
      await transaction.run(`
        INSERT INTO content_items 
        (id, type, title, description, content, metadata, tags, status, language) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        contentId,
        contentData.type,
        contentData.title,
        contentData.description,
        contentData.content,
        JSON.stringify(contentData.metadata || {}),
        (contentData.tags || []).join(','),
        contentData.status || 'draft',
        contentData.language || 'en'
      ]);

      // Store associated media
      if (contentData.media && contentData.media.length > 0) {
        for (const mediaItem of contentData.media) {
          const mediaId = await this.storeMediaAsset(mediaItem);
          
          await transaction.run(`
            INSERT INTO content_media_relations 
            (content_id, media_id, relation_type, position)
            VALUES (?, ?, ?, ?)
          `, [contentId, mediaId, mediaItem.relation || 'inline', mediaItem.position || 0]);
        }
      }

      transaction.commit();
      
      // Schedule background tasks
      await this.scheduleBackgroundTasks(contentId, contentData);
      
      return contentId;
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  }

  async storeMediaAsset(mediaData) {
    const mediaId = uuidv4();
    const fileExtension = path.extname(mediaData.originalFilename || mediaData.filename);
    const storedFilename = `${mediaId}${fileExtension}`;
    
    // Determine storage path based on media type
    let relativePath;
    const mimeType = mediaData.mimeType || mime.lookup(fileExtension);
    
    if (mimeType.startsWith('image/')) {
      relativePath = `media/images/raw/${storedFilename}`;
    } else if (mimeType.startsWith('video/')) {
      relativePath = `media/videos/source/${storedFilename}`;
    } else if (mimeType.startsWith('audio/')) {
      relativePath = `media/audio/music/${storedFilename}`;
    } else {
      relativePath = `media/other/${storedFilename}`;
    }

    const fullPath = path.join(this.storageRoot, relativePath);
    
    // Copy/move file to storage location
    if (mediaData.buffer) {
      await fs.writeFile(fullPath, mediaData.buffer);
    } else if (mediaData.sourcePath) {
      await fs.copyFile(mediaData.sourcePath, fullPath);
    }

    // Extract metadata
    const metadata = await this.extractMediaMetadata(fullPath, mimeType);
    const fileStats = await fs.stat(fullPath);
    const checksum = await this.calculateChecksum(fullPath);

    // Store in database
    await this.databases.main.run(`
      INSERT INTO media_assets 
      (id, filename, original_filename, file_path, file_size, mime_type, 
       dimensions, duration, checksum, metadata, tags, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      mediaId,
      storedFilename,
      mediaData.originalFilename,
      relativePath,
      fileStats.size,
      mimeType,
      JSON.stringify(metadata.dimensions),
      metadata.duration,
      checksum,
      JSON.stringify(metadata),
      (mediaData.tags || []).join(',')
    ]);

    // Schedule processing tasks
    await this.scheduleMediaProcessing(mediaId, mimeType);

    return mediaId;
  }
}
```

### 4. File Management System

```javascript
class LocalFileManager {
  constructor(storageRoot) {
    this.storageRoot = storageRoot;
    this.compressionEnabled = true;
    this.encryptionKey = this.getOrCreateEncryptionKey();
  }

  async ensureDirectories(directories) {
    for (const dir of directories) {
      const fullPath = path.join(this.storageRoot, dir);
      await fs.mkdir(fullPath, { recursive: true });
    }
  }

  async storeFile(sourceFile, targetDirectory, options = {}) {
    const filename = options.filename || `${uuidv4()}${path.extname(sourceFile.name)}`;
    const targetPath = path.join(this.storageRoot, targetDirectory, filename);
    
    // Ensure target directory exists
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    
    let finalPath = targetPath;
    
    // Apply compression if enabled and appropriate
    if (this.compressionEnabled && this.shouldCompress(sourceFile.mimeType)) {
      finalPath = await this.compressFile(sourceFile.path || sourceFile.buffer, targetPath);
    } else {
      if (sourceFile.path) {
        await fs.copyFile(sourceFile.path, finalPath);
      } else if (sourceFile.buffer) {
        await fs.writeFile(finalPath, sourceFile.buffer);
      }
    }

    // Apply encryption if sensitive
    if (options.encrypt) {
      finalPath = await this.encryptFile(finalPath);
    }

    return path.relative(this.storageRoot, finalPath);
  }

  async getFile(relativePath, options = {}) {
    const fullPath = path.join(this.storageRoot, relativePath);
    
    if (!await this.fileExists(fullPath)) {
      throw new Error(`File not found: ${relativePath}`);
    }

    let filePath = fullPath;
    
    // Decrypt if encrypted
    if (options.encrypted) {
      filePath = await this.decryptFile(fullPath);
    }

    // Return file stream or buffer based on options
    if (options.stream) {
      return fs.createReadStream(filePath);
    } else {
      return await fs.readFile(filePath);
    }
  }

  async deleteFile(relativePath) {
    const fullPath = path.join(this.storageRoot, relativePath);
    
    if (await this.fileExists(fullPath)) {
      await fs.unlink(fullPath);
      return true;
    }
    
    return false;
  }

  async moveFile(sourcePath, targetPath) {
    const sourceFullPath = path.join(this.storageRoot, sourcePath);
    const targetFullPath = path.join(this.storageRoot, targetPath);
    
    await fs.mkdir(path.dirname(targetFullPath), { recursive: true });
    await fs.rename(sourceFullPath, targetFullPath);
    
    return path.relative(this.storageRoot, targetFullPath);
  }

  async optimizeStorage() {
    // Remove unused files
    await this.cleanupUnusedFiles();
    
    // Compress large uncompressed files
    await this.compressLargeFiles();
    
    // Generate missing thumbnails
    await this.generateMissingThumbnails();
    
    // Update file statistics
    await this.updateFileStatistics();
  }
}
```

### 5. Backup and Sync System

```javascript
class BackupManager {
  constructor(storageRoot) {
    this.storageRoot = storageRoot;
    this.backupPath = path.join(storageRoot, 'backups');
    this.compressionLevel = 6;
    this.retentionDays = { daily: 30, weekly: 12, monthly: 6 };
  }

  async createBackup(type = 'incremental') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `${type}-${timestamp}`;
    const backupDir = path.join(this.backupPath, type, backupName);

    await fs.mkdir(backupDir, { recursive: true });

    try {
      if (type === 'full') {
        await this.createFullBackup(backupDir);
      } else {
        await this.createIncrementalBackup(backupDir);
      }

      // Create manifest
      await this.createBackupManifest(backupDir, type);
      
      // Compress backup
      const compressedPath = await this.compressBackup(backupDir);
      
      // Clean up uncompressed backup
      await fs.rm(backupDir, { recursive: true });
      
      return compressedPath;
    } catch (error) {
      // Clean up failed backup
      await fs.rm(backupDir, { recursive: true, force: true });
      throw error;
    }
  }

  async createFullBackup(backupDir) {
    // Backup databases with integrity checks
    const databases = ['main.sqlite', 'content.sqlite', 'cache.sqlite', 'analytics.sqlite'];
    
    for (const dbName of databases) {
      const sourcePath = path.join(this.storageRoot, 'data', dbName);
      const targetPath = path.join(backupDir, 'data', dbName);
      
      if (await this.fileExists(sourcePath)) {
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.copyFile(sourcePath, targetPath);
      }
    }

    // Backup media files
    await this.backupDirectory(
      path.join(this.storageRoot, 'media'),
      path.join(backupDir, 'media')
    );

    // Backup content files
    await this.backupDirectory(
      path.join(this.storageRoot, 'content'),
      path.join(backupDir, 'content')
    );

    // Backup configuration
    await this.backupDirectory(
      path.join(this.storageRoot, 'config'),
      path.join(backupDir, 'config')
    );
  }

  async scheduleBackups() {
    const cron = require('node-cron');
    
    // Daily incremental backups at 2 AM
    cron.schedule('0 2 * * *', async () => {
      try {
        await this.createBackup('incremental');
        await this.cleanupOldBackups('daily');
      } catch (error) {
        logger.error('Daily backup failed:', error);
      }
    });

    // Weekly full backups on Sunday at 3 AM
    cron.schedule('0 3 * * 0', async () => {
      try {
        await this.createBackup('full');
        await this.cleanupOldBackups('weekly');
      } catch (error) {
        logger.error('Weekly backup failed:', error);
      }
    });
  }
}

class CloudSyncManager {
  constructor() {
    this.providers = {
      dropbox: new DropboxSync(),
      gdrive: new GoogleDriveSync(),
      icloud: new iCloudSync()
    };
    this.syncEnabled = process.env.CLOUD_SYNC_ENABLED === 'true';
    this.syncInterval = process.env.SYNC_INTERVAL || '1h';
  }

  async syncToCloud(provider = 'auto') {
    if (!this.syncEnabled) return;

    const selectedProvider = provider === 'auto' 
      ? this.selectBestProvider() 
      : this.providers[provider];

    if (!selectedProvider) {
      throw new Error(`Cloud provider ${provider} not available`);
    }

    try {
      // Sync critical data first
      await selectedProvider.syncDirectory('data/', { priority: 'high' });
      await selectedProvider.syncDirectory('config/', { priority: 'high' });
      
      // Sync content
      await selectedProvider.syncDirectory('content/', { priority: 'medium' });
      
      // Sync media (only recent or frequently used)
      await this.selectiveMediaSync(selectedProvider);
      
      return { success: true, provider: selectedProvider.name };
    } catch (error) {
      logger.error(`Cloud sync failed for ${selectedProvider.name}:`, error);
      throw error;
    }
  }

  async selectiveMediaSync(provider) {
    // Only sync frequently used or recent media to save bandwidth
    const recentCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const query = `
      SELECT file_path FROM media_assets 
      WHERE (usage_count > 5 OR last_used > ? OR created_at > ?)
      ORDER BY usage_count DESC, last_used DESC
      LIMIT 1000
    `;
    
    const mediaFiles = await this.database.all(query, [recentCutoff, recentCutoff]);
    
    for (const mediaFile of mediaFiles) {
      await provider.syncFile(mediaFile.file_path, { compress: true });
    }
  }
}
```

### 6. Configuration Management

```javascript
class ConfigurationManager {
  constructor(storageRoot) {
    this.configPath = path.join(storageRoot, 'config');
    this.configs = new Map();
    this.watchers = new Map();
    
    this.loadConfigurations();
    this.startConfigWatching();
  }

  async loadConfigurations() {
    const configFiles = [
      'app.json',
      'integrations.json', 
      'feeds.json',
      'templates.json'
    ];

    for (const configFile of configFiles) {
      try {
        const filePath = path.join(this.configPath, configFile);
        if (await this.fileExists(filePath)) {
          const content = await fs.readFile(filePath, 'utf8');
          const config = JSON.parse(content);
          const configName = path.basename(configFile, '.json');
          
          this.configs.set(configName, config);
        }
      } catch (error) {
        logger.error(`Failed to load config ${configFile}:`, error);
      }
    }
  }

  async saveConfiguration(configName, config) {
    const filePath = path.join(this.configPath, `${configName}.json`);
    
    // Backup current config if it exists
    if (await this.fileExists(filePath)) {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      await fs.copyFile(filePath, backupPath);
    }

    // Save new configuration
    await fs.writeFile(filePath, JSON.stringify(config, null, 2));
    this.configs.set(configName, config);
    
    // Emit configuration change event
    this.emit('configChanged', { configName, config });
  }

  getConfig(configName, defaultValue = null) {
    return this.configs.get(configName) || defaultValue;
  }

  setConfig(configName, config) {
    return this.saveConfiguration(configName, config);
  }

  startConfigWatching() {
    const chokidar = require('chokidar');
    
    const watcher = chokidar.watch(path.join(this.configPath, '*.json'), {
      ignored: /\.backup\./,
      persistent: true
    });

    watcher.on('change', async (filePath) => {
      const configName = path.basename(filePath, '.json');
      
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const config = JSON.parse(content);
        
        this.configs.set(configName, config);
        this.emit('configChanged', { configName, config });
        
        logger.info(`Configuration ${configName} reloaded`);
      } catch (error) {
        logger.error(`Failed to reload config ${configName}:`, error);
      }
    });
  }
}
```

This local storage architecture provides:

- **SQLite-based persistence** with optimized performance settings
- **Hierarchical file organization** with logical separation of content types
- **Automated backup system** with incremental and full backups
- **Cloud sync capabilities** with selective synchronization
- **Robust file management** with compression and encryption options
- **Configuration management** with hot-reloading capabilities
- **Media asset optimization** with automatic processing pipelines
- **Local-first approach** that works offline and syncs when connected