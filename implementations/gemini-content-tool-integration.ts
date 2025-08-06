// Enhanced Aquascaping Content Tool with Gemini Integration
// File: /lib/ai/gemini-client.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

interface AquascapeImageRequest {
  style: 'nature' | 'iwagumi' | 'dutch' | 'biotope';
  elements: string[];
  tankSize: string;
  lighting: 'natural' | 'led' | 'fluorescent';
  waterParams: {
    ph: number;
    hardness: 'soft' | 'medium' | 'hard';
  };
  difficulty: 'beginner' | 'intermediate' | 'expert';
}

interface AquascapePromptConfig {
  basePrompt: string;
  styleModifiers: Record<string, string>;
  qualityEnhancers: string[];
  restrictionClauses: string[];
}

export class AquascapeGeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;
  
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-preview-image-generation',
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    });
  }

  private buildAquascapePrompt(request: AquascapeImageRequest): string {
    const promptConfig: AquascapePromptConfig = {
      basePrompt: 'Create a professional aquascaping photograph',
      styleModifiers: {
        nature: 'Nature Aquarium style with asymmetrical stone placement, natural driftwood, and lush plant growth following the golden ratio',
        iwagumi: 'Iwagumi style with minimalist stone arrangement, typically 3-5 stones in odd numbers, simple plant carpeting',
        dutch: 'Dutch style with terraced plant arrangements, multiple species in contrasting colors and textures, manicured appearance',
        biotope: 'Natural biotope recreation with region-specific plants, authentic substrate, and realistic fish populations'
      },
      qualityEnhancers: [
        'crystal clear water',
        'professional aquascaping photography',
        'high resolution',
        'perfect lighting balance',
        'vibrant plant colors',
        'natural depth of field'
      ],
      restrictionClauses: [
        'no artificial decorations',
        'no plastic plants', 
        'no neon colors',
        'realistic proportions'
      ]
    };

    const styleDescription = promptConfig.styleModifiers[request.style];
    const elementsDescription = request.elements.join(', ');
    const qualityDescription = promptConfig.qualityEnhancers.join(', ');
    const restrictions = promptConfig.restrictionClauses.join(', ');

    return `${promptConfig.basePrompt} featuring ${styleDescription}. 
    
Tank setup: ${request.tankSize} aquarium with ${elementsDescription}. 
Lighting: ${request.lighting} lighting setup creating natural shadows and highlights.
Water parameters: pH ${request.waterParams.ph}, ${request.waterParams.hardness} water.
Difficulty level: ${request.difficulty} aquascaping skill level.

Quality requirements: ${qualityDescription}.
Restrictions: ${restrictions}.

The image should inspire aquascaping enthusiasts and demonstrate best practices for this style.`;
  }

  async generateAquascapeImage(request: AquascapeImageRequest): Promise<{
    imageUrl: string;
    description: string;
    metadata: any;
  }> {
    try {
      const enhancedPrompt = this.buildAquascapePrompt(request);
      
      const result = await this.model.generateContent([{
        text: enhancedPrompt
      }]);

      const response = result.response;
      
      // Extract image and text from response
      return {
        imageUrl: response.candidates[0].content.parts.find(p => p.inlineData)?.inlineData || '',
        description: response.candidates[0].content.parts.find(p => p.text)?.text || '',
        metadata: {
          style: request.style,
          timestamp: new Date().toISOString(),
          cost: 0.04, // Gemini Imagen 4 cost per image
          prompt: enhancedPrompt
        }
      };
    } catch (error) {
      console.error('Gemini image generation failed:', error);
      throw new Error(`Failed to generate aquascape image: ${error.message}`);
    }
  }

  async morphExistingImage(
    imageBase64: string, 
    modifications: string[]
  ): Promise<{ imageUrl: string; description: string }> {
    const chat = this.model.startChat();
    
    // Send original image
    await chat.sendMessage([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      },
      {
        text: 'This is an aquascape image. Please analyze it and prepare for modifications.'
      }
    ]);

    // Apply modifications
    const modificationPrompt = `Please modify this aquascape image with the following changes: ${modifications.join(', ')}. 
    
    Maintain the overall aquascaping aesthetic and ensure all changes look natural and professionally done. 
    Keep water clarity, lighting quality, and realistic plant/fish behavior.`;

    const result = await chat.sendMessage(modificationPrompt);
    
    return {
      imageUrl: result.response.candidates[0].content.parts.find(p => p.inlineData)?.inlineData || '',
      description: result.response.candidates[0].content.parts.find(p => p.text)?.text || ''
    };
  }
}

// API Route Implementation
// File: app/api/generate-aquascape/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { AquascapeGeminiClient } from '@/lib/ai/gemini-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { style, elements, tankSize, lighting, waterParams, difficulty } = body;

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const geminiClient = new AquascapeGeminiClient(process.env.GOOGLE_GEMINI_API_KEY);
    
    const imageResult = await geminiClient.generateAquascapeImage({
      style,
      elements: elements.split(',').map(e => e.trim()),
      tankSize,
      lighting,
      waterParams: {
        ph: parseFloat(waterParams.ph),
        hardness: waterParams.hardness
      },
      difficulty
    });

    // Store generated image locally
    const imageBuffer = Buffer.from(imageResult.imageUrl, 'base64');
    const filename = `aquascape-${Date.now()}.jpg`;
    const imagePath = `/generated-images/${filename}`;
    
    // In production, save to file system or cloud storage
    // For now, return base64 data URL
    const dataUrl = `data:image/jpeg;base64,${imageResult.imageUrl}`;

    return NextResponse.json({
      success: true,
      image: {
        url: dataUrl,
        path: imagePath,
        description: imageResult.description,
        metadata: imageResult.metadata
      }
    });

  } catch (error) {
    console.error('Aquascape generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate aquascape image', details: error.message },
      { status: 500 }
    );
  }
}

// Enhanced UI Component
// File: components/ai/AquascapeImageGenerator.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Download, Wand2 } from 'lucide-react';

interface GeneratedImage {
  url: string;
  description: string;
  metadata: any;
}

export function AquascapeImageGenerator() {
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [formData, setFormData] = useState({
    style: 'nature',
    elements: 'dragon stone, java moss, anubias nana, rotala rotundifolia',
    tankSize: '60cm x 30cm x 36cm',
    lighting: 'led',
    waterParams: {
      ph: '6.8',
      hardness: 'medium'
    },
    difficulty: 'intermediate'
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-aquascape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedImage({
          url: result.image.url,
          description: result.image.description,
          metadata: result.image.metadata
        });
      } else {
        console.error('Generation failed:', result.error);
      }
    } catch (error) {
      console.error('Request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.download = `aquascape-${Date.now()}.jpg`;
      link.href = generatedImage.url;
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Aquascape Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Style Selection */}
          <div className="space-y-2">
            <Label>Aquascaping Style</Label>
            <Select 
              value={formData.style} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, style: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nature">Nature Aquarium</SelectItem>
                <SelectItem value="iwagumi">Iwagumi</SelectItem>
                <SelectItem value="dutch">Dutch Style</SelectItem>
                <SelectItem value="biotope">Biotope</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Elements */}
          <div className="space-y-2">
            <Label>Tank Elements</Label>
            <Textarea
              placeholder="e.g., dragon stone, java moss, anubias nana..."
              value={formData.elements}
              onChange={(e) => setFormData(prev => ({ ...prev, elements: e.target.value }))}
            />
          </div>

          {/* Tank Size */}
          <div className="space-y-2">
            <Label>Tank Size</Label>
            <Input
              placeholder="e.g., 60cm x 30cm x 36cm"
              value={formData.tankSize}
              onChange={(e) => setFormData(prev => ({ ...prev, tankSize: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Lighting */}
            <div className="space-y-2">
              <Label>Lighting</Label>
              <Select 
                value={formData.lighting} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, lighting: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="led">LED</SelectItem>
                  <SelectItem value="natural">Natural Light</SelectItem>
                  <SelectItem value="fluorescent">Fluorescent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select 
                value={formData.difficulty} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={loading} 
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Aquascape...
              </>
            ) : (
              'Generate Aquascape Image'
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedImage && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Aquascape</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <img 
                src={generatedImage.url} 
                alt="Generated aquascape"
                className="w-full rounded-lg"
              />
            </div>
            
            {generatedImage.description && (
              <div className="space-y-2">
                <Label>AI Description</Label>
                <p className="text-sm text-muted-foreground">
                  {generatedImage.description}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={downloadImage} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Image
              </Button>
              <Button variant="outline">
                Use in Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}