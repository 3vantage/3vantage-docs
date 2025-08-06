# Ollama Setup Guide for M2 MacBook - Aquascaping Content Generation

## Overview

The M2 MacBook's unified memory architecture makes it excellent for running local AI models. This guide sets up Ollama with optimized models for aquascaping content generation, providing cost-effective alternatives to cloud APIs.

## M2 MacBook Capabilities Analysis

### Hardware Advantages
- **Unified Memory**: 16GB-24GB shared between CPU/GPU
- **Neural Engine**: 15.8 TOPS for AI acceleration  
- **Efficiency**: Low power consumption vs. discrete GPUs
- **Privacy**: All AI processing stays local

### Recommended Models for Aquascaping
```yaml
Primary Models:
  - llama3.1:8b (8GB RAM) - Content generation
  - mistral:7b (7GB RAM) - Educational content
  - codellama:13b (13GB RAM) - Technical documentation
  
Specialized Models:
  - llava:13b (13GB RAM) - Image analysis
  - neural-chat:7b (7GB RAM) - Social media content
  - dolphin-mistral:7b (7GB RAM) - Instruction following

Memory Usage:
  - 8B models: ~6-8GB RAM
  - 13B models: ~10-13GB RAM
  - Leave 4-6GB for system operations
```

## Installation and Setup

### 1. Install Ollama
```bash
# Install Ollama via Homebrew
brew install ollama

# Or download directly from https://ollama.ai
curl https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve &
```

### 2. Download Optimized Models
```bash
# Primary content generation (fastest)
ollama pull llama3.1:8b

# Instruction-following for structured content
ollama pull mistral:7b

# Image understanding for aquascape analysis
ollama pull llava:13b

# Code generation for technical content
ollama pull codellama:7b

# Conversational model for social media
ollama pull neural-chat:7b

# Check available models
ollama list
```

### 3. Model Configuration
Create custom model configurations for aquascaping:

```bash
# Create aquascaping-tuned Llama model
cat > aquascape-llama.Modelfile << EOF
FROM llama3.1:8b

SYSTEM """You are an expert aquascaping consultant with 15+ years of experience. You specialize in:

- Nature Aquarium, Iwagumi, Dutch, and Biotope styles
- Plant care and cultivation techniques  
- Water chemistry and aquarium maintenance
- Equipment recommendations and setup
- Troubleshooting aquascaping problems
- Creating educational content for all skill levels

Always provide practical, accurate advice. Include specific measurements, parameters, and actionable steps. Write in a friendly but authoritative tone that builds confidence in aquascapers.

When discussing plants, always mention:
- Scientific names
- Light requirements (PAR values)
- CO2 needs
- Water parameters
- Difficulty level

When discussing equipment:
- Specific product recommendations when relevant
- Technical specifications
- Setup instructions
- Maintenance requirements

Focus on sustainable, ethical aquascaping practices."""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER repeat_penalty 1.1
EOF

# Build the custom model
ollama create aquascape-expert -f aquascape-llama.Modelfile

# Social media model
cat > aquascape-social.Modelfile << EOF
FROM neural-chat:7b

SYSTEM """You are a social media expert specializing in aquascaping content. You create engaging, educational posts for Instagram, Facebook, and newsletters.

Your style is:
- Enthusiastic but professional
- Educational with practical tips
- Community-focused and encouraging
- Visually descriptive
- Hashtag-savvy

Always include:
- Engaging hooks in first line
- Practical tips followers can use
- Questions to encourage engagement
- Relevant hashtags (mix popular and niche)
- Call-to-action when appropriate

Target audience: Aquascaping enthusiasts from beginners to experts, primarily ages 25-45, passionate about planted tanks and natural aquascaping."""

PARAMETER temperature 0.8
PARAMETER top_p 0.9
EOF

ollama create aquascape-social -f aquascape-social.Modelfile

# Multilingual model for Bulgarian/Hungarian
cat > aquascape-multilingual.Modelfile << EOF  
FROM mistral:7b

SYSTEM """You are a multilingual aquascaping expert fluent in English, Bulgarian, and Hungarian. You can translate aquascaping content and create native-language educational materials.

Bulgarian context: Focus on European aquascaping trends, EU plant regulations, and local suppliers like Green Aqua.

Hungarian context: Emphasize Central European water conditions, seasonal variations, and regional aquascaping communities.

Maintain technical accuracy across languages while adapting cultural context and local availability of plants/equipment."""

PARAMETER temperature 0.6
PARAMETER top_p 0.8
EOF

ollama create aquascape-multilingual -f aquascape-multilingual.Modelfile
```

## Integration with Existing Content Engine

### 1. Ollama API Client
```typescript
// File: /lib/ai/ollama-client.ts

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  eval_count: number;
  eval_duration: number;
}

interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  context?: number[];
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
    seed?: number;
  };
}

export class OllamaClient {
  private baseUrl: string;
  private timeout: number;
  
  constructor(baseUrl: string = 'http://localhost:11434', timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  async generate(request: OllamaRequest): Promise<OllamaResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          stream: false, // Non-streaming for simplicity
        }),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Ollama generation failed: ${error.message}`);
    }
  }

  async generateStream(request: OllamaRequest): Promise<ReadableStream> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama stream failed: ${response.status}`);
    }

    return response.body!;
  }

  async listModels(): Promise<{ models: Array<{ name: string; modified_at: string; size: number }> }> {
    const response = await fetch(`${this.baseUrl}/api/tags`);
    return await response.json();
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, { 
        signal: AbortSignal.timeout(5000) 
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Aquascaping-specific content generator
export class AquascapeOllamaGenerator {
  private client: OllamaClient;
  private models: {
    content: string;
    social: string;
    multilingual: string;
    technical: string;
  };

  constructor(client: OllamaClient) {
    this.client = client;
    this.models = {
      content: 'aquascape-expert',
      social: 'aquascape-social', 
      multilingual: 'aquascape-multilingual',
      technical: 'codellama:7b'
    };
  }

  async generatePlantCareGuide(plantName: string, skillLevel: string, language: string = 'en'): Promise<string> {
    const model = language === 'en' ? this.models.content : this.models.multilingual;
    
    const prompt = `Generate a comprehensive plant care guide for ${plantName} targeting ${skillLevel} aquascapers. 
    ${language !== 'en' ? `Write in ${language === 'bg' ? 'Bulgarian' : 'Hungarian'}.` : ''}
    
    Include sections on:
    - Plant overview and characteristics
    - Tank requirements (lighting, CO2, water parameters)
    - Planting and placement
    - Common issues and solutions
    - Pro tips for success
    
    Make it practical and actionable with specific measurements and parameters.`;

    const response = await this.client.generate({
      model,
      prompt,
      options: {
        temperature: 0.7,
        top_p: 0.9
      }
    });

    return response.response;
  }

  async generateInstagramCaption(aquascapeDescription: string, style: string): Promise<string> {
    const prompt = `Create an engaging Instagram caption for an ${style} style aquascape. 

    Aquascape details: ${aquascapeDescription}

    Include:
    - Hook in first line
    - Educational tip
    - Engagement question  
    - Relevant hashtags
    - Call-to-action

    Keep it under 2200 characters.`;

    const response = await this.client.generate({
      model: this.models.social,
      prompt,
      options: {
        temperature: 0.8,
        top_p: 0.9
      }
    });

    return response.response;
  }

  async generateNewsletterContent(topic: string, audience: string, length: number = 500): Promise<string> {
    const prompt = `Write a ${length}-word newsletter article about "${topic}" for ${audience} aquascapers.

    Structure:
    - Engaging introduction
    - Main educational content with practical tips
    - Actionable takeaways
    - Encouraging conclusion

    Include specific measurements, parameters, and techniques where relevant.
    Write in a friendly but authoritative tone.`;

    const response = await this.client.generate({
      model: this.models.content,
      prompt,
      options: {
        temperature: 0.7,
        top_p: 0.8
      }
    });

    return response.response;
  }

  async translateContent(content: string, targetLanguage: string): Promise<string> {
    const langMap = { 'bg': 'Bulgarian', 'hu': 'Hungarian', 'en': 'English' };
    
    const prompt = `Translate this aquascaping content to ${langMap[targetLanguage]}. 
    Maintain technical accuracy and adapt cultural context for local aquascaping communities.
    
    Content: ${content}`;

    const response = await this.client.generate({
      model: this.models.multilingual,
      prompt,
      options: {
        temperature: 0.3, // Lower temperature for translation accuracy
        top_p: 0.7
      }
    });

    return response.response;
  }
}
```

### 2. Performance Optimization
```typescript
// File: /lib/ai/ollama-optimizer.ts

export class OllamaPerformanceOptimizer {
  private client: OllamaClient;
  private contextCache: Map<string, number[]>;
  private modelWarmup: Set<string>;

  constructor(client: OllamaClient) {
    this.client = client;
    this.contextCache = new Map();
    this.modelWarmup = new Set();
  }

  // Warm up models on startup to reduce first-request latency
  async warmupModels(models: string[]): Promise<void> {
    const warmupPrompt = "Hello, ready for aquascaping content generation.";
    
    const warmupPromises = models.map(async (model) => {
      if (this.modelWarmup.has(model)) return;
      
      try {
        await this.client.generate({
          model,
          prompt: warmupPrompt,
          options: { temperature: 0.1 }
        });
        this.modelWarmup.add(model);
        console.log(`Model ${model} warmed up`);
      } catch (error) {
        console.warn(`Failed to warm up model ${model}:`, error);
      }
    });

    await Promise.all(warmupPromises);
  }

  // Cache conversation context for faster follow-up responses
  storeContext(sessionId: string, context: number[]): void {
    this.contextCache.set(sessionId, context);
  }

  getContext(sessionId: string): number[] | undefined {
    return this.contextCache.get(sessionId);
  }

  // Monitor system resources
  async getSystemStatus(): Promise<{
    memory: { total: number; used: number; available: number };
    models: Array<{ name: string; loaded: boolean; memory: number }>;
    health: boolean;
  }> {
    const health = await this.client.checkHealth();
    const models = await this.client.listModels();

    // Get memory info (macOS specific)
    const memoryInfo = await this.getMemoryInfo();

    return {
      memory: memoryInfo,
      models: models.models.map(m => ({
        name: m.name,
        loaded: this.modelWarmup.has(m.name),
        memory: m.size
      })),
      health
    };
  }

  private async getMemoryInfo(): Promise<{ total: number; used: number; available: number }> {
    try {
      // This would need actual implementation for macOS system info
      return {
        total: 16 * 1024 * 1024 * 1024, // 16GB in bytes
        used: 8 * 1024 * 1024 * 1024,   // 8GB used
        available: 8 * 1024 * 1024 * 1024 // 8GB available
      };
    } catch {
      return { total: 0, used: 0, available: 0 };
    }
  }

  // Intelligent model selection based on system resources and task
  selectOptimalModel(task: 'content' | 'social' | 'technical' | 'translation', available_memory: number): string {
    const modelRequirements = {
      'llama3.1:8b': 8000,      // 8GB
      'mistral:7b': 7000,       // 7GB
      'codellama:7b': 7000,     // 7GB
      'neural-chat:7b': 7000,   // 7GB
      'aquascape-expert': 8000, // 8GB (based on llama3.1:8b)
      'aquascape-social': 7000, // 7GB (based on neural-chat:7b)
    };

    const taskModels = {
      content: ['aquascape-expert', 'llama3.1:8b', 'mistral:7b'],
      social: ['aquascape-social', 'neural-chat:7b', 'mistral:7b'],
      technical: ['codellama:7b', 'llama3.1:8b'],
      translation: ['aquascape-multilingual', 'mistral:7b']
    };

    const candidates = taskModels[task];
    
    for (const model of candidates) {
      if (available_memory >= modelRequirements[model]) {
        return model;
      }
    }

    // Fallback to smallest model
    return 'mistral:7b';
  }
}
```

### 3. Cost-Effective Hybrid Strategy
```typescript
// File: /lib/ai/hybrid-ai-strategy.ts

interface AIProvider {
  name: string;
  cost: number;
  latency: number;
  quality: number;
  availability: boolean;
}

export class HybridAIStrategy {
  private ollama: AquascapeOllamaGenerator;
  private gemini: AquascapeGeminiClient;
  private fallbackChain: AIProvider[];

  constructor(ollama: AquascapeOllamaGenerator, gemini: AquascapeGeminiClient) {
    this.ollama = ollama;
    this.gemini = gemini;
    
    this.fallbackChain = [
      { name: 'ollama', cost: 0, latency: 2000, quality: 8, availability: true },
      { name: 'gemini', cost: 0.001, latency: 1500, quality: 9, availability: true }
    ];
  }

  async generateContent(
    type: 'plant_guide' | 'social_post' | 'newsletter' | 'image',
    parameters: any,
    preferences: { 
      prioritize: 'cost' | 'quality' | 'speed';
      max_cost?: number;
      language?: string;
    }
  ): Promise<{
    content: string;
    provider: string;
    cost: number;
    duration: number;
  }> {
    const startTime = Date.now();

    // Image generation always uses Gemini
    if (type === 'image') {
      const result = await this.gemini.generateAquascapeImage(parameters);
      return {
        content: result.imageUrl,
        provider: 'gemini',
        cost: 0.04,
        duration: Date.now() - startTime
      };
    }

    // Text content - choose based on preferences
    try {
      // First try local (free) generation
      if (preferences.prioritize === 'cost' || !preferences.max_cost || preferences.max_cost === 0) {
        const content = await this.generateWithOllama(type, parameters, preferences.language);
        return {
          content,
          provider: 'ollama-local',
          cost: 0,
          duration: Date.now() - startTime
        };
      }

      // For quality-first, use cloud AI but with local fallback
      if (preferences.prioritize === 'quality' && preferences.max_cost && preferences.max_cost > 0.001) {
        try {
          const content = await this.generateWithGemini(type, parameters, preferences.language);
          return {
            content,
            provider: 'gemini',
            cost: 0.001,
            duration: Date.now() - startTime
          };
        } catch (error) {
          console.warn('Gemini failed, falling back to local:', error);
          const content = await this.generateWithOllama(type, parameters, preferences.language);
          return {
            content,
            provider: 'ollama-local-fallback',
            cost: 0,
            duration: Date.now() - startTime
          };
        }
      }

      // Speed-first: use whichever is faster (usually local)
      const content = await this.generateWithOllama(type, parameters, preferences.language);
      return {
        content,
        provider: 'ollama-local',
        cost: 0,
        duration: Date.now() - startTime
      };

    } catch (error) {
      throw new Error(`All AI providers failed: ${error.message}`);
    }
  }

  private async generateWithOllama(type: string, parameters: any, language?: string): Promise<string> {
    switch (type) {
      case 'plant_guide':
        return await this.ollama.generatePlantCareGuide(
          parameters.plantName,
          parameters.skillLevel,
          language
        );
      case 'social_post':
        return await this.ollama.generateInstagramCaption(
          parameters.description,
          parameters.style
        );
      case 'newsletter':
        return await this.ollama.generateNewsletterContent(
          parameters.topic,
          parameters.audience,
          parameters.length
        );
      default:
        throw new Error(`Unsupported content type: ${type}`);
    }
  }

  private async generateWithGemini(type: string, parameters: any, language?: string): Promise<string> {
    // Implement Gemini text generation for comparison
    // For now, using Ollama as the primary text generator
    return await this.generateWithOllama(type, parameters, language);
  }

  // Usage analytics and cost tracking
  async getUsageStats(period: 'day' | 'week' | 'month'): Promise<{
    total_requests: number;
    total_cost: number;
    provider_breakdown: Record<string, { requests: number; cost: number }>;
    average_response_time: number;
  }> {
    // Implementation would track actual usage
    return {
      total_requests: 0,
      total_cost: 0,
      provider_breakdown: {},
      average_response_time: 0
    };
  }
}
```

## Monitoring and Maintenance

### 1. Health Check Script
```bash
#!/bin/bash
# File: scripts/ollama-health-check.sh

echo "🔍 Ollama Health Check"
echo "====================="

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "❌ Ollama service not running"
    echo "Starting Ollama..."
    ollama serve &
    sleep 5
else
    echo "✅ Ollama service running"
fi

# Check available models
echo "📦 Available models:"
ollama list | grep -E "(NAME|aquascape-|llama|mistral)"

# Check system memory
echo "💾 System memory:"
vm_stat | grep -E "(free|active|inactive|wired)" | head -4

# Test model performance
echo "⚡ Testing model response times:"
time ollama run aquascape-expert "What is the ideal pH for most aquatic plants?" --verbose=false

echo "✅ Health check complete"
```

### 2. Model Management
```bash
#!/bin/bash
# File: scripts/manage-models.sh

case "$1" in
    "update")
        echo "🔄 Updating aquascaping models..."
        ollama pull llama3.1:8b
        ollama pull mistral:7b
        
        # Rebuild custom models
        ollama create aquascape-expert -f aquascape-llama.Modelfile
        ollama create aquascape-social -f aquascape-social.Modelfile
        ;;
    "cleanup")
        echo "🧹 Cleaning up unused models..."
        # Remove old versions
        ollama rm $(ollama list | grep "old\|backup" | awk '{print $1}')
        ;;
    "backup")
        echo "💾 Backing up model configurations..."
        cp *.Modelfile ~/backups/ollama-models/
        ;;
    *)
        echo "Usage: $0 {update|cleanup|backup}"
        ;;
esac
```

## Expected Performance on M2 MacBook

### Model Performance Benchmarks
```
16GB M2 MacBook:
- llama3.1:8b: ~15-20 tokens/second
- mistral:7b: ~18-25 tokens/second  
- Multiple models: Can run 2 simultaneously

24GB M2 MacBook:
- llama3.1:8b: ~20-25 tokens/second
- Can run 3 models simultaneously
- Better for batch processing

Typical Response Times:
- Short social posts: 3-5 seconds
- Plant care guides: 8-15 seconds
- Newsletter articles: 10-20 seconds
```

### Cost Savings Analysis
```
Monthly usage comparison (500 content pieces):

Cloud APIs:
- OpenAI GPT-4: ~$15-30/month
- Gemini Pro: ~$10-20/month
- Total: $25-50/month

Local Ollama:
- Electricity: ~$2-5/month
- Internet: $0 (no API calls)
- Total: $2-5/month

Annual savings: $276-540
ROI: 95-98% cost reduction
```

This local AI setup provides excellent capabilities for aquascaping content generation while maintaining complete privacy and minimal operating costs.