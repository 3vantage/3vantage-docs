# 3vantage Aquascaping Platform - Complete Deployment Guide

## Overview

This comprehensive deployment guide covers the deployment of both the AquaScene main platform and the AquaScene Waitlist SPA. Both applications are built with Next.js 14 and optimized for modern hosting platforms with emphasis on performance, security, and scalability.

## 🎯 Deployment Targets

### Recommended Hosting Platforms
1. **Vercel** (Primary recommendation) - Built by Next.js team, optimal performance
2. **Netlify** - Excellent for static sites with form handling
3. **AWS Amplify** - Full AWS integration with enterprise features
4. **GitHub Pages** - Free option for static exports
5. **Custom Server** - Docker-based deployment for full control

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18+ (LTS recommended)
- **Package Manager**: npm, yarn, or pnpm
- **Git**: For version control and deployment workflows
- **Domain**: Custom domain for production deployment (optional but recommended)

### Required Accounts
- **Vercel Account** (free tier available)
- **Resend Account** (for email functionality)
- **GitHub Account** (for repository hosting)
- **Domain Registrar** (for custom domain)

### Environment Variables Setup
Both applications require environment variables for email integration and configuration.

## 🚀 AquaScene Waitlist SPA Deployment

The waitlist SPA is the primary launch vehicle for the Green Aqua partnership and should be deployed first.

### Repository Information
- **Repository**: `aquascene-waitlist`
- **Framework**: Next.js 14 with App Router
- **Build Output**: Static export optimized for CDN deployment
- **Target URL**: `waitlist.3vantage.com` or `3vantage.com/waitlist`

### Step-by-Step Vercel Deployment

#### 1. Repository Setup
```bash
# Clone the repository
git clone [repository-url]
cd aquascene-waitlist

# Install dependencies
npm install
# or
pnpm install
```

#### 2. Environment Configuration
Create `.env.local` file in project root:

```env
# Email Integration (Required)
RESEND_API_KEY=re_xxxxxxxxxx_your_resend_api_key_here

# Application Configuration
NEXT_PUBLIC_BASE_URL=https://waitlist.3vantage.com
NEXT_PUBLIC_APP_NAME=3vantage Aquascaping

# Admin Configuration (Optional - for analytics)
ADMIN_KEY=your_secure_admin_key_here

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# GDPR Compliance
NEXT_PUBLIC_PRIVACY_POLICY_URL=https://3vantage.com/privacy
NEXT_PUBLIC_TERMS_URL=https://3vantage.com/terms
```

#### 3. Resend Email Setup

##### Create Resend Account
1. Visit [resend.com](https://resend.com)
2. Sign up for free account (generous free tier)
3. Verify your email address

##### Generate API Key
1. Go to API Keys section in dashboard
2. Click "Create API Key"
3. Name it "3vantage-waitlist-production"
4. Copy the key (starts with `re_`)

##### Configure Sending Domain (Production)
For production deployment, verify your domain:

1. Add your domain in Resend dashboard
2. Add DNS records provided by Resend:
   ```
   Type: TXT
   Name: _resend
   Value: [provided by Resend]
   ```
3. Wait for verification (usually 5-10 minutes)

#### 4. Vercel Deployment Process

##### Option A: Automatic Deployment (Recommended)

1. **Connect Repository to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your `aquascene-waitlist` repository

2. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (project root)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

3. **Set Environment Variables**
   In Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.local`:
     ```
     RESEND_API_KEY=re_xxxxxxxxxx
     NEXT_PUBLIC_BASE_URL=https://waitlist.3vantage.com
     ADMIN_KEY=your_secure_admin_key
     ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy
   - Initial deployment takes 2-3 minutes

##### Option B: Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel

# Follow the prompts:
# ? Set up and deploy "~/aquascene-waitlist"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? aquascene-waitlist
# ? In which directory is your code located? ./

# Deploy to production
vercel --prod
```

#### 5. Custom Domain Configuration

##### Add Custom Domain in Vercel
1. Go to Project Settings > Domains
2. Add your domain: `waitlist.3vantage.com`
3. Vercel will provide DNS configuration

##### Configure DNS Records
Add these records to your domain DNS:

```
Type: CNAME
Name: waitlist
Value: cname.vercel-dns.com

# Or if using root domain:
Type: A
Name: @
Value: 76.76.19.61

Type: A
Name: @
Value: 76.76.19.62
```

##### SSL Certificate
- Vercel automatically provisions SSL certificates
- HTTPS will be available within 5-10 minutes
- Certificate auto-renews every 90 days

### Email Testing & Validation

#### Test Email Integration
```bash
# In development environment
npm run dev

# Open browser to http://localhost:3000/en
# Fill out waitlist form with test email
# Check both:
# 1. User receives welcome email
# 2. gerasimovkris@3vantage.com receives notification
```

#### Production Email Validation
1. **Deliverability Test**: Use tools like [Mail Tester](https://www.mail-tester.com)
2. **Spam Score Check**: Ensure emails don't go to spam
3. **Template Testing**: Verify emails render correctly across clients
4. **Unsubscribe Testing**: Verify unsubscribe links work properly

## 🏢 AquaScene Main Platform Deployment

The main platform showcases the full business capabilities and should be deployed to the primary domain.

### Repository Information
- **Repository**: `aquascene`
- **Framework**: Next.js 14 with TypeScript
- **Features**: 15 dynamic themes, product catalog, portfolio system
- **Target URL**: `3vantage.com` or `aquascene.com`

### Step-by-Step Deployment

#### 1. Repository Preparation
```bash
# Clone the repository
git clone [repository-url]
cd aquascene

# Install dependencies
npm install

# Build the application
npm run build

# Test the build locally
npm start
```

#### 2. Environment Configuration
Create `.env.local` file:

```env
# Application Configuration
NEXT_PUBLIC_BASE_URL=https://3vantage.com
NEXT_PUBLIC_APP_NAME=AquaScene

# Theme System
NEXT_PUBLIC_DEFAULT_THEME=nature
NEXT_PUBLIC_ENABLE_THEME_SWITCHER=true

# Green Aqua Integration (Future)
GREEN_AQUA_API_KEY=ga_xxxxxxxxxx
GREEN_AQUA_WEBHOOK_SECRET=whsec_xxxxxxxxxx

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Contact Form (Optional)
RESEND_API_KEY=re_xxxxxxxxxx
CONTACT_EMAIL=gerasimovkris@3vantage.com
```

#### 3. Vercel Deployment

##### Automatic Deployment
1. **Import Repository**
   - Connect `aquascene` repository to Vercel
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`

2. **Environment Variables**
   Add all variables from step 2 to Vercel dashboard

3. **Deploy**
   - Automatic deployment on git push
   - Build time: ~3-5 minutes (due to theme system)

##### Build Optimization Settings
In Vercel dashboard, configure:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "framework": "nextjs",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "nodejs": "18.x"
}
```

## 🌐 Domain Configuration Strategy

### Domain Structure Recommendation
```
Primary Domain: 3vantage.com
├── Main Platform: 3vantage.com (or www.3vantage.com)
├── Waitlist: waitlist.3vantage.com
├── Blog: blog.3vantage.com (future)
├── API: api.3vantage.com (future)
└── Admin: admin.3vantage.com (future)
```

### DNS Configuration
```
# Root domain
Type: A
Name: @
Value: 76.76.19.61

Type: A
Name: @
Value: 76.76.19.62

# Waitlist subdomain
Type: CNAME
Name: waitlist
Value: cname.vercel-dns.com

# WWW redirect
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Multi-Language URL Structure
```
3vantage.com/en/        # English (default)
3vantage.com/bg/        # Bulgarian
3vantage.com/hu/        # Hungarian

waitlist.3vantage.com/en/   # English waitlist
waitlist.3vantage.com/bg/   # Bulgarian waitlist
waitlist.3vantage.com/hu/   # Hungarian waitlist
```

## 🔒 Security Configuration

### HTTPS & SSL
- **Automatic SSL**: Vercel provides automatic SSL certificates
- **HSTS Headers**: Configured in `next.config.js`
- **Redirect HTTP**: All HTTP traffic redirects to HTTPS

### Security Headers
Configure in `next.config.js`:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};
```

### Environment Security
```bash
# Generate secure admin key
openssl rand -base64 32

# Store in Vercel securely
vercel env add ADMIN_KEY production
```

## 📧 Email System Configuration

### Resend Integration Setup

#### Domain Verification for Production
1. **Add Domain**: Add `3vantage.com` in Resend dashboard
2. **DNS Configuration**:
   ```
   Type: TXT
   Name: _resend
   Value: [provided by Resend]
   
   Type: MX
   Name: @
   Priority: 10
   Value: feedback-smtp.us-east-1.amazonses.com
   ```

#### Email Templates Configuration
The system includes two email templates:

##### 1. Welcome Email (to subscribers)
- **From**: `hello@3vantage.com`
- **Subject**: Localized welcome message
- **Content**: Position on waitlist, next steps, sharing options
- **Design**: Aquascaping-themed HTML template

##### 2. Owner Notification (to gerasimovkris@3vantage.com)
- **From**: `waitlist@3vantage.com`
- **Subject**: "New Waitlist Signup: [Name]"
- **Content**: Subscriber details, total count, recent signups
- **Design**: Admin-focused layout with actionable information

#### Email Automation Workflow
```
User submits form
    ↓
Form validation (client & server)
    ↓
Store in database/file
    ↓
Send welcome email to user
    ↓
Send notification to owner
    ↓
Return success response
    ↓
Show success state to user
```

## 🚀 Performance Optimization

### Build Optimization

#### Next.js Configuration
```javascript
// next.config.js
const nextConfig = {
  output: 'standalone', // For Docker deployment
  images: {
    unoptimized: true, // For static export
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // For multi-language support
  i18n: {
    locales: ['en', 'bg', 'hu'],
    defaultLocale: 'en',
  },
};
```

#### Bundle Analysis
```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# Add to package.json scripts
"analyze": "ANALYZE=true npm run build"

# Run analysis
npm run analyze
```

### CDN & Caching Strategy

#### Vercel Edge Network
- **Global CDN**: Automatic global distribution
- **Edge Functions**: API routes run at edge locations
- **Static Assets**: Cached with optimal headers
- **ISR**: Incremental Static Regeneration for dynamic content

#### Caching Headers
```javascript
// Custom caching in API routes
export async function GET() {
  return new Response(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
```

## 📊 Monitoring & Analytics

### Performance Monitoring

#### Vercel Analytics (Built-in)
- **Core Web Vitals**: Automatic tracking
- **Real User Monitoring**: Performance from actual users
- **Error Tracking**: JavaScript error monitoring
- **Function Performance**: API route performance

#### Additional Monitoring Options
```javascript
// Add to _app.tsx for detailed monitoring
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### Business Analytics

#### Waitlist Metrics
- **Signup Rate**: Conversions per visitor
- **Language Distribution**: Usage by locale
- **Referral Sources**: Traffic source analysis
- **Device Analysis**: Mobile vs desktop usage

#### Custom Analytics Events
```javascript
// Track custom events
import { track } from '@vercel/analytics';

// Track form submissions
track('waitlist_signup', {
  language: locale,
  experience: formData.experience,
});

// Track theme usage (main platform)
track('theme_switch', {
  from_theme: previousTheme,
  to_theme: newTheme,
});
```

## 🛠️ Maintenance & Updates

### Automated Deployment Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

#### Update Process
1. **Development**: Make changes in feature branches
2. **Testing**: Automated tests run on pull requests
3. **Review**: Code review process
4. **Merge**: Merge to main branch
5. **Deploy**: Automatic deployment to production

### Content Updates

#### Translation Updates
```bash
# Add new translations
# Edit messages/[locale].json files

# Validate translations
npm run build

# Deploy updates
git add messages/
git commit -m "Update translations"
git push origin main
```

#### Theme Updates
```bash
# Add new theme
# Edit src/data/themes.ts

# Test theme system
npm run dev

# Deploy new theme
git add src/data/themes.ts
git commit -m "Add new theme: [theme-name]"
git push origin main
```

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### Email Not Sending
1. **Check API Key**: Verify Resend API key is correct
2. **Domain Verification**: Ensure domain is verified in Resend
3. **Rate Limits**: Check Resend dashboard for rate limit issues
4. **Environment Variables**: Verify all email-related env vars are set

#### Slow Loading Times
1. **Analyze Bundle**: Use bundle analyzer to identify large dependencies
2. **Optimize Images**: Ensure images are properly optimized
3. **Check CDN**: Verify CDN is properly configured
4. **Monitor Performance**: Use Vercel Analytics to identify bottlenecks

#### Multi-language Issues
1. **Translation Missing**: Check all translation files have required keys
2. **URL Routing**: Verify locale routing is properly configured
3. **Default Language**: Ensure default locale fallbacks work
4. **SEO Tags**: Check hreflang tags are properly generated

### Emergency Procedures

#### Rollback Deployment
```bash
# Via Vercel CLI
vercel rollback [deployment-url]

# Via Vercel Dashboard
# Go to Deployments tab, click "Promote to Production" on previous version
```

#### Database Recovery (Future)
```bash
# If using database in future
# Backup before major updates
pg_dump $DATABASE_URL > backup.sql

# Restore if needed
psql $DATABASE_URL < backup.sql
```

## 🎯 Launch Checklist

### Pre-Launch Verification

#### Technical Checklist
- [ ] **DNS Configuration**: All domains resolve correctly
- [ ] **SSL Certificates**: HTTPS working on all domains
- [ ] **Email Integration**: Both user and admin emails sending
- [ ] **Form Validation**: All form fields validate properly
- [ ] **Multi-language**: All locales working correctly
- [ ] **Mobile Responsive**: Testing on various devices
- [ ] **Performance**: PageSpeed Insights score 90+
- [ ] **Accessibility**: WCAG AA compliance verified
- [ ] **Analytics**: Tracking scripts installed and working

#### Content Checklist
- [ ] **Translations**: All text translated for all languages
- [ ] **Legal Pages**: Privacy policy and terms of service
- [ ] **Contact Information**: Correct email addresses
- [ ] **Branding**: Consistent branding across all pages
- [ ] **Meta Tags**: SEO meta tags for all pages
- [ ] **Social Media**: Open Graph tags for social sharing

#### Business Checklist
- [ ] **Partnership Agreement**: Green Aqua partnership finalized
- [ ] **Email Workflows**: Notification system tested
- [ ] **Admin Access**: Admin panels accessible
- [ ] **Backup Systems**: Data backup procedures in place
- [ ] **Monitoring**: Error monitoring and alerting setup

### Launch Day Procedure

#### Hour 0: Final Checks
1. **Verify Production Environment**: All systems green
2. **Test Critical Paths**: Form submission, email delivery
3. **Monitor Dashboard**: Set up monitoring dashboards
4. **Team Notification**: Alert team that launch is proceeding

#### Hour 1: Go Live
1. **DNS Switch**: Point domains to production
2. **SSL Verification**: Confirm HTTPS working
3. **Functionality Test**: Complete end-to-end test
4. **Performance Check**: Verify loading times

#### Hour 2-24: Monitoring
1. **Error Monitoring**: Watch for any errors or issues
2. **Performance Tracking**: Monitor Core Web Vitals
3. **Email Delivery**: Confirm emails are being delivered
4. **User Feedback**: Monitor for any user-reported issues

## 📞 Support & Maintenance

### Support Contacts
- **Technical Issues**: Development team
- **Business Questions**: gerasimovkris@3vantage.com
- **Emergency Contact**: 24/7 support for critical issues

### Maintenance Schedule
- **Daily**: Automated health checks and performance monitoring
- **Weekly**: Review analytics and performance metrics
- **Monthly**: Security updates and dependency updates
- **Quarterly**: Comprehensive performance audit and optimization

### Update Procedures
1. **Security Updates**: Apply immediately when available
2. **Feature Updates**: Follow standard development workflow
3. **Content Updates**: Can be deployed immediately
4. **Major Changes**: Require testing and approval process

---

## Conclusion

This deployment guide provides comprehensive instructions for deploying both the AquaScene main platform and waitlist SPA. The combination of modern hosting (Vercel), reliable email service (Resend), and optimized Next.js applications ensures a professional, scalable, and maintainable deployment.

Key benefits of this deployment strategy:
- **Zero Infrastructure Management**: Serverless deployment handles scaling automatically
- **Global Performance**: CDN distribution ensures fast loading worldwide
- **Automatic SSL**: Security handled automatically with certificate management
- **Easy Updates**: Git-based deployment workflow for easy maintenance
- **Cost Effective**: Free tier available, pay-as-you-scale pricing model

The platform is now ready for production deployment and Green Aqua partnership launch.

**Status**: ✅ **DEPLOYMENT-READY**

*Deployment guide completed on August 5, 2025 - Ready for production launch*