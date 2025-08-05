# Automation Pipelines & Web Scraping Research
## Aquascaping Content Generation Engine

**Document Version:** 1.0  
**Last Updated:** August 5, 2025  
**Target Project:** AquaScene Content Automation

---

## Executive Summary

This document provides comprehensive technical research and implementation guidelines for building automated content generation pipelines for aquascaping content. The system will leverage web scraping, social media APIs, and AI content generation to create continuous, high-quality aquascaping content across multiple platforms.

### Key Objectives
- Automated data collection from aquascaping communities and sources
- AI-powered content generation and curation
- Multi-platform content distribution with compliance focus
- Real-time monitoring and quality control systems
- Scalable architecture for growing content demands

---

## 1. Web Scraping Stack

### 1.1 Core Python Libraries

#### Primary Scraping Framework
```python
# requirements.txt
requests==2.31.0
httpx==0.25.0          # Modern async HTTP client
beautifulsoup4==4.12.2
lxml==4.9.3
selenium==4.15.0
playwright==1.40.0     # Modern browser automation
scrapy==2.11.0         # Industrial-strength scraping

# Additional parsing
selectolax==0.3.17     # Fast HTML parser
pyquery==2.0.0         # jQuery-like syntax for Python
```

#### Advanced Scraping Tools
```python
# Anti-detection and rotating
requests-html==0.10.0
cloudscraper==1.2.71   # Cloudflare bypass
fake-useragent==1.4.0
user-agent==0.1.10

# Browser automation
undetected-chromedriver==3.5.4
seleniumwire==5.1.0    # Request/response interception
```

### 1.2 Proxy Management & Anti-Detection

#### Proxy Rotation System
```python
import random
import time
from itertools import cycle
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class ProxyRotator:
    def __init__(self, proxy_list):
        self.proxies = cycle(proxy_list)
        self.current_proxy = None
        
    def get_session(self):
        session = requests.Session()
        
        # Retry strategy
        retry_strategy = Retry(
            total=3,
            status_forcelist=[429, 500, 502, 503, 504],
            backoff_factor=1
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        # Rotate proxy
        self.current_proxy = next(self.proxies)
        session.proxies = {
            'http': self.current_proxy,
            'https': self.current_proxy
        }
        
        # Random user agent
        session.headers.update({
            'User-Agent': self.get_random_user_agent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
        
        return session
    
    def get_random_user_agent(self):
        user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        ]
        return random.choice(user_agents)
```

#### Advanced Anti-Detection
```python
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class StealthScraper:
    def __init__(self):
        self.options = uc.ChromeOptions()
        self.options.add_argument('--no-sandbox')
        self.options.add_argument('--disable-dev-shm-usage')
        self.options.add_argument('--disable-blink-features=AutomationControlled')
        self.options.add_experimental_option("excludeSwitches", ["enable-automation"])
        self.options.add_experimental_option('useAutomationExtension', False)
        
    def create_driver(self):
        driver = uc.Chrome(options=self.options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        return driver
    
    def human_like_scroll(self, driver):
        # Simulate human scrolling patterns
        scroll_pause_time = random.uniform(0.5, 2.0)
        screen_height = driver.execute_script("return window.screen.height;")
        
        i = 1
        while True:
            driver.execute_script(f"window.scrollTo(0, {screen_height}*{i});")
            i += 1
            time.sleep(scroll_pause_time)
            
            scroll_height = driver.execute_script("return document.body.scrollHeight;")
            if (screen_height) * i > scroll_height:
                break
```

### 1.3 Production-Ready Scraping Architecture

#### Distributed Scraping with Celery
```python
# celery_app.py
from celery import Celery
from kombu import Queue

app = Celery('aquascaping_scraper')
app.conf.update(
    broker_url='redis://localhost:6379/0',
    result_backend='redis://localhost:6379/0',
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_routes={
        'scraper.tasks.scrape_reddit': {'queue': 'reddit'},
        'scraper.tasks.scrape_instagram': {'queue': 'instagram'},
        'scraper.tasks.scrape_youtube': {'queue': 'youtube'},
    }
)

# Define queues with priority
app.conf.task_routes = {
    'scraper.tasks.*': {'queue': 'scraping'},
}

# Worker configuration
app.conf.worker_prefetch_multiplier = 1
app.conf.task_acks_late = True
```

#### Robust Error Handling & Retry Logic
```python
from celery import Task
from celery.exceptions import Retry
import logging

class CallbackTask(Task):
    def on_success(self, retval, task_id, args, kwargs):
        logging.info(f'Task {task_id} succeeded with result: {retval}')
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logging.error(f'Task {task_id} failed: {exc}')
        # Send alert to monitoring system
        send_alert(f'Scraping task failed: {task_id}', str(exc))

@app.task(bind=True, base=CallbackTask, autoretry_for=(Exception,), 
          retry_kwargs={'max_retries': 3, 'countdown': 60})
def scrape_with_retry(self, url, scraper_config):
    try:
        return perform_scraping(url, scraper_config)
    except Exception as exc:
        logging.warning(f'Scraping failed for {url}: {exc}')
        raise self.retry(exc=exc)
```

---

## 2. Content APIs Integration

### 2.1 Reddit API (PRAW)

#### Official Reddit API Setup
```python
import praw
from datetime import datetime, timedelta
import pandas as pd

class RedditCollector:
    def __init__(self, client_id, client_secret, user_agent):
        self.reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent
        )
    
    def collect_aquascaping_content(self, subreddits, time_filter='week', limit=100):
        """Collect aquascaping posts from multiple subreddits"""
        subreddit_list = [
            'Aquariums', 'PlantedTank', 'Aquascape', 
            'shrimptank', 'ReefTank', 'bettafish'
        ]
        
        all_posts = []
        
        for subreddit_name in subreddit_list:
            subreddit = self.reddit.subreddit(subreddit_name)
            
            # Get top posts from specified time period
            for post in subreddit.top(time_filter=time_filter, limit=limit):
                post_data = {
                    'id': post.id,
                    'title': post.title,
                    'score': post.score,
                    'url': post.url,
                    'selftext': post.selftext,
                    'created_utc': datetime.fromtimestamp(post.created_utc),
                    'num_comments': post.num_comments,
                    'subreddit': subreddit_name,
                    'author': str(post.author),
                    'permalink': post.permalink,
                    'is_video': post.is_video,
                    'media_url': self.extract_media_url(post)
                }
                all_posts.append(post_data)
        
        return pd.DataFrame(all_posts)
    
    def extract_media_url(self, post):
        """Extract direct media URLs from Reddit posts"""
        if hasattr(post, 'preview') and 'images' in post.preview:
            return post.preview['images'][0]['source']['url']
        elif post.url.endswith(('.jpg', '.png', '.gif')):
            return post.url
        return None
    
    def get_trending_keywords(self, posts_df):
        """Extract trending keywords from post titles and content"""
        from collections import Counter
        import re
        
        text_content = ' '.join(posts_df['title'] + ' ' + posts_df['selftext'])
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text_content.lower())
        
        # Filter aquascaping-related terms
        aqua_terms = [word for word in words if any(term in word for term in 
                     ['aqua', 'plant', 'tank', 'fish', 'scape', 'water'])]
        
        return Counter(aqua_terms).most_common(20)
```

### 2.2 YouTube Data API v3

#### YouTube Content Discovery
```python
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import isodate

class YouTubeCollector:
    def __init__(self, api_key):
        self.youtube = build('youtube', 'v3', developerKey=api_key)
    
    def search_aquascaping_videos(self, query='aquascaping', max_results=50):
        """Search for aquascaping videos with detailed metadata"""
        try:
            search_response = self.youtube.search().list(
                q=query,
                part='id,snippet',
                type='video',
                maxResults=max_results,
                order='relevance',
                publishedAfter=(datetime.now() - timedelta(days=30)).isoformat() + 'Z'
            ).execute()
            
            video_ids = [item['id']['videoId'] for item in search_response['items']]
            
            # Get detailed video statistics
            videos_response = self.youtube.videos().list(
                part='statistics,contentDetails,snippet',
                id=','.join(video_ids)
            ).execute()
            
            videos_data = []
            for video in videos_response['items']:
                duration = isodate.parse_duration(video['contentDetails']['duration'])
                
                video_data = {
                    'video_id': video['id'],
                    'title': video['snippet']['title'],
                    'description': video['snippet']['description'][:500],
                    'channel_title': video['snippet']['channelTitle'],
                    'published_at': video['snippet']['publishedAt'],
                    'duration_seconds': duration.total_seconds(),
                    'view_count': int(video['statistics'].get('viewCount', 0)),
                    'like_count': int(video['statistics'].get('likeCount', 0)),
                    'comment_count': int(video['statistics'].get('commentCount', 0)),
                    'thumbnail_url': video['snippet']['thumbnails']['high']['url']
                }
                videos_data.append(video_data)
            
            return pd.DataFrame(videos_data)
            
        except HttpError as e:
            print(f'YouTube API error: {e}')
            return pd.DataFrame()
    
    def get_channel_content(self, channel_id, max_results=25):
        """Get recent uploads from specific aquascaping channels"""
        try:
            # Get uploads playlist ID
            channel_response = self.youtube.channels().list(
                part='contentDetails',
                id=channel_id
            ).execute()
            
            uploads_playlist_id = channel_response['items'][0]['contentDetails']['relatedPlaylists']['uploads']
            
            # Get recent uploads
            playlist_response = self.youtube.playlistItems().list(
                part='snippet',
                playlistId=uploads_playlist_id,
                maxResults=max_results
            ).execute()
            
            return playlist_response['items']
            
        except HttpError as e:
            print(f'Channel content error: {e}')
            return []
```

### 2.3 Instagram Business API

#### Instagram Graph API Integration
```python
import requests
from datetime import datetime
import json

class InstagramCollector:
    def __init__(self, access_token, business_account_id):
        self.access_token = access_token
        self.business_account_id = business_account_id
        self.base_url = 'https://graph.facebook.com/v18.0'
    
    def get_account_media(self, limit=25):
        """Fetch recent media from Instagram Business account"""
        url = f"{self.base_url}/{self.business_account_id}/media"
        params = {
            'fields': 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
            'limit': limit,
            'access_token': self.access_token
        }
        
        response = requests.get(url, params=params)
        if response.status_code == 200:
            return response.json()['data']
        else:
            print(f"Error fetching media: {response.text}")
            return []
    
    def get_hashtag_insights(self, hashtag):
        """Get insights for specific hashtag performance"""
        # Note: This requires Instagram Basic Display API approval
        url = f"{self.base_url}/ig_hashtag_search"
        params = {
            'user_id': self.business_account_id,
            'q': hashtag,
            'access_token': self.access_token
        }
        
        response = requests.get(url, params=params)
        if response.status_code == 200:
            hashtag_data = response.json()
            return self.analyze_hashtag_performance(hashtag_data)
        return None
    
    def publish_content(self, image_url, caption, hashtags=None):
        """Publish content to Instagram (requires approval)"""
        if hashtags:
            caption += ' ' + ' '.join([f'#{tag}' for tag in hashtags])
        
        # Create media object
        create_url = f"{self.base_url}/{self.business_account_id}/media"
        create_params = {
            'image_url': image_url,
            'caption': caption,
            'access_token': self.access_token
        }
        
        create_response = requests.post(create_url, params=create_params)
        if create_response.status_code == 200:
            creation_id = create_response.json()['id']
            
            # Publish media object
            publish_url = f"{self.base_url}/{self.business_account_id}/media_publish"
            publish_params = {
                'creation_id': creation_id,
                'access_token': self.access_token
            }
            
            publish_response = requests.post(publish_url, params=publish_params)
            return publish_response.json()
        
        return None
```

---

## 3. Automation Frameworks

### 3.1 Apache Airflow DAG Implementation

#### Core Aquascaping Content Pipeline DAG
```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.sensors.filesystem import FileSensor
from datetime import datetime, timedelta
import pandas as pd

default_args = {
    'owner': 'aquascene-team',
    'depends_on_past': False,
    'start_date': datetime(2025, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
    'catchup': False
}

def collect_reddit_data(**context):
    """Task: Collect data from Reddit aquascaping communities"""
    from collectors.reddit_collector import RedditCollector
    
    collector = RedditCollector(
        client_id=context['params']['reddit_client_id'],
        client_secret=context['params']['reddit_client_secret'],
        user_agent='AquaSceneBot/1.0'
    )
    
    data = collector.collect_aquascaping_content(
        subreddits=['Aquariums', 'PlantedTank', 'Aquascape'],
        time_filter='day'
    )
    
    # Save to data lake
    data.to_parquet(f"/data/raw/reddit_{context['ds']}.parquet")
    return len(data)

def collect_youtube_data(**context):
    """Task: Collect YouTube video data"""
    from collectors.youtube_collector import YouTubeCollector
    
    collector = YouTubeCollector(api_key=context['params']['youtube_api_key'])
    data = collector.search_aquascaping_videos(max_results=100)
    
    data.to_parquet(f"/data/raw/youtube_{context['ds']}.parquet")
    return len(data)

def process_content_data(**context):
    """Task: Process and clean collected data"""
    import pandas as pd
    from processors.content_processor import ContentProcessor
    
    # Load raw data
    reddit_data = pd.read_parquet(f"/data/raw/reddit_{context['ds']}.parquet")
    youtube_data = pd.read_parquet(f"/data/raw/youtube_{context['ds']}.parquet")
    
    processor = ContentProcessor()
    
    # Clean and enrich data
    clean_reddit = processor.clean_reddit_data(reddit_data)
    clean_youtube = processor.clean_youtube_data(youtube_data)
    
    # Combine and deduplicate
    combined_data = processor.combine_sources(clean_reddit, clean_youtube)
    
    # Save processed data
    combined_data.to_parquet(f"/data/processed/combined_{context['ds']}.parquet")
    return len(combined_data)

def generate_ai_content(**context):
    """Task: Generate AI content from processed data"""
    from generators.ai_content_generator import AIContentGenerator
    
    # Load processed data
    data = pd.read_parquet(f"/data/processed/combined_{context['ds']}.parquet")
    
    generator = AIContentGenerator()
    generated_content = generator.create_content_batch(data, content_types=['post', 'story', 'reel'])
    
    # Save generated content
    generated_content.to_json(f"/data/generated/content_{context['ds']}.json")
    return len(generated_content)

def quality_check(**context):
    """Task: Quality control for generated content"""
    from validators.content_validator import ContentValidator
    
    # Load generated content
    with open(f"/data/generated/content_{context['ds']}.json") as f:
        content = json.load(f)
    
    validator = ContentValidator()
    validated_content = validator.validate_batch(content)
    
    # Filter out low-quality content
    high_quality_content = [c for c in validated_content if c['quality_score'] > 0.7]
    
    with open(f"/data/validated/content_{context['ds']}.json", 'w') as f:
        json.dump(high_quality_content, f)
    
    return len(high_quality_content)

# Define DAG
dag = DAG(
    'aquascaping_content_pipeline',
    default_args=default_args,
    description='Daily aquascaping content collection and generation',
    schedule_interval='0 6 * * *',  # Run daily at 6 AM
    params={
        'reddit_client_id': 'your_reddit_client_id',
        'reddit_client_secret': 'your_reddit_client_secret',
        'youtube_api_key': 'your_youtube_api_key'
    }
)

# Define tasks
collect_reddit = PythonOperator(
    task_id='collect_reddit_data',
    python_callable=collect_reddit_data,
    dag=dag
)

collect_youtube = PythonOperator(
    task_id='collect_youtube_data',
    python_callable=collect_youtube_data,
    dag=dag
)

process_data = PythonOperator(
    task_id='process_content_data',
    python_callable=process_content_data,
    dag=dag
)

generate_content = PythonOperator(
    task_id='generate_ai_content',
    python_callable=generate_ai_content,
    dag=dag
)

quality_control = PythonOperator(
    task_id='quality_check',
    python_callable=quality_check,
    dag=dag
)

# Set task dependencies
[collect_reddit, collect_youtube] >> process_data >> generate_content >> quality_control
```

### 3.2 GitHub Actions Workflow

#### Continuous Content Pipeline
```yaml
# .github/workflows/content-pipeline.yml
name: Aquascaping Content Pipeline

on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC
  workflow_dispatch:     # Manual trigger
  push:
    branches: [main]
    paths: ['src/**', 'config/**']

env:
  PYTHON_VERSION: '3.11'
  NODE_VERSION: '18'

jobs:
  data-collection:
    runs-on: ubuntu-latest
    outputs:
      data-available: ${{ steps.check-data.outputs.has-data }}
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}
    
    - name: Cache dependencies
      uses: actions/cache@v3
      with:
        path: ~/.cache/pip
        key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
    
    - name: Collect Reddit Data
      env:
        REDDIT_CLIENT_ID: ${{ secrets.REDDIT_CLIENT_ID }}
        REDDIT_CLIENT_SECRET: ${{ secrets.REDDIT_CLIENT_SECRET }}
      run: |
        python src/collectors/reddit_collector.py --output data/reddit_$(date +%Y%m%d).json
    
    - name: Collect YouTube Data
      env:
        YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
      run: |
        python src/collectors/youtube_collector.py --output data/youtube_$(date +%Y%m%d).json
    
    - name: Check Data Availability
      id: check-data
      run: |
        if [ -f "data/reddit_$(date +%Y%m%d).json" ] && [ -f "data/youtube_$(date +%Y%m%d).json" ]; then
          echo "has-data=true" >> $GITHUB_OUTPUT
        else
          echo "has-data=false" >> $GITHUB_OUTPUT
        fi
    
    - name: Upload data artifacts
      uses: actions/upload-artifact@v3
      with:
        name: raw-data-${{ github.run_id }}
        path: data/
        retention-days: 7

  content-generation:
    needs: data-collection
    if: needs.data-collection.outputs.data-available == 'true'
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Download data artifacts
      uses: actions/download-artifact@v3
      with:
        name: raw-data-${{ github.run_id }}
        path: data/
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}
    
    - name: Install dependencies
      run: pip install -r requirements.txt
    
    - name: Process Raw Data
      run: |
        python src/processors/data_processor.py \
          --reddit-file data/reddit_$(date +%Y%m%d).json \
          --youtube-file data/youtube_$(date +%Y%m%d).json \
          --output data/processed_$(date +%Y%m%d).json
    
    - name: Generate AI Content
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
      run: |
        python src/generators/ai_content_generator.py \
          --input data/processed_$(date +%Y%m%d).json \
          --output data/generated_$(date +%Y%m%d).json \
          --content-types post,story,reel
    
    - name: Quality Control
      run: |
        python src/validators/content_validator.py \
          --input data/generated_$(date +%Y%m%d).json \
          --output data/validated_$(date +%Y%m%d).json \
          --min-quality-score 0.7
    
    - name: Upload generated content
      uses: actions/upload-artifact@v3
      with:
        name: generated-content-${{ github.run_id }}
        path: data/validated_*.json
        retention-days: 30

  content-publishing:
    needs: content-generation
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Download generated content
      uses: actions/download-artifact@v3
      with:
        name: generated-content-${{ github.run_id }}
        path: data/
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ env.PYTHON_VERSION }}
    
    - name: Install dependencies
      run: pip install -r requirements.txt
    
    - name: Schedule Instagram Posts
      env:
        INSTAGRAM_ACCESS_TOKEN: ${{ secrets.INSTAGRAM_ACCESS_TOKEN }}
        INSTAGRAM_BUSINESS_ACCOUNT_ID: ${{ secrets.INSTAGRAM_BUSINESS_ACCOUNT_ID }}
      run: |
        python src/publishers/instagram_publisher.py \
          --input data/validated_$(date +%Y%m%d).json \
          --schedule-mode automatic \
          --max-posts-per-day 3
    
    - name: Update Content Database
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
      run: |
        python src/database/content_updater.py \
          --input data/validated_$(date +%Y%m%d).json
    
    - name: Send Success Notification
      if: success()
      uses: 8398a7/action-slack@v3
      with:
        status: success
        text: 'Content pipeline completed successfully! Generated and scheduled new aquascaping content.'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
    
    - name: Send Failure Notification
      if: failure()
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        text: 'Content pipeline failed! Please check the logs.'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 3.3 Cron-based Scheduling System

#### Production Cron Configuration
```bash
# /etc/crontab - Production scheduling

# Data collection every 6 hours
0 */6 * * * /usr/local/bin/python /opt/aquascene/collectors/continuous_collector.py >> /var/log/aquascene/collection.log 2>&1

# Content generation daily at 7 AM
0 7 * * * /usr/local/bin/python /opt/aquascene/generators/daily_generator.py >> /var/log/aquascene/generation.log 2>&1

# Instagram posting - 3 times daily
0 9,13,17 * * * /usr/local/bin/python /opt/aquascene/publishers/instagram_scheduler.py >> /var/log/aquascene/publishing.log 2>&1

# Cleanup old data weekly
0 2 * * 0 /usr/local/bin/python /opt/aquascene/maintenance/cleanup.py >> /var/log/aquascene/cleanup.log 2>&1

# Health check every 30 minutes
*/30 * * * * /usr/local/bin/python /opt/aquascene/monitoring/health_check.py >> /var/log/aquascene/health.log 2>&1

# Database backup daily at 3 AM
0 3 * * * /opt/aquascene/scripts/backup_database.sh >> /var/log/aquascene/backup.log 2>&1
```

---

## 4. AI Content Generation

### 4.1 OpenAI Integration

#### GPT-4 Content Generation System
```python
import openai
from typing import List, Dict, Any
import json
import time
from dataclasses import dataclass

@dataclass
class ContentRequest:
    content_type: str  # 'post', 'story', 'reel', 'article'
    source_data: Dict[Any, Any]
    target_platform: str
    tone: str = 'educational'
    length: str = 'medium'

class OpenAIContentGenerator:
    def __init__(self, api_key: str, model: str = "gpt-4-turbo-preview"):
        self.client = openai.OpenAI(api_key=api_key)
        self.model = model
        self.rate_limit_delay = 1  # seconds between requests
    
    def generate_instagram_post(self, aquascaping_data: Dict) -> Dict:
        """Generate Instagram post from aquascaping content"""
        prompt = f"""
        Create an engaging Instagram post about aquascaping based on this data:
        
        Title: {aquascaping_data.get('title', 'Unknown')}
        Description: {aquascaping_data.get('description', 'No description')}
        Tags: {aquascaping_data.get('tags', [])}
        
        Requirements:
        - Write in an educational yet engaging tone
        - Include 3-5 relevant hashtags
        - Keep caption under 200 words
        - Include a call-to-action
        - Focus on aquascaping techniques or tips
        
        Format as JSON with keys: caption, hashtags, call_to_action
        """
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are an expert aquascaping content creator who creates engaging social media posts."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        time.sleep(self.rate_limit_delay)
        return json.loads(response.choices[0].message.content)
    
    def generate_educational_content(self, topic: str, source_data: List[Dict]) -> Dict:
        """Generate educational aquascaping content"""
        combined_info = "\n".join([
            f"- {item.get('title', '')}: {item.get('description', '')[:200]}"
            for item in source_data[:5]
        ])
        
        prompt = f"""
        Create educational content about {topic} in aquascaping.
        
        Source information:
        {combined_info}
        
        Create:
        1. A comprehensive guide post (300-500 words)
        2. 3 quick tips for social media
        3. A beginner-friendly explanation
        4. Advanced techniques section
        
        Format as JSON with keys: guide, quick_tips, beginner_guide, advanced_tips
        """
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are an aquascaping expert and educator with 10+ years of experience."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=1500
        )
        
        time.sleep(self.rate_limit_delay)
        return json.loads(response.choices[0].message.content)
    
    def generate_content_batch(self, requests: List[ContentRequest]) -> List[Dict]:
        """Generate multiple pieces of content efficiently"""
        results = []
        
        for request in requests:
            try:
                if request.content_type == 'instagram_post':
                    content = self.generate_instagram_post(request.source_data)
                elif request.content_type == 'educational':
                    content = self.generate_educational_content(
                        request.source_data.get('topic', 'aquascaping'),
                        request.source_data.get('sources', [])
                    )
                else:
                    content = self.generate_generic_content(request)
                
                results.append({
                    'request_id': id(request),
                    'content_type': request.content_type,
                    'content': content,
                    'generated_at': time.time(),
                    'status': 'success'
                })
                
            except Exception as e:
                results.append({
                    'request_id': id(request),
                    'content_type': request.content_type,
                    'error': str(e),
                    'status': 'failed'
                })
        
        return results
```

### 4.2 Claude (Anthropic) Integration

#### Claude-3 Content Generation
```python
import anthropic
from typing import List, Dict
import asyncio

class ClaudeContentGenerator:
    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = "claude-3-sonnet-20240229"
    
    def generate_aquascaping_guide(self, topic: str, source_data: List[Dict]) -> str:
        """Generate comprehensive aquascaping guides using Claude"""
        
        source_summary = self.summarize_sources(source_data)
        
        prompt = f"""
        I need you to create a comprehensive aquascaping guide about {topic}.
        
        Here's the source material I've gathered:
        {source_summary}
        
        Please create:
        1. An introduction that hooks the reader
        2. Step-by-step instructions with clear explanations
        3. Common mistakes to avoid
        4. Pro tips from experienced aquascapers
        5. Equipment recommendations
        6. Maintenance guidelines
        
        Write in a friendly, educational tone that's accessible to beginners but valuable to experienced aquascapers too.
        Target length: 800-1200 words.
        """
        
        response = self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            temperature=0.3,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return response.content[0].text
    
    def generate_social_media_series(self, theme: str, post_count: int = 5) -> List[Dict]:
        """Generate a series of connected social media posts"""
        
        prompt = f"""
        Create a {post_count}-part social media series about {theme} in aquascaping.
        
        Each post should:
        - Build on the previous post
        - Be engaging and educational
        - Include relevant hashtags
        - Have a clear call-to-action
        - Be optimized for Instagram (caption + hashtags)
        
        Format each post as:
        Post X of {post_count}: [Title]
        Caption: [content]
        Hashtags: [5-8 relevant hashtags]
        CTA: [call to action]
        
        Make sure the series tells a complete story about {theme}.
        """
        
        response = self.client.messages.create(
            model=self.model,
            max_tokens=3000,
            temperature=0.4,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return self.parse_social_series(response.content[0].text)
    
    def summarize_sources(self, sources: List[Dict]) -> str:
        """Summarize source material for content generation"""
        summaries = []
        for source in sources[:10]:  # Limit to prevent token overflow
            title = source.get('title', 'Unknown')
            content = source.get('description', source.get('content', ''))[:300]
            summaries.append(f"• {title}: {content}")
        
        return "\n".join(summaries)
    
    def parse_social_series(self, response_text: str) -> List[Dict]:
        """Parse Claude's response into structured social media posts"""
        posts = []
        current_post = {}
        
        lines = response_text.split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith('Post '):
                if current_post:
                    posts.append(current_post)
                current_post = {'title': line}
            elif line.startswith('Caption:'):
                current_post['caption'] = line.replace('Caption:', '').strip()
            elif line.startswith('Hashtags:'):
                hashtags = line.replace('Hashtags:', '').strip()
                current_post['hashtags'] = [tag.strip() for tag in hashtags.split('#') if tag.strip()]
            elif line.startswith('CTA:'):
                current_post['cta'] = line.replace('CTA:', '').strip()
        
        if current_post:
            posts.append(current_post)
        
        return posts
```

### 4.3 Local LLM Implementation

#### Ollama Integration for Cost-Effective Generation
```python
import requests
import json
from typing import Optional, Dict, List

class OllamaContentGenerator:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.model = "llama2:13b"  # or "codellama", "mistral"
    
    def generate_content(self, prompt: str, max_tokens: int = 500) -> Optional[str]:
        """Generate content using local Ollama instance"""
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": max_tokens,
                "temperature": 0.7,
                "top_p": 0.9
            }
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=300
            )
            
            if response.status_code == 200:
                return response.json()['response']
            else:
                print(f"Ollama API error: {response.status_code}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"Connection error to Ollama: {e}")
            return None
    
    def generate_aquascaping_tips(self, difficulty_level: str = "beginner") -> List[str]:
        """Generate aquascaping tips for different skill levels"""
        
        prompt = f"""
        Generate 5 practical aquascaping tips for {difficulty_level} level aquarium enthusiasts.
        
        Each tip should be:
        - Specific and actionable
        - Include reasoning why it's important
        - Be 2-3 sentences long
        
        Format as a numbered list.
        """
        
        response = self.generate_content(prompt, max_tokens=800)
        if response:
            # Parse the response into individual tips
            tips = []
            for line in response.split('\n'):
                if line.strip() and (line.strip()[0].isdigit() or line.strip().startswith('•')):
                    tips.append(line.strip())
            return tips
        
        return []
    
    def generate_plant_care_guide(self, plant_name: str) -> Dict[str, str]:
        """Generate care guide for specific aquarium plants"""
        
        prompt = f"""
        Create a comprehensive care guide for {plant_name} in aquariums.
        
        Include sections for:
        - Light requirements
        - CO2 needs
        - Fertilization
        - Planting tips
        - Common problems
        - Propagation methods
        
        Keep each section concise but informative.
        """
        
        response = self.generate_content(prompt, max_tokens=1000)
        if response:
            # Parse response into structured guide
            guide = self.parse_plant_guide(response)
            return guide
        
        return {}
    
    def parse_plant_guide(self, text: str) -> Dict[str, str]:
        """Parse plant guide response into structured format"""
        guide = {}
        current_section = None
        
        for line in text.split('\n'):
            line = line.strip()
            if ':' in line and len(line.split(':')[0]) < 30:
                # Likely a section header
                current_section = line.split(':')[0].strip()
                guide[current_section] = line.split(':', 1)[1].strip()
            elif current_section and line:
                # Continue content for current section
                guide[current_section] += ' ' + line
        
        return guide
```

### 4.4 AI Content Quality Assessment

#### Content Quality Scoring System
```python
import re
from textblob import TextBlob
from transformers import pipeline
import spacy

class ContentQualityAssessor:
    def __init__(self):
        # Load models for quality assessment
        self.sentiment_analyzer = pipeline("sentiment-analysis")
        self.nlp = spacy.load("en_core_web_sm")
        
        # Quality criteria weights
        self.criteria_weights = {
            'readability': 0.25,
            'engagement': 0.25,
            'accuracy': 0.20,
            'uniqueness': 0.15,
            'compliance': 0.15
        }
    
    def assess_content_quality(self, content: Dict) -> Dict:
        """Comprehensive content quality assessment"""
        
        text = content.get('caption', '') + ' ' + content.get('description', '')
        
        scores = {
            'readability': self.assess_readability(text),
            'engagement': self.assess_engagement_potential(content),
            'accuracy': self.assess_factual_accuracy(text),
            'uniqueness': self.assess_uniqueness(text),
            'compliance': self.assess_platform_compliance(content)
        }
        
        # Calculate weighted overall score
        overall_score = sum(
            scores[criterion] * weight 
            for criterion, weight in self.criteria_weights.items()
        )
        
        return {
            'overall_score': overall_score,
            'detailed_scores': scores,
            'recommendations': self.generate_recommendations(scores),
            'approval_status': 'approved' if overall_score > 0.7 else 'needs_review'
        }
    
    def assess_readability(self, text: str) -> float:
        """Assess text readability using multiple metrics"""
        if not text.strip():
            return 0.0
        
        # Basic readability metrics
        sentences = len(re.split(r'[.!?]+', text))
        words = len(text.split())
        
        if sentences == 0:
            return 0.0
        
        avg_sentence_length = words / sentences
        
        # Ideal sentence length for social media: 15-20 words
        if 10 <= avg_sentence_length <= 25:
            length_score = 1.0
        elif avg_sentence_length < 10:
            length_score = 0.8
        else:
            length_score = max(0.3, 1.0 - (avg_sentence_length - 25) / 50)
        
        # Check for technical jargon complexity
        doc = self.nlp(text)
        complex_words = sum(1 for token in doc if len(token.text) > 8 and token.pos_ in ['NOUN', 'ADJ'])
        complexity_ratio = complex_words / len(doc) if len(doc) > 0 else 0
        
        complexity_score = max(0.2, 1.0 - complexity_ratio * 2)
        
        return (length_score + complexity_score) / 2
    
    def assess_engagement_potential(self, content: Dict) -> float:
        """Assess potential for user engagement"""
        
        score = 0.0
        
        # Check for call-to-action
        text = (content.get('caption', '') + ' ' + content.get('cta', '')).lower()
        cta_phrases = ['comment', 'share', 'tag', 'follow', 'like', 'save', 'try', 'what do you think']
        
        if any(phrase in text for phrase in cta_phrases):
            score += 0.3
        
        # Check for questions
        if '?' in text:
            score += 0.2
        
        # Check for hashtags
        hashtags = content.get('hashtags', [])
        if 3 <= len(hashtags) <= 10:
            score += 0.2
        elif len(hashtags) > 0:
            score += 0.1
        
        # Check sentiment positivity
        sentiment = self.sentiment_analyzer(text[:500])[0]  # Limit text length
        if sentiment['label'] == 'POSITIVE' and sentiment['score'] > 0.7:
            score += 0.3
        
        return min(1.0, score)
    
    def assess_factual_accuracy(self, text: str) -> float:
        """Basic factual accuracy assessment for aquascaping content"""
        
        # Aquascaping fact patterns (basic implementation)
        aquascaping_terms = [
            'co2', 'carbon dioxide', 'fertilizer', 'substrate', 'lighting',
            'aquatic plants', 'fish', 'nitrogen cycle', 'ph', 'hardscape'
        ]
        
        # Check for presence of domain-relevant terms
        text_lower = text.lower()
        relevant_terms = sum(1 for term in aquascaping_terms if term in text_lower)
        
        if relevant_terms == 0:
            return 0.5  # Neutral - might not be aquascaping content
        
        # Basic fact-checking patterns
        suspicious_patterns = [
            r'(\d+)\s*%\s*(of|more|less)',  # Specific percentages without sources
            r'always|never|all|none',       # Absolute statements
            r'guaranteed|100%|instant'      # Unrealistic claims
        ]
        
        suspicious_count = sum(len(re.findall(pattern, text_lower)) for pattern in suspicious_patterns)
        
        if suspicious_count > 2:
            return 0.3
        elif suspicious_count > 0:
            return 0.7
        else:
            return 0.9
    
    def assess_uniqueness(self, text: str) -> float:
        """Assess content uniqueness (basic implementation)"""
        # This would typically check against a database of existing content
        # For now, we'll use text complexity as a proxy
        
        doc = self.nlp(text)
        
        # Check vocabulary diversity
        unique_lemmas = set(token.lemma_.lower() for token in doc if token.is_alpha)
        total_words = len([token for token in doc if token.is_alpha])
        
        if total_words == 0:
            return 0.0
        
        vocabulary_diversity = len(unique_lemmas) / total_words
        
        # Normalize to 0-1 scale
        uniqueness_score = min(1.0, vocabulary_diversity * 2)
        
        return uniqueness_score
    
    def assess_platform_compliance(self, content: Dict) -> float:
        """Check compliance with platform guidelines"""
        
        score = 1.0
        text = content.get('caption', '') + ' ' + content.get('description', '')
        
        # Check for prohibited content patterns
        prohibited_patterns = [
            r'buy now|purchase|sale|discount|\$\d+',  # Commercial promotion
            r'follow for follow|f4f|like for like',   # Engagement manipulation
        ]
        
        for pattern in prohibited_patterns:
            if re.search(pattern, text.lower()):
                score -= 0.3
        
        # Check hashtag limits (Instagram: max 30)
        hashtags = content.get('hashtags', [])
        if len(hashtags) > 30:
            score -= 0.2
        
        # Check caption length (Instagram: 2200 chars)
        if len(content.get('caption', '')) > 2200:
            score -= 0.2
        
        return max(0.0, score)
    
    def generate_recommendations(self, scores: Dict) -> List[str]:
        """Generate improvement recommendations based on scores"""
        
        recommendations = []
        
        if scores['readability'] < 0.6:
            recommendations.append("Simplify sentence structure and reduce technical jargon")
        
        if scores['engagement'] < 0.5:
            recommendations.append("Add call-to-action and engaging questions")
        
        if scores['accuracy'] < 0.7:
            recommendations.append("Verify facts and avoid absolute statements")
        
        if scores['uniqueness'] < 0.5:
            recommendations.append("Increase vocabulary diversity and original insights")
        
        if scores['compliance'] < 0.8:
            recommendations.append("Review platform guidelines for prohibited content")
        
        return recommendations
```

---

## 5. Instagram Automation & Compliance

### 5.1 Instagram Business API Compliance

#### Official API Implementation
```python
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import time

class InstagramBusinessAPI:
    def __init__(self, access_token: str, business_account_id: str):
        self.access_token = access_token
        self.business_account_id = business_account_id
        self.base_url = "https://graph.facebook.com/v18.0"
        
        # Rate limiting
        self.requests_per_hour = 200  # Instagram API limit
        self.request_timestamps = []
    
    def _check_rate_limit(self):
        """Enforce rate limiting to stay within API limits"""
        now = datetime.now()
        # Remove timestamps older than 1 hour
        self.request_timestamps = [
            ts for ts in self.request_timestamps 
            if now - ts < timedelta(hours=1)
        ]
        
        if len(self.request_timestamps) >= self.requests_per_hour:
            sleep_time = 3600 - (now - self.request_timestamps[0]).total_seconds()
            if sleep_time > 0:
                time.sleep(sleep_time)
        
        self.request_timestamps.append(now)
    
    def _make_request(self, endpoint: str, method: str = 'GET', params: Dict = None, data: Dict = None) -> Optional[Dict]:
        """Make API request with error handling and rate limiting"""
        self._check_rate_limit()
        
        url = f"{self.base_url}/{endpoint}"
        params = params or {}
        params['access_token'] = self.access_token
        
        try:
            if method == 'GET':
                response = requests.get(url, params=params)
            elif method == 'POST':
                response = requests.post(url, params=params, data=data)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.HTTPError as e:
            if response.status_code == 429:
                # Rate limit exceeded, wait and retry
                time.sleep(60)
                return self._make_request(endpoint, method, params, data)
            else:
                print(f"HTTP Error {response.status_code}: {response.text}")
                return None
        except Exception as e:
            print(f"Request error: {e}")
            return None
    
    def create_media_object(self, media_url: str, caption: str, media_type: str = 'IMAGE') -> Optional[str]:
        """Create media object for publishing"""
        
        endpoint = f"{self.business_account_id}/media"
        data = {
            'image_url': media_url if media_type == 'IMAGE' else None,
            'video_url': media_url if media_type == 'VIDEO' else None,
            'caption': caption,
            'media_type': media_type
        }
        
        # Remove None values
        data = {k: v for k, v in data.items() if v is not None}
        
        response = self._make_request(endpoint, method='POST', data=data)
        
        if response and 'id' in response:
            return response['id']
        return None
    
    def publish_media(self, creation_id: str) -> Optional[Dict]:
        """Publish previously created media object"""
        
        endpoint = f"{self.business_account_id}/media_publish"
        data = {'creation_id': creation_id}
        
        return self._make_request(endpoint, method='POST', data=data)
    
    def schedule_content(self, content_list: List[Dict], posts_per_day: int = 3) -> List[Dict]:
        """Schedule content publishing with compliance checks"""
        
        scheduled_posts = []
        posting_interval = 24 // posts_per_day * 3600  # seconds between posts
        
        for i, content in enumerate(content_list):
            # Compliance checks
            if not self._validate_content_compliance(content):
                continue
            
            # Create media object
            media_id = self.create_media_object(
                media_url=content['media_url'],
                caption=content['caption'],
                media_type=content.get('media_type', 'IMAGE')
            )
            
            if media_id:
                # Calculate posting time
                posting_time = datetime.now() + timedelta(seconds=i * posting_interval)
                
                scheduled_posts.append({
                    'media_id': media_id,
                    'content': content,
                    'scheduled_time': posting_time,
                    'status': 'scheduled'
                })
                
                # Add delay to avoid overwhelming the API
                time.sleep(2)
        
        return scheduled_posts
    
    def _validate_content_compliance(self, content: Dict) -> bool:
        """Validate content against Instagram policies"""
        
        caption = content.get('caption', '')
        
        # Check caption length (2200 character limit)
        if len(caption) > 2200:
            return False
        
        # Check for prohibited content patterns
        prohibited_terms = [
            'follow for follow', 'f4f', 'like for like', 'l4l',
            'engagement pods', 'bot', 'automated'
        ]
        
        caption_lower = caption.lower()
        if any(term in caption_lower for term in prohibited_terms):
            return False
        
        # Check hashtag count (30 max)
        hashtag_count = caption.count('#')
        if hashtag_count > 30:
            return False
        
        # Check for spam patterns
        if self._detect_spam_patterns(caption):
            return False
        
        return True
    
    def _detect_spam_patterns(self, text: str) -> bool:
        """Detect spam patterns in content"""
        
        # Excessive repetition
        words = text.lower().split()
        word_count = {}
        for word in words:
            word_count[word] = word_count.get(word, 0) + 1
        
        # Check if any word appears more than 5 times
        if any(count > 5 for count in word_count.values()):
            return True
        
        # Excessive punctuation
        punctuation_ratio = sum(1 for char in text if char in '!?.,;:') / len(text) if text else 0
        if punctuation_ratio > 0.1:
            return True
        
        return False
    
    def get_account_insights(self, metrics: List[str] = None, period: str = 'day') -> Dict:
        """Get Instagram account insights"""
        
        if metrics is None:
            metrics = ['impressions', 'reach', 'profile_views', 'follower_count']
        
        endpoint = f"{self.business_account_id}/insights"
        params = {
            'metric': ','.join(metrics),
            'period': period
        }
        
        return self._make_request(endpoint, params=params) or {}
    
    def get_media_insights(self, media_id: str) -> Dict:
        """Get insights for specific media posts"""
        
        endpoint = f"{media_id}/insights"
        params = {
            'metric': 'impressions,reach,engagement,saves,profile_visits_from_post'
        }
        
        return self._make_request(endpoint, params=params) or {}
```

### 5.2 Content Scheduling System

#### Advanced Scheduling with Optimal Timing
```python
import sqlite3
import json
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
import numpy as np
from sklearn.cluster import KMeans

class InstagramScheduler:
    def __init__(self, db_path: str = 'content_scheduler.db'):
        self.db_path = db_path
        self.init_database()
        
        # Optimal posting times (can be learned from data)
        self.optimal_times = {
            'monday': [9, 13, 17],
            'tuesday': [9, 13, 17],
            'wednesday': [9, 13, 17],
            'thursday': [9, 13, 17],
            'friday': [9, 13, 17],
            'saturday': [10, 14, 18],
            'sunday': [10, 14, 18]
        }
    
    def init_database(self):
        """Initialize SQLite database for content scheduling"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scheduled_content (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_id TEXT UNIQUE,
                content_type TEXT,
                caption TEXT,
                hashtags TEXT,
                media_url TEXT,
                scheduled_time TIMESTAMP,
                posted_time TIMESTAMP,
                status TEXT DEFAULT 'scheduled',
                engagement_score REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS posting_performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id TEXT,
                posted_time TIMESTAMP,
                hour_of_day INTEGER,
                day_of_week INTEGER,
                impressions INTEGER,
                reach INTEGER,
                likes INTEGER,
                comments INTEGER,
                saves INTEGER,
                engagement_rate REAL,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def schedule_content_batch(self, content_list: List[Dict], start_date: datetime = None) -> List[Dict]:
        """Schedule a batch of content with optimal timing"""
        
        if start_date is None:
            start_date = datetime.now()
        
        scheduled_content = []
        current_date = start_date
        
        # Group content by type for balanced scheduling
        content_by_type = {}
        for content in content_list:
            content_type = content.get('content_type', 'post')
            if content_type not in content_by_type:
                content_by_type[content_type] = []
            content_by_type[content_type].append(content)
        
        # Schedule content across optimal time slots
        time_slots = self._generate_time_slots(start_date, len(content_list))
        
        for i, content in enumerate(content_list):
            scheduled_time = time_slots[i % len(time_slots)]
            
            scheduled_item = {
                'content_id': content.get('id', f'content_{i}'),
                'content': content,
                'scheduled_time': scheduled_time,
                'status': 'scheduled'
            }
            
            scheduled_content.append(scheduled_item)
            self._save_scheduled_content(scheduled_item)
        
        return scheduled_content
    
    def _generate_time_slots(self, start_date: datetime, content_count: int) -> List[datetime]:
        """Generate optimal time slots for content posting"""
        
        time_slots = []
        current_date = start_date.date()
        
        # Generate time slots for the next 30 days
        for day_offset in range(30):
            date = current_date + timedelta(days=day_offset)
            day_name = date.strftime('%A').lower()
            
            optimal_hours = self.optimal_times.get(day_name, [9, 13, 17])
            
            for hour in optimal_hours:
                slot_time = datetime.combine(date, datetime.min.time().replace(hour=hour))
                time_slots.append(slot_time)
                
                if len(time_slots) >= content_count:
                    return time_slots[:content_count]
        
        return time_slots
    
    def _save_scheduled_content(self, scheduled_item: Dict):
        """Save scheduled content to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        content = scheduled_item['content']
        cursor.execute('''
            INSERT OR REPLACE INTO scheduled_content 
            (content_id, content_type, caption, hashtags, media_url, scheduled_time, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            scheduled_item['content_id'],
            content.get('content_type', 'post'),
            content.get('caption', ''),
            json.dumps(content.get('hashtags', [])),
            content.get('media_url', ''),
            scheduled_item['scheduled_time'],
            scheduled_item['status']
        ))
        
        conn.commit()
        conn.close()
    
    def get_due_posts(self) -> List[Dict]:
        """Get posts due for publishing"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM scheduled_content 
            WHERE status = 'scheduled' 
            AND scheduled_time <= ?
        ''', (datetime.now(),))
        
        rows = cursor.fetchall()
        conn.close()
        
        due_posts = []
        for row in rows:
            post = {
                'id': row[0],
                'content_id': row[1],
                'content_type': row[2],
                'caption': row[3],
                'hashtags': json.loads(row[4]) if row[4] else [],
                'media_url': row[5],
                'scheduled_time': datetime.fromisoformat(row[6])
            }
            due_posts.append(post)
        
        return due_posts
    
    def mark_as_posted(self, content_id: str, post_id: str = None):
        """Mark content as posted"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE scheduled_content 
            SET status = 'posted', posted_time = ?
            WHERE content_id = ?
        ''', (datetime.now(), content_id))
        
        conn.commit()
        conn.close()
    
    def optimize_posting_times(self):
        """Analyze performance data to optimize posting times"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT hour_of_day, day_of_week, AVG(engagement_rate) as avg_engagement
            FROM posting_performance
            WHERE recorded_at >= date('now', '-30 days')
            GROUP BY hour_of_day, day_of_week
            HAVING COUNT(*) >= 3
            ORDER BY avg_engagement DESC
        ''')
        
        performance_data = cursor.fetchall()
        conn.close()
        
        if performance_data:
            # Update optimal times based on performance data
            day_names = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            new_optimal_times = {day: [] for day in day_names}
            
            for hour, day_of_week, engagement in performance_data[:21]:  # Top 21 time slots (3 per day)
                day_name = day_names[day_of_week]
                if len(new_optimal_times[day_name]) < 3:
                    new_optimal_times[day_name].append(hour)
            
            # Fill in missing slots with defaults
            for day in day_names:
                while len(new_optimal_times[day]) < 3:
                    default_times = [9, 13, 17]
                    for time in default_times:
                        if time not in new_optimal_times[day]:
                            new_optimal_times[day].append(time)
                            break
            
            self.optimal_times = new_optimal_times
    
    def record_performance(self, post_id: str, metrics: Dict):
        """Record post performance for optimization"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        posted_time = datetime.now()  # This should come from the actual post data
        
        cursor.execute('''
            INSERT INTO posting_performance 
            (post_id, posted_time, hour_of_day, day_of_week, impressions, reach, 
             likes, comments, saves, engagement_rate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            post_id,
            posted_time,
            posted_time.hour,
            posted_time.weekday(),
            metrics.get('impressions', 0),
            metrics.get('reach', 0),
            metrics.get('likes', 0),
            metrics.get('comments', 0),
            metrics.get('saves', 0),
            metrics.get('engagement_rate', 0.0)
        ))
        
        conn.commit()
        conn.close()
```

### 5.3 Automated Publishing Pipeline

#### Production Publishing System
```python
import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict
import aiohttp
import json

class AutomatedPublisher:
    def __init__(self, instagram_api: InstagramBusinessAPI, scheduler: InstagramScheduler):
        self.instagram_api = instagram_api
        self.scheduler = scheduler
        self.logger = self._setup_logger()
        
        # Publishing limits
        self.max_posts_per_day = 5
        self.max_stories_per_day = 10
        self.min_interval_minutes = 120  # Minimum time between posts
    
    def _setup_logger(self) -> logging.Logger:
        """Setup logging for the publisher"""
        logger = logging.getLogger('automated_publisher')
        logger.setLevel(logging.INFO)
        
        handler = logging.FileHandler('publisher.log')
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
    
    async def run_publishing_cycle(self):
        """Main publishing cycle - run this periodically"""
        try:
            # Get posts due for publishing
            due_posts = self.scheduler.get_due_posts()
            
            if not due_posts:
                self.logger.info("No posts due for publishing")
                return
            
            # Check daily limits
            if not self._check_daily_limits():
                self.logger.warning("Daily posting limits reached")
                return
            
            # Publish posts
            for post in due_posts:
                try:
                    await self._publish_single_post(post)
                    await asyncio.sleep(300)  # 5-minute delay between posts
                except Exception as e:
                    self.logger.error(f"Failed to publish post {post['content_id']}: {e}")
                    continue
            
            self.logger.info(f"Publishing cycle completed. Processed {len(due_posts)} posts")
            
        except Exception as e:
            self.logger.error(f"Publishing cycle failed: {e}")
    
    async def _publish_single_post(self, post: Dict):
        """Publish a single post to Instagram"""
        
        try:
            # Create media object
            media_id = self.instagram_api.create_media_object(
                media_url=post['media_url'],
                caption=post['caption'],
                media_type=post.get('content_type', 'IMAGE').upper()
            )
            
            if not media_id:
                raise Exception("Failed to create media object")
            
            # Wait a moment then publish
            await asyncio.sleep(5)
            
            publish_result = self.instagram_api.publish_media(media_id)
            
            if publish_result and 'id' in publish_result:
                instagram_post_id = publish_result['id']
                
                # Mark as posted in scheduler
                self.scheduler.mark_as_posted(post['content_id'], instagram_post_id)
                
                # Schedule performance tracking
                asyncio.create_task(self._track_performance_later(instagram_post_id))
                
                self.logger.info(f"Successfully published post {post['content_id']} as {instagram_post_id}")
                
            else:
                raise Exception("Failed to publish media object")
                
        except Exception as e:
            self.logger.error(f"Error publishing post {post['content_id']}: {e}")
            raise
    
    async def _track_performance_later(self, post_id: str):
        """Track post performance after a delay"""
        # Wait 24 hours to get meaningful engagement data
        await asyncio.sleep(24 * 3600)
        
        try:
            insights = self.instagram_api.get_media_insights(post_id)
            
            if insights and 'data' in insights:
                metrics = {}
                for metric in insights['data']:
                    metrics[metric['name']] = metric['values'][0]['value']
                
                # Calculate engagement rate
                impressions = metrics.get('impressions', 1)
                engagement = metrics.get('engagement', 0)
                metrics['engagement_rate'] = engagement / impressions if impressions > 0 else 0
                
                # Record performance
                self.scheduler.record_performance(post_id, metrics)
                
                self.logger.info(f"Recorded performance for post {post_id}")
                
        except Exception as e:
            self.logger.error(f"Failed to track performance for post {post_id}: {e}")
    
    def _check_daily_limits(self) -> bool:
        """Check if daily posting limits are reached"""
        today = datetime.now().date()
        
        # Count posts published today
        conn = sqlite3.connect(self.scheduler.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT COUNT(*) FROM scheduled_content 
            WHERE DATE(posted_time) = ? AND status = 'posted'
        ''', (today,))
        
        posts_today = cursor.fetchone()[0]
        conn.close()
        
        return posts_today < self.max_posts_per_day
    
    async def emergency_stop(self):
        """Emergency stop for publishing operations"""
        self.logger.warning("Emergency stop activated - halting all publishing operations")
        # Implementation would cancel all pending tasks
        pass

# Usage example
async def main():
    # Initialize components
    instagram_api = InstagramBusinessAPI(access_token, business_account_id)
    scheduler = InstagramScheduler()
    publisher = AutomatedPublisher(instagram_api, scheduler)
    
    # Run publishing cycle every 30 minutes
    while True:
        await publisher.run_publishing_cycle()
        await asyncio.sleep(1800)  # 30 minutes

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 6. Monitoring & Quality Control

### 6.1 Comprehensive Monitoring Stack

#### Real-time System Health Monitoring
```python
import psutil
import redis
import requests
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart

class SystemMonitor:
    def __init__(self, config: Dict):
        self.config = config
        self.redis_client = redis.Redis(host=config['redis_host'], port=config['redis_port'])
        self.alert_thresholds = {
            'cpu_usage': 80.0,
            'memory_usage': 85.0,
            'disk_usage': 90.0,
            'error_rate': 5.0,  # errors per minute
            'api_response_time': 5.0,  # seconds
        }
        
    def collect_system_metrics(self) -> Dict:
        """Collect comprehensive system metrics"""
        
        metrics = {
            'timestamp': datetime.now().isoformat(),
            'system': {
                'cpu_percent': psutil.cpu_percent(interval=1),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_percent': psutil.disk_usage('/').percent,
                'network_io': dict(psutil.net_io_counters()._asdict()),
                'process_count': len(psutil.pids())
            },
            'application': self._collect_app_metrics(),
            'external_apis': self._check_external_apis(),
            'database': self._check_database_health(),
            'redis': self._check_redis_health()
        }
        
        return metrics
    
    def _collect_app_metrics(self) -> Dict:
        """Collect application-specific metrics"""
        
        # Check log files for error rates
        error_count = self._count_recent_errors()
        
        # Check queue sizes
        queue_sizes = {
            'scraping_queue': self._get_queue_size('scraping'),
            'generation_queue': self._get_queue_size('generation'),
            'publishing_queue': self._get_queue_size('publishing')
        }
        
        # Check recent content generation success rate
        generation_success_rate = self._calculate_generation_success_rate()
        
        return {
            'error_count_last_hour': error_count,
            'queue_sizes': queue_sizes,
            'generation_success_rate': generation_success_rate,
            'active_scrapers': self._count_active_scrapers(),
            'pending_publications': self._count_pending_publications()
        }
    
    def _check_external_apis(self) -> Dict:
        """Check external API health and response times"""
        
        api_health = {}
        apis_to_check = [
            ('reddit', 'https://www.reddit.com/api/v1/me'),
            ('youtube', 'https://www.googleapis.com/youtube/v3/search'),
            ('instagram', 'https://graph.facebook.com/v18.0/me'),
            ('openai', 'https://api.openai.com/v1/models')
        ]
        
        for api_name, url in apis_to_check:
            try:
                start_time = datetime.now()
                response = requests.get(url, timeout=10)
                response_time = (datetime.now() - start_time).total_seconds()
                
                api_health[api_name] = {
                    'status': 'healthy' if response.status_code < 400 else 'unhealthy',
                    'response_time': response_time,
                    'status_code': response.status_code
                }
                
            except Exception as e:
                api_health[api_name] = {
                    'status': 'error',
                    'error': str(e),
                    'response_time': None
                }
        
        return api_health
    
    def _check_database_health(self) -> Dict:
        """Check database connectivity and performance"""
        try:
            conn = sqlite3.connect(self.config['database_path'])
            cursor = conn.cursor()
            
            start_time = datetime.now()
            cursor.execute("SELECT COUNT(*) FROM scheduled_content")
            query_time = (datetime.now() - start_time).total_seconds()
            
            record_count = cursor.fetchone()[0]
            conn.close()
            
            return {
                'status': 'healthy',
                'query_time': query_time,
                'record_count': record_count
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def _check_redis_health(self) -> Dict:
        """Check Redis connectivity and performance"""
        try:
            start_time = datetime.now()
            self.redis_client.ping()
            ping_time = (datetime.now() - start_time).total_seconds()
            
            info = self.redis_client.info()
            
            return {
                'status': 'healthy',
                'ping_time': ping_time,
                'memory_usage': info['used_memory_human'],
                'connected_clients': info['connected_clients']
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def analyze_metrics(self, metrics: Dict) -> List[Dict]:
        """Analyze metrics and generate alerts"""
        
        alerts = []
        
        # System resource alerts
        if metrics['system']['cpu_percent'] > self.alert_thresholds['cpu_usage']:
            alerts.append({
                'level': 'warning',
                'type': 'high_cpu_usage',
                'message': f"CPU usage is {metrics['system']['cpu_percent']:.1f}%",
                'threshold': self.alert_thresholds['cpu_usage']
            })
        
        if metrics['system']['memory_percent'] > self.alert_thresholds['memory_usage']:
            alerts.append({
                'level': 'warning',
                'type': 'high_memory_usage',
                'message': f"Memory usage is {metrics['system']['memory_percent']:.1f}%",
                'threshold': self.alert_thresholds['memory_usage']
            })
        
        # Application alerts
        if metrics['application']['error_count_last_hour'] > self.alert_thresholds['error_rate'] * 60:
            alerts.append({
                'level': 'critical',
                'type': 'high_error_rate',
                'message': f"High error rate: {metrics['application']['error_count_last_hour']} errors in last hour"
            })
        
        # External API alerts
        for api_name, api_health in metrics['external_apis'].items():
            if api_health['status'] != 'healthy':
                alerts.append({
                    'level': 'critical',
                    'type': 'api_unhealthy',
                    'message': f"{api_name} API is unhealthy: {api_health.get('error', 'Unknown error')}"
                })
        
        return alerts
    
    def send_alerts(self, alerts: List[Dict]):
        """Send alerts via email and Slack"""
        
        if not alerts:
            return
        
        # Send email alerts
        self._send_email_alerts(alerts)
        
        # Send Slack alerts
        self._send_slack_alerts(alerts)
    
    def _send_email_alerts(self, alerts: List[Dict]):
        """Send email alerts"""
        
        if not self.config.get('email_config'):
            return
        
        email_config = self.config['email_config']
        
        msg = MimeMultipart()
        msg['From'] = email_config['from']
        msg['To'] = ', '.join(email_config['to'])
        msg['Subject'] = f"AquaScene System Alert - {len(alerts)} issues detected"
        
        body = "System alerts detected:\n\n"
        for alert in alerts:
            body += f"[{alert['level'].upper()}] {alert['type']}: {alert['message']}\n"
        
        msg.attach(MimeText(body, 'plain'))
        
        try:
            server = smtplib.SMTP(email_config['smtp_server'], email_config['smtp_port'])
            server.starttls()
            server.login(email_config['username'], email_config['password'])
            server.sendmail(email_config['from'], email_config['to'], msg.as_string())
            server.quit()
        except Exception as e:
            print(f"Failed to send email alert: {e}")
    
    def _send_slack_alerts(self, alerts: List[Dict]):
        """Send Slack alerts"""
        
        webhook_url = self.config.get('slack_webhook_url')
        if not webhook_url:
            return
        
        color_map = {
            'warning': '#ffaa00',
            'critical': '#ff0000',
            'info': '#0099ff'
        }
        
        attachments = []
        for alert in alerts:
            attachments.append({
                'color': color_map.get(alert['level'], '#cccccc'),
                'title': alert['type'].replace('_', ' ').title(),
                'text': alert['message'],
                'timestamp': int(datetime.now().timestamp())
            })
        
        payload = {
            'text': f'AquaScene System Alert - {len(alerts)} issues detected',
            'attachments': attachments
        }
        
        try:
            requests.post(webhook_url, json=payload)
        except Exception as e:
            print(f"Failed to send Slack alert: {e}")
    
    def _count_recent_errors(self) -> int:
        """Count errors in log files from the last hour"""
        # Implementation would parse log files and count ERROR level entries
        # This is a simplified version
        try:
            with open('/var/log/aquascene/app.log', 'r') as f:
                lines = f.readlines()
                recent_errors = 0
                cutoff_time = datetime.now() - timedelta(hours=1)
                
                for line in reversed(lines[-1000:]):  # Check last 1000 lines
                    if 'ERROR' in line:
                        # Parse timestamp from log line (implementation depends on log format)
                        recent_errors += 1
                
                return recent_errors
        except:
            return 0
    
    def _get_queue_size(self, queue_name: str) -> int:
        """Get queue size from Redis"""
        try:
            return self.redis_client.llen(f'queue:{queue_name}')
        except:
            return -1
    
    def _calculate_generation_success_rate(self) -> float:
        """Calculate content generation success rate"""
        # Implementation would check recent generation attempts
        return 0.95  # Placeholder
    
    def _count_active_scrapers(self) -> int:
        """Count active scraper processes"""
        # Implementation would check process list or status indicators
        return 3  # Placeholder
    
    def _count_pending_publications(self) -> int:
        """Count pending publications"""
        try:
            conn = sqlite3.connect(self.config['database_path'])
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM scheduled_content WHERE status = 'scheduled'")
            count = cursor.fetchone()[0]
            conn.close()
            return count
        except:
            return -1
```

### 6.2 Content Quality Control Pipeline

#### Automated Content Validation
```python
import re
import requests
from PIL import Image
import imagehash
from transformers import pipeline
import spacy
from typing import Dict, List, Tuple, Optional
import sqlite3
import json

class ContentQualityController:
    def __init__(self, config: Dict):
        self.config = config
        self.nlp = spacy.load("en_core_web_sm")
        
        # Load AI models for content analysis
        self.sentiment_analyzer = pipeline("sentiment-analysis")
        self.toxicity_classifier = pipeline("text-classification", 
                                           model="unitary/toxic-bert")
        
        # Quality thresholds
        self.quality_thresholds = {
            'min_readability_score': 0.6,
            'max_toxicity_score': 0.1,
            'min_uniqueness_score': 0.7,
            'min_relevance_score': 0.8,
            'max_promotional_score': 0.3
        }
        
        # Initialize duplicate detection database
        self.init_duplicate_db()
    
    def init_duplicate_db(self):
        """Initialize database for duplicate detection"""
        conn = sqlite3.connect(self.config['quality_db_path'])
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS content_hashes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_hash TEXT UNIQUE,
                image_hash TEXT,
                content_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def validate_content_batch(self, content_list: List[Dict]) -> List[Dict]:
        """Validate a batch of content"""
        
        validated_content = []
        
        for content in content_list:
            validation_result = self.validate_single_content(content)
            
            if validation_result['approved']:
                validated_content.append({
                    **content,
                    'quality_score': validation_result['overall_score'],
                    'validation_passed': True,
                    'validation_details': validation_result
                })
            else:
                # Log rejected content for review
                self._log_rejected_content(content, validation_result)
        
        return validated_content
    
    def validate_single_content(self, content: Dict) -> Dict:
        """Comprehensive validation of single content piece"""
        
        validation_results = {
            'duplicate_check': self._check_for_duplicates(content),
            'text_quality': self._analyze_text_quality(content),
            'image_quality': self._analyze_image_quality(content),
            'platform_compliance': self._check_platform_compliance(content),
            'brand_safety': self._check_brand_safety(content),
            'relevance_check': self._check_aquascaping_relevance(content)
        }
        
        # Calculate overall score
        scores = [result.get('score', 0) for result in validation_results.values() 
                 if isinstance(result, dict) and 'score' in result]
        overall_score = sum(scores) / len(scores) if scores else 0
        
        # Determine approval status
        critical_failures = [
            not validation_results['duplicate_check']['is_unique'],
            validation_results['text_quality']['toxicity_score'] > self.quality_thresholds['max_toxicity_score'],
            not validation_results['platform_compliance']['compliant'],
            not validation_results['brand_safety']['safe']
        ]
        
        approved = not any(critical_failures) and overall_score >= 0.7
        
        return {
            'approved': approved,
            'overall_score': overall_score,
            'validation_results': validation_results,
            'critical_failures': critical_failures
        }
    
    def _check_for_duplicates(self, content: Dict) -> Dict:
        """Check for content duplicates using text and image hashing"""
        
        text = content.get('caption', '') + ' ' + content.get('description', '')
        text_hash = hash(text.lower().strip())
        
        # Check text duplicates
        conn = sqlite3.connect(self.config['quality_db_path'])
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM content_hashes WHERE content_hash = ?", (str(text_hash),))
        text_duplicate_count = cursor.fetchone()[0]
        
        # Check image duplicates if image URL provided
        image_duplicate_count = 0
        if content.get('media_url'):
            image_hash = self._calculate_image_hash(content['media_url'])
            if image_hash:
                cursor.execute("SELECT COUNT(*) FROM content_hashes WHERE image_hash = ?", (str(image_hash),))
                image_duplicate_count = cursor.fetchone()[0]
        
        conn.close()
        
        is_unique = text_duplicate_count == 0 and image_duplicate_count == 0
        
        # Store hash if unique
        if is_unique:
            self._store_content_hash(str(text_hash), str(image_hash) if 'image_hash' in locals() else None, text)
        
        return {
            'is_unique': is_unique,
            'text_duplicates': text_duplicate_count,
            'image_duplicates': image_duplicate_count,
            'score': 1.0 if is_unique else 0.0
        }
    
    def _analyze_text_quality(self, content: Dict) -> Dict:
        """Analyze text quality including readability, toxicity, and engagement"""
        
        text = content.get('caption', '') + ' ' + content.get('description', '')
        
        if not text.strip():
            return {'score': 0.0, 'error': 'No text content'}
        
        # Readability analysis
        readability_score = self._calculate_readability(text)
        
        # Toxicity analysis
        toxicity_result = self.toxicity_classifier(text[:512])  # Truncate for model limits
        toxicity_score = toxicity_result[0]['score'] if toxicity_result[0]['label'] == 'TOXIC' else 0
        
        # Sentiment analysis
        sentiment_result = self.sentiment_analyzer(text[:512])
        sentiment_score = sentiment_result[0]['score'] if sentiment_result[0]['label'] == 'POSITIVE' else 0
        
        # Grammar and spelling check
        grammar_score = self._check_grammar(text)
        
        # Engagement potential
        engagement_score = self._calculate_engagement_potential(content)
        
        overall_score = (
            readability_score * 0.3 +
            (1 - toxicity_score) * 0.3 +
            sentiment_score * 0.2 +
            grammar_score * 0.1 +
            engagement_score * 0.1
        )
        
        return {
            'score': overall_score,
            'readability_score': readability_score,
            'toxicity_score': toxicity_score,
            'sentiment_score': sentiment_score,
            'grammar_score': grammar_score,
            'engagement_score': engagement_score
        }
    
    def _analyze_image_quality(self, content: Dict) -> Dict:
        """Analyze image quality if image URL is provided"""
        
        image_url = content.get('media_url')
        if not image_url:
            return {'score': 0.5, 'note': 'No image provided'}
        
        try:
            # Download and analyze image
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()
            
            image = Image.open(BytesIO(response.content))
            
            # Basic image quality checks
            width, height = image.size
            aspect_ratio = width / height
            file_size = len(response.content)
            
            # Quality scoring
            resolution_score = min(1.0, (width * height) / (1080 * 1080))  # Score based on resolution
            aspect_score = 1.0 if 0.8 <= aspect_ratio <= 1.25 else 0.7  # Square-ish images score higher
            size_score = 1.0 if file_size < 5 * 1024 * 1024 else 0.8  # Prefer smaller files
            
            overall_score = (resolution_score + aspect_score + size_score) / 3
            
            return {
                'score': overall_score,
                'width': width,
                'height': height,
                'aspect_ratio': aspect_ratio,
                'file_size': file_size,
                'resolution_score': resolution_score,
                'aspect_score': aspect_score,
                'size_score': size_score
            }
            
        except Exception as e:
            return {'score': 0.0, 'error': f'Image analysis failed: {str(e)}'}
    
    def _check_platform_compliance(self, content: Dict) -> Dict:
        """Check compliance with platform guidelines"""
        
        caption = content.get('caption', '')
        hashtags = content.get('hashtags', [])
        
        compliance_issues = []
        
        # Instagram-specific checks
        if len(caption) > 2200:
            compliance_issues.append('Caption too long (>2200 characters)')
        
        if len(hashtags) > 30:
            compliance_issues.append('Too many hashtags (>30)')
        
        # Check for prohibited content patterns
        prohibited_patterns = [
            r'follow\s*for\s*follow|f4f',
            r'like\s*for\s*like|l4l',
            r'engagement\s*pod',
            r'buy\s*followers',
            r'click\s*link\s*in\s*bio'
        ]
        
        text_to_check = (caption + ' ' + ' '.join(hashtags)).lower()
        for pattern in prohibited_patterns:
            if re.search(pattern, text_to_check):
                compliance_issues.append(f'Prohibited pattern detected: {pattern}')
        
        compliant = len(compliance_issues) == 0
        score = 1.0 if compliant else max(0.0, 1.0 - len(compliance_issues) * 0.2)
        
        return {
            'compliant': compliant,
            'score': score,
            'issues': compliance_issues
        }
    
    def _check_brand_safety(self, content: Dict) -> Dict:
        """Check content for brand safety"""
        
        text = content.get('caption', '') + ' ' + content.get('description', '')
        
        # Define brand safety keywords
        unsafe_topics = [
            'politics', 'religion', 'controversial', 'offensive', 
            'inappropriate', 'adult', 'violence', 'illegal'
        ]
        
        safe_aquascaping_topics = [
            'aquarium', 'fish', 'plants', 'aquascape', 'tank', 
            'substrate', 'lighting', 'co2', 'filtration', 'maintenance'
        ]
        
        text_lower = text.lower()
        
        # Count unsafe topics
        unsafe_mentions = sum(1 for topic in unsafe_topics if topic in text_lower)
        
        # Count safe aquascaping topics
        safe_mentions = sum(1 for topic in safe_aquascaping_topics if topic in text_lower)
        
        # Calculate brand safety score
        if unsafe_mentions > 0:
            safety_score = max(0.0, 1.0 - unsafe_mentions * 0.5)
        else:
            safety_score = min(1.0, 0.5 + safe_mentions * 0.1)
        
        safe = unsafe_mentions == 0 and safety_score >= 0.7
        
        return {
            'safe': safe,
            'score': safety_score,
            'unsafe_mentions': unsafe_mentions,
            'safe_mentions': safe_mentions
        }
    
    def _check_aquascaping_relevance(self, content: Dict) -> Dict:
        """Check if content is relevant to aquascaping"""
        
        text = content.get('caption', '') + ' ' + content.get('description', '')
        hashtags = content.get('hashtags', [])
        
        # Aquascaping-related keywords
        aquascaping_keywords = [
            'aquarium', 'aquascape', 'planted tank', 'fish tank', 'aquatic plants',
            'substrate', 'co2', 'lighting', 'filtration', 'hardscape', 'driftwood',
            'rocks', 'moss', 'carpet plants', 'stem plants', 'fish', 'shrimp',
            'algae', 'water parameters', 'ph', 'kh', 'gh', 'fertilizer'
        ]
        
        text_and_tags = (text + ' ' + ' '.join(hashtags)).lower()
        
        # Count relevance indicators
        relevance_matches = sum(1 for keyword in aquascaping_keywords if keyword in text_and_tags)
        
        # Calculate relevance score
        relevance_score = min(1.0, relevance_matches / 5)  # Normalize based on 5 matches = 100%
        
        relevant = relevance_score >= self.quality_thresholds['min_relevance_score']
        
        return {
            'relevant': relevant,
            'score': relevance_score,
            'matches': relevance_matches,
            'matched_keywords': [kw for kw in aquascaping_keywords if kw in text_and_tags]
        }
    
    def _calculate_image_hash(self, image_url: str) -> Optional[str]:
        """Calculate perceptual hash of image for duplicate detection"""
        try:
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()
            
            image = Image.open(BytesIO(response.content))
            return str(imagehash.phash(image))
            
        except Exception as e:
            print(f"Error calculating image hash: {e}")
            return None
    
    def _store_content_hash(self, content_hash: str, image_hash: Optional[str], content_text: str):
        """Store content hash for future duplicate detection"""
        conn = sqlite3.connect(self.config['quality_db_path'])
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR IGNORE INTO content_hashes (content_hash, image_hash, content_text)
            VALUES (?, ?, ?)
        ''', (content_hash, image_hash, content_text[:500]))  # Truncate text for storage
        
        conn.commit()
        conn.close()
    
    def _calculate_readability(self, text: str) -> float:
        """Calculate text readability score"""
        
        sentences = len(re.split(r'[.!?]+', text))
        words = len(text.split())
        
        if sentences == 0 or words == 0:
            return 0.0
        
        avg_sentence_length = words / sentences
        
        # Optimal sentence length for social media: 15-20 words
        if 10 <= avg_sentence_length <= 25:
            return 1.0
        elif avg_sentence_length < 10:
            return 0.8
        else:
            return max(0.2, 1.0 - (avg_sentence_length - 25) / 50)
    
    def _check_grammar(self, text: str) -> float:
        """Basic grammar checking using spaCy"""
        doc = self.nlp(text)
        
        # Count potential grammar issues
        issues = 0
        for token in doc:
            # Check for common issues
            if token.pos_ == 'VERB' and token.dep_ == 'ROOT' and not any(child.dep_ == 'nsubj' for child in token.children):
                issues += 1  # Missing subject
        
        # Calculate score based on issues per sentence
        sentences = len(list(doc.sents))
        if sentences == 0:
            return 0.0
        
        issue_rate = issues / sentences
        return max(0.0, 1.0 - issue_rate)
    
    def _calculate_engagement_potential(self, content: Dict) -> float:
        """Calculate potential for user engagement"""
        
        text = content.get('caption', '')
        hashtags = content.get('hashtags', [])
        
        engagement_score = 0.0
        
        # Check for questions
        if '?' in text:
            engagement_score += 0.3
        
        # Check for call-to-action phrases
        cta_phrases = ['comment', 'share', 'tag', 'follow', 'like', 'save', 'what do you think']
        if any(phrase in text.lower() for phrase in cta_phrases):
            engagement_score += 0.3
        
        # Check hashtag count (optimal range)
        if 5 <= len(hashtags) <= 15:
            engagement_score += 0.2
        elif len(hashtags) > 0:
            engagement_score += 0.1
        
        # Check for visual content
        if content.get('media_url'):
            engagement_score += 0.2
        
        return min(1.0, engagement_score)
    
    def _log_rejected_content(self, content: Dict, validation_result: Dict):
        """Log rejected content for manual review"""
        
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'content_id': content.get('id', 'unknown'),
            'rejection_reason': validation_result.get('critical_failures', []),
            'overall_score': validation_result.get('overall_score', 0),
            'content_preview': content.get('caption', '')[:100] + '...' if len(content.get('caption', '')) > 100 else content.get('caption', ''),
            'validation_details': validation_result
        }
        
        # Write to log file
        with open(self.config['rejected_content_log'], 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
```

### 6.3 Error Handling & Recovery

#### Robust Error Handling System
```python
import functools
import traceback
import time
from typing import Callable, Any, Dict, Optional
from datetime import datetime, timedelta
import logging
import json
import sqlite3

class ErrorHandler:
    def __init__(self, config: Dict):
        self.config = config
        self.logger = self._setup_logger()
        self.error_db_path = config.get('error_db_path', 'errors.db')
        self.init_error_db()
        
        # Circuit breaker configuration
        self.circuit_breakers = {}
        self.circuit_breaker_config = {
            'failure_threshold': 5,
            'recovery_timeout': 300,  # 5 minutes
            'expected_recovery_time': 60  # 1 minute
        }
    
    def _setup_logger(self) -> logging.Logger:
        """Setup error logging"""
        logger = logging.getLogger('error_handler')
        logger.setLevel(logging.ERROR)
        
        # File handler
        file_handler = logging.FileHandler(self.config.get('error_log_path', 'errors.log'))
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        
        return logger
    
    def init_error_db(self):
        """Initialize error tracking database"""
        conn = sqlite3.connect(self.error_db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS error_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                service_name TEXT,
                function_name TEXT,
                error_type TEXT,
                error_message TEXT,
                stack_trace TEXT,
                context TEXT,
                retry_count INTEGER DEFAULT 0,
                resolved BOOLEAN DEFAULT FALSE
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS circuit_breaker_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                service_name TEXT,
                event_type TEXT,
                details TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def with_retry(self, max_retries: int = 3, delay: float = 1.0, backoff: float = 2.0):
        """Decorator for automatic retry with exponential backoff"""
        def decorator(func: Callable) -> Callable:
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                retry_count = 0
                current_delay = delay
                
                while retry_count <= max_retries:
                    try:
                        return func(*args, **kwargs)
                    except Exception as e:
                        retry_count += 1
                        
                        if retry_count > max_retries:
                            self._log_error(func.__name__, e, {
                                'args': str(args)[:200],
                                'kwargs': str(kwargs)[:200],
                                'retry_count': retry_count
                            })
                            raise
                        
                        self.logger.warning(f"Retry {retry_count}/{max_retries} for {func.__name__}: {str(e)}")
                        time.sleep(current_delay)
                        current_delay *= backoff
                
            return wrapper
        return decorator
    
    def with_circuit_breaker(self, service_name: str):
        """Decorator for circuit breaker pattern"""
        def decorator(func: Callable) -> Callable:
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                # Check circuit breaker state
                if self._is_circuit_open(service_name):
                    raise Exception(f"Circuit breaker open for {service_name}")
                
                try:
                    result = func(*args, **kwargs)
                    self._record_success(service_name)
                    return result
                    
                except Exception as e:
                    self._record_failure(service_name, e)
                    raise
                    
            return wrapper
        return decorator
    
    def with_timeout(self, timeout_seconds: int = 30):
        """Decorator for function timeout"""
        def decorator(func: Callable) -> Callable:
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                import signal
                
                def timeout_handler(signum, frame):
                    raise TimeoutError(f"Function {func.__name__} timed out after {timeout_seconds} seconds")
                
                # Set up timeout
                old_handler = signal.signal(signal.SIGALRM, timeout_handler)
                signal.alarm(timeout_seconds)
                
                try:
                    result = func(*args, **kwargs)
                    return result
                finally:
                    signal.alarm(0)
                    signal.signal(signal.SIGALRM, old_handler)
                    
            return wrapper
        return decorator
    
    def _log_error(self, function_name: str, error: Exception, context: Dict = None):
        """Log error to database and file"""
        
        error_info = {
            'service_name': context.get('service_name', 'unknown') if context else 'unknown',
            'function_name': function_name,
            'error_type': type(error).__name__,
            'error_message': str(error),
            'stack_trace': traceback.format_exc(),
            'context': json.dumps(context) if context else None
        }
        
        # Log to file
        self.logger.error(f"Error in {function_name}: {str(error)}", extra=error_info)
        
        # Log to database
        conn = sqlite3.connect(self.error_db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO error_log 
            (service_name, function_name, error_type, error_message, stack_trace, context)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            error_info['service_name'],
            error_info['function_name'],
            error_info['error_type'],
            error_info['error_message'],
            error_info['stack_trace'],
            error_info['context']
        ))
        
        conn.commit()
        conn.close()
        
        # Send critical alerts if needed
        if self._is_critical_error(error):
            self._send_critical_alert(error_info)
    
    def _is_circuit_open(self, service_name: str) -> bool:
        """Check if circuit breaker is open for service"""
        
        if service_name not in self.circuit_breakers:
            self.circuit_breakers[service_name] = {
                'failure_count': 0,
                'last_failure_time': None,
                'state': 'closed'  # closed, open, half-open
            }
        
        circuit = self.circuit_breakers[service_name]
        
        if circuit['state'] == 'closed':
            return False
        elif circuit['state'] == 'open':
            # Check if recovery timeout has passed
            if circuit['last_failure_time'] and \
               datetime.now() - circuit['last_failure_time'] > timedelta(seconds=self.circuit_breaker_config['recovery_timeout']):
                circuit['state'] = 'half-open'
                self._log_circuit_breaker_event(service_name, 'half-open')
                return False
            return True
        elif circuit['state'] == 'half-open':
            return False
    
    def _record_success(self, service_name: str):
        """Record successful operation"""
        if service_name in self.circuit_breakers:
            circuit = self.circuit_breakers[service_name]
            if circuit['state'] == 'half-open':
                circuit['state'] = 'closed'
                circuit['failure_count'] = 0
                self._log_circuit_breaker_event(service_name, 'closed')
    
    def _record_failure(self, service_name: str, error: Exception):
        """Record failed operation"""
        if service_name not in self.circuit_breakers:
            self.circuit_breakers[service_name] = {
                'failure_count': 0,
                'last_failure_time': None,
                'state': 'closed'
            }
        
        circuit = self.circuit_breakers[service_name]
        circuit['failure_count'] += 1
        circuit['last_failure_time'] = datetime.now()
        
        if circuit['failure_count'] >= self.circuit_breaker_config['failure_threshold']:
            circuit['state'] = 'open'
            self._log_circuit_breaker_event(service_name, 'open', str(error))
    
    def _log_circuit_breaker_event(self, service_name: str, event_type: str, details: str = None):
        """Log circuit breaker state changes"""
        conn = sqlite3.connect(self.error_db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO circuit_breaker_events (service_name, event_type, details)
            VALUES (?, ?, ?)
        ''', (service_name, event_type, details))
        
        conn.commit()
        conn.close()
        
        self.logger.info(f"Circuit breaker {event_type} for {service_name}: {details}")
    
    def _is_critical_error(self, error: Exception) -> bool:
        """Determine if error is critical and requires immediate attention"""
        
        critical_error_types = [
            'DatabaseError',
            'AuthenticationError',
            'OutOfMemoryError',
            'DiskSpaceError'
        ]
        
        return type(error).__name__ in critical_error_types
    
    def _send_critical_alert(self, error_info: Dict):
        """Send immediate alert for critical errors"""
        
        alert_message = f"""
        CRITICAL ERROR DETECTED
        
        Service: {error_info['service_name']}
        Function: {error_info['function_name']}
        Error: {error_info['error_type']} - {error_info['error_message']}
        Time: {datetime.now().isoformat()}
        
        Immediate attention required!
        """
        
        # Send via configured alert channels
        webhook_url = self.config.get('critical_alert_webhook')
        if webhook_url:
            try:
                import requests
                requests.post(webhook_url, json={
                    'text': alert_message,
                    'color': '#ff0000'
                })
            except:
                pass  # Don't let alert failures break error handling
    
    def get_error_summary(self, hours: int = 24) -> Dict:
        """Get error summary for specified time period"""
        
        conn = sqlite3.connect(self.error_db_path)
        cursor = conn.cursor()
        
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        # Get error counts by type
        cursor.execute('''
            SELECT error_type, COUNT(*) as count
            FROM error_log
            WHERE timestamp >= ?
            GROUP BY error_type
            ORDER BY count DESC
        ''', (cutoff_time,))
        
        error_types = dict(cursor.fetchall())
        
        # Get error counts by service
        cursor.execute('''
            SELECT service_name, COUNT(*) as count
            FROM error_log
            WHERE timestamp >= ?
            GROUP BY service_name
            ORDER BY count DESC
        ''', (cutoff_time,))
        
        service_errors = dict(cursor.fetchall())
        
        # Get total error count
        cursor.execute('SELECT COUNT(*) FROM error_log WHERE timestamp >= ?', (cutoff_time,))
        total_errors = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'time_period_hours': hours,
            'total_errors': total_errors,
            'errors_by_type': error_types,
            'errors_by_service': service_errors,
            'circuit_breaker_states': {
                name: breaker['state'] 
                for name, breaker in self.circuit_breakers.items()
            }
        }

# Usage examples
error_handler = ErrorHandler(config)

@error_handler.with_retry(max_retries=3, delay=1.0)
@error_handler.with_circuit_breaker('reddit_api')
@error_handler.with_timeout(30)
def scrape_reddit_data():
    # Your scraping logic here
    pass
```

---

## 7. Production Implementation Roadmap

### Phase 1: Foundation Setup (Weeks 1-2)
1. **Infrastructure Setup**
   - Set up development and production environments
   - Configure Redis for queue management
   - Set up PostgreSQL/SQLite for data storage
   - Implement basic monitoring with health checks

2. **Core Services Development**
   - Reddit API collector with rate limiting
   - YouTube API collector with quota management
   - Basic content processor and cleaner
   - Initial database schema design

### Phase 2: Content Generation (Weeks 3-4)
1. **AI Integration**
   - OpenAI API integration with GPT-4
   - Claude API integration for long-form content
   - Local LLM setup (Ollama) for cost efficiency
   - Content quality assessment system

2. **Content Pipeline**
   - Airflow DAG for daily content generation
   - Content validation and quality control
   - Duplicate detection system
   - Content scheduling system

### Phase 3: Instagram Automation (Weeks 5-6)
1. **Instagram Business API**
   - Official API integration with compliance
   - Content publishing automation
   - Performance tracking and analytics
   - Optimal timing analysis

2. **Safety & Compliance**
   - Platform guideline compliance checker
   - Brand safety validation
   - Automated content moderation
   - Legal compliance documentation

### Phase 4: Monitoring & Optimization (Weeks 7-8)
1. **Comprehensive Monitoring**
   - System health monitoring
   - Error tracking and alerting
   - Performance metrics dashboard
   - Content quality metrics

2. **Optimization Systems**
   - A/B testing for content performance
   - Posting time optimization
   - Content type performance analysis
   - Cost optimization strategies

### Phase 5: Production Deployment (Weeks 9-10)
1. **Production Environment**
   - Docker containerization
   - CI/CD pipeline setup
   - Load balancing and scaling
   - Backup and disaster recovery

2. **Final Testing & Launch**
   - End-to-end testing
   - Performance testing under load
   - Security audit and penetration testing
   - Go-live and monitoring

---

## 8. Cost Estimation & ROI Analysis

### Monthly Operating Costs (Estimated)

#### Infrastructure Costs
- **Cloud Hosting (AWS/DigitalOcean)**: $100-300/month
- **Database (Managed PostgreSQL)**: $50-150/month
- **Redis Cache**: $25-75/month
- **CDN & Storage**: $50-200/month
- **Total Infrastructure**: $225-725/month

#### API Costs
- **OpenAI API (GPT-4)**: $200-800/month
- **Claude API**: $100-400/month
- **YouTube Data API**: Free (within quotas)
- **Reddit API**: Free
- **Instagram Business API**: Free
- **Total API Costs**: $300-1,200/month

#### Development & Maintenance
- **Development Time**: 40-80 hours/month at $75/hour = $3,000-6,000/month
- **Monitoring Tools**: $50-200/month
- **Total Development**: $3,050-6,200/month

#### Total Monthly Costs: $3,575-8,125/month

### Expected ROI
- **Content Volume**: 90-150 posts/month (3-5 per day)
- **Manual Content Creation Cost**: $50-100 per post
- **Manual Cost Equivalent**: $4,500-15,000/month
- **Net Savings**: $925-6,875/month
- **ROI**: 25-85% monthly savings

### Performance Metrics
- **Content Generation Speed**: 10x faster than manual
- **Consistency**: 24/7 automated operation
- **Quality**: Consistent brand voice and quality
- **Scalability**: Easy to scale to multiple accounts
- **Analytics**: Comprehensive performance tracking

---

## Conclusion

This technical document provides a comprehensive foundation for building a production-ready aquascaping content generation engine. The system combines modern web scraping techniques, AI-powered content generation, and compliant social media automation to create a scalable, reliable content pipeline.

Key advantages of this approach:
- **Scalable Architecture**: Microservices-based design for easy scaling
- **Quality Control**: Multi-layer validation ensures high-quality content
- **Compliance Focus**: Built-in compliance with platform guidelines
- **Cost Effective**: Significant savings compared to manual content creation
- **Monitoring**: Comprehensive monitoring for reliability and performance

The implementation roadmap provides a practical path to deployment, with clear phases and deliverables. Regular monitoring and optimization will ensure the system continues to perform effectively as the aquascaping community and platforms evolve.

---

**Next Steps:**
1. Review and approve technical architecture
2. Set up development environment
3. Begin Phase 1 implementation
4. Establish monitoring and quality control processes
5. Plan for continuous improvement and feature expansion