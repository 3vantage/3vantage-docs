# Developer Guide

## Overview

This guide provides comprehensive instructions for developers working on the aquascaping content generation engine ecosystem. The system consists of multiple interconnected repositories and services that work together to provide AI-powered content creation, social media automation, and customer engagement tools.

## Architecture Overview

### System Components

```mermaid
graph TB
    A[AquaScene Main Platform] --> B[Content Engine]
    C[Waitlist SPA] --> D[Email System]
    B --> E[AI Content Pipeline]
    B --> F[Instagram Automation]
    D --> G[Newsletter System]
    E --> H[Blog Generator]
    F --> I[Social Media Manager]
    G --> J[Email Templates]
    
    subgraph "External Services"
        K[Green Aqua API]
        L[Resend Email]
        M[Instagram API]
        N[OpenAI API]
    end
    
    A --> K
    D --> L
    F --> M
    E --> N
```

### Technology Stack

#### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 4.0 with custom aquascaping palette
- **Animations**: Framer Motion with performance optimization
- **State Management**: Zustand with persistent storage
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: next-intl with multi-language support

#### Backend
- **Runtime**: Node.js 18+ 
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with multiple providers
- **Email**: Resend API with React Email templates
- **AI**: OpenAI GPT-4 with custom fine-tuned prompts
- **Media**: Cloudinary for image optimization and storage
- **Caching**: Redis for session and content caching

#### Development Tools
- **Package Manager**: pnpm (preferred) or npm
- **Linting**: ESLint with Next.js configuration
- **Formatting**: Prettier with Tailwind plugin
- **Testing**: Jest + React Testing Library for unit tests
- **E2E Testing**: Playwright for integration tests
- **Type Checking**: TypeScript strict mode
- **Pre-commit**: Husky for git hooks

## Repository Structure

### Main Repositories

```
3vantage-ecosystem/
├── aquascene/                    # Main platform
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   ├── components/          # React components
│   │   ├── lib/                # Utilities and configurations
│   │   └── themes/             # 15 dynamic themes
│   ├── public/                 # Static assets
│   └── docs/                   # Component documentation
│
├── aquascene-waitlist/          # Waitlist SPA
│   ├── src/
│   │   ├── components/         # Form components
│   │   ├── emails/            # Email templates
│   │   └── lib/               # Validations and utilities
│   └── messages/              # i18n translations
│
├── aquascene-content-engine/    # AI content pipeline
│   ├── src/
│   │   ├── generators/        # Content generators
│   │   ├── processors/        # Content processors
│   │   ├── schedulers/        # Automation schedulers
│   │   └── integrations/      # External API integrations
│   └── prompts/               # AI prompt templates
│
└── 3vantage-docs/              # Documentation hub
    ├── guides/                # Developer guides
    ├── projects/              # Project documentation
    └── demos/                 # Demo scripts and guides
```

## Development Workflow

### 1. Environment Setup

#### Prerequisites
- Node.js 18+ (recommend using nvm)
- pnpm 8+ (or npm 9+)
- PostgreSQL 15+ (or Docker)
- Redis 7+ (optional, for caching)
- Git with SSH keys configured

#### Initial Setup
```bash
# Clone the main repository
git clone git@github.com:3vantage/aquascene.git
cd aquascene

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Set up database
pnpm db:setup

# Start development server
pnpm dev
```

#### Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aquascene"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email
RESEND_API_KEY="re_your_resend_key"
RESEND_FROM_EMAIL="hello@aquascene.com"

# AI Services
OPENAI_API_KEY="sk-your-openai-key"

# Social Media
INSTAGRAM_ACCESS_TOKEN="your-instagram-token"

# External APIs
GREEN_AQUA_API_KEY="your-green-aqua-key"

# Analytics
GOOGLE_ANALYTICS_ID="GA_MEASUREMENT_ID"
```

### 2. Development Commands

#### Core Commands
```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint
pnpm lint:fix              # Fix ESLint errors
pnpm type-check            # TypeScript type checking

# Database
pnpm db:generate           # Generate Prisma client
pnpm db:push               # Push schema changes
pnpm db:migrate            # Run migrations
pnpm db:seed               # Seed development data
pnpm db:studio             # Open Prisma Studio

# Testing
pnpm test                  # Run unit tests
pnpm test:watch            # Run tests in watch mode
pnpm test:e2e              # Run E2E tests
pnpm test:coverage         # Generate coverage report

# Content Generation
pnpm content:generate      # Generate blog content
pnpm content:schedule      # Schedule social media posts
pnpm content:preview       # Preview generated content
```

### 3. Code Standards

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/themes/*": ["./src/themes/*"]
    }
  }
}
```

#### ESLint Configuration
```javascript
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  }
}
```

#### Component Structure
```typescript
// Component template
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'secondary';
}

const Component: React.FC<ComponentProps> = ({ 
  className,
  children,
  variant = 'default'
}) => {
  return (
    <div className={cn(
      'base-styles',
      variant === 'secondary' && 'secondary-styles',
      className
    )}>
      {children}
    </div>
  );
};

export default Component;
```

### 4. Theme Development

#### Theme Structure
```typescript
// src/themes/types.ts
export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  components: {
    header: ComponentConfig;
    hero: ComponentConfig;
    features: ComponentConfig;
  };
  animations: AnimationConfig;
}

// Individual theme file
// src/themes/underwater.ts
export const underwaterTheme: Theme = {
  id: 'underwater',
  name: 'Underwater Paradise',
  description: 'Deep ocean blues with coral accents',
  colors: {
    primary: '#1E40AF',
    secondary: '#0EA5E9',
    accent: '#F59E0B',
    background: '#0F172A',
    foreground: '#F8FAFC'
  },
  // ... theme configuration
};
```

#### Dynamic Theme Switching
```typescript
// src/lib/theme-manager.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  currentTheme: string;
  setTheme: (themeId: string) => void;
  themes: Theme[];
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      currentTheme: 'underwater',
      setTheme: (themeId) => set({ currentTheme: themeId }),
      themes: [] // populated from theme files
    }),
    { name: 'aquascene-theme' }
  )
);
```

### 5. Content Generation Pipeline

#### Blog Content Generator
```typescript
// src/lib/content-generator.ts
import OpenAI from 'openai';

interface BlogPost {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  seoMetadata: SEOMetadata;
}

export class ContentGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateBlogPost(topic: string): Promise<BlogPost> {
    const prompt = `
      Generate a comprehensive aquascaping blog post about ${topic}.
      Include practical tips, equipment recommendations, and step-by-step instructions.
      Target audience: intermediate aquascaping enthusiasts.
      Length: 1500-2000 words.
      Include SEO-optimized title and meta description.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000
    });

    return this.parseGeneratedContent(response.choices[0].message.content);
  }
}
```

#### Social Media Automation
```typescript
// src/lib/instagram-manager.ts
export class InstagramManager {
  private accessToken: string;

  constructor() {
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN!;
  }

  async schedulePost(content: InstagramPost): Promise<void> {
    // Upload media
    const mediaId = await this.uploadMedia(content.imageUrl);
    
    // Create post with scheduling
    await this.createPost({
      media_id: mediaId,
      caption: content.caption,
      scheduled_publish_time: content.scheduledTime
    });
  }

  async generateCaption(imageDescription: string): Promise<string> {
    const prompt = `
      Create an engaging Instagram caption for an aquascaping post.
      Image description: ${imageDescription}
      Include relevant hashtags and call-to-action.
      Tone: inspirational and educational.
    `;

    // Use OpenAI to generate caption
    return this.generateWithAI(prompt);
  }
}
```

### 6. Testing Strategy

#### Unit Testing
```typescript
// src/components/__tests__/WaitlistForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WaitlistForm } from '../WaitlistForm';

describe('WaitlistForm', () => {
  it('should submit form with valid data', async () => {
    render(<WaitlistForm />);
    
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john@example.com' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Join Waitlist' }));
    
    await waitFor(() => {
      expect(screen.getByText('Successfully joined!')).toBeInTheDocument();
    });
  });
});
```

#### E2E Testing
```typescript
// tests/e2e/waitlist-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete waitlist signup flow', async ({ page }) => {
  await page.goto('/en');
  
  // Fill out waitlist form
  await page.fill('[data-testid="name-input"]', 'Test User');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.selectOption('[data-testid="experience-select"]', 'intermediate');
  await page.check('[data-testid="gdpr-consent"]');
  
  // Submit form
  await page.click('[data-testid="submit-button"]');
  
  // Verify success
  await expect(page.getByText('Welcome to the waitlist!')).toBeVisible();
});
```

### 7. Performance Optimization

#### Core Web Vitals
```typescript
// src/lib/performance.ts
export const performanceConfig = {
  // Largest Contentful Paint (LCP) target: < 2.5s
  lcp: {
    target: 2500,
    optimizations: [
      'Image optimization with next/image',
      'Font preloading',
      'Critical CSS inlining'
    ]
  },
  
  // First Input Delay (FID) target: < 100ms
  fid: {
    target: 100,
    optimizations: [
      'Code splitting',
      'Lazy loading',
      'Service worker caching'
    ]
  },
  
  // Cumulative Layout Shift (CLS) target: < 0.1
  cls: {
    target: 0.1,
    optimizations: [
      'Size attributes on images',
      'Skeleton loading states',
      'Avoid dynamic content insertion'
    ]
  }
};
```

#### Bundle Optimization
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'framer-motion',
      '@heroicons/react',
      'lucide-react'
    ]
  },
  images: {
    domains: ['res.cloudinary.com', 'greenaqua.hu'],
    formats: ['image/webp', 'image/avif']
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    };
    return config;
  }
};
```

## Integration Guidelines

### Green Aqua API Integration
```typescript
// src/lib/green-aqua-client.ts
export class GreenAquaClient {
  private apiKey: string;
  private baseUrl = 'https://api.greenaqua.hu/v1';

  async getProducts(category?: string): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/products`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.json();
  }

  async syncInventory(): Promise<void> {
    const products = await this.getProducts();
    
    // Update local database
    await Promise.all(
      products.map(product => 
        this.updateLocalProduct(product)
      )
    );
  }
}
```

### Email System Integration
```typescript
// src/lib/email-client.ts
import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/welcome-email';

export class EmailClient {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    await this.resend.emails.send({
      from: 'AquaScene <hello@aquascene.com>',
      to: [user.email],
      subject: 'Welcome to AquaScene! 🌿',
      react: WelcomeEmail({
        firstName: user.name,
        email: user.email
      })
    });
  }
}
```

## Deployment Considerations

### Environment-Specific Configurations
```typescript
// src/lib/config.ts
const config = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    emailFrom: 'dev@aquascene.com',
    logLevel: 'debug'
  },
  staging: {
    apiUrl: 'https://staging.aquascene.com/api',
    emailFrom: 'staging@aquascene.com',
    logLevel: 'info'
  },
  production: {
    apiUrl: 'https://aquascene.com/api',
    emailFrom: 'hello@aquascene.com',
    logLevel: 'warn'
  }
};

export default config[process.env.NODE_ENV as keyof typeof config];
```

### Build Optimization
```json
{
  "scripts": {
    "build:analyze": "cross-env ANALYZE=true next build",
    "build:production": "next build && next export",
    "build:staging": "cross-env NODE_ENV=staging next build"
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Theme Loading Issues
```bash
# Clear theme cache
rm -rf .next/cache
pnpm dev
```

#### 2. Database Connection Issues
```bash
# Reset database
pnpm db:reset
pnpm db:seed
```

#### 3. Build Errors
```bash
# Clear all caches
rm -rf .next node_modules
pnpm install
pnpm build
```

### Debug Commands
```bash
# Enable debug logging
DEBUG=* pnpm dev

# Check bundle size
pnpm build:analyze

# Test email sending
pnpm test:email

# Validate environment
pnpm validate:env
```

## Contributing Guidelines

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation if needed
4. Submit PR with clear description
5. Ensure CI passes
6. Request code review
7. Merge after approval

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Performance impact is minimal
- [ ] Accessibility requirements met
- [ ] Security considerations addressed

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(themes): add underwater paradise theme`
- `fix(forms): resolve validation error handling`
- `docs(api): update authentication examples`

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Guide](https://www.framer.com/motion/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Email Documentation](https://react.email/docs)

## Support

For development support, contact:
- **Technical Lead**: [gerasimovkris@3vantage.com](mailto:gerasimovkris@3vantage.com)
- **Documentation**: This guide + inline code comments
- **Issues**: GitHub Issues on respective repositories