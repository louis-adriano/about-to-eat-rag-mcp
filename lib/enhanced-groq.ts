// File: lib/enhanced-groq.ts (Updated with memory support)
// lib/enhanced-groq.ts
import Groq from 'groq-sdk';
import { MemoryService } from './memory-service';
import { ConversationMessage } from '../types/conversation';
import { GROQ_MODELS } from './model-config';

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
   * NEW: Create conversational response with memory support
   */
  static async createConversationalResponseWithMemory(
    userQuery: string,
    foodContext: string,
    conversationHistory: ConversationMessage[]
  ): Promise<ReadableStream> {
    if (!this.isApiKeyAvailable()) {
      const encoder = new TextEncoder();
      return new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            content: `I'd be happy to help you with food-related questions! However, I need my AI capabilities to be properly configured. Could you tell me more about what you're looking for?`
          })}\n\n`));
          controller.enqueue(encoder.encode('data: {"done": true}\n\n'));
          controller.close();
        },
      });
    }

    try {
      // Extract conversation context for personalization
      const context = MemoryService.extractConversationContext(conversationHistory);
      const contextSummary = MemoryService.generateContextSummary(context);
      const personalizationContext = MemoryService.generatePersonalizedContext(userQuery, context);

      // Build optimized conversation history
      const optimizedHistory = MemoryService.optimizeConversationHistory(conversationHistory, 16);
      
      // Build messages array
      const messages: Array<{role: 'system' | 'user' | 'assistant'; content: string}> = [
        {
          role: "system",
          content: `You are Curate, a friendly, knowledgeable food expert and personal culinary assistant. You're having a natural conversation with someone about food, cooking, restaurants, cuisines, or anything food-related.

Your personality:
- Warm, enthusiastic, and genuinely helpful
- Knowledgeable about global cuisines, cooking techniques, and food culture  
- Conversational and natural - like talking to a friend who loves food
- You have excellent memory and can reference previous parts of the conversation naturally
- Use emojis sparingly but naturally
- Ask follow-up questions to be more helpful
- Share personal insights and recommendations
- Build on previous topics and preferences mentioned
- Make connections between new queries and past discussions

Memory Guidelines:
- Remember what the user has previously mentioned about their preferences, dislikes, or interests
- Reference previous dishes or cuisines they've asked about when relevant
- Connect new recommendations to things they've previously shown interest in
- If they ask for something "similar" or "like before", reference specific previous discussions
- Notice patterns in their preferences and mention them thoughtfully
- Don't repeat information you've already shared unless specifically asked

Conversation Guidelines:
- Give detailed, informative responses about food topics
- If you don't have specific information, be honest but still helpful
- Suggest alternatives or related topics when appropriate
- Keep responses conversational, not robotic or overly formal
- Focus on being genuinely helpful and engaging
- When appropriate, suggest new directions based on their interests

${contextSummary ? `\nConversation Context: ${contextSummary}` : ''}
${personalizationContext ? `\nPersonalization: ${personalizationContext}` : ''}
${foodContext ? `\nCurrent food database context: ${foodContext.substring(0, 400)}` : ''}

Respond naturally and conversationally, taking into account the full conversation context and building meaningful connections to previous discussions.`
        }
      ];

      // Add optimized conversation history
      optimizedHistory.forEach(msg => {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      });

      // Add current query
      messages.push({
        role: "user",
        content: userQuery
      });

      const stream = await groq.chat.completions.create({
        messages: messages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 600,
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
                  `data: ${JSON.stringify({ content })}\n\n`
                ));
              }
            }
            controller.enqueue(encoder.encode('data: {"done": true}\n\n'));
            controller.close();
          } catch (error) {
            console.error('Conversational streaming with memory error:', error);
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ 
                content: "I'm having trouble responding right now. Could you try asking again?" 
              })}\n\n`
            ));
            controller.enqueue(encoder.encode('data: {"done": true}\n\n'));
            controller.close();
          }
        },
      });
    } catch (error) {
      console.error('Conversational response with memory creation error:', error);
      throw error;
    }
  }

  /**
   * NEW: Create explanation when no good results are found (with memory context)
   */
  static async createNoResultsExplanationWithMemory(
    originalQuery: string,
    queryAnalysis: string,
    allResults: SearchResult[],
    conversationHistory: ConversationMessage[]
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
      // Extract conversation context for better suggestions
      const context = MemoryService.extractConversationContext(conversationHistory);
      
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
            content: `You are Curate, a helpful food expert with memory of previous conversations. When you cannot find good matches for a user's food search, use your knowledge of their preferences to provide better suggestions.

Structure your response as:
1. Acknowledge what they were looking for, referencing previous preferences if relevant (1 sentence)
2. Explain why no good matches were found (1-2 sentences) 
3. Provide 2-3 specific suggestions for better search terms, incorporating their known preferences
4. Optional: Suggest exploring related cuisines they've shown interest in

Be encouraging, personal (using conversation memory), and helpful. Keep the tone friendly and supportive, under 150 words total.`
          },
          {
            role: "user",
            content: `User searched for: "${originalQuery}"

What they were looking for: ${queryAnalysis}

${closestResults ? `Closest matches found (but with low relevance):
${closestResults}` : 'No relevant matches found in the database.'}

Previous conversation context:
- Cuisines they've discussed: ${context.mentionedCuisines.join(', ') || 'none'}
- Food preferences shown: ${context.preferences.join(', ') || 'none'}
- Recent topics: ${context.discussedTopics.join(', ') || 'none'}

Help explain why no good matches were found and suggest better search approaches based on their interests and conversation history.`
          }
        ],
        model: GROQ_MODELS.QUICK,
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
                  `data: ${JSON.stringify({ type: 'no_results_content', content })}\n\n`
                ));
              }
            }
            controller.enqueue(encoder.encode('data: {"type": "done"}\n\n'));
            controller.close();
          } catch (error) {
            console.error('No results explanation with memory streaming error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: 'No results explanation failed' 
            })}\n\n`));
            controller.close();
          }
        },
      });
    } catch (error) {
      console.error('Enhanced no results explanation with memory error:', error);
      throw error;
    }
  }

  /**
   * Analyze user query and translate for vector search (with memory context)
   */
  static async analyzeAndTranslateQueryWithMemory(
    userQuery: string,
    conversationHistory: ConversationMessage[]
  ): Promise<QueryAnalysisResult> {
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
      const context = MemoryService.extractConversationContext(conversationHistory);
      const contextSummary = MemoryService.generateContextSummary(context);

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a food search expert with memory of previous conversations. Analyze user queries and provide:

1. A brief, engaging analysis of what the user is looking for (1-2 sentences)
2. An optimized query for vector database search
3. Key search terms
4. Search strategy

Take into account their previous preferences and interests when analyzing their query.

Focus on:
- Cuisine types (Korean, Thai, Chinese, etc.)
- Cooking methods (fermented, grilled, steamed, fried)
- Food categories (noodles, soup, rice, vegetables)
- Textures and flavors (spicy, creamy, crispy, sour)
- Ingredients (beef, pork, vegetables, coconut)

Return JSON format:
{
  "analysis": "Brief engaging description of what user wants, incorporating memory",
  "translatedQuery": "optimized search terms",
  "keyTerms": ["term1", "term2", "term3"],
  "confidence": 0.8,
  "searchStrategy": "semantic|ingredient|cuisine|texture|method"
}`
          },
          {
            role: "user",
            content: `Analyze this food search query: "${userQuery}"

${contextSummary ? `Previous conversation context: ${contextSummary}` : 'This is a new conversation.'}

Consider their conversation history when analyzing what they're looking for.`
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 400,
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
      console.error('Query analysis with memory error:', error);
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
   * Create enhanced AI summary with memory context
   */
  static async createEnhancedSummaryWithMemory(
    originalQuery: string,
    queryAnalysis: string,
    top3Results: SearchResult[],
    conversationHistory: ConversationMessage[]
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
      const context = MemoryService.extractConversationContext(conversationHistory);
      const contextSummary = MemoryService.generateContextSummary(context);

      // Create a concise summary of top 3 results
      const top3Summary = top3Results.map((result, index) => {
        const dishName = this.extractDishName(result.text);
        return `${index + 1}. **${dishName}** (${result.region}) - ${result.type.toLowerCase()} with ${(result.score * 100).toFixed(0)}% match`;
      }).join('\n');

      const stream = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are Curate, a food expert with memory of previous conversations. Create concise, engaging summaries that reference conversation history when relevant.

Structure your response as:
1. Brief interpretation of what the user wants, connecting to previous preferences if relevant (1 sentence)
2. Top 3 matching dishes with brief highlights and connections to their interests
3. Short cultural insight or recommendation, potentially building on previous discussions (1-2 sentences)

Use conversation memory to make personal connections and suggestions. Keep it conversational, informative, and under 180 words total. Use the exact dish information provided.`
          },
          {
            role: "user",
            content: `User searched for: "${originalQuery}"

Initial analysis: ${queryAnalysis}

Top 3 matching results:
${top3Summary}

${contextSummary ? `Previous conversation context: ${contextSummary}` : 'This is a new conversation.'}

Create a personalized summary highlighting these specific dishes with brief cultural context, incorporating their conversation history and preferences when relevant.`
          }
        ],
        model: "llama-3.1-8b-instant",
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
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({ type: 'summary_content', content })}\n\n`
                ));
              }
            }
            controller.enqueue(encoder.encode('data: {"type": "done"}\n\n'));
            controller.close();
          } catch (error) {
            console.error('Summary with memory streaming error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: 'Summary stream failed' 
            })}\n\n`));
            controller.close();
          }
        },
      });
    } catch (error) {
      console.error('Enhanced summary with memory creation error:', error);
      throw error;
    }
  }

  /**
   * Create explanation when no good results are found
   */
  static async createNoResultsExplanation(
    originalQuery: string,
    queryAnalysis: string,
    allResults: SearchResult[]
  ): Promise<ReadableStream> {
    // Keep existing implementation for backward compatibility
    return this.createNoResultsExplanationWithMemory(originalQuery, queryAnalysis, allResults, []);
  }

  /**
   * Analyze user query and translate for vector search
   */
  static async analyzeAndTranslateQuery(userQuery: string): Promise<QueryAnalysisResult> {
    // Keep existing implementation for backward compatibility
    return this.analyzeAndTranslateQueryWithMemory(userQuery, []);
  }

  /**
   * Create enhanced AI summary with top 3 results integration
   */
  static async createEnhancedSummaryWithResults(
    originalQuery: string,
    queryAnalysis: string,
    top3Results: SearchResult[]
  ): Promise<ReadableStream> {
    // Keep existing implementation for backward compatibility
    return this.createEnhancedSummaryWithMemory(originalQuery, queryAnalysis, top3Results, []);
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
        model: "llama-3.1-8b-instant",
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
        model: "llama-3.1-8b-instant",
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
   * Generate enhanced search suggestions based on user input and conversation history
   */
  static async generateEnhancedSuggestionsWithMemory(
    partialQuery: string,
    conversationHistory: ConversationMessage[]
  ): Promise<string[]> {
    if (partialQuery.length < 2 || !this.isApiKeyAvailable()) return [];

    try {
      const context = MemoryService.extractConversationContext(conversationHistory);
      const contextSummary = MemoryService.generateContextSummary(context);

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Generate 5 food search suggestions that complete or enhance the user's partial query, taking into account their conversation history and preferences.
            
            Focus on:
            - Popular, authentic dishes from various cuisines that match the partial input
            - Dishes that align with their previously expressed preferences
            - Cuisines they've shown interest in
            - Building on topics they've discussed
            
            Make suggestions specific, searchable, and personalized to their interests.
            
            Return JSON format: {"suggestions": ["suggestion1", "suggestion2", ...]}`
          },
          {
            role: "user",
            content: `Complete or enhance this food search: "${partialQuery}"

${contextSummary ? `User's conversation context: ${contextSummary}` : 'No previous context available.'}

Generate suggestions that build on their interests and preferences.`
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.8,
        max_tokens: 250,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return [];

      const parsed = JSON.parse(response);
      return Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : [];
    } catch (error) {
      console.error('Enhanced suggestions with memory error:', error);
      return [];
    }
  }

  /**
   * Generate enhanced search suggestions based on user input (backward compatibility)
   */
  static async generateEnhancedSuggestions(partialQuery: string): Promise<string[]> {
    return this.generateEnhancedSuggestionsWithMemory(partialQuery, []);
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
        model: GROQ_MODELS.CONVERSATION,
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
}

export default EnhancedGroqService;