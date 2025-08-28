// lib/enhanced-groq.ts
import Groq from 'groq-sdk';

// Initialize Groq client with fallback for build time
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy-key-for-build',
});

export interface QueryTranslation {
  translatedQuery: string;
  keyTerms: string[];
  confidence: number;
  searchStrategy: 'semantic' | 'ingredient' | 'cuisine' | 'texture' | 'method';
}

export class EnhancedGroqService {
  
  /**
   * Check if Groq API key is available
   */
  private static isApiKeyAvailable(): boolean {
    return !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'dummy-key-for-build');
  }

  /**
   * Create unified food analysis with streaming response and query translation
   */
  static async createUnifiedFoodAnalysis(userQuery: string): Promise<ReadableStream> {
    if (!this.isApiKeyAvailable()) {
      const encoder = new TextEncoder();
      return new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'content',
            content: 'AI analysis is not available. Please check your API key configuration.' 
          })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'translation',
            translatedQuery: userQuery,
            keyTerms: userQuery.split(' '),
            confidence: 0.5
          })}\n\n`));
          controller.enqueue(encoder.encode('data: {"type": "done"}\n\n'));
          controller.close();
        },
      });
    }

    try {
      // First, get query translation for vector search
      const translationPromise = this.translateQueryForVectorSearch(userQuery);

      // Start streaming analysis
      const stream = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a world-renowned food expert and culinary anthropologist. When users describe what they're craving, you provide:

            1. An engaging analysis of their food craving
            2. Cultural context and background
            3. Why they might be craving those specific flavors/textures
            4. What makes the food special or unique
            5. Cooking methods and preparation insights

            Write in a warm, engaging, conversational tone. Be informative but approachable.
            Focus on making the user excited about the food they're about to discover.
            Keep responses around 150-200 words, well-structured and easy to read.
            
            Do NOT just list foods - provide analysis and context about their craving.`
          },
          {
            role: "user",
            content: `I'm craving: "${userQuery}". Help me understand what I'm looking for and provide insights about these types of foods.`
          }
        ],
        model: "llama-3.1-70b-versatile", // Use more powerful model for analysis
        temperature: 0.7,
        max_tokens: 400,
        stream: true,
      });

      const encoder = new TextEncoder();
      
      return new ReadableStream({
        async start(controller) {
          try {
            // Get query translation in parallel
            let translationSent = false;
            
            translationPromise.then(translation => {
              if (!translationSent) {
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'translation',
                    translatedQuery: translation.translatedQuery,
                    keyTerms: translation.keyTerms,
                    confidence: translation.confidence,
                    searchStrategy: translation.searchStrategy
                  })}\n\n`
                ));
                translationSent = true;
              }
            }).catch(err => {
              console.error('Translation error:', err);
              // Send fallback translation
              if (!translationSent) {
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'translation',
                    translatedQuery: userQuery,
                    keyTerms: userQuery.split(' ').filter(word => word.length > 2),
                    confidence: 0.6,
                    searchStrategy: 'semantic'
                  })}\n\n`
                ));
                translationSent = true;
              }
            });

            // Stream the AI analysis
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({ type: 'content', content })}\n\n`
                ));
              }
            }
            
            // Ensure translation was sent
            const translation = await translationPromise.catch(() => ({
              translatedQuery: userQuery,
              keyTerms: userQuery.split(' ').filter(word => word.length > 2),
              confidence: 0.6,
              searchStrategy: 'semantic' as const
            }));

            if (!translationSent) {
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({
                  type: 'translation',
                  translatedQuery: translation.translatedQuery,
                  keyTerms: translation.keyTerms,
                  confidence: translation.confidence,
                  searchStrategy: translation.searchStrategy
                })}\n\n`
              ));
            }
            
            controller.enqueue(encoder.encode('data: {"type": "done"}\n\n'));
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: 'Stream failed' 
            })}\n\n`));
            controller.close();
          }
        },
      });
    } catch (error) {
      console.error('Enhanced Groq analysis error:', error);
      throw error;
    }
  }

  /**
   * Translate user query into vector search optimized terms
   */
  static async translateQueryForVectorSearch(userQuery: string): Promise<QueryTranslation> {
    if (!this.isApiKeyAvailable()) {
      return {
        translatedQuery: userQuery,
        keyTerms: userQuery.split(' ').filter(word => word.length > 2),
        confidence: 0.5,
        searchStrategy: 'semantic'
      };
    }

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a food search optimization expert. Your job is to translate user food queries into terms that will work best for vector database search.

            Analyze the user's query and provide:
            1. A translated query optimized for food database search
            2. Key search terms that should match food database entries
            3. The search strategy that would work best
            4. Confidence in the translation

            Focus on:
            - Cuisine names (Korean, Thai, Chinese, etc.)
            - Cooking methods (fermented, grilled, steamed, fried)
            - Food types (noodles, soup, rice, vegetables)
            - Textures (crispy, creamy, chewy, spicy)
            - Ingredients (beef, pork, vegetables, coconut)

            Return JSON format:
            {
              "translatedQuery": "optimized search terms",
              "keyTerms": ["term1", "term2", "term3"],
              "confidence": 0.8,
              "searchStrategy": "semantic|ingredient|cuisine|texture|method"
            }`
          },
          {
            role: "user",
            content: `Translate this food query for vector database search: "${userQuery}"`
          }
        ],
        model: "llama-3.1-8b-instant", // Use faster model for translation
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No translation response');
      }

      const parsed = JSON.parse(response) as QueryTranslation;
      
      // Validate the response
      if (!parsed.translatedQuery || !Array.isArray(parsed.keyTerms)) {
        throw new Error('Invalid translation format');
      }

      return {
        translatedQuery: parsed.translatedQuery || userQuery,
        keyTerms: parsed.keyTerms || userQuery.split(' ').filter(word => word.length > 2),
        confidence: Math.max(0.1, Math.min(1.0, parsed.confidence || 0.7)),
        searchStrategy: parsed.searchStrategy || 'semantic'
      };

    } catch (error) {
      console.error('Query translation error:', error);
      // Return fallback translation
      return {
        translatedQuery: userQuery,
        keyTerms: userQuery.split(' ').filter(word => word.length > 2),
        confidence: 0.6,
        searchStrategy: 'semantic'
      };
    }
  }

  /**
   * Generate enhanced search suggestions based on user input
   */
  static async generateEnhancedSuggestions(partialQuery: string): Promise<string[]> {
    if (partialQuery.length < 2 || !this.isApiKeyAvailable()) return [];

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Generate 5 food search suggestions that complete or enhance the user's partial query. 
            Focus on popular, authentic dishes from various cuisines that match the partial input.
            Make suggestions specific and searchable.
            
            Return JSON format: {"suggestions": ["suggestion1", "suggestion2", ...]}`
          },
          {
            role: "user",
            content: `Complete or enhance this food search: "${partialQuery}"`
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.8,
        max_tokens: 200,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return [];

      const parsed = JSON.parse(response);
      return Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : [];
    } catch (error) {
      console.error('Enhanced suggestions error:', error);
      return [];
    }
  }
}

export default EnhancedGroqService;