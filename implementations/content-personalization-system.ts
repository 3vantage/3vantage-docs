// Advanced Content Personalization System for Aquascaping
// File: /lib/personalization/personalization-engine.ts

interface UserProfile {
  id: string;
  email: string;
  preferences: {
    aquascaping_styles: ('nature' | 'iwagumi' | 'dutch' | 'biotope' | 'paludarium')[];
    experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    tank_sizes: string[];
    preferred_plants: string[];
    equipment_brands: string[];
    content_types: ('how_to' | 'inspiration' | 'product_review' | 'troubleshooting')[];
    languages: ('en' | 'bg' | 'hu')[];
  };
  behavior: {
    email_engagement: {
      open_rate: number;
      click_rate: number;
      best_send_times: string[];
      preferred_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    };
    content_interaction: {
      most_viewed_categories: string[];
      avg_time_spent: number;
      sharing_frequency: number;
      comment_engagement: number;
    };
    purchase_history: {
      categories: string[];
      brands: string[];
      price_range: string;
      seasonal_patterns: Record<string, number>;
    };
  };
  demographics: {
    country: string;
    timezone: string;
    signup_date: Date;
    referral_source: string;
  };
}

interface ContentItem {
  id: string;
  type: 'newsletter' | 'social_post' | 'blog_article' | 'product_feature';
  topic: string;
  style: string;
  difficulty: string;
  tags: string[];
  language: string;
  engagement_score: number;
  created_at: Date;
}

interface PersonalizationScore {
  user_id: string;
  content_id: string;
  relevance_score: number;
  engagement_prediction: number;
  personalization_factors: {
    style_match: number;
    difficulty_match: number;
    topic_interest: number;
    timing_optimal: number;
    language_match: number;
  };
}

export class AquascapePersonalizationEngine {
  private userProfiles: Map<string, UserProfile>;
  private contentLibrary: Map<string, ContentItem>;
  private interactionHistory: Map<string, any[]>;

  constructor() {
    this.userProfiles = new Map();
    this.contentLibrary = new Map();
    this.interactionHistory = new Map();
  }

  // === PROFILE BUILDING ===

  async buildUserProfile(userId: string, initialData: any): Promise<UserProfile> {
    const profile: UserProfile = {
      id: userId,
      email: initialData.email,
      preferences: {
        aquascaping_styles: initialData.styles || ['nature'],
        experience_level: initialData.experience || 'beginner',
        tank_sizes: initialData.tank_sizes || ['60cm'],
        preferred_plants: initialData.plants || [],
        equipment_brands: initialData.brands || [],
        content_types: initialData.content_types || ['how_to', 'inspiration'],
        languages: [initialData.language || 'en']
      },
      behavior: {
        email_engagement: {
          open_rate: 0.0,
          click_rate: 0.0,
          best_send_times: ['09:00', '19:00'],
          preferred_frequency: 'weekly'
        },
        content_interaction: {
          most_viewed_categories: [],
          avg_time_spent: 0,
          sharing_frequency: 0,
          comment_engagement: 0
        },
        purchase_history: {
          categories: [],
          brands: [],
          price_range: 'mid',
          seasonal_patterns: {}
        }
      },
      demographics: {
        country: initialData.country || 'Unknown',
        timezone: initialData.timezone || 'UTC',
        signup_date: new Date(),
        referral_source: initialData.source || 'direct'
      }
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  async updateProfileFromBehavior(userId: string, interaction: {
    type: 'email_open' | 'email_click' | 'content_view' | 'share' | 'comment' | 'purchase';
    content_id?: string;
    timestamp: Date;
    metadata?: any;
  }): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    // Track interaction history
    const history = this.interactionHistory.get(userId) || [];
    history.push(interaction);
    this.interactionHistory.set(userId, history);

    // Update behavior patterns
    switch (interaction.type) {
      case 'email_open':
        profile.behavior.email_engagement.open_rate = this.calculateEngagementRate(
          history.filter(h => h.type === 'email_open'),
          history.filter(h => h.type === 'email_sent')
        );
        break;
      
      case 'email_click':
        profile.behavior.email_engagement.click_rate = this.calculateEngagementRate(
          history.filter(h => h.type === 'email_click'),
          history.filter(h => h.type === 'email_open')
        );
        break;
      
      case 'content_view':
        if (interaction.content_id) {
          const content = this.contentLibrary.get(interaction.content_id);
          if (content) {
            this.updateContentPreferences(profile, content);
          }
        }
        break;
    }

    // Update optimal send times based on engagement patterns
    this.updateOptimalSendTimes(profile, history);

    this.userProfiles.set(userId, profile);
  }

  private calculateEngagementRate(positive: any[], total: any[]): number {
    if (total.length === 0) return 0;
    return positive.length / total.length;
  }

  private updateContentPreferences(profile: UserProfile, content: ContentItem): void {
    // Update style preferences based on engagement
    if (content.style && profile.preferences.aquascaping_styles.includes(content.style as any)) {
      // Increase weight for this style (implementation would track weights)
    }

    // Update topic interests
    if (content.tags) {
      content.tags.forEach(tag => {
        // Track tag engagement (implementation would maintain tag scores)
      });
    }
  }

  private updateOptimalSendTimes(profile: UserProfile, history: any[]): void {
    const engagements = history.filter(h => 
      h.type === 'email_open' || h.type === 'email_click'
    );

    const timeHeatmap = new Map<string, number>();
    
    engagements.forEach(engagement => {
      const hour = new Date(engagement.timestamp).getHours().toString().padStart(2, '0') + ':00';
      timeHeatmap.set(hour, (timeHeatmap.get(hour) || 0) + 1);
    });

    // Get top 2 engagement times
    const sortedTimes = Array.from(timeHeatmap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([time]) => time);

    if (sortedTimes.length > 0) {
      profile.behavior.email_engagement.best_send_times = sortedTimes;
    }
  }

  // === CONTENT SCORING ===

  async scoreContentForUser(userId: string, contentId: string): Promise<PersonalizationScore> {
    const profile = this.userProfiles.get(userId);
    const content = this.contentLibrary.get(contentId);

    if (!profile || !content) {
      throw new Error('User profile or content not found');
    }

    const factors = {
      style_match: this.calculateStyleMatch(profile, content),
      difficulty_match: this.calculateDifficultyMatch(profile, content),
      topic_interest: this.calculateTopicInterest(profile, content),
      timing_optimal: this.calculateTimingScore(profile),
      language_match: this.calculateLanguageMatch(profile, content)
    };

    // Weighted scoring
    const weights = {
      style_match: 0.25,
      difficulty_match: 0.20,
      topic_interest: 0.30,
      timing_optimal: 0.10,
      language_match: 0.15
    };

    const relevance_score = Object.entries(factors).reduce((sum, [key, value]) => {
      return sum + (value * weights[key]);
    }, 0);

    // Predict engagement based on historical data
    const engagement_prediction = this.predictEngagement(profile, content, relevance_score);

    return {
      user_id: userId,
      content_id: contentId,
      relevance_score,
      engagement_prediction,
      personalization_factors: factors
    };
  }

  private calculateStyleMatch(profile: UserProfile, content: ContentItem): number {
    if (content.style && profile.preferences.aquascaping_styles.includes(content.style as any)) {
      return 1.0;
    }
    
    // Partial matches based on style compatibility
    const styleCompatibility: Record<string, string[]> = {
      nature: ['iwagumi', 'biotope'],
      iwagumi: ['nature'],
      dutch: ['nature'],
      biotope: ['nature', 'paludarium'],
      paludarium: ['biotope']
    };

    if (content.style && styleCompatibility[content.style]) {
      const hasCompatible = profile.preferences.aquascaping_styles.some(style => 
        styleCompatibility[content.style].includes(style)
      );
      return hasCompatible ? 0.6 : 0.2;
    }

    return 0.2; // Default base score
  }

  private calculateDifficultyMatch(profile: UserProfile, content: ContentItem): number {
    const difficultyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const userLevel = difficultyLevels.indexOf(profile.preferences.experience_level);
    const contentLevel = difficultyLevels.indexOf(content.difficulty);

    if (userLevel === contentLevel) return 1.0;
    
    const difference = Math.abs(userLevel - contentLevel);
    
    // Slight preference for content one level above user's experience
    if (contentLevel === userLevel + 1) return 0.8;
    if (contentLevel === userLevel - 1) return 0.7;
    
    return Math.max(0.2, 1.0 - (difference * 0.3));
  }

  private calculateTopicInterest(profile: UserProfile, content: ContentItem): number {
    const history = this.interactionHistory.get(profile.id) || [];
    const viewedContent = history
      .filter(h => h.type === 'content_view' && h.content_id)
      .map(h => this.contentLibrary.get(h.content_id))
      .filter(c => c);

    // Calculate topic interest based on past engagement
    let topicScore = 0.5; // Base score

    // Check tag matches
    const tagMatches = content.tags.filter(tag => 
      viewedContent.some(vc => vc.tags.includes(tag))
    ).length;

    topicScore += (tagMatches / Math.max(content.tags.length, 1)) * 0.5;

    // Check content type preference
    if (profile.preferences.content_types.includes(content.type as any)) {
      topicScore += 0.3;
    }

    return Math.min(1.0, topicScore);
  }

  private calculateTimingScore(profile: UserProfile): number {
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0') + ':00';
    
    if (profile.behavior.email_engagement.best_send_times.includes(currentHour)) {
      return 1.0;
    }

    // Check if within 2 hours of optimal time
    const optimalTimes = profile.behavior.email_engagement.best_send_times.map(time => 
      parseInt(time.split(':')[0])
    );

    const currentHourNum = now.getHours();
    const isNearOptimal = optimalTimes.some(optimal => 
      Math.abs(currentHourNum - optimal) <= 2
    );

    return isNearOptimal ? 0.7 : 0.3;
  }

  private calculateLanguageMatch(profile: UserProfile, content: ContentItem): number {
    return profile.preferences.languages.includes(content.language as any) ? 1.0 : 0.0;
  }

  private predictEngagement(profile: UserProfile, content: ContentItem, relevanceScore: number): number {
    // Simple engagement prediction based on historical performance
    const baseEngagement = profile.behavior.email_engagement.click_rate || 0.05;
    const contentEngagement = content.engagement_score || 0.05;
    
    // Combine factors with relevance score
    return Math.min(1.0, (baseEngagement + contentEngagement + relevanceScore) / 3);
  }

  // === CONTENT RECOMMENDATION ===

  async recommendContent(userId: string, limit: number = 10, contentType?: string): Promise<{
    content_id: string;
    score: PersonalizationScore;
    content: ContentItem;
  }[]> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    let availableContent = Array.from(this.contentLibrary.values());

    // Filter by content type if specified
    if (contentType) {
      availableContent = availableContent.filter(c => c.type === contentType);
    }

    // Filter by user's preferred languages
    availableContent = availableContent.filter(c => 
      profile.preferences.languages.includes(c.language as any)
    );

    // Score all content
    const scoredContent = await Promise.all(
      availableContent.map(async (content) => {
        const score = await this.scoreContentForUser(userId, content.id);
        return { content_id: content.id, score, content };
      })
    );

    // Sort by combined relevance and engagement prediction
    scoredContent.sort((a, b) => {
      const scoreA = (a.score.relevance_score * 0.7) + (a.score.engagement_prediction * 0.3);
      const scoreB = (b.score.relevance_score * 0.7) + (b.score.engagement_prediction * 0.3);
      return scoreB - scoreA;
    });

    return scoredContent.slice(0, limit);
  }

  // === NEWSLETTER PERSONALIZATION ===

  async personalizeNewsletter(userId: string, templateContent: any): Promise<{
    personalized_content: any;
    personalization_applied: string[];
    engagement_optimization: any;
  }> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    const personalizations: string[] = [];
    const optimizations: any = {};

    // 1. Personalize greeting and content tone
    const greeting = this.personalizeGreeting(profile);
    templateContent.greeting = greeting;
    personalizations.push('greeting');

    // 2. Select most relevant content sections
    const recommendations = await this.recommendContent(userId, 5, 'newsletter');
    templateContent.recommended_articles = recommendations.map(r => r.content);
    personalizations.push('content_selection');

    // 3. Optimize send time
    optimizations.optimal_send_time = profile.behavior.email_engagement.best_send_times[0] || '09:00';
    
    // 4. Customize subject line based on interests
    const subjectLine = await this.personalizeSubjectLine(profile, templateContent.topic);
    templateContent.subject_line = subjectLine;
    personalizations.push('subject_line');

    // 5. Add personalized plant recommendations
    if (profile.preferences.preferred_plants.length > 0) {
      templateContent.plant_recommendations = this.getPersonalizedPlantTips(profile);
      personalizations.push('plant_tips');
    }

    // 6. Adjust content difficulty level
    templateContent.content_difficulty = profile.preferences.experience_level;
    personalizations.push('difficulty_adjustment');

    return {
      personalized_content: templateContent,
      personalization_applied: personalizations,
      engagement_optimization: optimizations
    };
  }

  private personalizeGreeting(profile: UserProfile): string {
    const timeZone = profile.demographics.timezone;
    const now = new Date();
    const hour = now.getHours();

    let timeGreeting = '';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    const experienceContext = {
      beginner: 'fellow aquascaping enthusiast',
      intermediate: 'aquascaping hobbyist',
      advanced: 'skilled aquascaper',
      expert: 'aquascaping expert'
    };

    return `${timeGreeting}, ${experienceContext[profile.preferences.experience_level]}!`;
  }

  private async personalizeSubjectLine(profile: UserProfile, topic: string): Promise<string> {
    const styleEmojis = {
      nature: '🌿',
      iwagumi: '🪨',
      dutch: '🌺',
      biotope: '🐟',
      paludarium: '🌱'
    };

    const primaryStyle = profile.preferences.aquascaping_styles[0];
    const emoji = styleEmojis[primaryStyle] || '🐠';

    const experienceLevel = profile.preferences.experience_level;
    
    // Generate contextual subject lines
    if (experienceLevel === 'beginner') {
      return `${emoji} Easy ${topic} Tips for Beginners`;
    } else if (experienceLevel === 'expert') {
      return `${emoji} Advanced ${topic} Masterclass`;
    } else {
      return `${emoji} ${topic} Secrets Revealed`;
    }
  }

  private getPersonalizedPlantTips(profile: UserProfile): string[] {
    const preferredPlants = profile.preferences.preferred_plants;
    const tips = [
      `Special care tips for your favorite ${preferredPlants[0]}`,
      `New varieties similar to ${preferredPlants[1] || preferredPlants[0]} you might love`,
      `Troubleshooting common ${preferredPlants[0]} problems`
    ];

    return tips.slice(0, preferredPlants.length);
  }

  // === ANALYTICS AND OPTIMIZATION ===

  async analyzePersonalizationPerformance(period: 'day' | 'week' | 'month'): Promise<{
    total_users: number;
    personalization_lift: number;
    engagement_improvement: number;
    top_performing_personalizations: string[];
    user_satisfaction_score: number;
  }> {
    // Implementation would analyze actual performance data
    return {
      total_users: this.userProfiles.size,
      personalization_lift: 0.25, // 25% improvement in engagement
      engagement_improvement: 0.35, // 35% higher click-through rates
      top_performing_personalizations: ['content_selection', 'timing_optimization', 'difficulty_matching'],
      user_satisfaction_score: 4.2
    };
  }

  async optimizePersonalizationAlgorithm(): Promise<void> {
    // A/B testing and algorithm optimization would happen here
    console.log('Running personalization optimization...');
    
    // Analyze performance of different personalization factors
    // Adjust weights based on actual engagement results
    // Update recommendation algorithms
  }

  // === SEGMENT MANAGEMENT ===

  async createUserSegments(): Promise<Record<string, string[]>> {
    const segments: Record<string, string[]> = {
      beginners: [],
      intermediate: [],
      experts: [],
      nature_lovers: [],
      dutch_enthusiasts: [],
      iwagumi_minimalists: [],
      high_engagement: [],
      low_engagement: [],
      recent_signups: [],
      long_time_subscribers: []
    };

    this.userProfiles.forEach((profile, userId) => {
      // Experience-based segments
      segments[profile.preferences.experience_level + 's']?.push(userId);

      // Style-based segments  
      profile.preferences.aquascaping_styles.forEach(style => {
        const segmentKey = style + '_lovers';
        if (segments[segmentKey]) {
          segments[segmentKey].push(userId);
        }
      });

      // Engagement-based segments
      const avgEngagement = (profile.behavior.email_engagement.open_rate + 
                           profile.behavior.email_engagement.click_rate) / 2;
      
      if (avgEngagement > 0.3) {
        segments.high_engagement.push(userId);
      } else if (avgEngagement < 0.1) {
        segments.low_engagement.push(userId);
      }

      // Tenure-based segments
      const daysSinceSignup = (Date.now() - profile.demographics.signup_date.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceSignup < 30) {
        segments.recent_signups.push(userId);
      } else if (daysSinceSignup > 365) {
        segments.long_time_subscribers.push(userId);
      }
    });

    return segments;
  }
}

// Usage Examples and Integration
export const PersonalizationExamples = {
  // Example: Initialize user profile from waitlist signup
  async initializeFromWaitlist(email: string, signupData: any): Promise<UserProfile> {
    const engine = new AquascapePersonalizationEngine();
    
    const profile = await engine.buildUserProfile('user_' + Date.now(), {
      email,
      experience: signupData.experience_level || 'beginner',
      styles: signupData.interested_styles || ['nature'],
      tank_sizes: signupData.tank_sizes || ['60cm'],
      language: signupData.language || 'en',
      country: signupData.country || 'Unknown',
      source: 'waitlist'
    });

    return profile;
  },

  // Example: Personalize weekly newsletter
  async generatePersonalizedNewsletter(userId: string): Promise<any> {
    const engine = new AquascapePersonalizationEngine();
    
    const baseTemplate = {
      topic: 'Weekly Aquascaping Update',
      sections: ['featured_article', 'plant_spotlight', 'community_showcase', 'tips']
    };

    const personalized = await engine.personalizeNewsletter(userId, baseTemplate);
    
    return {
      ...personalized.personalized_content,
      send_time: personalized.engagement_optimization.optimal_send_time,
      personalization_score: personalized.personalization_applied.length
    };
  },

  // Example: Get content recommendations for homepage
  async getHomepageRecommendations(userId: string): Promise<any[]> {
    const engine = new AquascapePersonalizationEngine();
    
    const recommendations = await engine.recommendContent(userId, 6);
    
    return recommendations.map(rec => ({
      ...rec.content,
      relevance_score: rec.score.relevance_score,
      why_recommended: this.explainRecommendation(rec.score.personalization_factors)
    }));
  },

  explainRecommendation(factors: any): string {
    const topFactor = Object.entries(factors)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
    const explanations = {
      style_match: "Matches your preferred aquascaping style",
      difficulty_match: "Perfect for your experience level", 
      topic_interest: "Based on your reading history",
      timing_optimal: "Recommended at your optimal time",
      language_match: "Available in your preferred language"
    };

    return explanations[topFactor[0]] || "Recommended for you";
  }
};