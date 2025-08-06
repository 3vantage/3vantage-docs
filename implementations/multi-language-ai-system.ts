// Advanced Multi-Language AI System for Aquascaping Content
// File: /lib/i18n/multi-language-ai-engine.ts

interface LanguageConfig {
  code: 'en' | 'bg' | 'hu';
  name: string;
  native_name: string;
  region: string;
  timezone: string;
  currency: string;
  aquascaping_culture: {
    popular_styles: string[];
    common_plants: string[];
    equipment_brands: string[];
    seasonal_considerations: Record<string, string>;
    local_terminology: Record<string, string>;
  };
  content_preferences: {
    formality_level: 'casual' | 'formal' | 'semi_formal';
    preferred_length: 'short' | 'medium' | 'long';
    cultural_references: string[];
    measurement_units: 'metric' | 'imperial';
  };
}

interface TranslationRequest {
  source_language: string;
  target_language: string;
  content_type: 'newsletter' | 'social_post' | 'product_description' | 'tutorial';
  source_text: string;
  preserve_formatting: boolean;
  localize_context: boolean;
  maintain_seo: boolean;
}

interface LocalizedContent {
  original_text: string;
  translated_text: string;
  language: string;
  localization_notes: string[];
  cultural_adaptations: string[];
  seo_keywords: string[];
  quality_score: number;
  confidence_score: number;
}

export class MultiLanguageAquascapingEngine {
  private languageConfigs: Map<string, LanguageConfig>;
  private aiTranslator: any; // Ollama multilingual model
  private culturalAdaptations: Map<string, any>;
  private terminologyDatabase: Map<string, Record<string, string>>;

  constructor(dependencies: { aiTranslator: any }) {
    this.aiTranslator = dependencies.aiTranslator;
    this.languageConfigs = new Map();
    this.culturalAdaptations = new Map();
    this.terminologyDatabase = new Map();
    
    this.initializeLanguageConfigs();
    this.initializeTerminologyDatabase();
    this.initializeCulturalAdaptations();
  }

  private initializeLanguageConfigs(): void {
    const configs: LanguageConfig[] = [
      {
        code: 'en',
        name: 'English',
        native_name: 'English',
        region: 'International',
        timezone: 'UTC',
        currency: 'USD',
        aquascaping_culture: {
          popular_styles: ['Nature Aquarium', 'Dutch Style', 'Iwagumi'],
          common_plants: ['Java Moss', 'Anubias', 'Cryptocoryne', 'Rotala'],
          equipment_brands: ['ADA', 'Fluval', 'Eheim', 'Chihiros'],
          seasonal_considerations: {
            winter: 'Reduced lighting periods and slower growth',
            spring: 'Increased fertilization and active trimming',
            summer: 'Heat management and algae prevention',
            autumn: 'Preparation for slower growth period'
          },
          local_terminology: {
            'aquascape': 'aquascape',
            'planted_tank': 'planted tank',
            'hardscape': 'hardscape',
            'carpet_plants': 'carpet plants',
            'co2_injection': 'CO2 injection'
          }
        },
        content_preferences: {
          formality_level: 'semi_formal',
          preferred_length: 'medium',
          cultural_references: ['Takashi Amano', 'Nature Aquarium', 'AGA contests'],
          measurement_units: 'imperial'
        }
      },
      {
        code: 'bg',
        name: 'Bulgarian',
        native_name: 'Български',
        region: 'Bulgaria',
        timezone: 'Europe/Sofia',
        currency: 'BGN',
        aquascaping_culture: {
          popular_styles: ['Природен аквариум', 'Холандски стил', 'Ивагуми'],
          common_plants: ['Ява мъх', 'Анубиас', 'Криптокорина', 'Ротала'],
          equipment_brands: ['Green Aqua', 'ADA', 'Dennerle', 'JBL'],
          seasonal_considerations: {
            winter: 'Намалени светлинни периоди и по-бавен растеж',
            spring: 'Увеличено торене и активно подрязване',
            summer: 'Управление на топлината и предотвратяване на водорасли',
            autumn: 'Подготовка за период на по-бавен растеж'
          },
          local_terminology: {
            'aquascape': 'аквашейп',
            'planted_tank': 'засаден аквариум',
            'hardscape': 'твърда декорация',
            'carpet_plants': 'килимни растения',
            'co2_injection': 'въвеждане на CO2'
          }
        },
        content_preferences: {
          formality_level: 'formal',
          preferred_length: 'long',
          cultural_references: ['Green Aqua', 'Европейски стил', 'Балканска традиция'],
          measurement_units: 'metric'
        }
      },
      {
        code: 'hu',
        name: 'Hungarian',
        native_name: 'Magyar',
        region: 'Hungary',
        timezone: 'Europe/Budapest',
        currency: 'HUF',
        aquascaping_culture: {
          popular_styles: ['Természetes Akvárium', 'Holland Stílus', 'Iwagumi'],
          common_plants: ['Jáva moha', 'Anubias', 'Cryptocoryne', 'Rotala'],
          equipment_brands: ['Green Aqua', 'ADA', 'Dennerle', 'Tropica'],
          seasonal_considerations: {
            winter: 'Csökkentett megvilágítási időszakok és lassabb növekedés',
            spring: 'Fokozott tápanyag-utánpótlás és aktív metszés',
            summer: 'Hőmérséklet-szabályozás és algamegelőzés',
            autumn: 'Felkészülés a lassabb növekedési időszakra'
          },
          local_terminology: {
            'aquascape': 'akvászkép',
            'planted_tank': 'növényes akvárium',
            'hardscape': 'kemény dekoráció',
            'carpet_plants': 'szőnyegnövények',
            'co2_injection': 'CO2 befecskendezés'
          }
        },
        content_preferences: {
          formality_level: 'semi_formal',
          preferred_length: 'medium',
          cultural_references: ['Green Aqua', 'Közép-európai trend', 'Magyar aquascaping'],
          measurement_units: 'metric'
        }
      }
    ];

    configs.forEach(config => {
      this.languageConfigs.set(config.code, config);
    });
  }

  private initializeTerminologyDatabase(): void {
    // Comprehensive aquascaping terminology in all languages
    const terminologies = {
      'aquascaping_terms': {
        en: {
          'nature_aquarium': 'Nature Aquarium',
          'iwagumi': 'Iwagumi',
          'dutch_style': 'Dutch Style',
          'biotope': 'Biotope',
          'hardscape': 'Hardscape',
          'planted_tank': 'Planted Tank',
          'carpet_plants': 'Carpet Plants',
          'background_plants': 'Background Plants',
          'midground_plants': 'Midground Plants',
          'foreground_plants': 'Foreground Plants',
          'co2_system': 'CO2 System',
          'led_lighting': 'LED Lighting',
          'substrate': 'Substrate',
          'fertilizers': 'Fertilizers',
          'water_parameters': 'Water Parameters',
          'ph_level': 'pH Level',
          'water_hardness': 'Water Hardness',
          'nitrates': 'Nitrates',
          'phosphates': 'Phosphates',
          'algae_control': 'Algae Control',
          'plant_trimming': 'Plant Trimming',
          'aquascape_maintenance': 'Aquascape Maintenance'
        },
        bg: {
          'nature_aquarium': 'Природен Аквариум',
          'iwagumi': 'Ивагуми',
          'dutch_style': 'Холандски Стил',
          'biotope': 'Биотоп',
          'hardscape': 'Твърда Декорация',
          'planted_tank': 'Засаден Аквариум',
          'carpet_plants': 'Килимни Растения',
          'background_plants': 'Фонови Растения',
          'midground_plants': 'Средни Растения',
          'foreground_plants': 'Преднали Растения',
          'co2_system': 'CO2 Система',
          'led_lighting': 'LED Осветление',
          'substrate': 'Субстрат',
          'fertilizers': 'Торове',
          'water_parameters': 'Водни Параметри',
          'ph_level': 'pH Ниво',
          'water_hardness': 'Твърдост на Водата',
          'nitrates': 'Нитрати',
          'phosphates': 'Фосфати',
          'algae_control': 'Контрол на Водорасли',
          'plant_trimming': 'Подрязване на Растения',
          'aquascape_maintenance': 'Поддръжка на Аквашейп'
        },
        hu: {
          'nature_aquarium': 'Természetes Akvárium',
          'iwagumi': 'Iwagumi',
          'dutch_style': 'Holland Stílus',
          'biotope': 'Biotóp',
          'hardscape': 'Kemény Dekoráció',
          'planted_tank': 'Növényes Akvárium',
          'carpet_plants': 'Szőnyegnövények',
          'background_plants': 'Háttérnövények',
          'midground_plants': 'Középső Növények',
          'foreground_plants': 'Előtérnövények',
          'co2_system': 'CO2 Rendszer',
          'led_lighting': 'LED Megvilágítás',
          'substrate': 'Aljzat',
          'fertilizers': 'Tápanyagok',
          'water_parameters': 'Víz Paraméterek',
          'ph_level': 'pH Szint',
          'water_hardness': 'Víz Keménysége',
          'nitrates': 'Nitrátok',
          'phosphates': 'Foszfátok',
          'algae_control': 'Alga Kontroll',
          'plant_trimming': 'Növény Metszés',
          'aquascape_maintenance': 'Akvászkép Karbantartás'
        }
      },
      'plant_names': {
        en: {
          'java_moss': 'Java Moss',
          'anubias_nana': 'Anubias Nana',
          'cryptocoryne_wendtii': 'Cryptocoryne Wendtii',
          'rotala_rotundifolia': 'Rotala Rotundifolia',
          'hc_cuba': 'HC Cuba (Hemianthus callitrichoides)',
          'glossostigma': 'Glossostigma elatinoides',
          'monte_carlo': 'Monte Carlo',
          'java_fern': 'Java Fern',
          'amazon_sword': 'Amazon Sword',
          'vallisneria': 'Vallisneria'
        },
        bg: {
          'java_moss': 'Ява Мъх',
          'anubias_nana': 'Анубиас Нана',
          'cryptocoryne_wendtii': 'Криптокорина Вендти',
          'rotala_rotundifolia': 'Ротала Ротундифолия',
          'hc_cuba': 'HC Куба (Хемиантус калитрихоидес)',
          'glossostigma': 'Глосостигма елатиноидес',
          'monte_carlo': 'Монте Карло',
          'java_fern': 'Ява Папрат',
          'amazon_sword': 'Амазонски Меч',
          'vallisneria': 'Валиснерия'
        },
        hu: {
          'java_moss': 'Jáva Moha',
          'anubias_nana': 'Anubias Nana',
          'cryptocoryne_wendtii': 'Cryptocoryne Wendtii',
          'rotala_rotundifolia': 'Rotala Rotundifolia',
          'hc_cuba': 'HC Kuba (Hemianthus callitrichoides)',
          'glossostigma': 'Glossostigma elatinoides',
          'monte_carlo': 'Monte Carlo',
          'java_fern': 'Jáva Páfrány',
          'amazon_sword': 'Amazoni Kard',
          'vallisneria': 'Vallisneria'
        }
      }
    };

    Object.entries(terminologies).forEach(([category, languages]) => {
      this.terminologyDatabase.set(category, languages);
    });
  }

  private initializeCulturalAdaptations(): void {
    const adaptations = {
      'content_style': {
        bg: {
          greeting_style: 'formal_with_respect',
          educational_approach: 'detailed_explanations',
          call_to_action: 'polite_suggestions',
          social_proof: 'expert_endorsements',
          seasonal_context: 'european_climate_focus'
        },
        hu: {
          greeting_style: 'warm_personal',
          educational_approach: 'practical_demonstrations',
          call_to_action: 'community_involvement',
          social_proof: 'local_success_stories',
          seasonal_context: 'central_european_conditions'
        },
        en: {
          greeting_style: 'friendly_professional',
          educational_approach: 'step_by_step_guides',
          call_to_action: 'direct_encouragement',
          social_proof: 'international_examples',
          seasonal_context: 'global_climate_considerations'
        }
      },
      'regional_preferences': {
        bg: {
          preferred_brands: ['Green Aqua', 'Dennerle', 'JBL', 'Sera'],
          popular_fish: ['Неонки', 'Скалари', 'Гупи', 'Тетри'],
          common_problems: ['алги през лятото', 'бавен растеж през зимата'],
          measurement_preferences: 'metric_detailed',
          price_sensitivity: 'value_conscious'
        },
        hu: {
          preferred_brands: ['Green Aqua', 'Tropica', 'Dennerle', 'ADA'],
          popular_fish: ['Neon halak', 'Skalár', 'Guppi', 'Tetra'],
          common_problems: ['nyári algásodás', 'téli lassú növekedés'],
          measurement_preferences: 'metric_precise',
          price_sensitivity: 'quality_focused'
        },
        en: {
          preferred_brands: ['ADA', 'Fluval', 'Eheim', 'Current USA'],
          popular_fish: ['Neon Tetras', 'Angelfish', 'Guppies', 'Cardinal Tetras'],
          common_problems: ['summer algae blooms', 'winter slow growth'],
          measurement_preferences: 'mixed_units',
          price_sensitivity: 'feature_focused'
        }
      }
    };

    Object.entries(adaptations).forEach(([category, data]) => {
      this.culturalAdaptations.set(category, data);
    });
  }

  // === TRANSLATION METHODS ===

  async translateContent(request: TranslationRequest): Promise<LocalizedContent> {
    const sourceConfig = this.languageConfigs.get(request.source_language);
    const targetConfig = this.languageConfigs.get(request.target_language);

    if (!sourceConfig || !targetConfig) {
      throw new Error('Unsupported language pair');
    }

    // 1. Pre-process source text with terminology recognition
    const preprocessedText = await this.preprocessText(request.source_text, request.source_language);

    // 2. Perform AI translation with cultural context
    const translationPrompt = this.buildTranslationPrompt(request, sourceConfig, targetConfig);
    const rawTranslation = await this.aiTranslator.translateContent(
      preprocessedText,
      request.target_language
    );

    // 3. Post-process with localization
    const localizedText = await this.localizeContent(
      rawTranslation,
      request,
      targetConfig
    );

    // 4. Apply cultural adaptations
    const culturallyAdapted = await this.applyCulturalAdaptations(
      localizedText,
      request.target_language,
      request.content_type
    );

    // 5. Quality assessment
    const qualityScore = await this.assessTranslationQuality(
      request.source_text,
      culturallyAdapted,
      request.source_language,
      request.target_language
    );

    // 6. SEO keyword localization if requested
    let seoKeywords: string[] = [];
    if (request.maintain_seo) {
      seoKeywords = await this.localizeSEOKeywords(
        request.source_text,
        request.target_language
      );
    }

    return {
      original_text: request.source_text,
      translated_text: culturallyAdapted,
      language: request.target_language,
      localization_notes: await this.generateLocalizationNotes(request, culturallyAdapted),
      cultural_adaptations: await this.getCulturalAdaptationDetails(request.target_language),
      seo_keywords: seoKeywords,
      quality_score: qualityScore,
      confidence_score: 0.9 // Would be calculated based on AI model confidence
    };
  }

  private async preprocessText(text: string, language: string): Promise<string> {
    // Replace technical terms with standardized forms
    let processedText = text;
    
    const terminology = this.terminologyDatabase.get('aquascaping_terms')?.[language];
    const plantNames = this.terminologyDatabase.get('plant_names')?.[language];
    
    if (terminology) {
      Object.entries(terminology).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${value}\\b`, 'gi');
        processedText = processedText.replace(regex, `{{${key}}}`);
      });
    }

    if (plantNames) {
      Object.entries(plantNames).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${value}\\b`, 'gi');
        processedText = processedText.replace(regex, `{{plant:${key}}}`);
      });
    }

    return processedText;
  }

  private buildTranslationPrompt(
    request: TranslationRequest, 
    sourceConfig: LanguageConfig, 
    targetConfig: LanguageConfig
  ): string {
    return `Translate this aquascaping content from ${sourceConfig.native_name} to ${targetConfig.native_name}.

Context:
- Content type: ${request.content_type}
- Target audience: ${targetConfig.region} aquascaping enthusiasts
- Formality level: ${targetConfig.content_preferences.formality_level}
- Preferred length: ${targetConfig.content_preferences.preferred_length}

Cultural considerations:
- Popular brands in ${targetConfig.region}: ${targetConfig.aquascaping_culture.equipment_brands.join(', ')}
- Common plants: ${targetConfig.aquascaping_culture.common_plants.join(', ')}
- Measurement units: ${targetConfig.content_preferences.measurement_units}

Guidelines:
1. Maintain technical accuracy of all aquascaping terms
2. Adapt cultural references to the target region
3. Use appropriate formality level for the target culture
4. Preserve the educational value and practical advice
5. Ensure natural flow in the target language

${request.preserve_formatting ? 'Preserve all formatting, including line breaks and bullet points.' : ''}
${request.localize_context ? 'Adapt examples and references to be relevant for the target region.' : ''}`;
  }

  private async localizeContent(
    translatedText: string,
    request: TranslationRequest,
    targetConfig: LanguageConfig
  ): Promise<string> {
    let localizedText = translatedText;

    // Replace terminology placeholders with target language terms
    const terminology = this.terminologyDatabase.get('aquascaping_terms')?.[request.target_language];
    const plantNames = this.terminologyDatabase.get('plant_names')?.[request.target_language];

    if (terminology) {
      Object.entries(terminology).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        localizedText = localizedText.replace(placeholder, value);
      });
    }

    if (plantNames) {
      Object.entries(plantNames).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{plant:${key}}}`, 'g');
        localizedText = localizedText.replace(placeholder, value);
      });
    }

    // Localize measurements if needed
    if (request.localize_context) {
      localizedText = await this.localizeMeasurements(localizedText, targetConfig);
    }

    // Adapt currency and pricing if present
    localizedText = await this.localizeCurrency(localizedText, targetConfig);

    return localizedText;
  }

  private async applyCulturalAdaptations(
    text: string,
    targetLanguage: string,
    contentType: string
  ): Promise<string> {
    const adaptations = this.culturalAdaptations.get('content_style')?.[targetLanguage];
    const regionalPrefs = this.culturalAdaptations.get('regional_preferences')?.[targetLanguage];
    
    if (!adaptations || !regionalPrefs) {
      return text;
    }

    let adaptedText = text;

    // Apply content style adaptations based on content type
    switch (contentType) {
      case 'newsletter':
        adaptedText = await this.adaptNewsletterStyle(adaptedText, adaptations, regionalPrefs);
        break;
      case 'social_post':
        adaptedText = await this.adaptSocialPostStyle(adaptedText, adaptations, regionalPrefs);
        break;
      case 'tutorial':
        adaptedText = await this.adaptTutorialStyle(adaptedText, adaptations, regionalPrefs);
        break;
      case 'product_description':
        adaptedText = await this.adaptProductStyle(adaptedText, adaptations, regionalPrefs);
        break;
    }

    return adaptedText;
  }

  private async adaptNewsletterStyle(text: string, style: any, regional: any): Promise<string> {
    let adapted = text;

    // Adapt greeting based on cultural preferences
    if (style.greeting_style === 'formal_with_respect') {
      adapted = adapted.replace(/^(Hi|Hello|Hey)/i, 'Уважаеми колеги аквариумисти');
    } else if (style.greeting_style === 'warm_personal') {
      adapted = adapted.replace(/^(Hi|Hello|Hey)/i, 'Kedves akvárium szerető barátaim');
    }

    // Adapt brand mentions to regional preferences
    regional.preferred_brands.forEach((brand: string, index: number) => {
      if (index === 0) {
        // Replace generic equipment mentions with preferred local brand
        adapted = adapted.replace(/quality equipment/gi, `${brand} equipment`);
      }
    });

    return adapted;
  }

  private async adaptSocialPostStyle(text: string, style: any, regional: any): Promise<string> {
    let adapted = text;

    // Adapt hashtags to regional preferences
    const localHashtags = {
      bg: ['#български_аквариум', '#аквашейп_българия', '#зелени_растения'],
      hu: ['#magyar_akvárium', '#akvászkép_magyarország', '#növényes_medence']
    };

    // Add regional hashtags based on language
    const targetLang = regional === this.culturalAdaptations.get('regional_preferences')?.bg ? 'bg' : 'hu';
    if (localHashtags[targetLang]) {
      adapted += '\n\n' + localHashtags[targetLang].join(' ');
    }

    return adapted;
  }

  private async adaptTutorialStyle(text: string, style: any, regional: any): Promise<string> {
    let adapted = text;

    // Add regional context for seasonal advice
    if (regional.common_problems && regional.common_problems.length > 0) {
      const seasonalTip = `\n\nМестен съвет: В нашия регион често срещаме ${regional.common_problems[0]}. Важно е да...`;
      adapted += seasonalTip;
    }

    return adapted;
  }

  private async adaptProductStyle(text: string, style: any, regional: any): Promise<string> {
    let adapted = text;

    // Adapt pricing context based on regional price sensitivity
    if (regional.price_sensitivity === 'value_conscious') {
      adapted = adapted.replace(/premium/gi, 'качествен и достъпен');
    } else if (regional.price_sensitivity === 'quality_focused') {
      adapted = adapted.replace(/affordable/gi, 'kiváló minőségű');
    }

    return adapted;
  }

  private async localizeMeasurements(text: string, config: LanguageConfig): Promise<string> {
    let localized = text;

    if (config.content_preferences.measurement_units === 'metric') {
      // Convert imperial to metric (simplified)
      localized = localized.replace(/(\d+)\s*gallons?/gi, (match, num) => {
        const liters = Math.round(parseFloat(num) * 3.785);
        return `${liters} литра`;
      });
      
      localized = localized.replace(/(\d+)\s*inches?/gi, (match, num) => {
        const cm = Math.round(parseFloat(num) * 2.54);
        return `${cm} см`;
      });
      
      localized = localized.replace(/(\d+)\s*°F/gi, (match, num) => {
        const celsius = Math.round((parseFloat(num) - 32) * 5/9);
        return `${celsius}°C`;
      });
    }

    return localized;
  }

  private async localizeCurrency(text: string, config: LanguageConfig): Promise<string> {
    let localized = text;

    // Convert USD prices to local currency (would use real exchange rates)
    if (config.currency === 'BGN') {
      localized = localized.replace(/\$(\d+)/g, (match, num) => {
        const bgn = Math.round(parseFloat(num) * 1.8);
        return `${bgn} лв`;
      });
    } else if (config.currency === 'HUF') {
      localized = localized.replace(/\$(\d+)/g, (match, num) => {
        const huf = Math.round(parseFloat(num) * 350);
        return `${huf} Ft`;
      });
    }

    return localized;
  }

  // === CONTENT GENERATION METHODS ===

  async generateMultilingualContent(parameters: {
    topic: string;
    content_type: 'newsletter' | 'social_post' | 'tutorial' | 'product_guide';
    target_languages: ('en' | 'bg' | 'hu')[];
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    style: 'nature' | 'iwagumi' | 'dutch' | 'biotope';
  }): Promise<Record<string, LocalizedContent>> {
    
    // Generate base content in English first
    const englishContent = await this.generateBaseContent(parameters);
    
    const results: Record<string, LocalizedContent> = {
      en: {
        original_text: englishContent,
        translated_text: englishContent,
        language: 'en',
        localization_notes: [],
        cultural_adaptations: [],
        seo_keywords: await this.extractSEOKeywords(englishContent, 'en'),
        quality_score: 1.0,
        confidence_score: 1.0
      }
    };

    // Translate to other requested languages
    for (const lang of parameters.target_languages) {
      if (lang !== 'en') {
        const translationRequest: TranslationRequest = {
          source_language: 'en',
          target_language: lang,
          content_type: parameters.content_type,
          source_text: englishContent,
          preserve_formatting: true,
          localize_context: true,
          maintain_seo: true
        };

        results[lang] = await this.translateContent(translationRequest);
      }
    }

    return results;
  }

  private async generateBaseContent(parameters: any): Promise<string> {
    // This would use your existing AI content generation
    // For demonstration, returning a template
    return `Complete guide to ${parameters.style} aquascaping for ${parameters.difficulty_level} enthusiasts.

Learn the essential techniques, plant selections, and maintenance tips for creating stunning ${parameters.style} aquascapes.

Key topics covered:
- Planning your layout
- Plant selection and placement  
- Equipment requirements
- Maintenance schedule
- Common troubleshooting

This comprehensive guide will help you master the art of ${parameters.style} aquascaping.`;
  }

  // === SEO AND ANALYTICS ===

  private async localizeSEOKeywords(text: string, targetLanguage: string): Promise<string[]> {
    const config = this.languageConfigs.get(targetLanguage);
    if (!config) return [];

    // Extract and translate SEO-relevant terms
    const baseKeywords = await this.extractSEOKeywords(text, 'en');
    const localizedKeywords: string[] = [];

    for (const keyword of baseKeywords) {
      const translated = await this.translateKeyword(keyword, targetLanguage);
      localizedKeywords.push(translated);
    }

    // Add regional-specific keywords
    const regionalTerms = this.getRegionalSEOTerms(targetLanguage);
    localizedKeywords.push(...regionalTerms);

    return localizedKeywords.slice(0, 20); // Limit to top 20
  }

  private async extractSEOKeywords(text: string, language: string): Promise<string[]> {
    // Extract aquascaping-relevant keywords from text
    const aquascapingKeywords = [
      'aquascape', 'planted tank', 'aquarium plants', 'CO2 system',
      'LED lighting', 'substrate', 'fertilizers', 'plant care',
      'nature aquarium', 'iwagumi', 'dutch style', 'biotope'
    ];

    const foundKeywords = aquascapingKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    return foundKeywords;
  }

  private async translateKeyword(keyword: string, targetLanguage: string): Promise<string> {
    const terminology = this.terminologyDatabase.get('aquascaping_terms')?.[targetLanguage];
    
    // Try to find direct translation in terminology database
    for (const [key, value] of Object.entries(terminology || {})) {
      if (key.replace('_', ' ').toLowerCase() === keyword.toLowerCase()) {
        return value;
      }
    }

    // Fallback to AI translation for complex terms
    return await this.aiTranslator.translateContent(keyword, targetLanguage);
  }

  private getRegionalSEOTerms(language: string): string[] {
    const regionalTerms = {
      bg: ['аквариум българия', 'водни растения софия', 'аквашейп варна'],
      hu: ['akvárium magyarország', 'vízi növények budapest', 'akvászkép pécs']
    };

    return regionalTerms[language] || [];
  }

  // === QUALITY ASSESSMENT ===

  private async assessTranslationQuality(
    sourceText: string,
    translatedText: string, 
    sourceLang: string,
    targetLang: string
  ): Promise<number> {
    // Quality assessment based on multiple factors
    const factors = {
      terminology_consistency: await this.assessTerminologyConsistency(translatedText, targetLang),
      cultural_appropriateness: await this.assessCulturalAdaptation(translatedText, targetLang),
      fluency_score: await this.assessFluency(translatedText, targetLang),
      completeness_score: await this.assessCompleteness(sourceText, translatedText),
      technical_accuracy: await this.assessTechnicalAccuracy(translatedText, targetLang)
    };

    // Weighted average
    const weights = {
      terminology_consistency: 0.25,
      cultural_appropriateness: 0.20,
      fluency_score: 0.25,
      completeness_score: 0.15,
      technical_accuracy: 0.15
    };

    let totalScore = 0;
    for (const [factor, score] of Object.entries(factors)) {
      totalScore += score * weights[factor];
    }

    return Math.round(totalScore * 100) / 100;
  }

  private async assessTerminologyConsistency(text: string, language: string): Promise<number> {
    const terminology = this.terminologyDatabase.get('aquascaping_terms')?.[language];
    if (!terminology) return 0.5;

    let consistentTerms = 0;
    let totalTerms = 0;

    Object.values(terminology).forEach((term: string) => {
      if (text.includes(term)) {
        consistentTerms++;
      }
      totalTerms++;
    });

    return totalTerms > 0 ? consistentTerms / totalTerms : 0.8;
  }

  private async assessCulturalAdaptation(text: string, language: string): Promise<number> {
    const adaptations = this.culturalAdaptations.get('regional_preferences')?.[language];
    if (!adaptations) return 0.5;

    let adaptationScore = 0.5;

    // Check for preferred brands mention
    const brandMentions = adaptations.preferred_brands.some((brand: string) => 
      text.toLowerCase().includes(brand.toLowerCase())
    );
    if (brandMentions) adaptationScore += 0.2;

    // Check for appropriate measurement units
    const hasMetric = /\d+\s*(см|литра|°C)/i.test(text);
    if (hasMetric && language !== 'en') adaptationScore += 0.2;

    // Check for regional problem awareness
    const mentionsRegionalIssues = adaptations.common_problems?.some((problem: string) =>
      text.toLowerCase().includes(problem.toLowerCase())
    );
    if (mentionsRegionalIssues) adaptationScore += 0.1;

    return Math.min(1.0, adaptationScore);
  }

  private async assessFluency(text: string, language: string): Promise<number> {
    // Simplified fluency assessment
    // In production, this would use language-specific models
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Check average sentence length (appropriate for language)
    const avgLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
    
    const optimalLengths = { en: 15, bg: 18, hu: 16 }; // Words per sentence
    const optimal = optimalLengths[language] || 15;
    
    const lengthScore = 1 - Math.min(0.5, Math.abs(avgLength - optimal) / optimal);
    
    return lengthScore;
  }

  private async assessCompleteness(sourceText: string, translatedText: string): Promise<number> {
    const sourceWords = sourceText.split(/\s+/).length;
    const translatedWords = translatedText.split(/\s+/).length;
    
    // Expect translated text to be within 70%-130% of original length
    const ratio = translatedWords / sourceWords;
    
    if (ratio >= 0.7 && ratio <= 1.3) {
      return 1.0;
    } else if (ratio >= 0.5 && ratio <= 1.6) {
      return 0.8;
    } else {
      return 0.5;
    }
  }

  private async assessTechnicalAccuracy(text: string, language: string): Promise<number> {
    const plantTerms = this.terminologyDatabase.get('plant_names')?.[language];
    const techTerms = this.terminologyDatabase.get('aquascaping_terms')?.[language];
    
    if (!plantTerms || !techTerms) return 0.7;

    // Count correct technical term usage
    let correctTerms = 0;
    let totalExpectedTerms = 0;

    [...Object.values(plantTerms), ...Object.values(techTerms)].forEach((term: string) => {
      if (text.includes(term)) {
        correctTerms++;
      }
      totalExpectedTerms++;
    });

    return totalExpectedTerms > 0 ? Math.min(1.0, correctTerms / (totalExpectedTerms * 0.1)) : 0.8;
  }

  // === HELPER METHODS ===

  private async generateLocalizationNotes(
    request: TranslationRequest, 
    translatedText: string
  ): Promise<string[]> {
    const notes: string[] = [];
    const targetConfig = this.languageConfigs.get(request.target_language);
    
    if (targetConfig) {
      notes.push(`Adapted for ${targetConfig.region} aquascaping community`);
      notes.push(`Formality level: ${targetConfig.content_preferences.formality_level}`);
      notes.push(`Measurement units: ${targetConfig.content_preferences.measurement_units}`);
      
      if (request.localize_context) {
        notes.push('Cultural references adapted to local context');
      }
      
      if (request.maintain_seo) {
        notes.push('SEO keywords localized for target market');
      }
    }

    return notes;
  }

  private async getCulturalAdaptationDetails(language: string): Promise<string[]> {
    const adaptations = this.culturalAdaptations.get('content_style')?.[language];
    const regional = this.culturalAdaptations.get('regional_preferences')?.[language];
    
    const details: string[] = [];
    
    if (adaptations) {
      details.push(`Greeting style: ${adaptations.greeting_style}`);
      details.push(`Educational approach: ${adaptations.educational_approach}`);
      details.push(`Call-to-action style: ${adaptations.call_to_action}`);
    }
    
    if (regional) {
      details.push(`Regional brands emphasized: ${regional.preferred_brands.slice(0, 2).join(', ')}`);
      details.push(`Price sensitivity: ${regional.price_sensitivity}`);
    }

    return details;
  }
}

// Usage Examples
export const MultiLanguageExamples = {
  // Example: Generate multilingual newsletter
  async generateMultilingualNewsletter(): Promise<Record<string, LocalizedContent>> {
    const engine = new MultiLanguageAquascapingEngine({
      aiTranslator: null // Your AI translator
    });

    return await engine.generateMultilingualContent({
      topic: 'Advanced Plant Trimming Techniques',
      content_type: 'newsletter',
      target_languages: ['en', 'bg', 'hu'],
      difficulty_level: 'intermediate',
      style: 'nature'
    });
  },

  // Example: Translate existing content
  async translateProductGuide(): Promise<LocalizedContent> {
    const engine = new MultiLanguageAquascapingEngine({
      aiTranslator: null
    });

    const englishGuide = `Complete guide to CO2 systems for planted aquariums. 
    Learn how to choose, install, and maintain CO2 injection systems for optimal plant growth.`;

    return await engine.translateContent({
      source_language: 'en',
      target_language: 'bg',
      content_type: 'tutorial',
      source_text: englishGuide,
      preserve_formatting: true,
      localize_context: true,
      maintain_seo: true
    });
  }
};