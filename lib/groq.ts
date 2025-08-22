// lib/groq.ts
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface QueryEnhancement {
  enhancedQuery: string;
  searchTerms: string[];
  cuisine: string | null;
  cookingMethod: string | null;
  ingredients: string[];
  confidence: number;
}

export interface FoodRecommendation {
  name: string;
  description: string;
  cuisine: string;
  reasoning: string;
  searchTerms: string[];
}

interface SearchResult {
  region: string;
  type: string;
  text: string;
}

export class GroqFoodService {
  
  /**
   * Enhance user query with LLM intelligence (non-streaming for structured data)
   */
  static async enhanceQuery(userQuery: string): Promise<QueryEnhancement> {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a food search expert. Analyze user queries and enhance them for better food discovery.
            
            Return a JSON object with:
            - enhancedQuery: improved search terms
            - searchTerms: array of key search terms
            - cuisine: detected cuisine type (or null)
            - cookingMethod: detected cooking method (or null)  
            - ingredients: array of detected ingredients
            - confidence: confidence score 0-1
            
            Be concise and focus on food-related terms only.`
          },
          {
            role: "user",
            content: `Enhance this food search query: "${userQuery}"`
          }
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from Groq');

      return JSON.parse(response) as QueryEnhancement;
    } catch (error) {
      console.error('Groq query enhancement error:', error);
      return {
        enhancedQuery: userQuery,
        searchTerms: userQuery.split(' '),
        cuisine: null,
        cookingMethod: null,
        ingredients: [],
        confidence: 0.5
      };
    }
  }

  /**
   * Generate smart food recommendations (non-streaming for structured data)
   */
  static async generateRecommendations(
    userQuery: string, 
    searchResults: SearchResult[], 
    userPreferences?: string[]
  ): Promise<FoodRecommendation[]> {
    try {
      const resultsSummary = searchResults.slice(0, 3).map(r => 
        `${r.region} ${r.type}: ${r.text.substring(0, 100)}...`
      ).join('\n');

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a culinary expert AI. Based on search results and user preferences, recommend 3 similar or complementary foods.
            
            Return a JSON object with a "recommendations" array, each containing:
            - name: food name
            - description: brief appealing description
            - cuisine: cuisine type
            - reasoning: why this matches their interest
            - searchTerms: array of terms to search for this food
            
            Focus on variety and authentic cultural foods.`
          },
          {
            role: "user",
            content: `User searched for: "${userQuery}"
            
            Search results found:
            ${resultsSummary}
            
            User preferences: ${userPreferences?.join(', ') || 'None specified'}
            
            Recommend 3 foods they might enjoy:`
          }
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return [];

      const parsed = JSON.parse(response);
      return Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
    } catch (error) {
      console.error('Groq recommendations error:', error);
      return [];
    }
  }

  /**
   * Create streaming food context (NEW STREAMING METHOD!)
   */
  static async createStreamingFoodContext(foodItem: SearchResult): Promise<ReadableStream> {
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
        stream: true, // 🔥 STREAMING ENABLED
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
      console.error('Groq streaming context error:', error);
      throw error;
    }
  }

  /**
   * Smart query suggestions (non-streaming for quick responses)
   */
  static async generateQuerySuggestions(partialQuery: string): Promise<string[]> {
    if (partialQuery.length < 3) return [];

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Generate 5 food search query completions based on the partial input. 
            Return a JSON object with a "suggestions" array of strings. Focus on popular, authentic dishes from various cuisines.
            Make suggestions specific and searchable.`
          },
          {
            role: "user",
            content: `Complete these food search queries starting with: "${partialQuery}"`
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
      return Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
    } catch (error) {
      console.error('Groq suggestions error:', error);
      return [];
    }
  }
}

export default GroqFoodService;