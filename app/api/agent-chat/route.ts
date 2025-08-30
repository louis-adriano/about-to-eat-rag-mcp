import { NextRequest } from 'next/server';
import { searchSimilarFoods } from '../../../lib/vector-db';
import { EnhancedGroqService } from '../../../lib/enhanced-groq';
import { SearchResult } from '../../../types/food';
import { z } from 'zod';

const AgentChatSchema = z.object({
  query: z.string().min(1).max(500),
});

export async function POST(request: NextRequest) {
  try {
    // Check if Groq API key is available
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'dummy-key-for-build') {
      return new Response(
        JSON.stringify({ error: 'AI chat is not available. Please check API key configuration.' }),
        { 
          status: 503, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const body = await request.json();
    const { query } = AgentChatSchema.parse(body);

    const encoder = new TextEncoder();

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log(`Starting pure conversational agent for: "${query}"`);
          
          // Step 1: Check if this is a food-related query and get context
          let foodContext = '';
          try {
            // Search for relevant foods to use as context (but don't show results)
            const vectorResults = await searchSimilarFoods(query, 5);
            const meaningfulResults = vectorResults.filter(result => result.score > 0.1);
            
            if (meaningfulResults.length > 0) {
              // Create context from search results for the AI to reference
              foodContext = meaningfulResults.slice(0, 3).map(result => {
                const dishName = extractDishName(result.text);
                return `${dishName} from ${result.region}: ${result.text.substring(0, 200)}...`;
              }).join('\n\n');
            }
          } catch (searchError) {
            console.log('Search context failed, continuing with pure conversation:', searchError);
          }

          // Step 2: Create pure conversational AI response
          const conversationalStream = await createPureConversationalResponse(query, foodContext);
          
          const reader = conversationalStream.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.content) {
                    controller.enqueue(encoder.encode(
                      `data: ${JSON.stringify({ 
                        type: 'chat_response', 
                        content: data.content 
                      })}\n\n`
                    ));
                  } else if (data.done) {
                    break;
                  } else if (data.error) {
                    throw new Error(data.error);
                  }
                } catch (parseError) {
                  console.error('Parse error:', parseError);
                }
              }
            }
          }

          // Step 3: Signal completion
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'done' })}\n\n`
          ));

          controller.close();

        } catch (error) {
          console.error('Pure agent chat error:', error);
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ 
              type: 'chat_response', 
              content: `I'm sorry, I encountered an issue. Could you please try asking again? I'm here to help you with any food-related questions! 😊`
            })}\n\n`
          ));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Agent chat endpoint error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Pure conversational AI response - like talking to Claude
async function createPureConversationalResponse(
  userQuery: string,
  foodContext: string
): Promise<ReadableStream> {
  const encoder = new TextEncoder();
  
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'dummy-key-for-build') {
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
    const stream = await EnhancedGroqService.createStreamingFoodContext({
      text: `User question: "${userQuery}". ${foodContext ? `Relevant food context from database: ${foodContext}` : 'No specific food context available.'}`,
      region: 'Global Food Knowledge',
      type: 'Conversational Assistant'
    });

    // Override the system prompt to make it purely conversational
    const conversationalStream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are a friendly, knowledgeable food expert and personal culinary assistant. You're having a natural conversation with someone about food, cooking, restaurants, cuisines, or anything food-related.

Your personality:
- Warm, enthusiastic, and genuinely helpful
- Knowledgeable about global cuisines, cooking techniques, and food culture  
- Conversational and natural - like talking to a friend who loves food
- Use emojis sparingly but naturally
- Ask follow-up questions to be more helpful
- Share personal insights and recommendations

Guidelines:
- Give detailed, informative responses about food topics
- If you don't have specific information, be honest but still helpful
- Suggest alternatives or related topics when appropriate
- Keep responses conversational, not robotic or overly formal
- Focus on being genuinely helpful and engaging

${foodContext ? `Context from food database: ${foodContext.substring(0, 500)}` : ''}

Respond naturally and conversationally to the user's food-related question.`
          },
          {
            role: "user",
            content: userQuery
          }
        ],
        model: "llama3-70b-8192",
        temperature: 0.7,
        max_tokens: 500,
        stream: true,
      }),
    });

    if (!conversationalStream.ok) {
      throw new Error('Groq API request failed');
    }

    return new ReadableStream({
      async start(controller) {
        try {
          const reader = conversationalStream.body?.getReader();
          if (!reader) throw new Error('No reader available');
          
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: {"done": true}\n\n'));
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  
                  if (content) {
                    controller.enqueue(encoder.encode(
                      `data: ${JSON.stringify({ content })}\n\n`
                    ));
                  }
                } catch (parseError) {
                  // Skip invalid JSON
                }
              }
            }
          }
          
          controller.enqueue(encoder.encode('data: {"done": true}\n\n'));
          controller.close();
        } catch (error) {
          console.error('Conversational streaming error:', error);
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
    console.error('Pure conversational response creation error:', error);
    throw error;
  }
}

// Helper function to extract dish names
function extractDishName(text: string): string {
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