import Groq from 'groq-sdk';
import { MemoryService } from './memory-service';
import { ConversationMessage } from '../types/conversation';
import { GROQ_MODELS } from './model-config';

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

interface StrictFilters {
  spiceLevel: 'none' | 'mild' | 'moderate' | 'spicy' | 'very-spicy' | null;
  excludeSpicy: boolean;
  excludeSweet: boolean;
  excludeFermented: boolean;
  requiredCuisine: string | null;
  excludedIngredients: string[];
  requiredIngredients: string[];
  textureRequirements: string[];
}

function parseStrictRequirements(query: string): StrictFilters {
  const lowerQuery = query.toLowerCase();
  
  const filters: StrictFilters = {
    spiceLevel: null,
    excludeSpicy: false,
    excludeSweet: false,
    excludeFermented: false,
    requiredCuisine: null,
    excludedIngredients: [],
    requiredIngredients: [],
    textureRequirements: []
  };

  if (lowerQuery.includes('not spicy') || lowerQuery.includes('no spice') || lowerQuery.includes('mild only')) {
    filters.excludeSpicy = true;
    filters.spiceLevel = 'mild';
  }
  if (lowerQuery.includes('very spicy') || lowerQuery.includes('extremely spicy')) {
    filters.spiceLevel = 'very-spicy';
  }
  if (lowerQuery.includes('moderately spicy') || lowerQuery.includes('medium spice')) {
    filters.spiceLevel = 'moderate';
  }

  if (lowerQuery.includes('not sweet') || lowerQuery.includes('no sugar')) {
    filters.excludeSweet = true;
  }
  if (lowerQuery.includes('not fermented') || lowerQuery.includes('no fermentation')) {
    filters.excludeFermented = true;
  }

  const cuisines = ['korean', 'chinese', 'japanese', 'thai', 'italian', 'mexican', 'indian', 'french'];
  for (const cuisine of cuisines) {
    if (lowerQuery.includes(cuisine)) {
      filters.requiredCuisine = cuisine;
      break;
    }
  }

  if (lowerQuery.includes('must have') || lowerQuery.includes('needs to have')) {
    const ingredientMatches = lowerQuery.match(/(?:must have|needs to have|with) ([a-z\s]+)/g);
    if (ingredientMatches) {
      filters.requiredIngredients = ingredientMatches.map(match => 
        match.replace(/^(?:must have|needs to have|with)\s+/, '').trim()
      );
    }
  }

  return filters;
}

function strictFilterResults(results: SearchResult[], filters: StrictFilters, originalQuery: string): SearchResult[] {
  return results.filter(result => {
    const text = result.text.toLowerCase();
    const region = result.region.toLowerCase();
    
    if (filters.excludeSpicy) {
      if (text.includes('spicy') || text.includes('hot') || text.includes('chili') || 
          text.includes('pepper') || text.includes('fiery') || text.includes('burning')) {
        return false;
      }
    }

    if (filters.excludeSweet) {
      if (text.includes('sweet') || text.includes('sugar') || text.includes('honey') || 
          text.includes('syrup') || text.includes('dessert')) {
        return false;
      }
    }

    if (filters.excludeFermented) {
      if (text.includes('fermented') || text.includes('pickled') || text.includes('aged') || 
          text.includes('kimchi') || text.includes('sauerkraut') || text.includes('miso')) {
        return false;
      }
    }

    if (filters.requiredCuisine) {
      if (!region.includes(filters.requiredCuisine) && !text.includes(filters.requiredCuisine)) {
        return false;
      }
    }

    if (filters.requiredIngredients.length > 0) {
      const hasAllRequired = filters.requiredIngredients.every(ingredient => 
        text.includes(ingredient.toLowerCase())
      );
      if (!hasAllRequired) {
        return false;
      }
    }

    return true;
  });
}

export class EnhancedGroqService {
  
  private static isApiKeyAvailable(): boolean {
    return !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'dummy-key-for-build');
  }

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
      const context = MemoryService.extractConversationContext(conversationHistory);
      const contextSummary = MemoryService.generateContextSummary(context);
      const personalizationContext = MemoryService.generatePersonalizedContext(userQuery, context);
      const optimizedHistory = MemoryService.optimizeConversationHistory(conversationHistory, 16);
      
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

      optimizedHistory.forEach(msg => {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      });

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
            content: `No dishes in our database match your strict requirements for "${originalQuery}". Try broadening your search terms.`
          })}\n\n`));
          controller.enqueue(encoder.encode('data: {"type": "done"}\n\n'));
          controller.close();
        },
      });
    }

    try {
      const context = MemoryService.extractConversationContext(conversationHistory);
      
      let closestResults = '';
      if (allResults.length > 0) {
        const top3Closest = allResults.slice(0, 3);
        closestResults = top3Closest.map((result, index) => {
          const dishName = this.extractDishName(result.text);
          return `${index + 1}. ${dishName} (${result.region}) - ${(result.score * 100).toFixed(0)}% match but doesn't meet your requirements`;
        }).join('\n');
      }

      const stream = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a brutally honest food search assistant. When users have strict requirements that can't be met, tell them the truth clearly and directly.

DO NOT:
- Make excuses or workarounds ("you could make it less spicy")
- Suggest modifications ("you could ask for it mild")
- Compromise their requirements
- Be overly apologetic

DO:
- Be clear and direct about why nothing matched
- Suggest what IS available that's closest
- Recommend broader search terms if appropriate
- Keep it under 100 words and friendly but honest

Structure:
1. Direct statement that nothing matched their requirements (1 sentence)
2. Brief explanation why (1 sentence)
3. What's closest/available instead (2-3 options max)
4. Suggestion for broader search if appropriate`
          },
          {
            role: "user",
            content: `User searched for: "${originalQuery}"

What they were looking for: ${queryAnalysis}

${closestResults ? `Closest matches found (but don't meet requirements):
${closestResults}` : 'No relevant matches found at all.'}

Previous conversation context:
- Cuisines discussed: ${context.mentionedCuisines.join(', ') || 'none'}
- Their preferences: ${context.preferences.join(', ') || 'none'}

Be honest about why nothing matched their requirements. Don't make excuses.`
          }
        ],
        model: GROQ_MODELS.QUICK,
        temperature: 0.3,
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
            console.error('Strict no results explanation streaming error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: 'No results explanation failed' 
            })}\n\n`));
            controller.close();
          }
        },
      });
    } catch (error) {
      console.error('Strict no results explanation error:', error);
      throw error;
    }
  }

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
      const strictFilters = parseStrictRequirements(userQuery);

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a strict food search analyzer. Your job is to understand EXACTLY what the user wants and create search terms that will find foods matching their EXACT requirements.

Pay special attention to:
- NEGATIVE requirements ("not spicy", "no meat", "not sweet") - these are ABSOLUTE exclusions
- POSITIVE requirements ("must be Korean", "needs vegetables") - these are mandatory
- PREFERENCE indicators ("prefer mild", "like crispy") - these are guidelines

Be HONEST about what the user is asking for. If they say "not spicy", they mean NO SPICE AT ALL.

Return JSON format:
{
  "analysis": "Clear, honest description of what user wants (including restrictions)",
  "translatedQuery": "optimized search terms that respect their restrictions",
  "keyTerms": ["term1", "term2", "term3"],
  "confidence": 0.8,
  "searchStrategy": "strict|semantic|ingredient|cuisine|texture|method",
  "strictRequirements": {
    "exclusions": ["spicy", "sweet"],
    "requirements": ["korean", "vegetarian"],
    "mustHave": ["vegetables"]
  }
}`
          },
          {
            role: "user",
            content: `Analyze this food search query with STRICT attention to their requirements: "${userQuery}"

${contextSummary ? `Previous conversation context: ${contextSummary}` : 'This is a new conversation.'}

Be honest about their restrictions. If they say "not spicy", they mean it.`
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        max_tokens: 400,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No analysis response');
      }

      const parsed = JSON.parse(response);
      
      return {
        analysis: parsed.analysis || `Looking for food that strictly matches: "${userQuery}"`,
        translatedQuery: parsed.translatedQuery || userQuery,
        keyTerms: Array.isArray(parsed.keyTerms) ? parsed.keyTerms : userQuery.split(' ').filter(word => word.length > 2),
        confidence: Math.max(0.1, Math.min(1.0, parsed.confidence || 0.7)),
        searchStrategy: parsed.searchStrategy || 'strict'
      };

    } catch (error) {
      console.error('Strict query analysis error:', error);
      return {
        analysis: `Looking for food that strictly matches: "${userQuery}"`,
        translatedQuery: userQuery,
        keyTerms: userQuery.split(' ').filter(word => word.length > 2),
        confidence: 0.6,
        searchStrategy: 'strict'
      };
    }
  }

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
            content: `Found ${top3Results.length} dishes that match your requirements: ${top3Results.map(r => r.region + ' ' + r.type).join(', ')}.`
          })}\n\n`));
          controller.enqueue(encoder.encode('data: {"type": "done"}\n\n'));
          controller.close();
        },
      });
    }

    try {
      const context = MemoryService.extractConversationContext(conversationHistory);
      const contextSummary = MemoryService.generateContextSummary(context);

      const top3Summary = top3Results.map((result, index) => {
        const dishName = this.extractDishName(result.text);
        return `${index + 1}. **${dishName}** (${result.region}) - ${(result.score * 100).toFixed(0)}% match`;
      }).join('\n');

      const stream = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a precise food search assistant. Create summaries that:

1. Confirm these results actually match what the user asked for
2. Highlight why each dish fits their requirements
3. Be specific about what makes them good matches
4. Reference conversation history when relevant
5. Keep it concise (under 150 words)

DO NOT:
- Suggest modifications to dishes
- Apologize for spice levels if they didn't ask for non-spicy
- Make assumptions about what they might want

DO:
- Confirm these dishes meet their stated requirements
- Explain why they're good matches
- Connect to their previous interests if relevant`
          },
          {
            role: "user",
            content: `User searched for: "${originalQuery}"

Analysis: ${queryAnalysis}

Top 3 matching results that passed strict filtering:
${top3Summary}

${contextSummary ? `Previous conversation: ${contextSummary}` : 'New conversation.'}

Create a summary confirming these dishes match their requirements and explaining why.`
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.4,
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
            console.error('Strict summary streaming error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: 'Summary stream failed' 
            })}\n\n`));
            controller.close();
          }
        },
      });
    } catch (error) {
      console.error('Strict summary creation error:', error);
      throw error;
    }
  }

  static async createNoResultsExplanation(
    originalQuery: string,
    queryAnalysis: string,
    allResults: SearchResult[]
  ): Promise<ReadableStream> {
    return this.createNoResultsExplanationWithMemory(originalQuery, queryAnalysis, allResults, []);
  }

  static async analyzeAndTranslateQuery(userQuery: string): Promise<QueryAnalysisResult> {
    return this.analyzeAndTranslateQueryWithMemory(userQuery, []);
  }

  static async createEnhancedSummaryWithResults(
    originalQuery: string,
    queryAnalysis: string,
    top3Results: SearchResult[]
  ): Promise<ReadableStream> {
    return this.createEnhancedSummaryWithMemory(originalQuery, queryAnalysis, top3Results, []);
  }

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
      return {
        translatedQuery: userQuery,
        keyTerms: userQuery.split(' ').filter(word => word.length > 2),
        confidence: 0.6,
        searchStrategy: 'semantic'
      };
    }
  }

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

  static async generateEnhancedSuggestions(partialQuery: string): Promise<string[]> {
    return this.generateEnhancedSuggestionsWithMemory(partialQuery, []);
  }

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
      const translationPromise = this.translateQueryForVectorSearch(userQuery);

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

            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({ type: 'content', content })}\n\n`
                ));
              }
            }
            
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

  private static extractDishName(text: string): string {
    const sentences = text.split('.');
    const firstSentence = sentences[0];
    
    const patterns = [
      /^([A-Z][a-z]+(?:\s+[a-z]+)*)\s+is\s+/,
      /^([A-Z][a-z]+(?:\s+[a-z]+)*)\s+features\s+/,
      /^([A-Z][a-z]+(?:\s+[a-z]+)*)\s+are\s+/,
    ];
    
    for (const pattern of patterns) {
      const match = firstSentence.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    const words = firstSentence.split(' ');
    if (words.length >= 2 && words[0][0] === words[0][0].toUpperCase()) {
      return words.slice(0, Math.min(3, words.length)).join(' ');
    }
    
    return words[0] || 'Dish';
  }
}

export default EnhancedGroqService;