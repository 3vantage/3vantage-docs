# Developer Setup & Contribution Guide

Complete setup guide for developers working on the AquaScene Ecosystem.

## Overview

The AquaScene ecosystem consists of 4 integrated applications that work together to provide AI-powered aquascaping content generation and social media automation.

## System Requirements

### Minimum Requirements
- **OS**: macOS, Linux, or Windows with WSL2
- **Memory**: 8GB RAM (16GB recommended)
- **Storage**: 20GB available space
- **Node.js**: v18.0.0 or higher
- **Python**: v3.9 or higher
- **Docker**: v20.10 or higher
- **Docker Compose**: v2.0 or higher

### Development Tools
- **Git**: v2.30 or higher
- **Code Editor**: VS Code recommended with extensions
- **Terminal**: Modern terminal (iTerm2, Windows Terminal, etc.)

## Project Structure

```
AquaScene Ecosystem/
├── aquascape-social-hub/         # Backend API (Express.js + TypeScript)
│   ├── src/
│   │   ├── controllers/          # API controllers
│   │   ├── models/               # Database models
│   │   ├── services/             # Business logic
│   │   ├── middleware/           # Auth and validation
│   │   └── routes/               # API routes
│   ├── database/
│   │   ├── migrations/           # Database migrations
│   │   └── seeds/                # Sample data
│   └── tests/                    # Backend tests
├── aquascape-social-hub-frontend/ # Frontend Dashboard (Next.js 15)
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Next.js pages
│   │   ├── hooks/                # Custom React hooks
│   │   ├── stores/               # Zustand state management
│   │   └── utils/                # Utility functions
│   └── public/                   # Static assets
├── aquascape-ai-pipeline/        # AI Services (Python FastAPI)
│   ├── app/
│   │   ├── api/                  # API routes
│   │   ├── core/                 # Configuration
│   │   ├── models/               # Data models
│   │   ├── services/             # AI services
│   │   └── utils/                # Utility functions
│   └── tests/                    # Python tests
└── aquascape-infrastructure/     # DevOps (Docker + Monitoring)
    ├── docker/                   # Docker configurations
    ├── monitoring/               # Prometheus, Grafana, Loki
    ├── scripts/                  # Deployment scripts
    └── docs/                     # Infrastructure documentation
```

## Quick Setup

### 1. Clone Repositories

```bash
# Create project directory
mkdir aquascape-ecosystem && cd aquascape-ecosystem

# Clone all repositories
git clone https://github.com/yourusername/aquascape-social-hub.git
git clone https://github.com/yourusername/aquascape-social-hub-frontend.git
git clone https://github.com/yourusername/aquascape-ai-pipeline.git
git clone https://github.com/yourusername/aquascape-infrastructure.git
git clone https://github.com/yourusername/3vantage-docs.git
```

### 2. Environment Setup

```bash
# Install Node.js dependencies for backend
cd aquascape-social-hub
npm install
cp .env.example .env.local
npm run dev

# Install Node.js dependencies for frontend
cd ../aquascape-social-hub-frontend
npm install
cp .env.example .env.local
npm run dev

# Install Python dependencies for AI pipeline
cd ../aquascape-ai-pipeline
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python main.py

# Setup infrastructure
cd ../aquascape-infrastructure
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Database Setup

```bash
# Backend database setup
cd aquascape-social-hub
npm run db:migrate
npm run db:seed

# Verify database connection
npm run db:status
```

### 4. Verify Installation

```bash
# Check all services are running
curl http://localhost:3001/api/health  # Backend API
curl http://localhost:3000             # Frontend
curl http://localhost:8000/health      # AI Pipeline
curl http://localhost:9090             # Prometheus
curl http://localhost:3000             # Grafana
```

## Development Workflow

### Branch Strategy

```bash
main                    # Production-ready code
├── develop            # Integration branch
├── feature/[name]     # Feature development
├── bugfix/[name]      # Bug fixes
└── hotfix/[name]      # Critical production fixes
```

### Git Workflow

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/ai-content-enhancement

# Make changes and commit
git add .
git commit -m "feat: add content quality scoring"

# Push and create PR
git push origin feature/ai-content-enhancement
# Create Pull Request to develop branch
```

### Environment Configuration

#### Backend (.env.local)
```env
# Database
DATABASE_URL=sqlite:./dev.db
POSTGRES_URL=postgresql://user:pass@localhost:5432/aquascape_dev

# API Keys
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_gemini_key

# Social Media APIs
INSTAGRAM_CLIENT_ID=your_instagram_id
INSTAGRAM_CLIENT_SECRET=your_instagram_secret
FACEBOOK_APP_ID=your_facebook_id
FACEBOOK_APP_SECRET=your_facebook_secret

# Email
RESEND_API_KEY=your_resend_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_API_URL=http://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development
```

#### AI Pipeline (.env)
```env
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_gemini_key
DATABASE_URL=sqlite:///./ai_dev.db
BACKEND_API_URL=http://localhost:3001
```

## Code Style & Standards

### TypeScript/JavaScript Standards

```javascript
// Use TypeScript strict mode
// Follow Prettier formatting
// Use ESLint configuration

// Example: Proper type definitions
interface ContentItem {
  id: string;
  title: string;
  content: string;
  platform: 'instagram' | 'facebook' | 'youtube';
  status: 'draft' | 'scheduled' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

// Example: Async/await with proper error handling
const generateContent = async (params: ContentParams): Promise<ContentItem> => {
  try {
    const result = await aiService.generate(params);
    return await contentService.save(result);
  } catch (error) {
    logger.error('Content generation failed:', error);
    throw new Error('Failed to generate content');
  }
};
```

### Python Standards

```python
# Follow PEP 8 style guide
# Use type hints
# Use dataclasses for models

from typing import Optional, List
from dataclasses import dataclass
from datetime import datetime

@dataclass
class ContentRequest:
    topic: str
    platform: str
    language: str
    tone: Optional[str] = "professional"

async def generate_ai_content(request: ContentRequest) -> str:
    """Generate AI content based on request parameters."""
    try:
        response = await openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": get_system_prompt(request.platform)},
                {"role": "user", "content": f"Create content about: {request.topic}"}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"AI generation failed: {e}")
        raise
```

### Database Migrations

#### Creating Migrations

```bash
# Backend (TypeScript)
cd aquascape-social-hub
npm run migration:create -- --name add_content_analytics

# Edit the generated migration file
# Run migration
npm run migration:run

# AI Pipeline (Python/Alembic)
cd aquascape-ai-pipeline
alembic revision --autogenerate -m "Add content scoring table"
alembic upgrade head
```

#### Migration Example

```javascript
// TypeScript migration
export const up = async (queryRunner: QueryRunner): Promise<void> => {
    await queryRunner.query(`
        CREATE TABLE content_analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content_id VARCHAR(255) NOT NULL,
            platform VARCHAR(50) NOT NULL,
            views INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            shares INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
};
```

## Testing

### Running Tests

```bash
# Backend tests
cd aquascape-social-hub
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:coverage     # Coverage report

# Frontend tests
cd aquascape-social-hub-frontend
npm run test              # Jest + React Testing Library
npm run test:e2e          # Playwright E2E tests

# AI Pipeline tests
cd aquascape-ai-pipeline
pytest                    # Python tests
pytest --cov=app         # Coverage report
```

### Test Examples

#### Backend Testing

```javascript
// Unit test example
describe('ContentService', () => {
  it('should generate social media content', async () => {
    const mockAIService = jest.fn().mockResolvedValue('Generated content');
    const contentService = new ContentService(mockAIService);
    
    const result = await contentService.generateContent({
      topic: 'aquascaping',
      platform: 'instagram'
    });
    
    expect(result.content).toBe('Generated content');
    expect(result.platform).toBe('instagram');
  });
});

// Integration test example
describe('Content API', () => {
  it('POST /api/content should create new content', async () => {
    const response = await request(app)
      .post('/api/content')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Content',
        type: 'instagram_post'
      })
      .expect(201);

    expect(response.body.data.title).toBe('Test Content');
  });
});
```

#### Frontend Testing

```javascript
// Component test
import { render, screen, fireEvent } from '@testing-library/react';
import ContentForm from '../ContentForm';

test('should submit content form', async () => {
  const mockSubmit = jest.fn();
  render(<ContentForm onSubmit={mockSubmit} />);
  
  fireEvent.change(screen.getByLabelText(/title/i), {
    target: { value: 'Test Title' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(mockSubmit).toHaveBeenCalledWith({
    title: 'Test Title'
  });
});
```

## Debugging

### Backend Debugging

```javascript
// VS Code launch.json for Node.js debugging
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeArgs": ["-r", "ts-node/register"]
    }
  ]
}
```

### Python Debugging

```python
# Using debugger in code
import pdb; pdb.set_trace()  # Set breakpoint

# Or using Python debugger
import debugpy
debugpy.listen(5678)
debugpy.wait_for_client()  # Pause execution
```

### Frontend Debugging

```javascript
// React DevTools for component debugging
// Browser DevTools for network requests
// Console logging with structured data

const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}:`, data);
  }
};
```

## Performance Optimization

### Database Optimization

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_content_platform ON content_items(platform);
CREATE INDEX idx_content_created_at ON content_items(created_at);
CREATE INDEX idx_analytics_content_id ON content_analytics(content_id);

-- Query optimization
EXPLAIN QUERY PLAN 
SELECT * FROM content_items 
WHERE platform = 'instagram' 
AND created_at > datetime('now', '-7 days');
```

### API Performance

```javascript
// Implement caching for expensive operations
import { LRUCache } from 'lru-cache';

const contentCache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 10 // 10 minutes
});

const getCachedContent = async (key: string) => {
  let content = contentCache.get(key);
  if (!content) {
    content = await generateExpensiveContent(key);
    contentCache.set(key, content);
  }
  return content;
};
```

### Frontend Optimization

```javascript
// React optimization techniques
import { memo, useMemo, useCallback } from 'react';

const ContentList = memo(({ items, onSelect }) => {
  const sortedItems = useMemo(() => 
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [items]
  );

  const handleSelect = useCallback((id) => {
    onSelect(id);
  }, [onSelect]);

  return (
    <div>
      {sortedItems.map(item => (
        <ContentItem key={item.id} item={item} onSelect={handleSelect} />
      ))}
    </div>
  );
});
```

## Monitoring & Logging

### Application Logging

```javascript
// Structured logging with Winston
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage
logger.info('Content generated successfully', {
  contentId: '123',
  platform: 'instagram',
  duration: 2300
});
```

### Error Monitoring

```javascript
// Error boundary for React
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to monitoring service
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

## Contributing Guidelines

### Pull Request Process

1. **Fork and Branch**: Fork repository and create feature branch
2. **Code Changes**: Make your changes following style guidelines
3. **Tests**: Add tests for new functionality
4. **Documentation**: Update relevant documentation
5. **PR Description**: Provide clear description of changes
6. **Code Review**: Address review feedback
7. **Merge**: Squash and merge after approval

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings or errors
```

### Code Review Guidelines

**For Reviewers:**
- Check code functionality and logic
- Verify test coverage
- Ensure documentation is updated
- Confirm style guidelines followed
- Provide constructive feedback

**For Contributors:**
- Respond to feedback promptly
- Make requested changes
- Update tests if needed
- Squash commits before merge

## Deployment

### Development Deployment

```bash
# Start all services in development mode
cd aquascape-infrastructure
docker-compose -f docker-compose.dev.yml up -d

# Hot reload for development
cd aquascape-social-hub
npm run dev

cd aquascape-social-hub-frontend
npm run dev

cd aquascape-ai-pipeline
python main.py --reload
```

### Production Deployment

```bash
# Build production images
./scripts/build-production.sh

# Deploy to production
./scripts/deploy-production.sh

# Monitor deployment
./scripts/health-check.sh
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Find process using port
   lsof -i :3000
   # Kill process
   kill -9 PID
   ```

2. **Database Connection Issues**
   ```bash
   # Reset database
   npm run db:reset
   # Check database status
   npm run db:status
   ```

3. **Docker Issues**
   ```bash
   # Reset Docker environment
   docker-compose down -v
   docker system prune -f
   docker-compose up -d --force-recreate
   ```

### Getting Help

- **Documentation**: Check relevant documentation first
- **Issues**: Search GitHub issues for similar problems
- **Discussions**: Use GitHub discussions for questions
- **Code Review**: Request help during PR review
- **Team Chat**: Use team communication channels

## Resources

### Documentation
- [API Documentation](../api-docs/README.md)
- [Deployment Guide](../deployment/production-setup.md)
- [Troubleshooting](../troubleshooting/README.md)

### Tools
- [VS Code Extensions](.vscode/extensions.json)
- [Postman Collection](./postman/aquascape-api.json)
- [Docker Configurations](../infrastructure/docker/)

### Learning Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Documentation](https://docs.docker.com/)

**Happy coding! 🚀**