# 3vantage Aquascaping Waitlist SPA - Comprehensive Design Specification

## Executive Summary

This design specification outlines the complete visual and interactive design system for the 3vantage aquascaping waitlist SPA, targeting Bulgarian and Hungarian markets with a focus on the Green Aqua partnership. The design emphasizes conversion optimization, cultural sensitivity, and the serene aesthetic of professional aquascaping.

## 1. Color Scheme & Brand Palette

### 1.1 Primary Color Palette

**Nature-Inspired Aquascaping Colors:**
- **Primary Green**: `#2D5A3D` (Deep Forest Green - trust, nature, growth)
- **Secondary Green**: `#4A7C59` (Sage Green - balance, harmony)
- **Accent Green**: `#6B9B7C` (Soft Eucalyptus - freshness, renewal)
- **Light Green**: `#A8C9B0` (Mint Whisper - clean, modern)
- **Highlight Green**: `#1A8B42` (Vibrant Emerald - CTAs, success states)

**Complementary Underwater Palette:**
- **Deep Blue**: `#1E3A5F` (Ocean Depth - premium, professional)
- **Aqua Blue**: `#4A90A4` (Clear Water - transparency, clarity)
- **Light Aqua**: `#87CEEB` (Shallow Water - lightness, accessibility)
- **Sand Beige**: `#F5F1E8` (Substrate - natural, grounding)
- **Coral Accent**: `#FF6B6B` (Living Coral - energy, life, CTAs)

### 1.2 Neutral Foundation

**Base Neutrals:**
- **Pure White**: `#FFFFFF` (Clean backgrounds, forms)
- **Off-White**: `#FAFAFA` (Subtle backgrounds, cards)
- **Light Gray**: `#F8F9FA` (Section dividers, subtle surfaces)
- **Medium Gray**: `#6C757D` (Secondary text, placeholders)
- **Dark Gray**: `#343A40` (Primary text, headings)
- **Charcoal**: `#212529` (High contrast text, navigation)

### 1.3 Semantic Colors

**Status Colors:**
- **Success**: `#28A745` (Form success, completion states)
- **Warning**: `#FFC107` (Caution, attention needed)
- **Error**: `#DC3545` (Validation errors, failures)
- **Info**: `#17A2B8` (Informational messages, tips)

## 2. Typography System

### 2.1 Font Families

**Primary Typeface - Headings:**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```
- Modern, highly legible
- Excellent at all sizes
- Strong multilingual support (Bulgarian Cyrillic)
- Professional, trustworthy appearance

**Secondary Typeface - Body:**
```css
font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```
- Optimized for reading
- Clean, approachable feel
- Great for longer text blocks
- Excellent accessibility scores

**Accent Typeface - Special Elements:**
```css
font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
```
- For premium messaging
- Elegant, sophisticated
- Use sparingly for impact

### 2.2 Typography Scale

**Desktop Typography:**
```css
/* Hero Heading */
.heading-xl { font-size: 3.5rem; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; }

/* Main Headings */
.heading-lg { font-size: 2.5rem; font-weight: 600; line-height: 1.2; letter-spacing: -0.01em; }

/* Section Headings */
.heading-md { font-size: 1.875rem; font-weight: 600; line-height: 1.3; }

/* Subheadings */
.heading-sm { font-size: 1.25rem; font-weight: 500; line-height: 1.4; }

/* Body Large */
.text-lg { font-size: 1.125rem; font-weight: 400; line-height: 1.6; }

/* Body Regular */
.text-base { font-size: 1rem; font-weight: 400; line-height: 1.6; }

/* Body Small */
.text-sm { font-size: 0.875rem; font-weight: 400; line-height: 1.5; }

/* Caption */
.text-xs { font-size: 0.75rem; font-weight: 400; line-height: 1.4; }
```

**Mobile Typography (Responsive Adjustments):**
```css
@media (max-width: 768px) {
  .heading-xl { font-size: 2.5rem; }
  .heading-lg { font-size: 2rem; }
  .heading-md { font-size: 1.5rem; }
  .heading-sm { font-size: 1.125rem; }
}
```

## 3. Layout Structure & Wireframes

### 3.1 Page Architecture

**Single-Page Application Structure:**
```
Header (Sticky Navigation)
├── Logo/Brand
├── Language Toggle (BG/EN)
└── Contact CTA

Hero Section
├── Compelling Headline
├── Value Proposition
├── Hero Visual/Video
└── Primary CTA

Social Proof Section
├── Partner Logos (Green Aqua)
├── User Count/Statistics
└── Trust Indicators

Features/Benefits Section
├── 3-Column Feature Grid
├── Visual Icons
└── Benefit Descriptions

Waitlist Form Section
├── Email Capture Form
├── Referral System
└── GDPR Compliance

Footer
├── Legal Links
├── Social Media
└── Contact Information
```

### 3.2 Desktop Wireframe (1200px+)

```
┌─────────────────────────────────────────────────┐
│ [Logo]              [BG|EN]        [Contact]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐  ┌─────────────────────────┐  │
│  │             │  │ Join the Aquascaping    │  │
│  │ Hero Video  │  │ Revolution              │  │
│  │ or Image    │  │                         │  │
│  │             │  │ Get early access to...  │  │
│  │             │  │                         │  │
│  │             │  │ [Join Waitlist Button]  │  │
│  └─────────────┘  └─────────────────────────┘  │
│                                                 │
├─────────────────────────────────────────────────┤
│ "Trusted by 500+ aquascaping enthusiasts"      │
│ [Green Aqua Logo] [Partner Logos] [Statistics] │
├─────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐     │
│ │ Feature 1 │ │ Feature 2 │ │ Feature 3 │     │
│ │ [Icon]    │ │ [Icon]    │ │ [Icon]    │     │
│ │ Title     │ │ Title     │ │ Title     │     │
│ │ Desc...   │ │ Desc...   │ │ Desc...   │     │
│ └───────────┘ └───────────┘ └───────────┘     │
├─────────────────────────────────────────────────┤
│              Waitlist Form                      │
│ ┌─────────────────────────────────────────────┐ │
│ │ [Email Input Field]                         │ │
│ │ [Name Input Field]                          │ │
│ │ [✓] GDPR Consent Checkbox                   │ │
│ │ [Reserve My Spot - Button]                  │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│ Footer: [Privacy] [Terms] [Contact] [Social]   │
└─────────────────────────────────────────────────┘
```

### 3.3 Mobile Wireframe (< 768px)

```
┌─────────────────┐
│ [☰] [Logo] [EN] │
├─────────────────┤
│ Join the        │
│ Aquascaping     │
│ Revolution      │
│                 │
│ ┌─────────────┐ │
│ │ Hero Image  │ │
│ │ or Video    │ │
│ └─────────────┘ │
│                 │
│ Get early...    │
│                 │
│ [Join Waitlist] │
├─────────────────┤
│ "Trusted by     │
│ 500+ aquascap-  │
│ ing enthusiasts"│
│                 │
│ [Green Aqua]    │
│ [Partners]      │
├─────────────────┤
│ ┌─────────────┐ │
│ │ [Icon]      │ │
│ │ Feature 1   │ │
│ │ Description │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │ [Icon]      │ │
│ │ Feature 2   │ │
│ │ Description │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │ [Icon]      │ │
│ │ Feature 3   │ │
│ │ Description │ │
│ └─────────────┘ │
├─────────────────┤
│ Waitlist Form   │
│ ┌─────────────┐ │
│ │ [Email]     │ │
│ │ [Name]      │ │
│ │ [✓] Consent │ │
│ │ [Join Now]  │ │
│ └─────────────┘ │
├─────────────────┤
│ Footer Links    │
└─────────────────┘
```

## 4. Component Design Specifications

### 4.1 Navigation Header

**Desktop Navigation:**
```css
.header {
  height: 80px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #E5E7EB;
  position: sticky;
  top: 0;
  z-index: 50;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2D5A3D;
}

.nav-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6C757D;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: #2D5A3D;
}
```

**Language Toggle:**
```css
.language-toggle {
  display: flex;
  background: #F8F9FA;
  border-radius: 6px;
  padding: 2px;
}

.language-option {
  padding: 6px 12px;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.language-option.active {
  background: #2D5A3D;
  color: white;
}
```

### 4.2 Hero Section

**Hero Container:**
```css
.hero-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #F5F1E8 0%, #A8C9B0 100%);
  position: relative;
  overflow: hidden;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-headline {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  color: #2D5A3D;
  margin-bottom: 1.5rem;
}

.hero-subtext {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #6C757D;
  margin-bottom: 2rem;
}
```

**Hero Visual:**
```css
.hero-visual {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.hero-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.hero-video {
  width: 100%;
  height: auto;
  border-radius: 16px;
}
```

### 4.3 Form Components

**Input Fields:**
```css
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #2D5A3D;
  box-shadow: 0 0 0 3px rgba(45, 90, 61, 0.1);
}

.form-input.error {
  border-color: #DC3545;
}

.form-input.success {
  border-color: #28A745;
}
```

**Checkbox (GDPR Consent):**
```css
.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin: 1.5rem 0;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  border: 2px solid #D1D5DB;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.checkbox-input:checked {
  background: #2D5A3D;
  border-color: #2D5A3D;
}

.checkbox-label {
  font-size: 0.875rem;
  line-height: 1.5;
  color: #6C757D;
}
```

## 5. Call-to-Action Button Designs

### 5.1 Primary CTA Buttons

**Main CTA (Join Waitlist):**
```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 32px;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #2D5A3D 0%, #1A8B42 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(45, 90, 61, 0.3);
  min-height: 56px;
  min-width: 200px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(45, 90, 61, 0.4);
  background: linear-gradient(135deg, #1A8B42 0%, #2D5A3D 100%);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(45, 90, 61, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
```

**Secondary CTA:**
```css
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 28px;
  font-size: 1rem;
  font-weight: 500;
  color: #2D5A3D;
  background: white;
  border: 2px solid #2D5A3D;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 48px;
}

.btn-secondary:hover {
  background: #2D5A3D;
  color: white;
}
```

### 5.2 CTA Text Variations (A/B Testing)

**Version A - Action-Focused:**
- "Join Waitlist"
- "Reserve My Spot"
- "Get Early Access"

**Version B - Benefit-Focused:**
- "Start My Aquascaping Journey"
- "Unlock Professional Tools"
- "Join the Revolution"

**Version C - Urgency-Focused:**
- "Secure My Position"
- "Don't Miss Out"
- "Join First 1000"

## 6. Animation & Micro-Interactions

### 6.1 Page Load Animations

**Staggered Content Reveal:**
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.6s ease-out forwards;
}

.animate-delay-1 { animation-delay: 0.1s; }
.animate-delay-2 { animation-delay: 0.2s; }
.animate-delay-3 { animation-delay: 0.3s; }
```

**Hero Video/Image Animation:**
```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.hero-visual {
  animation: scaleIn 0.8s ease-out 0.3s both;
}
```

### 6.2 Interactive Animations

**Button Hover Effects:**
```css
.btn-primary {
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-primary:hover::before {
  left: 100%;
}
```

**Form Field Focus:**
```css
.form-input {
  position: relative;
}

.form-input:focus {
  animation: inputFocus 0.3s ease-out;
}

@keyframes inputFocus {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
```

### 6.3 Success State Animations

**Form Submission Success:**
```css
@keyframes checkmarkDraw {
  0% {
    stroke-dashoffset: 100;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.success-checkmark {
  stroke-dasharray: 100;
  animation: checkmarkDraw 0.8s ease-out forwards;
}

@keyframes successPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.success-message {
  animation: successPulse 0.6s ease-in-out;
}
```

## 7. Mobile-First Responsive Breakpoints

### 7.1 Breakpoint System

```css
/* Mobile First Approach */
/* Base styles: Mobile (320px+) */

/* Small Mobile */
@media (min-width: 480px) {
  /* Styles for larger phones */
}

/* Tablet Portrait */
@media (min-width: 768px) {
  /* Styles for tablets */
}

/* Tablet Landscape / Small Desktop */
@media (min-width: 1024px) {
  /* Styles for small desktops */
}

/* Desktop */
@media (min-width: 1200px) {
  /* Styles for standard desktops */
}

/* Large Desktop */
@media (min-width: 1440px) {
  /* Styles for large screens */
}
```

### 7.2 Mobile-Specific Adaptations

**Mobile Navigation:**
```css
@media (max-width: 767px) {
  .header {
    height: 60px;
    padding: 0 1rem;
  }
  
  .mobile-menu-toggle {
    display: block;
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
  
  .desktop-nav {
    display: none;
  }
}
```

**Mobile Hero Section:**
```css
@media (max-width: 767px) {
  .hero-section {
    min-height: 70vh;
    padding: 2rem 1rem;
  }
  
  .hero-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .hero-headline {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  .hero-subtext {
    font-size: 1.125rem;
  }
}
```

**Mobile Form:**
```css
@media (max-width: 767px) {
  .form-container {
    padding: 1.5rem;
    margin: 0 1rem;
  }
  
  .form-input {
    font-size: 16px; /* Prevents zoom on iOS */
    padding: 14px 16px;
  }
  
  .btn-primary {
    width: 100%;
    min-height: 52px;
    font-size: 1.125rem;
  }
}
```

## 8. Visual Hierarchy Principles

### 8.1 Hierarchy System

**Level 1 - Hero/Primary:**
- Hero headline
- Primary CTA buttons
- Key value proposition

**Level 2 - Secondary:**
- Section headings
- Feature titles
- Social proof elements

**Level 3 - Supporting:**
- Body text
- Feature descriptions
- Form labels

**Level 4 - Tertiary:**
- Captions
- Fine print
- Footer links

### 8.2 Visual Weight Distribution

```css
/* Primary Elements - Highest Visual Weight */
.visual-weight-primary {
  font-weight: 700;
  font-size: clamp(2rem, 4vw, 3.5rem);
  color: #2D5A3D;
  line-height: 1.1;
}

/* Secondary Elements */
.visual-weight-secondary {
  font-weight: 600;
  font-size: clamp(1.25rem, 2.5vw, 1.875rem);
  color: #374151;
  line-height: 1.3;
}

/* Supporting Elements */
.visual-weight-supporting {
  font-weight: 400;
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  color: #6C757D;
  line-height: 1.6;
}

/* Tertiary Elements */
.visual-weight-tertiary {
  font-weight: 400;
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  color: #9CA3AF;
  line-height: 1.4;
}
```

### 8.3 Spacing and Rhythm

```css
/* Vertical Rhythm Scale */
.space-xs { margin-bottom: 0.5rem; }   /* 8px */
.space-sm { margin-bottom: 1rem; }     /* 16px */
.space-md { margin-bottom: 1.5rem; }   /* 24px */
.space-lg { margin-bottom: 2rem; }     /* 32px */
.space-xl { margin-bottom: 3rem; }     /* 48px */
.space-2xl { margin-bottom: 4rem; }    /* 64px */
.space-3xl { margin-bottom: 6rem; }    /* 96px */

/* Container Spacing */
.section-padding {
  padding: 4rem 1rem; /* Mobile */
}

@media (min-width: 768px) {
  .section-padding {
    padding: 6rem 2rem; /* Tablet+ */
  }
}
```

## 9. Success & Error State Designs

### 9.1 Form Validation States

**Success State:**
```css
.form-success {
  padding: 2rem;
  background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
  border: 2px solid #22C55E;
  border-radius: 12px;
  text-align: center;
}

.success-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  color: #22C55E;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #166534;
  margin-bottom: 0.5rem;
}

.success-message {
  font-size: 1rem;
  color: #15803D;
  margin-bottom: 1.5rem;
}

.success-details {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #BBF7D0;
}
```

**Error State:**
```css
.form-error {
  padding: 1rem;
  background: #FEF2F2;
  border: 2px solid #FCA5A5;
  border-radius: 8px;
  color: #991B1B;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.error-icon {
  width: 16px;
  height: 16px;
  color: #DC2626;
}

/* Field-level errors */
.field-error {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #DC2626;
}
```

### 9.2 Loading States

**Button Loading:**
```css
.btn-loading {
  position: relative;
  color: transparent;
}

.btn-loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}
```

**Form Loading:**
```css
.form-loading {
  position: relative;
  pointer-events: none;
  opacity: 0.7;
}

.form-loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
```

## 10. Accessibility & GDPR Compliance

### 10.1 Accessibility Standards (WCAG 2.1 AA)

**Color Contrast:**
- Text on white: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Interactive elements: Minimum 3:1 ratio

**Focus Management:**
```css
.focus-visible {
  outline: 3px solid #2D5A3D;
  outline-offset: 2px;
}

.form-input:focus-visible {
  outline: 3px solid #2D5A3D;
  outline-offset: -2px;
}

.btn-primary:focus-visible {
  outline: 3px solid #1A8B42;
  outline-offset: 2px;
}
```

**Screen Reader Support:**
```html
<!-- Form labels and ARIA -->
<label for="email" class="form-label">
  Email Address
  <span class="required" aria-label="required">*</span>
</label>
<input 
  id="email" 
  type="email" 
  class="form-input" 
  aria-describedby="email-help email-error"
  aria-invalid="false"
  required
/>
<div id="email-help" class="field-help">
  We'll use this to send you updates about the launch
</div>
<div id="email-error" class="field-error" role="alert" aria-live="polite">
  <!-- Error message appears here -->
</div>
```

### 10.2 GDPR Compliance Elements

**Consent Checkbox:**
```html
<div class="checkbox-group">
  <input 
    type="checkbox" 
    id="gdpr-consent" 
    class="checkbox-input" 
    required 
    aria-describedby="consent-description"
  />
  <label for="gdpr-consent" class="checkbox-label">
    <span id="consent-description">
      I consent to receive updates about the 3vantage aquascaping platform launch and understand I can unsubscribe at any time. 
      <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>
    </span>
  </label>
</div>
```

**Privacy Notice:**
```css
.privacy-notice {
  background: #F8F9FA;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #6C757D;
}

.privacy-notice a {
  color: #2D5A3D;
  text-decoration: underline;
}
```

## 11. Localization (Bulgarian/Hungarian)

### 11.1 Language-Specific Adaptations

**Bulgarian Text Styling:**
```css
/* Cyrillic font optimization */
.lang-bg {
  font-family: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: 0.01em; /* Slightly increased for Cyrillic readability */
}

.lang-bg .heading-xl {
  line-height: 1.15; /* Adjusted for Cyrillic characters */
}
```

**Hungarian Text Styling:**
```css
.lang-hu {
  font-family: 'Inter', 'Source Sans Pro', -apple-system, sans-serif;
}

.lang-hu .text-base {
  line-height: 1.65; /* Hungarian text benefits from increased line height */
}
```

### 11.2 Cultural Color Preferences

**Bulgarian Market:**
- Strong preference for green (nature, growth)
- Gold accents for premium feel (`#D4AF37`)
- Avoid excessive red (political associations)

**Hungarian Market:**
- Green aligns with environmental consciousness
- Blue for trust and reliability
- White space for clarity and premium feel

## 12. Performance Optimization

### 12.1 Critical CSS

```css
/* Above-the-fold critical styles */
.header,
.hero-section,
.hero-content,
.btn-primary {
  /* Critical styles inlined in HTML head */
}
```

### 12.2 Image Optimization

```css
/* Responsive images */
.responsive-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

/* WebP with fallback */
.hero-image {
  background-image: url('hero.webp');
}

.no-webp .hero-image {
  background-image: url('hero.jpg');
}
```

### 12.3 Loading Performance

```css
/* Skeleton loading for slow connections */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## 13. Component Library Structure

### 13.1 Atomic Design Organization

```
components/
├── atoms/
│   ├── Button/
│   ├── Input/
│   ├── Typography/
│   └── Icon/
├── molecules/
│   ├── FormField/
│   ├── LanguageToggle/
│   └── SocialProof/
├── organisms/
│   ├── Header/
│   ├── HeroSection/
│   ├── WaitlistForm/
│   └── Footer/
└── templates/
    └── LandingPage/
```

### 13.2 Design Tokens

```css
:root {
  /* Colors */
  --color-primary: #2D5A3D;
  --color-primary-light: #4A7C59;
  --color-primary-dark: #1A3A2E;
  --color-secondary: #4A90A4;
  --color-accent: #FF6B6B;
  --color-success: #28A745;
  --color-error: #DC3545;
  --color-warning: #FFC107;
  
  /* Typography */
  --font-primary: 'Inter', sans-serif;
  --font-secondary: 'Source Sans Pro', sans-serif;
  --font-accent: 'Playfair Display', serif;
  
  /* Spacing */
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  --space-2xl: 4rem;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 25px 50px rgba(0, 0, 0, 0.25);
}
```

## 14. Testing & Quality Assurance

### 14.1 Visual Testing Checklist

- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness (320px to 2560px)
- [ ] Dark mode compatibility
- [ ] High contrast mode accessibility
- [ ] Print styles optimization
- [ ] Loading state implementations
- [ ] Error state handling
- [ ] Success state animations

### 14.2 Performance Targets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **PageSpeed Insights Score**: 90+

### 14.3 Accessibility Testing

- [ ] Screen reader compatibility (NVDA, JAWS, VoiceOver)
- [ ] Keyboard navigation flow
- [ ] Color contrast validation
- [ ] Focus indicator visibility
- [ ] ARIA label correctness
- [ ] Language attribute specification

## 15. Implementation Guidelines

### 15.1 CSS Architecture

**BEM Methodology:**
```css
/* Block */
.waitlist-form { }

/* Element */
.waitlist-form__input { }
.waitlist-form__button { }
.waitlist-form__error { }

/* Modifier */
.waitlist-form--loading { }
.waitlist-form__button--disabled { }
```

### 15.2 Component Structure

```jsx
// Example React component structure
const WaitlistForm = ({ 
  onSubmit, 
  loading, 
  error, 
  success, 
  language = 'en' 
}) => {
  return (
    <form className={`waitlist-form ${loading ? 'waitlist-form--loading' : ''}`}>
      <FormField
        type="email"
        label={translations[language].emailLabel}
        error={error?.email}
        required
      />
      <FormField
        type="text"
        label={translations[language].nameLabel}
        error={error?.name}
      />
      <ConsentCheckbox
        required
        language={language}
      />
      <Button
        type="submit"
        variant="primary"
        loading={loading}
        disabled={!isValid}
      >
        {translations[language].ctaText}
      </Button>
    </form>
  );
};
```

## Conclusion

This comprehensive design specification provides a complete foundation for building a high-converting, accessible, and culturally appropriate waitlist SPA for the 3vantage aquascaping platform. The design system emphasizes:

1. **Conversion Optimization**: Strategic use of color, typography, and layout to drive signups
2. **Cultural Sensitivity**: Appropriate color choices and localization for Bulgarian/Hungarian markets
3. **Accessibility**: WCAG 2.1 AA compliance ensuring inclusive design
4. **Performance**: Mobile-first approach with optimized loading and interactions
5. **Brand Alignment**: Colors and aesthetics that reflect aquascaping's natural, premium positioning
6. **Technical Excellence**: Modern design patterns with comprehensive component specifications

The design balances the serene, natural aesthetic of aquascaping with the urgency and social proof needed for effective waitlist conversion, while maintaining the professional credibility required for partnership with established players like Green Aqua.

---

*Design Specification completed on 2025-08-05*
*Ready for development implementation using Next.js 14 + Tailwind CSS*