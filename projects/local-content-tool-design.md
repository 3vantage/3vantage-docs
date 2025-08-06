# Local Aquascaping Content Generation Tool - Design Document

## Team Meeting Summary
**Participants**: Backend Architect, Frontend Developer, AI Engineer  
**Date**: August 6, 2025  
**Goal**: Design a local-first content generation tool for aquascaping content

## 1. Architecture Overview

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Local Dev     │    │   Image AI   │    │  Waitlist VPS   │
│   Environment   │    │   Services    │    │   (Optional)    │
├─────────────────┤    ├──────────────┤    ├─────────────────┤
│ • Next.js App   │────│ • Gemini API │    │ • Node.js/Express│
│ • Template Eng. │    │ • Stability   │    │ • PostgreSQL    │
│ • Local Storage │    │ • OpenAI     │    │ • Static Files  │
│ • File System   │    │              │    │                 │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

### Core Principles
- **Local-First**: Everything runs on developer machine
- **File-Based**: Templates and content stored as files
- **API-Light**: Only external calls for image generation
- **Simple Deploy**: Static site + minimal backend

## 2. Technology Stack

### Local Development Environment
```yaml
Frontend: Next.js 14 (App Router)
Styling: Tailwind CSS + shadcn/ui
Templates: React components + MDX
Storage: Local file system + SQLite
Image Processing: Sharp.js
AI APIs: Google Gemini, Stability AI, OpenAI
```

### Waitlist Backend (VPS)
```yaml
Runtime: Node.js + Express
Database: PostgreSQL (managed)
Hosting: DigitalOcean Droplet ($5/month)
SSL: Let's Encrypt
```

## 3. File Structure

```
aquascape-content-tool/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── generate-image/       # Gemini API integration
│   │   ├── morph-image/          # Image manipulation
│   │   └── export-newsletter/    # Template export
│   ├── dashboard/                # Main UI
│   ├── templates/                # Newsletter previews
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── newsletter/               # Newsletter components
│   ├── image-generator/          # AI image tools
│   └── template-editor/          # Template customization
├── lib/
│   ├── ai/                       # AI service integrations
│   ├── templates/                # Template engine
│   ├── database.ts               # Local SQLite
│   └── utils.ts
├── templates/                    # Newsletter templates
│   ├── minimal-modern/
│   ├── vibrant-showcase/
│   ├── expert-tips/
│   └── product-feature/
├── public/
│   ├── stock-images/             # Local aquascaping images
│   ├── templates-preview/        # Template screenshots
│   └── assets/
├── data/
│   ├── local.db                  # SQLite database
│   ├── generated-content/        # AI outputs
│   └── exports/                  # Final newsletters
├── waitlist-backend/             # Separate VPS backend
│   ├── server.js
│   ├── routes/
│   └── database/
└── README.md
```

## 4. Quick Start Guide

### Prerequisites
```bash
# Required
node.js 18+
npm or yarn
Git

# API Keys (store in .env.local)
GOOGLE_GEMINI_API_KEY=your_key
STABILITY_API_KEY=your_key  
OPENAI_API_KEY=your_key
```

### Installation
```bash
# Clone and setup
git clone [repo-url]
cd aquascape-content-tool
npm install

# Setup environment
cp .env.example .env.local
# Add your API keys

# Initialize local database
npm run db:setup

# Start development
npm run dev
# Opens http://localhost:3000
```

### First Use
1. Open dashboard at `http://localhost:3000`
2. Choose a newsletter template
3. Generate aquascaping images with AI prompts
4. Customize content and layout
5. Export as HTML/PDF for distribution

## 5. Image Generation Workflow

### Text-to-Image Pipeline
```typescript
interface ImageGeneration {
  prompt: string;
  style: 'photorealistic' | 'artistic' | 'minimalist';
  resolution: '1024x1024' | '1920x1080' | '800x600';
  aquascapeType: 'planted' | 'iwagumi' | 'dutch' | 'nature';
}

// Example workflow
1. User inputs: "Iwagumi aquascape with dragon stone and carpet plants"
2. System enhances: "Professional aquascaping photo, Iwagumi style layout, 
   dragon stone hardscape, lush green carpet plants, crystal clear water,
   natural lighting, high detail, photorealistic"
3. Generate via Gemini/Stability API
4. Post-process with Sharp.js (crop, optimize)
5. Save to local storage with metadata
```

### Stock Image Morphing
```typescript
interface ImageMorphing {
  sourceImage: File | URL;
  modifications: string[];  // ["add more plants", "change lighting", "remove fish"]
  strength: number;         // 0.1-1.0 modification intensity
}

// Process
1. Load stock aquascaping image
2. Generate mask for modifications
3. Use AI inpainting to apply changes
4. Blend with original for natural result
```

## 6. Newsletter Template System

### Template Structure
```
templates/minimal-modern/
├── config.json              # Template metadata
├── layout.tsx              # React component
├── styles.css              # Custom styles
├── preview.png             # Template thumbnail
└── sample-content.json     # Example data
```

### Available Templates

#### 1. Minimal Modern
- Clean, professional layout
- Focus on single hero image
- Perfect for product features
- Minimal text, maximum impact

#### 2. Vibrant Showcase
- Multi-image grid layout
- Colorful accents and borders
- Great for tank showcases
- Community highlights

#### 3. Expert Tips
- Text-heavy educational layout
- Step-by-step sections
- Diagram/infographic support
- Tutorial-friendly format

#### 4. Product Feature
- E-commerce focused
- Product comparison tables
- Price highlights
- Call-to-action buttons

### Template Customization
```typescript
interface TemplateConfig {
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: {
    columns: number;
    spacing: string;
  };
}
```

## 7. Waitlist Backend Design (Minimal VPS)

### Simple Express Server
```javascript
// server.js - Ultra minimal
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const db = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json());

// Single endpoint for waitlist
app.post('/api/waitlist', async (req, res) => {
  const { email, source } = req.body;
  
  try {
    await db.query(
      'INSERT INTO waitlist (email, source, created_at) VALUES ($1, $2, NOW())',
      [email, source]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.listen(3001);
```

### Database Schema
```sql
-- Minimal waitlist table
CREATE TABLE waitlist (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(100),  -- where they signed up from
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_waitlist_created ON waitlist(created_at);
```

### Static Site Deployment
```bash
# Build static export
npm run build
npm run export

# Deploy to VPS
rsync -av out/ user@your-vps:/var/www/html/
```

## 8. Implementation Timeline

### Day 1: Foundation
- [ ] Setup Next.js project with TypeScript
- [ ] Install and configure Tailwind CSS + shadcn/ui
- [ ] Create basic file structure
- [ ] Setup local SQLite database
- [ ] Basic dashboard layout

### Day 2: Templates
- [ ] Create template engine architecture
- [ ] Build 2 basic newsletter templates (Minimal Modern, Vibrant Showcase)
- [ ] Template preview and selection UI
- [ ] Template customization basics (colors, fonts)

### Day 3: Image Generation
- [ ] Integrate Google Gemini API
- [ ] Build text-to-image interface
- [ ] Image optimization and storage
- [ ] Basic prompt enhancement system

### Day 4: Content Management
- [ ] Content editor interface
- [ ] Image insertion and positioning
- [ ] Text editing and formatting
- [ ] Preview functionality

### Day 5: Export & Polish
- [ ] HTML/PDF export functionality
- [ ] File management system
- [ ] UI polish and error handling
- [ ] Basic documentation

### Weekend: Waitlist Backend
- [ ] Setup VPS (DigitalOcean)
- [ ] Deploy minimal Express server
- [ ] PostgreSQL setup
- [ ] Static site deployment
- [ ] SSL certificate

## 9. Key Features

### Content Generation
- AI-powered aquascaping image creation
- Stock image modification and enhancement
- Automated content suggestions
- Template-based layout system

### Developer Experience
- Hot reload during development
- Local file-based storage
- No complex configuration
- Single command startup

### Export Options
- HTML email format
- PDF for print
- Social media formats
- Web-optimized images

## 10. Costs & Resources

### Development Costs
- Local development: $0
- API calls: ~$5-10/month (testing)
- VPS hosting: $5/month
- Domain: $10/year

### API Usage Estimates
```
Image generation: ~$0.02 per image
Text processing: ~$0.001 per request
Monthly budget: $10-20 covers 500+ images
```

## 11. Success Metrics

### Developer Adoption
- Time from clone to first newsletter: < 5 minutes
- Template customization: < 2 minutes
- Image generation: < 30 seconds

### Content Quality
- Generated images match aquascaping aesthetics
- Templates look professional out-of-the-box
- Export formats work across email clients

## 12. Future Enhancements (Post-MVP)

### Phase 2 Features
- More newsletter templates
- Video generation capabilities
- Social media post templates
- Batch image processing

### Phase 3 Features
- Template marketplace
- Team collaboration
- Analytics integration
- Advanced AI features

---

## Getting Started

Ready to build? Follow these steps:

1. **Setup**: Clone repo, install dependencies, add API keys
2. **Test**: Generate your first aquascaping image
3. **Create**: Build a newsletter using a template
4. **Export**: Output HTML and share

This tool is designed for speed and simplicity. Start building, iterate quickly, and focus on what works for real aquascaping content creation.

---

**Architecture Decision Log**:
- Chose Next.js for full-stack simplicity and React familiarity
- Local SQLite over cloud databases for offline capability
- File-based templates for easy customization and version control
- Minimal VPS backend to keep costs under $10/month
- Sharp.js for image processing to avoid external dependencies