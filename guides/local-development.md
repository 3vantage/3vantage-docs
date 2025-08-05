# Local Development Guide

## Overview

This guide covers everything you need to know for effective local development on the aquascaping content generation engine ecosystem. It includes development environment setup, debugging techniques, testing workflows, and optimization strategies.

## Development Environment Setup

### 1. IDE Configuration

#### VS Code Setup (Recommended)

**Essential Extensions:**
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "prisma.prisma",
    "ms-playwright.playwright"
  ]
}
```

**Workspace Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.preferTypeOnlyAutoImports": true,
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

**Debugging Configuration:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

#### Alternative IDEs

**WebStorm Configuration:**
- Enable TypeScript support
- Configure ESLint and Prettier
- Set up live templates for components
- Enable Tailwind CSS intelligence

**Cursor/Claude Editor:**
- Install Node.js and TypeScript extensions
- Configure auto-formatting
- Set up integrated terminal

### 2. Terminal Setup

#### Recommended Terminal Tools
```bash
# Install oh-my-zsh (macOS/Linux)
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Install useful plugins
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# Update .zshrc
plugins=(git node npm nvm docker zsh-autosuggestions zsh-syntax-highlighting)
```

#### Useful Aliases
```bash
# Add to ~/.zshrc or ~/.bashrc
alias pn="pnpm"
alias pnx="pnpm dlx"
alias dev="pnpm dev"
alias build="pnpm build"
alias test="pnpm test"
alias lint="pnpm lint"
alias db="pnpm db:studio"

# Git aliases
alias gs="git status"
alias ga="git add"
alias gc="git commit"
alias gp="git push"
alias gl="git pull"
alias gco="git checkout"
alias gco="git branch"

# Docker aliases
alias dps="docker ps"
alias dls="docker ps -a"
alias di="docker images"
alias dc="docker-compose"
alias dcup="docker-compose up -d"
alias dcdown="docker-compose down"
```

### 3. Environment Configuration

#### Development Environment Variables
```bash
# .env.local template
NODE_ENV=development
DEBUG=true
VERBOSE_LOGGING=true

# Database
DATABASE_URL="postgresql://aquascene:development@localhost:5432/aquascene_dev"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production"

# Email (Development)
RESEND_API_KEY="re_development_key"
RESEND_FROM_EMAIL="dev@aquascene.local"
RESEND_TO_EMAIL="developer@localhost"
EMAIL_PREVIEW_MODE=true

# AI Services (Development)
OPENAI_API_KEY="sk-development-key"
OPENAI_MODEL="gpt-3.5-turbo"  # Cheaper for development
OPENAI_MAX_TOKENS=1000

# External APIs (Development/Mock)
GREEN_AQUA_API_KEY="mock-key"
GREEN_AQUA_API_URL="http://localhost:8080/mock/greenaqua"
INSTAGRAM_ACCESS_TOKEN="mock-token"

# Feature Flags
ENABLE_AI_CONTENT=true
ENABLE_INSTAGRAM_POSTING=false
ENABLE_EMAIL_SENDING=false
ENABLE_ANALYTICS=false
ENABLE_CACHING=false

# Performance
ANALYZE_BUNDLE=false
SKIP_IMAGE_OPTIMIZATION=true
DISABLE_TELEMETRY=true
```

#### Hot Reload Configuration
```javascript
// next.config.js
module.exports = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  },
  
  // Fast refresh configuration
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.next', '**/dist']
      };
    }
    return config;
  }
};
```

## Development Workflow

### 1. Daily Development Routine

#### Starting Development Session
```bash
#!/bin/bash
# dev-start.sh - Daily development startup script

echo "🚀 Starting AquaScene development environment..."

# Check prerequisites
echo "📋 Checking prerequisites..."
node --version
pnpm --version
docker --version

# Start database services
echo "🗄️ Starting database services..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services..."
sleep 5

# Start main application
echo "🌊 Starting main application..."
cd aquascene
pnpm dev &

# Start waitlist application
echo "📝 Starting waitlist application..."
cd ../aquascene-waitlist
pnpm dev &

# Start content engine
echo "🤖 Starting content engine..."
cd ../aquascene-content-engine
pnpm dev &

echo "✅ All services started!"
echo "🌐 Main app: http://localhost:3000"
echo "📝 Waitlist: http://localhost:3001"
echo "🤖 Content engine: Background services running"
```

#### Development Health Check
```bash
#!/bin/bash
# health-check.sh

echo "🏥 Running development health check..."

# Check ports
echo "📡 Checking ports..."
lsof -i :3000 >/dev/null && echo "✅ Main app (3000)" || echo "❌ Main app (3000)"
lsof -i :3001 >/dev/null && echo "✅ Waitlist (3001)" || echo "❌ Waitlist (3001)"
lsof -i :5432 >/dev/null && echo "✅ PostgreSQL (5432)" || echo "❌ PostgreSQL (5432)"
lsof -i :6379 >/dev/null && echo "✅ Redis (6379)" || echo "❌ Redis (6379)"

# Check database connection
echo "🗄️ Checking database..."
cd aquascene && pnpm db:ping && echo "✅ Database connected" || echo "❌ Database connection failed"

# Check environment variables
echo "🔐 Checking environment..."
[ -n "$DATABASE_URL" ] && echo "✅ DATABASE_URL set" || echo "❌ DATABASE_URL missing"
[ -n "$NEXTAUTH_SECRET" ] && echo "✅ NEXTAUTH_SECRET set" || echo "❌ NEXTAUTH_SECRET missing"
[ -n "$RESEND_API_KEY" ] && echo "✅ RESEND_API_KEY set" || echo "❌ RESEND_API_KEY missing"

echo "🏥 Health check complete!"
```

### 2. Feature Development Process

#### Creating a New Feature
```bash
# 1. Create feature branch
git checkout -b feature/underwater-theme-v2

# 2. Create feature directory structure
mkdir -p src/themes/underwater-v2
mkdir -p src/components/themes/underwater-v2
mkdir -p tests/themes/underwater-v2

# 3. Generate component templates
pnpm generate:component UnderwaterV2Theme
pnpm generate:page underwater-v2-preview

# 4. Start development server with feature flags
FEATURE_UNDERWATER_V2=true pnpm dev
```

#### Theme Development Workflow
```typescript
// src/themes/underwater-v2/index.ts
import { Theme } from '@/lib/types';

export const underwaterV2Theme: Theme = {
  id: 'underwater-v2',
  name: 'Underwater Paradise V2',
  description: 'Enhanced underwater experience with particle effects',
  
  // Color palette
  colors: {
    primary: {
      50: '#f0f9ff',
      500: '#0ea5e9',
      900: '#0c4a6e'
    },
    secondary: {
      50: '#f0fdf4',
      500: '#10b981',
      900: '#064e3b'
    }
  },
  
  // Animation configuration
  animations: {
    duration: 'normal',
    easing: 'easeInOut',
    reduceMotion: true
  },
  
  // Component overrides
  components: {
    hero: {
      background: 'gradient',
      particles: true,
      waves: true
    }
  }
};
```

#### Live Theme Preview
```typescript
// src/components/ThemePreview.tsx
'use client';

import { useTheme } from '@/lib/theme-context';
import { motion } from 'framer-motion';

export function ThemePreview() {
  const { currentTheme, previewTheme, setTheme } = useTheme();
  
  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4">
      <h3>Theme Preview</h3>
      
      {/* Live preview controls */}
      <div className="space-y-2">
        <button 
          onClick={() => previewTheme('underwater-v2')}
          className="w-full px-3 py-2 text-left hover:bg-gray-100"
        >
          Preview Underwater V2
        </button>
        
        <button 
          onClick={() => setTheme('underwater-v2')}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded"
        >
          Apply Theme
        </button>
      </div>
    </div>
  );
}
```

### 3. Database Development

#### Database Workflow
```bash
# Development database commands
pnpm db:reset          # Reset database to initial state
pnpm db:seed           # Populate with development data
pnpm db:migrate:dev    # Apply development migrations
pnpm db:studio         # Open Prisma Studio
pnpm db:backup         # Create development backup
pnpm db:restore        # Restore from backup
```

#### Schema Development
```prisma
// prisma/schema.prisma - Development additions
model Theme {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  
  // Development fields
  isDevelopment Boolean @default(false)
  version      String  @default("1.0.0")
  
  // Theme configuration
  colors      Json
  typography  Json
  animations  Json
  components  Json
  
  // Metadata
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  previewSessions ThemePreview[]
  
  @@map("themes")
}

model ThemePreview {
  id       String @id @default(cuid())
  themeId  String
  userId   String?
  
  // Preview session data
  duration Int     // seconds
  interactions Json
  feedback String?
  
  theme    Theme   @relation(fields: [themeId], references: [id])
  
  createdAt DateTime @default(now())
  
  @@map("theme_previews")
}
```

#### Development Seed Data
```typescript
// prisma/seeds/development.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDevelopment() {
  // Create development themes
  const themes = [
    {
      id: 'underwater-dev',
      name: 'Underwater (Development)',
      slug: 'underwater-dev',
      isDevelopment: true,
      colors: {
        primary: '#0ea5e9',
        secondary: '#10b981'
      }
    }
  ];
  
  for (const theme of themes) {
    await prisma.theme.upsert({
      where: { slug: theme.slug },
      update: theme,
      create: theme
    });
  }
  
  // Create test users
  const users = [
    {
      email: 'dev@aquascene.local',
      name: 'Developer User',
      role: 'ADMIN'
    },
    {
      email: 'test@aquascene.local',
      name: 'Test User',
      role: 'USER'
    }
  ];
  
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user
    });
  }
  
  console.log('✅ Development data seeded');
}

seedDevelopment()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## Testing Strategies

### 1. Unit Testing Setup

#### Test Configuration
```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './'
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};

module.exports = createJestConfig(customJestConfig);
```

#### Component Testing
```typescript
// src/components/__tests__/ThemeSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@/lib/theme-context';
import { ThemeSelector } from '../ThemeSelector';

const mockThemes = [
  { id: 'underwater', name: 'Underwater' },
  { id: 'forest', name: 'Forest' }
];

describe('ThemeSelector', () => {
  it('renders all themes', () => {
    render(
      <ThemeProvider>
        <ThemeSelector themes={mockThemes} />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Underwater')).toBeInTheDocument();
    expect(screen.getByText('Forest')).toBeInTheDocument();
  });
  
  it('calls onThemeChange when theme is selected', () => {
    const onThemeChange = jest.fn();
    
    render(
      <ThemeProvider>
        <ThemeSelector 
          themes={mockThemes}
          onThemeChange={onThemeChange}
        />
      </ThemeProvider>
    );
    
    fireEvent.click(screen.getByText('Underwater'));
    expect(onThemeChange).toHaveBeenCalledWith('underwater');
  });
});
```

### 2. Integration Testing

#### API Testing
```typescript
// src/api/__tests__/themes.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../themes';

describe('/api/themes', () => {
  it('returns all themes', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data.themes).toBeDefined();
    expect(Array.isArray(data.themes)).toBe(true);
  });
  
  it('creates new theme with valid data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Test Theme',
        colors: { primary: '#000000' }
      }
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(201);
  });
});
```

### 3. E2E Testing with Playwright

#### E2E Test Setup
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],
  
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

#### Theme Switching E2E Test
```typescript
// tests/e2e/theme-switching.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test('should switch themes correctly', async ({ page }) => {
    await page.goto('/');
    
    // Open theme selector
    await page.click('[data-testid="theme-selector-button"]');
    
    // Select underwater theme
    await page.click('[data-testid="theme-underwater"]');
    
    // Check if theme is applied
    await expect(page.locator('body')).toHaveClass(/theme-underwater/);
    
    // Verify theme persistence after reload
    await page.reload();
    await expect(page.locator('body')).toHaveClass(/theme-underwater/);
  });
  
  test('should maintain theme across navigation', async ({ page }) => {
    await page.goto('/');
    
    // Set theme
    await page.click('[data-testid="theme-selector-button"]');
    await page.click('[data-testid="theme-forest"]');
    
    // Navigate to different page
    await page.click('[data-testid="nav-about"]');
    
    // Verify theme is maintained
    await expect(page.locator('body')).toHaveClass(/theme-forest/);
  });
});
```

## Debugging and Troubleshooting

### 1. Development Debugging

#### Browser DevTools Setup
```javascript
// src/lib/debug.ts
export const debugConfig = {
  enabled: process.env.NODE_ENV === 'development',
  
  log: (message: string, data?: any) => {
    if (debugConfig.enabled) {
      console.log(`🐛 [AquaScene Debug]: ${message}`, data);
    }
  },
  
  warn: (message: string, data?: any) => {
    if (debugConfig.enabled) {
      console.warn(`⚠️ [AquaScene Warning]: ${message}`, data);
    }
  },
  
  error: (message: string, error?: Error) => {
    if (debugConfig.enabled) {
      console.error(`❌ [AquaScene Error]: ${message}`, error);
    }
  }
};

// Add global debug functions
if (typeof window !== 'undefined' && debugConfig.enabled) {
  (window as any).aquascapeDebug = {
    themes: () => import('@/lib/theme-manager').then(m => m.getAllThemes()),
    currentTheme: () => import('@/lib/theme-context').then(m => m.useTheme()),
    clearCache: () => localStorage.clear()
  };
}
```

#### React DevTools Integration
```typescript
// src/components/DevTools.tsx
'use client';

import { useEffect } from 'react';

export function DevTools() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Enable React DevTools profiler
      if (typeof window !== 'undefined') {
        (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.settings.setSettings({
          profilerSettings: {
            recordChangeReasons: true,
            recordTimeline: true
          }
        });
      }
    }
  }, []);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed top-0 right-0 bg-red-500 text-white p-2 text-xs z-50">
      DEV MODE
    </div>
  );
}
```

### 2. Performance Monitoring

#### Performance Debug Component
```typescript
// src/components/PerformanceMonitor.tsx
'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    // Monitor Core Web Vitals
    import('web-vitals').then(({ getLCP, getFID, getCLS, getTTFB }) => {
      getLCP((metric) => setMetrics(prev => ({ ...prev, lcp: metric.value })));
      getFID((metric) => setMetrics(prev => ({ ...prev, fid: metric.value })));
      getCLS((metric) => setMetrics(prev => ({ ...prev, cls: metric.value })));
      getTTFB((metric) => setMetrics(prev => ({ ...prev, ttfb: metric.value })));
    });
  }, []);
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-0 left-0 bg-black text-white p-2 text-xs font-mono z-50">
      <div>LCP: {metrics.lcp?.toFixed(2)}ms</div>
      <div>FID: {metrics.fid?.toFixed(2)}ms</div>
      <div>CLS: {metrics.cls?.toFixed(3)}</div>
      <div>TTFB: {metrics.ttfb?.toFixed(2)}ms</div>
    </div>
  );
}
```

### 3. Common Development Issues

#### Hot Reload Not Working
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
pnpm install

# Check for file watchers limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### Database Issues
```bash
# Reset database completely
pnpm db:reset

# Check database connection
pnpm db:ping

# View database logs
docker logs aquascene-postgres

# Connect to database directly
psql -h localhost -U aquascene -d aquascene_dev
```

#### Theme Not Loading
```typescript
// Debug theme loading
console.log('Available themes:', await import('@/lib/themes').then(m => m.getAllThemes()));
console.log('Current theme:', localStorage.getItem('aquascene-theme'));
console.log('Theme CSS variables:', getComputedStyle(document.documentElement));
```

## Performance Optimization

### 1. Development Performance

#### Bundle Analysis
```bash
# Analyze bundle size
ANALYZE=true pnpm build

# Check individual component sizes
pnpm build && npx next-bundle-analyzer
```

#### Memory Profiling
```typescript
// src/lib/memory-profiler.ts
export class MemoryProfiler {
  private static measurements: Array<{ name: string; memory: number; timestamp: number }> = [];
  
  static measure(name: string) {
    if (process.env.NODE_ENV !== 'development') return;
    
    const memory = (performance as any).memory?.usedJSHeapSize || 0;
    this.measurements.push({
      name,
      memory,
      timestamp: Date.now()
    });
    
    console.log(`Memory [${name}]: ${(memory / 1024 / 1024).toFixed(2)} MB`);
  }
  
  static getReport() {
    return this.measurements;
  }
  
  static reset() {
    this.measurements = [];
  }
}

// Usage in components
useEffect(() => {
  MemoryProfiler.measure('Component Mounted');
  return () => MemoryProfiler.measure('Component Unmounted');
}, []);
```

### 2. Code Splitting

#### Dynamic Imports
```typescript
// Lazy load heavy components
const ThemeCustomizer = lazy(() => import('@/components/ThemeCustomizer'));
const AdminDashboard = lazy(() => import('@/components/AdminDashboard'));

// Lazy load utilities
const heavyUtils = lazy(() => import('@/lib/heavy-utils'));

// Preload on hover
const preloadUtils = () => import('@/lib/heavy-utils');
```

## Local Testing Strategies

### 1. Mock Services

#### Email Service Mock
```typescript
// src/lib/mocks/email-service.ts
export class MockEmailService {
  static emails: Array<{
    to: string;
    subject: string;
    content: string;
    timestamp: Date;
  }> = [];
  
  static async send(email: EmailData) {
    console.log('📧 Mock Email Sent:', email);
    
    this.emails.push({
      ...email,
      timestamp: new Date()
    });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, id: Math.random().toString(36) };
  }
  
  static getEmails() {
    return this.emails;
  }
  
  static clear() {
    this.emails = [];
  }
}
```

#### AI Service Mock
```typescript
// src/lib/mocks/ai-service.ts
export class MockAIService {
  static async generateContent(prompt: string): Promise<string> {
    console.log('🤖 Mock AI Generation:', prompt);
    
    // Return predetermined responses based on prompt
    const responses: Record<string, string> = {
      'blog-post': 'This is a mock blog post about aquascaping...',
      'instagram-caption': 'Beautiful aquascape! 🌿 #aquascaping #nature',
      'email-content': 'Welcome to our aquascaping community!'
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const responseKey = Object.keys(responses).find(key => 
      prompt.toLowerCase().includes(key)
    );
    
    return responses[responseKey || 'default'] || 'Mock AI response';
  }
}
```

### 2. Feature Flags

#### Feature Flag System
```typescript
// src/lib/feature-flags.ts
interface FeatureFlags {
  enableNewThemes: boolean;
  enableAIContent: boolean;
  enableInstagramIntegration: boolean;
  enableAnalytics: boolean;
  enableBetaFeatures: boolean;
}

export const featureFlags: FeatureFlags = {
  enableNewThemes: process.env.FEATURE_NEW_THEMES === 'true',
  enableAIContent: process.env.FEATURE_AI_CONTENT === 'true',
  enableInstagramIntegration: process.env.FEATURE_INSTAGRAM === 'true',
  enableAnalytics: process.env.FEATURE_ANALYTICS === 'true',
  enableBetaFeatures: process.env.NODE_ENV === 'development'
};

export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  return featureFlags[flag];
}
```

## Development Scripts

### Useful Development Scripts
```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "dev:debug": "NODE_OPTIONS='--inspect' next dev",
    "dev:verbose": "DEBUG=* next dev",
    "dev:clean": "rm -rf .next && pnpm dev",
    
    "build:analyze": "ANALYZE=true next build",
    "build:profile": "next build --profile",
    "build:debug": "next build --debug",
    
    "test:dev": "jest --watch",
    "test:coverage": "jest --coverage --watchAll=false",
    "test:e2e:dev": "playwright test --ui",
    
    "db:dev": "prisma migrate dev",
    "db:reset:dev": "prisma migrate reset --force",
    "db:seed:dev": "tsx prisma/seeds/development.ts",
    "db:studio": "prisma studio",
    
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    
    "dev:email": "email dev --port 3002",
    "dev:docs": "next dev --port 3003",
    
    "health": "node scripts/health-check.js",
    "setup": "node scripts/setup.js"
  }
}
```

This comprehensive local development guide provides everything needed for effective development on the aquascaping platform. Regular updates and additions based on team feedback and new features will keep this guide current and useful.