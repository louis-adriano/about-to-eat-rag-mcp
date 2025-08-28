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

export interface QueryAnalysisResult {
  analysis: string;
  translatedQuery: string;
  keyTerms: string[];
  confidence: number;
  searchStrategy: string;
}

export interface SearchResult {
  id: string;
  text: string;
  region: string;
  type: string;
  score: number;
}

export class EnhancedGroqService {
  
  /**
   * Check if Groq API key is available
   */
  private static isApiKeyAvailable(): boolean {
    return !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'dummy-key-for-build');
  }

  /**
   * NEW: Create explanation when no good results are found
   */
  static async createNoResultsExplanation(
    originalQuery: string,
    queryAnalysis: string,
    allResults: SearchResult[]
  ): Promise<ReadableStream> {
    if (!this.isApiKeyAvailable()) {
      const encoder = new TextEncoder();
      return new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'no_results_content',
            content: `I couldn't find any dishes in our database that match "${originalQuery}". Try describing the cuisine type, cooking method, or main ingredients differently.`
          })}\n\n`));
          controller.enqueue(encoder.encode('data: {"type": "done"}\n\n'));
          controller.close();
        },
      });
    }

    try {
      // Analyze what was closest if we have any results
      let closestResults = '';
      if (allResults.length > 0) {
        const top3Closest = allResults.slice(0, 3);
        closestResults = top3Closest.map((result, index) => {
          const dishName = this.extractDishName(result.text);
          return `${index + 1}. ${dishName} (${result.region}) - ${(result.score * 100).toFixed(0)}% match`;
        }).join('\n');
      }

      const stream = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a helpful food expert. When you cannot find good matches for a user's food search, politely explain why and provide constructive suggestions.

Structure your response as:
1. Acknowledge what they were looking for (1 sentence)
2. Explain why no good matches were found (1-2 sentences) 
3. Provide 2-3 specific suggestions for better search terms
4. Optional: If there were some weak matches, briefly mention what was closest

Be encouraging and helpful. Keep the tone friendly and supportive, under 120 words total.`
          },
          {
            role: "user",
            content: `User searched for: "${originalQuery}"

What they were looking for: ${queryAnalysis}

${closestResults ? `Closest matches found (but with low relevance):
${closestResults}` : 'No relevant matches found in the database.'}

Help explain why no good matches were found and suggest better search approaches.`
          }
        ],
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 200,
        stream: true,
      });

      const encoder = new TextEncoder();
      
      return new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({ type: 'no_results_content', content })}\n\n`
                ));
              }
            }
            controller.enqueue(encoder.encode('data: {"type": "done"}\n\n'));
            controller.close();
          } catch (error) {
            console.error('No results explanation streaming error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: 'No results explanation failed' 
            })}\n\n`));
            controller.close();
          }
        },
      });
    } catch (error) {
      console.error('Enhanced no results explanation error:', error);
      throw error;
    }
  }

  /**
   * Analyze user query and translate for vector search
   */
  static async analyzeAndTranslateQuery(userQuery: string): Promise<QueryAnalysisResult> {
    if (!this.isApiKeyAvailable()) {
      return {
        analysis: `Looking for food related to "${userQuery}"...`,
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
            content: `You are a food search expert. Analyze user queries and provide:

1. A brief, engaging analysis of what the user is looking for (1-2 sentences)
2. An optimized query for vector database search
3. Key search terms
4. Search strategy

Focus on:
- Cuisine types (Korean, Thai, Chinese, etc.)
- Cooking methods (fermented, grilled, steamed, fried)
- Food categories (noodles, soup, rice, vegetables)
- Textures and flavors (spicy, creamy, crispy, sour)
- Ingredients (beef, pork, vegetables, coconut)

Return JSON format:
{
  "analysis": "Brief engaging description of what user wants",
  "translatedQuery": "optimized search terms",
  "keyTerms": ["term1", "term2", "term3"],
  "confidence": 0.8,
  "searchStrategy": "semantic|ingredient|cuisine|texture|method"
}`
          },
          {
            role: "user",
            content: `Analyze this food search query: "${userQuery}"`
          }
        ],
        model: "llama3-8b-8192",
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No analysis response');
      }

      const parsed = JSON.parse(response);
      
      return {
        analysis: parsed.analysis || `Looking for food related to "${userQuery}"`,
        translatedQuery: parsed.translatedQuery || userQuery,
        keyTerms: Array.isArray(parsed.keyTerms) ? parsed.keyTerms : userQuery.split(' ').filter(word => word.length > 2),
        confidence: Math.max(0.1, Math.min(1.0, parsed.confidence || 0.7)),
        searchStrategy: parsed.searchStrategy || 'semantic'
      };

    } catch (error) {
      console.error('Query analysis error:', error);
      return {
        analysis: `Looking for food related to "${userQuery}"...`,
        translatedQuery: userQuery,
        keyTerms: userQuery.split(' ').filter(word => word.length > 2),
        confidence: 0.6,
        searchStrategy: 'semantic'
      };
    }
  }

  /**
   * Create enhanced AI summary with top 3 results integration
   */
  static async createEnhancedSummaryWithResults(
    originalQuery: string,
    queryAnalysis: string,
    top3Results: SearchResult[]
  ): Promise<ReadableStream> {
    if (!this.isApiKeyAvailable()) {
      const encoder = new TextEncoder();
      return new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'summary_content',
            content: `Based on your search, here are the top matches: ${top3Results.map(r => r.region + ' ' + r.type).join(', ')}.`
          })}\n\n`));
          controller.enqueue(encoder.encode('data: {"type": "done"}\n\n'));
          controller.close();
        },
      });
    }

    try {
      // Create a concise summary of top 3 results
      const top3Summary = top3Results.map((result, index) => {
        const dishName = this.extractDishName(result.text);
        return `${index + 1}. **${dishName}** (${result.region}) - ${result.type.toLowerCase()} with ${(result.score * 100).toFixed(0)}% match`;
      }).join('\n');

      const stream = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a food expert creating concise, engaging summaries. Structure your response as:

1. Brief interpretation of what the user wants (1 sentence)
2. Top 3 matching dishes with brief highlights  
3. Short cultural insight or recommendation (1-2 sentences)

Keep it conversational, informative, and under 150 words total. Use the exact dish information provided.`
          },
          {
            role: "user",
            content: `User searched for: "${originalQuery}"

Initial analysis: ${queryAnalysis}

Top 3 matching results:
${top3Summary}

Create a structured summary highlighting these specific dishes with brief cultural context.`
          }
        ],
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 250,
        stream: true,
      });

      const encoder = new TextEncoder();
      
      return new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({ type: 'summary_content', content })}\n\n`
                ));
              }
            }
            controller.enqueue(encoder.encode('data: {"type": "done"}\n\n'));
            controller.close();
          } catch (error) {
            console.error('Summary streaming error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: 'Summary stream failed' 
            })}\n\n`));
            controller.close();
          }
        },
      });
    } catch (error) {
      console.error('Enhanced summary creation error:', error);
      throw error;
    }
  }

  /**
   * Helper method to extract dish names from descriptions
   */
  private static extractDishName(text: string): string {
    // Look for dish names at the beginning of descriptions
    const sentences = text.split('.');
    const firstSentence = sentences[0];
    
    // Common patterns for dish names
    const patterns = [
      /^([A-Z][a-z]+(?:\s+[a-z]+)*)\s+is\s+/,  // "Kimchi is a..."
      /^([A-Z][a-z]+(?:\s+[a-z]+)*)\s+features\s+/, // "Pad Thai features..."
      /^([A-Z][a-z]+(?:\s+[a-z]+)*)\s+are\s+/, // "Dumplings are..."
    ];
    
    for (const pattern of patterns) {
      const match = firstSentence.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    // Fallback: take first 1-3 words if they look like a dish name
    const words = firstSentence.split(' ');
    if (words.length >= 2 && words[0][0] === words[0][0].toUpperCase()) {
      return words.slice(0, Math.min(3, words.length)).join(' ');
    }
    
    return words[0] || 'Dish';
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

      // Start streaming analysis - Updated to use supported model
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
        model: "llama3-70b-8192", // Updated to supported model
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
        model: "llama3-8b-8192", // Updated to supported model
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
   * Create streaming food context (for individual food items)
   */
  static async createStreamingFoodContext(foodItem: { text: string; region: string; type: string }): Promise<ReadableStream> {
    if (!this.isApiKeyAvailable()) {
      const encoder = new TextEncoder();
      return new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            content: 'AI analysis is not available. Please check your API key configuration.' 
          })}\n\n`));
          controller.enqueue(encoder.encode('data: {"done": true}\n\n'));
          controller.close();
        },
      });
    }

    try {
      const stream = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a food historian and cultural expert. Provide fascinating, engaging insights about foods including:
            - Cultural significance and traditions
            - Interesting historical facts and origins
            - Traditional preparation methods
            - Regional variations and local customs
            - Fun facts that make the food special
            
            Write in an engaging, storytelling style. Keep responses informative but conversational, around 150-200 words.`
          },
          {
            role: "user",
            content: `Tell me about this fascinating food: ${foodItem.text} from ${foodItem.region}. What makes it special culturally and historically?`
          }
        ],
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 300,
        stream: true,
      });

      const encoder = new TextEncoder();
      
      return new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode('data: {"done": true}\n\n'));
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`));
            controller.close();
          }
        },
      });
    } catch (error) {
      console.error('Enhanced Groq context streaming error:', error);
      throw error;
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
        model: "llama3-8b-8192", // Updated to supported model
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