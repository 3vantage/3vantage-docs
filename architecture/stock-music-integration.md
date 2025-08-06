# Stock Music Integration System Architecture

## Overview

The Stock Music Integration System provides automated selection, licensing, and integration of royalty-free music for video content, with intelligent mood matching and platform-specific optimization.

## Core Architecture

### 1. Music Library Management System

```javascript
class StockMusicLibrary {
  constructor() {
    this.providers = {
      freesound: new FreesoundAPI(),
      youtube_audio: new YouTubeAudioLibrary(),
      epidemic_sound: new EpidemicSoundAPI(),
      artlist: new ArtlistAPI(),
      soundstripe: new SoundstripeAPI(),
      local: new LocalMusicLibrary()
    };
    
    this.metadataAnalyzer = new AudioMetadataAnalyzer();
    this.moodClassifier = new MoodClassificationService();
    this.licensingManager = new LicensingManager();
    this.audioProcessor = new AudioProcessor();
  }

  async searchMusic(criteria) {
    const {
      mood = 'calm',
      genre = 'ambient',
      duration = { min: 30, max: 120 },
      energy = 'low',
      instruments = [],
      bpm = { min: 60, max: 120 },
      key = null,
      license = 'royalty_free'
    } = criteria;

    const searchResults = [];
    
    // Search across all enabled providers
    for (const [providerName, provider] of Object.entries(this.providers)) {
      if (provider.isEnabled) {
        try {
          const providerResults = await provider.search({
            mood, genre, duration, energy, instruments, bpm, key, license
          });
          
          searchResults.push(...providerResults.map(track => ({
            ...track,
            provider: providerName,
            score: this.calculateRelevanceScore(track, criteria)
          })));
        } catch (error) {
          logger.warn(`Search failed for provider ${providerName}:`, error);
        }
      }
    }

    // Sort by relevance and return top matches
    return searchResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }

  async getRecommendedMusic(contentContext) {
    const {
      contentType = 'aquascape_showcase', // aquascape_showcase, tutorial, timelapse
      aquascapeStyle = 'nature', // nature, iwagumi, dutch, biotope
      mood = 'peaceful',
      videoDuration = 60,
      targetAudience = 'general'
    } = contentContext;

    // Define music profiles for different content types
    const musicProfiles = {
      aquascape_showcase: {
        mood: ['peaceful', 'serene', 'contemplative'],
        genre: ['ambient', 'neo_classical', 'nature_sounds'],
        energy: 'low',
        bpm: { min: 60, max: 90 },
        instruments: ['piano', 'strings', 'flute', 'nature_sounds']
      },
      tutorial: {
        mood: ['focused', 'educational', 'upbeat'],
        genre: ['corporate', 'acoustic', 'minimal'],
        energy: 'medium',
        bpm: { min: 90, max: 110 },
        instruments: ['acoustic_guitar', 'piano', 'light_percussion']
      },
      timelapse: {
        mood: ['dynamic', 'progressive', 'inspiring'],
        genre: ['electronic', 'cinematic', 'upbeat'],
        energy: 'medium_high',
        bpm: { min: 110, max: 140 },
        instruments: ['synthesizer', 'strings', 'percussion']
      }
    };

    const profile = musicProfiles[contentType] || musicProfiles.aquascape_showcase;
    
    return await this.searchMusic({
      ...profile,
      mood: profile.mood.includes(mood) ? mood : profile.mood[0],
      duration: { min: Math.max(videoDuration - 10, 30), max: videoDuration + 30 }
    });
  }
}
```

### 2. Provider Implementations

```javascript
class YouTubeAudioLibrary {
  constructor() {
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    this.libraryUrl = 'https://studio.youtube.com/channel/music';
    this.isEnabled = true;
    this.licenseType = 'creative_commons';
  }

  async search(criteria) {
    // YouTube Audio Library provides curated royalty-free music
    const tracks = [
      {
        id: 'ambient_aquarium_1',
        title: 'Peaceful Waters',
        artist: 'YouTube Audio Library',
        duration: 120,
        genre: 'ambient',
        mood: 'peaceful',
        bpm: 75,
        key: 'C_major',
        license: 'creative_commons',
        url: 'https://example.com/peaceful_waters.mp3',
        preview_url: 'https://example.com/peaceful_waters_preview.mp3',
        tags: ['water', 'nature', 'calm', 'meditation'],
        instruments: ['piano', 'strings', 'nature_sounds']
      },
      {
        id: 'nature_ambient_2',
        title: 'Forest Whispers',
        artist: 'YouTube Audio Library',
        duration: 90,
        genre: 'nature_sounds',
        mood: 'serene',
        bpm: 65,
        key: 'A_minor',
        license: 'creative_commons',
        url: 'https://example.com/forest_whispers.mp3',
        preview_url: 'https://example.com/forest_whispers_preview.mp3',
        tags: ['forest', 'birds', 'ambient', 'natural'],
        instruments: ['nature_sounds', 'light_pad']
      }
    ];

    return this.filterTracks(tracks, criteria);
  }

  filterTracks(tracks, criteria) {
    return tracks.filter(track => {
      const durationMatch = track.duration >= criteria.duration.min && 
                           track.duration <= criteria.duration.max;
      const moodMatch = track.mood === criteria.mood;
      const genreMatch = track.genre === criteria.genre;
      
      return durationMatch && (moodMatch || genreMatch);
    });
  }
}

class FreesoundAPI {
  constructor() {
    this.baseUrl = 'https://freesound.org/apiv2';
    this.apiKey = process.env.FREESOUND_API_KEY;
    this.isEnabled = !!this.apiKey;
    this.licenseType = 'creative_commons';
  }

  async search(criteria) {
    if (!this.isEnabled) return [];

    const searchParams = new URLSearchParams({
      token: this.apiKey,
      query: this.buildQuery(criteria),
      page_size: 50,
      fields: 'id,name,description,username,duration,filesize,type,channels,license,tags,download,previews',
      filter: this.buildFilter(criteria)
    });

    try {
      const response = await fetch(`${this.baseUrl}/search/text/?${searchParams}`);
      const data = await response.json();
      
      return data.results.map(this.transformFreesoundTrack.bind(this));
    } catch (error) {
      logger.error('Freesound API error:', error);
      return [];
    }
  }

  buildQuery(criteria) {
    const queryTerms = [];
    
    if (criteria.mood) queryTerms.push(criteria.mood);
    if (criteria.genre) queryTerms.push(criteria.genre);
    if (criteria.instruments && criteria.instruments.length > 0) {
      queryTerms.push(...criteria.instruments);
    }
    
    // Add aquascaping-related terms
    queryTerms.push('ambient', 'peaceful', 'water', 'nature');
    
    return queryTerms.join(' OR ');
  }

  buildFilter(criteria) {
    const filters = [];
    
    filters.push('type:wav OR type:mp3');
    filters.push('license:"Creative Commons 0"');
    
    if (criteria.duration) {
      filters.push(`duration:[${criteria.duration.min} TO ${criteria.duration.max}]`);
    }
    
    return filters.join(' ');
  }

  transformFreesoundTrack(freesoundTrack) {
    return {
      id: `freesound_${freesoundTrack.id}`,
      title: freesoundTrack.name,
      artist: freesoundTrack.username,
      duration: Math.round(freesoundTrack.duration),
      license: freesoundTrack.license,
      url: freesoundTrack.download,
      preview_url: freesoundTrack.previews['preview-hq-mp3'],
      tags: freesoundTrack.tags || [],
      provider: 'freesound',
      filesize: freesoundTrack.filesize,
      channels: freesoundTrack.channels
    };
  }
}

class LocalMusicLibrary {
  constructor() {
    this.libraryPath = path.join(process.env.STORAGE_ROOT, 'media/audio/music');
    this.metadataCache = new Map();
    this.isEnabled = true;
  }

  async search(criteria) {
    const musicFiles = await this.scanMusicLibrary();
    const analyzedTracks = [];

    for (const file of musicFiles) {
      try {
        const metadata = await this.getTrackMetadata(file);
        const moodAnalysis = await this.analyzeMood(file);
        
        const track = {
          id: `local_${path.basename(file, path.extname(file))}`,
          title: metadata.title || path.basename(file, path.extname(file)),
          artist: metadata.artist || 'Unknown',
          album: metadata.album,
          duration: metadata.duration,
          genre: metadata.genre,
          bpm: moodAnalysis.bpm,
          key: moodAnalysis.key,
          mood: moodAnalysis.mood,
          energy: moodAnalysis.energy,
          license: 'owned',
          url: file,
          preview_url: file,
          provider: 'local',
          instruments: moodAnalysis.instruments || []
        };

        analyzedTracks.push(track);
      } catch (error) {
        logger.warn(`Failed to analyze track ${file}:`, error);
      }
    }

    return this.filterLocalTracks(analyzedTracks, criteria);
  }

  async scanMusicLibrary() {
    const supportedExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg'];
    const musicFiles = [];

    async function scanDirectory(dir) {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (supportedExtensions.includes(path.extname(item.name).toLowerCase())) {
          musicFiles.push(fullPath);
        }
      }
    }

    if (await fs.access(this.libraryPath).then(() => true).catch(() => false)) {
      await scanDirectory(this.libraryPath);
    }

    return musicFiles;
  }
}
```

### 3. Audio Processing and Enhancement

```javascript
class AudioProcessor {
  constructor() {
    this.ffmpeg = require('fluent-ffmpeg');
    this.audioContext = null;
  }

  async processForVideo(audioFile, videoConfig) {
    const {
      targetDuration,
      fadeInDuration = 2,
      fadeOutDuration = 3,
      volumeLevel = 0.7,
      targetFormat = 'aac',
      sampleRate = 44100,
      bitRate = '128k'
    } = videoConfig;

    return new Promise((resolve, reject) => {
      const outputPath = `/tmp/processed_audio_${Date.now()}.${targetFormat}`;
      
      let command = this.ffmpeg(audioFile.url || audioFile.path)
        .audioCodec('aac')
        .audioBitrate(bitRate)
        .audioFrequency(sampleRate)
        .audioChannels(2);

      // Trim audio to match video duration
      if (targetDuration) {
        command = command.duration(targetDuration);
      }

      // Apply volume normalization and fades
      const audioFilters = [
        `volume=${volumeLevel}`,
        `afade=t=in:ss=0:d=${fadeInDuration}`,
        `afade=t=out:st=${targetDuration - fadeOutDuration}:d=${fadeOutDuration}`
      ];

      command = command.audioFilters(audioFilters);

      command
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  async createAudioLoop(audioFile, targetDuration) {
    return new Promise((resolve, reject) => {
      const outputPath = `/tmp/looped_audio_${Date.now()}.aac`;
      
      // Create seamless audio loop
      this.ffmpeg(audioFile.url || audioFile.path)
        .audioCodec('aac')
        .audioFilters([
          `aloop=loop=-1:size=2e+09:start=0`,
          'afade=t=in:ss=0:d=0.5',
          'afade=t=out:st=' + (targetDuration - 0.5) + ':d=0.5'
        ])
        .duration(targetDuration)
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  async extractAudioFeatures(audioFile) {
    // Use Web Audio API or external library for audio analysis
    try {
      const audioBuffer = await this.loadAudioBuffer(audioFile);
      
      return {
        duration: audioBuffer.duration,
        bpm: await this.detectBPM(audioBuffer),
        key: await this.detectKey(audioBuffer),
        energy: await this.calculateEnergy(audioBuffer),
        spectralCentroid: await this.calculateSpectralCentroid(audioBuffer),
        mfcc: await this.calculateMFCC(audioBuffer)
      };
    } catch (error) {
      logger.error('Audio feature extraction failed:', error);
      return null;
    }
  }
}
```

### 4. Mood Classification Service

```javascript
class MoodClassificationService {
  constructor() {
    this.moodProfiles = {
      peaceful: {
        bpm: { min: 60, max: 90 },
        energy: { min: 0.1, max: 0.4 },
        valence: { min: 0.3, max: 0.7 },
        instruments: ['piano', 'strings', 'flute', 'nature_sounds'],
        keywords: ['peaceful', 'calm', 'serene', 'tranquil', 'gentle']
      },
      energetic: {
        bpm: { min: 120, max: 160 },
        energy: { min: 0.6, max: 1.0 },
        valence: { min: 0.5, max: 1.0 },
        instruments: ['drums', 'electric_guitar', 'bass', 'synthesizer'],
        keywords: ['energetic', 'upbeat', 'dynamic', 'powerful', 'exciting']
      },
      contemplative: {
        bpm: { min: 70, max: 100 },
        energy: { min: 0.2, max: 0.5 },
        valence: { min: 0.2, max: 0.6 },
        instruments: ['piano', 'cello', 'ambient_pad'],
        keywords: ['contemplative', 'thoughtful', 'introspective', 'meditative']
      },
      inspiring: {
        bpm: { min: 100, max: 130 },
        energy: { min: 0.5, max: 0.8 },
        valence: { min: 0.6, max: 0.9 },
        instruments: ['orchestra', 'piano', 'strings', 'choir'],
        keywords: ['inspiring', 'uplifting', 'motivational', 'hopeful', 'triumphant']
      }
    };
  }

  async classifyMood(audioFeatures, metadata = {}) {
    const scores = {};
    
    for (const [mood, profile] of Object.entries(this.moodProfiles)) {
      scores[mood] = this.calculateMoodScore(audioFeatures, profile, metadata);
    }

    // Return mood with highest score
    const bestMood = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      primaryMood: bestMood[0],
      confidence: bestMood[1],
      allScores: scores
    };
  }

  calculateMoodScore(features, profile, metadata) {
    let score = 0;
    let factors = 0;

    // BPM scoring
    if (features.bpm && profile.bpm) {
      const bpmMatch = this.scoreRange(features.bpm, profile.bpm);
      score += bpmMatch * 0.3;
      factors += 0.3;
    }

    // Energy scoring
    if (features.energy && profile.energy) {
      const energyMatch = this.scoreRange(features.energy, profile.energy);
      score += energyMatch * 0.25;
      factors += 0.25;
    }

    // Keyword matching in title/tags
    if (metadata.title || metadata.tags) {
      const text = `${metadata.title || ''} ${(metadata.tags || []).join(' ')}`.toLowerCase();
      const keywordMatches = profile.keywords.filter(keyword => 
        text.includes(keyword.toLowerCase())
      ).length;
      
      const keywordScore = Math.min(keywordMatches / profile.keywords.length, 1);
      score += keywordScore * 0.2;
      factors += 0.2;
    }

    // Instrument matching
    if (metadata.instruments && profile.instruments) {
      const instrumentMatches = metadata.instruments.filter(instrument =>
        profile.instruments.includes(instrument)
      ).length;
      
      const instrumentScore = Math.min(instrumentMatches / profile.instruments.length, 1);
      score += instrumentScore * 0.25;
      factors += 0.25;
    }

    return factors > 0 ? score / factors : 0;
  }

  scoreRange(value, range) {
    if (value >= range.min && value <= range.max) {
      return 1.0; // Perfect match
    } else {
      // Calculate distance penalty
      const distance = Math.min(
        Math.abs(value - range.min),
        Math.abs(value - range.max)
      );
      const rangeSize = range.max - range.min;
      return Math.max(0, 1 - (distance / rangeSize));
    }
  }
}
```

### 5. Licensing and Compliance Management

```javascript
class LicensingManager {
  constructor() {
    this.licenseTypes = {
      'creative_commons_0': {
        name: 'Creative Commons CC0',
        commercial: true,
        attribution: false,
        modifications: true,
        distribution: true
      },
      'creative_commons_by': {
        name: 'Creative Commons Attribution',
        commercial: true,
        attribution: true,
        modifications: true,
        distribution: true
      },
      'royalty_free': {
        name: 'Royalty Free',
        commercial: true,
        attribution: false,
        modifications: true,
        distribution: false
      },
      'owned': {
        name: 'Owned License',
        commercial: true,
        attribution: false,
        modifications: true,
        distribution: true
      }
    };
  }

  async validateLicense(track, usage) {
    const license = this.licenseTypes[track.license];
    
    if (!license) {
      throw new Error(`Unknown license type: ${track.license}`);
    }

    const requirements = {
      commercial: usage.commercial || false,
      attribution: license.attribution,
      modifications: usage.modifications || false,
      distribution: usage.distribution || false
    };

    // Check if license allows commercial use
    if (requirements.commercial && !license.commercial) {
      throw new Error(`License ${license.name} does not allow commercial use`);
    }

    // Generate attribution text if required
    let attributionText = null;
    if (license.attribution) {
      attributionText = this.generateAttribution(track);
    }

    return {
      valid: true,
      requirements,
      attributionText,
      license: license.name
    };
  }

  generateAttribution(track) {
    const parts = [];
    
    if (track.title) parts.push(`"${track.title}"`);
    if (track.artist) parts.push(`by ${track.artist}`);
    if (track.license) parts.push(`(${this.licenseTypes[track.license]?.name})`);
    if (track.provider === 'freesound') parts.push('via Freesound');
    
    return parts.join(' ');
  }

  async recordUsage(track, contentId, usage) {
    const usageRecord = {
      trackId: track.id,
      contentId,
      usage,
      timestamp: new Date(),
      license: track.license,
      attribution: await this.validateLicense(track, usage).then(v => v.attributionText),
      platform: usage.platform || 'unknown'
    };

    // Store in database for compliance tracking
    await this.database.run(`
      INSERT INTO music_usage_log 
      (track_id, content_id, usage_data, license_type, attribution_text, platform, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      track.id,
      contentId,
      JSON.stringify(usage),
      track.license,
      usageRecord.attribution,
      usage.platform,
      usageRecord.timestamp
    ]);

    return usageRecord;
  }
}
```

### 6. Smart Music Selection Algorithm

```javascript
class SmartMusicSelector {
  constructor() {
    this.musicLibrary = new StockMusicLibrary();
    this.contentAnalyzer = new ContentAnalyzer();
    this.userPreferences = new UserPreferenceManager();
  }

  async selectBestTrack(contentData, preferences = {}) {
    // Analyze content to determine optimal music characteristics
    const contentAnalysis = await this.analyzeContent(contentData);
    
    // Get user preferences and historical data
    const userPrefs = await this.userPreferences.getPreferences();
    const historicalData = await this.getHistoricalPerformance();
    
    // Generate music criteria
    const musicCriteria = this.generateMusicCriteria(
      contentAnalysis, 
      userPrefs, 
      preferences
    );
    
    // Search for matching tracks
    const candidates = await this.musicLibrary.searchMusic(musicCriteria);
    
    if (candidates.length === 0) {
      throw new Error('No suitable music tracks found');
    }
    
    // Score and rank candidates
    const rankedTracks = await this.rankTracks(
      candidates, 
      contentAnalysis, 
      historicalData
    );
    
    return rankedTracks[0]; // Return best match
  }

  async analyzeContent(contentData) {
    const {
      type, // 'showcase', 'tutorial', 'timelapse'
      images,
      duration,
      aquascapeStyle,
      mood,
      targetAudience
    } = contentData;

    // Analyze visual content for mood and energy
    const visualAnalysis = await this.contentAnalyzer.analyzeImages(images);
    
    return {
      contentType: type,
      visualMood: visualAnalysis.mood,
      colorPalette: visualAnalysis.dominantColors,
      visualEnergy: visualAnalysis.energy,
      duration,
      aquascapeStyle,
      suggestedMood: mood || visualAnalysis.mood,
      targetAudience,
      optimalMusicGenres: this.mapContentToGenres(type, aquascapeStyle)
    };
  }

  generateMusicCriteria(contentAnalysis, userPrefs, overrides) {
    const baseCriteria = {
      duration: {
        min: Math.max(contentAnalysis.duration - 15, 30),
        max: contentAnalysis.duration + 30
      },
      mood: contentAnalysis.suggestedMood,
      energy: contentAnalysis.visualEnergy,
      genre: contentAnalysis.optimalMusicGenres,
      license: 'creative_commons_0'
    };

    // Apply user preferences
    if (userPrefs.preferredGenres) {
      baseCriteria.genre = userPrefs.preferredGenres.filter(g => 
        baseCriteria.genre.includes(g)
      );
    }

    // Apply overrides
    return { ...baseCriteria, ...overrides };
  }

  async rankTracks(tracks, contentAnalysis, historicalData) {
    const rankedTracks = [];

    for (const track of tracks) {
      const score = await this.calculateTrackScore(
        track, 
        contentAnalysis, 
        historicalData
      );
      
      rankedTracks.push({
        ...track,
        selectionScore: score,
        selectionReasons: score.reasons
      });
    }

    return rankedTracks.sort((a, b) => 
      b.selectionScore.overall - a.selectionScore.overall
    );
  }

  async calculateTrackScore(track, contentAnalysis, historicalData) {
    let score = 0;
    const reasons = [];

    // Mood compatibility (30%)
    const moodScore = this.scoreMoodMatch(track.mood, contentAnalysis.suggestedMood);
    score += moodScore * 0.3;
    if (moodScore > 0.8) reasons.push('Perfect mood match');

    // Duration compatibility (20%)
    const durationScore = this.scoreDurationMatch(track.duration, contentAnalysis.duration);
    score += durationScore * 0.2;
    if (durationScore > 0.9) reasons.push('Ideal duration');

    // Genre preference (20%)
    const genreScore = this.scoreGenreMatch(track.genre, contentAnalysis.optimalMusicGenres);
    score += genreScore * 0.2;
    if (genreScore > 0.8) reasons.push('Preferred genre');

    // Historical performance (15%)
    const historyScore = this.scoreHistoricalPerformance(track, historicalData);
    score += historyScore * 0.15;
    if (historyScore > 0.7) reasons.push('Good historical performance');

    // License compatibility (10%)
    const licenseScore = track.license === 'creative_commons_0' ? 1.0 : 0.8;
    score += licenseScore * 0.1;

    // Quality indicators (5%)
    const qualityScore = this.scoreQuality(track);
    score += qualityScore * 0.05;

    return {
      overall: score,
      mood: moodScore,
      duration: durationScore,
      genre: genreScore,
      history: historyScore,
      license: licenseScore,
      quality: qualityScore,
      reasons
    };
  }
}
```

### 7. Database Schema for Music Management

```sql
-- Music library tracking
CREATE TABLE music_tracks (
    id TEXT PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    provider_id TEXT,
    title TEXT NOT NULL,
    artist TEXT,
    album TEXT,
    duration INTEGER, -- in seconds
    genre VARCHAR(100),
    mood VARCHAR(50),
    bpm INTEGER,
    music_key VARCHAR(20),
    energy_level REAL, -- 0.0 to 1.0
    license_type VARCHAR(50),
    file_path TEXT,
    preview_url TEXT,
    download_url TEXT,
    tags TEXT, -- JSON array of tags
    instruments TEXT, -- JSON array of instruments
    audio_features TEXT, -- JSON object with detailed audio features
    usage_count INTEGER DEFAULT 0,
    last_used DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Music usage logging for compliance
CREATE TABLE music_usage_log (
    id TEXT PRIMARY KEY,
    track_id TEXT REFERENCES music_tracks(id),
    content_id TEXT,
    usage_data TEXT, -- JSON with usage details
    license_type VARCHAR(50),
    attribution_text TEXT,
    platform VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User music preferences
CREATE TABLE user_music_preferences (
    user_id TEXT,
    preferred_genres TEXT, -- JSON array
    preferred_moods TEXT, -- JSON array
    energy_preference REAL, -- 0.0 to 1.0
    avoid_genres TEXT, -- JSON array
    custom_settings TEXT, -- JSON object
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);

-- Music performance analytics
CREATE TABLE music_performance (
    track_id TEXT REFERENCES music_tracks(id),
    content_id TEXT,
    platform VARCHAR(50),
    engagement_metrics TEXT, -- JSON with views, likes, shares, etc.
    performance_score REAL, -- calculated performance metric
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (track_id, content_id, platform)
);
```

This stock music integration system provides:

- **Multi-provider music library** with intelligent search and filtering
- **Smart mood classification** using audio analysis and metadata
- **Automated licensing compliance** with usage tracking
- **Audio processing pipeline** for video synchronization
- **Content-aware music selection** using AI analysis
- **Local music library support** with metadata extraction
- **Performance analytics** to improve future selections
- **Seamless integration** with video generation pipeline