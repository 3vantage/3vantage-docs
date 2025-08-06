// Comprehensive Aquascaping Prompt Library
// File: /lib/ai/aquascaping-prompts.ts

export interface PromptTemplate {
  id: string;
  name: string;
  category: 'visual' | 'content' | 'social' | 'educational';
  language: 'en' | 'bg' | 'hu';
  template: string;
  variables: string[];
  examples: any[];
}

export const AQUASCAPING_PROMPT_LIBRARY: PromptTemplate[] = [
  // === VISUAL PROMPTS (IMAGE GENERATION) ===
  {
    id: 'nature_aquarium_hero',
    name: 'Nature Aquarium Hero Shot',
    category: 'visual',
    language: 'en',
    template: `Create a stunning professional aquascaping photograph featuring a {tankSize} Nature Aquarium style setup. 

Layout: Asymmetrical hardscape with {hardscape} positioned following the golden ratio rule. Natural driftwood pieces creating depth and visual flow.

Plants: Lush {foregroundPlants} carpet in the foreground, {midgroundPlants} creating texture in the middle, and {backgroundPlants} providing height and backdrop.

Fish: {fishCount} {fishSpecies} swimming naturally in the {waterColumn} creating movement and life.

Technical details:
- Water: Crystal clear with {waterPh} pH, perfect clarity
- Lighting: {lighting} creating natural shadows and highlights
- Photography: Professional aquascaping contest quality, sharp focus, vibrant colors
- Composition: Rule of thirds, natural depth of field
- Quality: High resolution, contest-worthy presentation

The image should inspire aquascaping enthusiasts and demonstrate Nature Aquarium principles of natural beauty and harmony.`,
    variables: ['tankSize', 'hardscape', 'foregroundPlants', 'midgroundPlants', 'backgroundPlants', 'fishCount', 'fishSpecies', 'waterColumn', 'waterPh', 'lighting'],
    examples: [
      {
        tankSize: '90cm x 45cm x 45cm',
        hardscape: 'Seiryu stone arrangement',
        foregroundPlants: 'Glossostigma elatinoides',
        midgroundPlants: 'Cryptocoryne wendtii and Anubias nana',
        backgroundPlants: 'Rotala rotundifolia and Vallisneria spiralis',
        fishCount: '20',
        fishSpecies: 'Cardinal tetras',
        waterColumn: 'middle water column',
        waterPh: '6.8',
        lighting: 'LED full spectrum lighting'
      }
    ]
  },

  {
    id: 'iwagumi_minimalist',
    name: 'Iwagumi Minimalist Layout',
    category: 'visual',
    language: 'en',
    template: `Generate a serene Iwagumi style aquascape photograph with pure minimalist aesthetics.

Stone arrangement: {stoneCount} {stoneType} stones arranged in traditional Iwagumi principles - largest stone (Oyaishi) positioned off-center, secondary stones (Fukuishi) supporting the main composition, smaller accent stones (Soeishi) completing the layout.

Carpeting: Dense, pristine {carpetPlant} carpet covering the substrate, perfectly trimmed and maintained, creating a lush green meadow effect.

Fish: School of {schoolSize} {fishType} swimming in perfect formation, adding movement while maintaining the minimalist aesthetic.

Water parameters: pH {ph}, extremely clear water with no particles or debris visible.

Lighting: {lightingStyle} creating soft, natural illumination that enhances the stone textures and plant colors without harsh shadows.

Composition: Zen-like tranquility, perfect symmetry broken by natural asymmetry, peaceful and meditative atmosphere.

Photography: Professional aquascaping competition standard, perfect clarity, vibrant yet natural colors, shallow depth of field highlighting the main stone arrangement.`,
    variables: ['stoneCount', 'stoneType', 'carpetPlant', 'schoolSize', 'fishType', 'ph', 'lightingStyle'],
    examples: [
      {
        stoneCount: '5',
        stoneType: 'Ohko stone',
        carpetPlant: 'HC Cuba (Hemianthus callitrichoides)',
        schoolSize: '30',
        fishType: 'Celestial Pearl Danios',
        ph: '6.5',
        lightingStyle: 'Natural daylight simulation LED'
      }
    ]
  },

  // === CONTENT GENERATION PROMPTS ===
  {
    id: 'plant_care_guide',
    name: 'Plant Care Guide Generator',
    category: 'educational',
    language: 'en',
    template: `Write a comprehensive care guide for {plantName} ({scientificName}) targeted at {skillLevel} aquascapers.

Structure the guide with these sections:

**Plant Overview**
- Native habitat and natural growing conditions
- Growth characteristics and adult size
- Difficulty level and maintenance requirements

**Tank Requirements**
- Lighting: {lightingNeeds} (specify PAR values and duration)
- CO2: {co2Requirements} 
- Water parameters: pH {phRange}, hardness {hardnessRange}, temperature {tempRange}
- Substrate needs and fertilization requirements

**Planting and Placement**
- Where to position in the aquascape
- Planting techniques and root development
- Spacing requirements and growth patterns
- Trimming schedule and propagation methods

**Common Issues and Solutions**
- Most frequent problems beginners encounter
- Yellowing leaves, melting, or poor growth causes
- How to identify nutrient deficiencies
- Compatibility with other plants and fish

**Pro Tips for Success**
- Expert advice for optimal growth
- Seasonal care variations
- Competition-level maintenance techniques

Make the content engaging, practical, and include specific measurable parameters. Write in a friendly but authoritative tone that builds confidence in {skillLevel} aquascapers.`,
    variables: ['plantName', 'scientificName', 'skillLevel', 'lightingNeeds', 'co2Requirements', 'phRange', 'hardnessRange', 'tempRange'],
    examples: [
      {
        plantName: 'Java Moss',
        scientificName: 'Vesicularia dubyana',
        skillLevel: 'beginner',
        lightingNeeds: 'Low to moderate (20-40 PAR)',
        co2Requirements: 'Not required but beneficial',
        phRange: '6.0-7.5',
        hardnessRange: '2-15 dGH',
        tempRange: '18-28°C'
      }
    ]
  },

  {
    id: 'newsletter_announcement',
    name: 'Newsletter Announcement Content',
    category: 'content',
    language: 'en',
    template: `Create an engaging newsletter announcement for aquascaping enthusiasts about {announcementTopic}.

**Subject Line Options** (A/B test ready):
1. {subjectLine1}
2. {subjectLine2}
3. {subjectLine3}

**Opening Hook** (2-3 sentences):
Start with an engaging question or statement that connects to the reader's aquascaping passion and introduces {announcementTopic}.

**Main Content** (200-300 words):
- What: Clear explanation of {announcementTopic}
- Why it matters: Benefits for aquascapers
- Key details: {keyDetails}
- Value proposition: What subscribers gain

**Call-to-Action**:
{ctaType} with specific action: {specificAction}

**Social Proof** (if applicable):
Include {testimonialCount} brief testimonials or success stories related to the announcement.

**Next Steps Preview**:
Tease upcoming content: "{nextWeekTopic}" coming next week.

**Footer Elements**:
- Aquascaping tip of the week
- Community highlight
- Unsubscribe and preference management

Tone: Professional yet enthusiastic, expert knowledge with approachable delivery. Make readers feel part of an exclusive aquascaping community.`,
    variables: ['announcementTopic', 'subjectLine1', 'subjectLine2', 'subjectLine3', 'keyDetails', 'ctaType', 'specificAction', 'testimonialCount', 'nextWeekTopic'],
    examples: [
      {
        announcementTopic: 'New Partnership with Green Aqua',
        subjectLine1: '🌿 Exciting Partnership News Inside!',
        subjectLine2: 'Your Aquascaping Journey Just Got Better',
        subjectLine3: 'Green Aqua + AquaScene = Amazing News',
        keyDetails: 'Exclusive discounts, expert content collaboration, priority access to new products',
        ctaType: 'Learn more button',
        specificAction: 'Visit partnership page',
        testimonialCount: '2',
        nextWeekTopic: 'Advanced CO2 System Setup Guide'
      }
    ]
  },

  // === SOCIAL MEDIA PROMPTS ===
  {
    id: 'instagram_showcase',
    name: 'Instagram Aquascape Showcase',
    category: 'social',
    language: 'en',
    template: `Create an Instagram post caption for showcasing a beautiful {aquascapeStyle} aquascape.

**Opening** (Hook in first line):
{hookStyle} that immediately captures attention and relates to the image.

**Main Description** (50-80 words):
Describe the aquascape featuring:
- Tank size: {tankDimensions}
- Key plants: {featuredPlants}
- Hardscape: {hardscapeMaterials}
- Fish: {fishSpecies}
- Lighting: {lightingSetup}

**Educational Value** (30-50 words):
Share one practical tip about {aquascapingTip} that followers can apply to their own tanks.

**Engagement Questions**:
Ask 1-2 questions to encourage comments:
- About their favorite {elementType}
- Their experience with {technique}

**Hashtags** (20-30 relevant hashtags):
Mix of popular and niche aquascaping hashtags:
- Brand hashtags: #aquascene #greenlush
- Style hashtags: #{aquascapeStyle}aquascape
- Plant hashtags: {plantHashtags}
- Community hashtags: #aquascaping #plantedtank #aquascapers

**Call-to-Action**:
{ctaType}: {ctaText}

Tone: Inspiring and educational, community-focused, professional yet approachable.`,
    variables: ['aquascapeStyle', 'hookStyle', 'tankDimensions', 'featuredPlants', 'hardscapeMaterials', 'fishSpecies', 'lightingSetup', 'aquascapingTip', 'elementType', 'technique', 'plantHashtags', 'ctaType', 'ctaText'],
    examples: [
      {
        aquascapeStyle: 'nature',
        hookStyle: 'Breathtaking question about natural beauty',
        tankDimensions: '120cm x 50cm x 50cm',
        featuredPlants: 'Rotala rotundifolia, Java fern, Anubias barteri',
        hardscapeMaterials: 'Dragon stone and Malaysian driftwood',
        fishSpecies: 'Cardinal tetras and Otocinclus catfish',
        lightingSetup: 'Chihiros WRGB 2 LED system',
        aquascapingTip: 'proper plant placement using the rule of thirds',
        elementType: 'background plant',
        technique: 'trimming and maintenance',
        plantHashtags: '#rotala #javafern #anubias',
        ctaType: 'Learn more',
        ctaText: 'Visit our plant care guides (link in bio)'
      }
    ]
  },

  // === MULTILINGUAL PROMPTS ===
  {
    id: 'plant_care_guide_bg',
    name: 'Ръководство за грижи за растения',
    category: 'educational',
    language: 'bg',
    template: `Напишете изчерпателно ръководство за грижи за {plantName} ({scientificName}) насочено към {skillLevel} аквариумисти.

Структурирайте ръководството със следните раздели:

**Общ преглед на растението**
- Естествена среда на обитание и условия на растеж
- Характеристики на растежа и размери при зряло състояние  
- Степен на трудност и изисквания за поддръжка

**Изисквания за аквариума**
- Осветление: {lightingNeeds} (посочете PAR стойности и продължителност)
- CO2: {co2Requirements}
- Водни параметри: pH {phRange}, твърдост {hardnessRange}, температура {tempRange}
- Нужди от субстрат и изисквания за торене

**Засаждане и позициониране**
- Къде да се позиционира в аквашейпа
- Техники за засаждане и развитие на корените
- Изисквания за разстояние и модели на растеж
- График за подрязване и методи за размножаване

**Чести проблеми и решения**
- Най-чести проблеми, с които се сблъскват начинаещите
- Причини за пожълтяване на листата, топене или слаб растеж
- Как да идентифицирате дефицити на хранителни вещества
- Съвместимост с други растения и риби

**Професионални съвети за успех**
- Експертни съвети за оптимален растеж
- Сезонни вариации в грижите
- Техники за поддръжка на състезателно ниво

Направете съдържанието ангажиращо, практично и включете специфични измерими параметри. Пишете в дружелюбен, но авторитетен тон, който изгражда увереност в {skillLevel} аквариумисти.`,
    variables: ['plantName', 'scientificName', 'skillLevel', 'lightingNeeds', 'co2Requirements', 'phRange', 'hardnessRange', 'tempRange'],
    examples: [
      {
        plantName: 'Ява мъх',
        scientificName: 'Vesicularia dubyana',
        skillLevel: 'начинаещи',
        lightingNeeds: 'Слабо до умерено (20-40 PAR)',
        co2Requirements: 'Не е задължително, но е полезно',
        phRange: '6.0-7.5',
        hardnessRange: '2-15 dGH',
        tempRange: '18-28°C'
      }
    ]
  },

  {
    id: 'plant_care_guide_hu',
    name: 'Növényápolási útmutató',
    category: 'educational',
    language: 'hu',
    template: `Írj átfogó ápolási útmutatót a(z) {plantName} ({scientificName}) számára, {skillLevel} akváriumi növény-ápolóknak szánva.

Strukturáld az útmutatót az alábbi részekkel:

**Növény áttekintés**
- Természetes élőhely és természetes növekedési körülmények
- Növekedési jellemzők és felnőtt méret
- Nehézségi szint és karbantartási igények

**Akvárium követelmények**
- Világítás: {lightingNeeds} (PAR értékeket és időtartamot adj meg)
- CO2: {co2Requirements}
- Víz paraméterek: pH {phRange}, keménység {hardnessRange}, hőmérséklet {tempRange}
- Szubsztrát igények és trágyázási követelmények

**Ültetés és elhelyezés**
- Hova helyezze el az aquascaping-ben
- Ültetési technikák és gyökérfejlődés
- Távolság követelmények és növekedési minták
- Metszési ütemterv és szaporítási módszerek

**Gyakori problémák és megoldások**
- Leggyakoribb problémák, amikkel a kezdők találkoznak
- Levelek sárgulásának, elolvadásának vagy gyenge növekedés okai
- Hogyan azonosítsuk a tápanyaghiányt
- Kompatibilitás más növényekkel és halakkal

**Profi tippek a sikerhez**
- Szakértői tanácsok az optimális növekedéshez
- Szezonális ápolási variációk
- Versenyszerű karbantartási technikák

Tedd a tartalmat vonzóvá, praktikussá és tartalmazz konkrét mérhető paramétereket. Írj barátságos, de hiteles hangnemben, ami építi a {skillLevel} akváriumi növény-ápolók bizalmát.`,
    variables: ['plantName', 'scientificName', 'skillLevel', 'lightingNeeds', 'co2Requirements', 'phRange', 'hardnessRange', 'tempRange'],
    examples: [
      {
        plantName: 'Java moha',
        scientificName: 'Vesicularia dubyana',
        skillLevel: 'kezdő',
        lightingNeeds: 'Alacsony-közepes (20-40 PAR)',
        co2Requirements: 'Nem szükséges, de hasznos',
        phRange: '6.0-7.5',
        hardnessRange: '2-15 dGH',
        tempRange: '18-28°C'
      }
    ]
  }
];

// Prompt Engine for Dynamic Content Generation
export class AquascapingPromptEngine {
  private prompts: Map<string, PromptTemplate>;

  constructor() {
    this.prompts = new Map();
    AQUASCAPING_PROMPT_LIBRARY.forEach(prompt => {
      this.prompts.set(prompt.id, prompt);
    });
  }

  getPrompt(id: string): PromptTemplate | undefined {
    return this.prompts.get(id);
  }

  getPromptsByCategory(category: string): PromptTemplate[] {
    return Array.from(this.prompts.values()).filter(p => p.category === category);
  }

  getPromptsByLanguage(language: string): PromptTemplate[] {
    return Array.from(this.prompts.values()).filter(p => p.language === language);
  }

  renderPrompt(id: string, variables: Record<string, any>): string {
    const prompt = this.prompts.get(id);
    if (!prompt) {
      throw new Error(`Prompt with id '${id}' not found`);
    }

    let rendered = prompt.template;
    
    // Replace all variables in the template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    });

    return rendered;
  }

  validatePromptVariables(id: string, variables: Record<string, any>): {
    isValid: boolean;
    missing: string[];
    extra: string[];
  } {
    const prompt = this.prompts.get(id);
    if (!prompt) {
      throw new Error(`Prompt with id '${id}' not found`);
    }

    const provided = Object.keys(variables);
    const required = prompt.variables;
    
    const missing = required.filter(req => !provided.includes(req));
    const extra = provided.filter(prov => !required.includes(prov));

    return {
      isValid: missing.length === 0,
      missing,
      extra
    };
  }

  getRandomExample(id: string): any {
    const prompt = this.prompts.get(id);
    if (!prompt || !prompt.examples.length) {
      return null;
    }
    
    return prompt.examples[Math.floor(Math.random() * prompt.examples.length)];
  }

  // Smart prompt suggestions based on content type and audience
  suggestPrompts(context: {
    contentType?: string;
    audience?: string;
    language?: string;
    difficulty?: string;
  }): PromptTemplate[] {
    let suggestions = Array.from(this.prompts.values());

    // Filter by language if specified
    if (context.language) {
      suggestions = suggestions.filter(p => p.language === context.language);
    }

    // Filter by category mapping
    const categoryMap: Record<string, string[]> = {
      'newsletter': ['content', 'educational'],
      'social': ['social'],
      'education': ['educational'],
      'visual': ['visual']
    };

    if (context.contentType && categoryMap[context.contentType]) {
      suggestions = suggestions.filter(p => 
        categoryMap[context.contentType].includes(p.category)
      );
    }

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }
}

// Usage examples and test utilities
export const PROMPT_EXAMPLES = {
  generateNatureAquascapeImage: () => {
    const engine = new AquascapingPromptEngine();
    const variables = {
      tankSize: '120cm x 50cm x 50cm',
      hardscape: 'Dragon stone and Malaysian driftwood',
      foregroundPlants: 'Glossostigma elatinoides',
      midgroundPlants: 'Cryptocoryne wendtii and Rotala rotundifolia',
      backgroundPlants: 'Vallisneria spiralis and Ludwigia repens',
      fishCount: '25',
      fishSpecies: 'Cardinal tetras',
      waterColumn: 'middle and upper water column',
      waterPh: '6.8',
      lighting: 'Full spectrum LED with 6500K temperature'
    };

    return engine.renderPrompt('nature_aquarium_hero', variables);
  },

  generatePlantCareGuide: () => {
    const engine = new AquascapingPromptEngine();
    const variables = {
      plantName: 'Rotala Rotundifolia',
      scientificName: 'Rotala rotundifolia',
      skillLevel: 'intermediate',
      lightingNeeds: 'High (50-80 PAR)',
      co2Requirements: 'Required for optimal coloration',
      phRange: '6.0-7.0',
      hardnessRange: '3-8 dGH',
      tempRange: '22-26°C'
    };

    return engine.renderPrompt('plant_care_guide', variables);
  },

  generateInstagramPost: () => {
    const engine = new AquascapingPromptEngine();
    const variables = {
      aquascapeStyle: 'nature',
      hookStyle: 'Ever wondered how nature creates perfect harmony?',
      tankDimensions: '90cm x 45cm x 45cm',
      featuredPlants: 'Monte Carlo, Anubias Nana Petite, and Red Ludwigia',
      hardscapeMaterials: 'Seiryu stone with Spider wood',
      fishSpecies: 'Neon tetras and Cherry shrimp',
      lightingSetup: 'Chihiros WRGB 2 Pro',
      aquascapingTip: 'using the golden ratio for hardscape placement',
      elementType: 'red accent plant',
      technique: 'CO2 balancing',
      plantHashtags: '#montecarlo #anubias #ludwigia',
      ctaType: 'Save for later',
      ctaText: 'Save this post and try the golden ratio in your next aquascape!'
    };

    return engine.renderPrompt('instagram_showcase', variables);
  }
};