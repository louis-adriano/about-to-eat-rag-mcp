import { NextRequest } from 'next/server';
import { searchSimilarFoods } from '../../../lib/vector-db';
import { EnhancedGroqService } from '../../../lib/enhanced-groq';
import { z } from 'zod';

const UnifiedSearchSchema = z.object({
  query: z.string().min(1).max(500),
});

interface AIResponse {
  answer: string;
  translatedQuery: string;
  confidence: number;
  keyTerms: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Check if Groq API key is available
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'dummy-key-for-build') {
      return new Response(
        JSON.stringify({ error: 'Groq API key not configured' }),
        { 
          status: 503, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const body = await request.json();
    const { query } = UnifiedSearchSchema.parse(body);

    const encoder = new TextEncoder();

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Step 1: Start AI analysis and query translation
          console.log(`Starting unified search for: "${query}"`);
          
          let aiResponse: AIResponse | null = null;
          let streamContent = '';

          // Create AI analysis stream
          const aiStream = await EnhancedGroqService.createUnifiedFoodAnalysis(query);
          const aiReader = aiStream.getReader();
          const decoder = new TextDecoder();

          // Stream AI analysis while processing query translation
          let translatedQuery = query; // fallback
          let aiProcessingComplete = false;

          // Process AI stream
          const processAIStream = async () => {
            try {
              while (true) {
                const { done, value } = await aiReader.read();
                if (done) {
                  aiProcessingComplete = true;
                  break;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const data = JSON.parse(line.slice(6));
                      
                      if (data.type === 'content') {
                        streamContent += data.content;
                        // Stream AI content to client
                        controller.enqueue(encoder.encode(
                          `data: ${JSON.stringify({ 
                            type: 'ai_content', 
                            content: data.content 
                          })}\n\n`
                        ));
                      } else if (data.type === 'translation') {
                        translatedQuery = data.translatedQuery;
                        aiResponse = {
                          answer: streamContent,
                          translatedQuery: data.translatedQuery,
                          confidence: data.confidence,
                          keyTerms: data.keyTerms
                        };
                      } else if (data.type === 'done') {
                        aiProcessingComplete = true;
                        break;
                      }
                    } catch (parseError) {
                      console.error('AI stream parse error:', parseError);
                    }
                  }
                }
              }
            } catch (error) {
              console.error('AI stream processing error:', error);
              aiProcessingComplete = true;
            }
          };

          // Start AI processing
          const aiPromise = processAIStream();

          // Wait a moment for potential query translation
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Step 2: Perform vector search with translated query
          console.log(`Performing vector search with query: "${translatedQuery}"`);
          
          const vectorResults = await searchSimilarFoods(translatedQuery, 8);

          // Wait for AI processing to complete
          await aiPromise;

          // Step 3: Send final results
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({
              type: 'search_results',
              results: {
                aiResponse: aiResponse || {
                  answer: streamContent,
                  translatedQuery: translatedQuery,
                  confidence: 0.8,
                  keyTerms: query.split(' ').filter(term => term.length > 2)
                },
                vectorResults: vectorResults,
                originalQuery: query
              }
            })}\n\n`
          ));

          // Signal completion
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'done' })}\n\n`
          ));

          controller.close();

        } catch (error) {
          console.error('Unified search error:', error);
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ 
              type: 'error', 
              error: 'Search failed: ' + (error instanceof Error ? error.message : 'Unknown error')
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
    console.error('Unified search endpoint error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process unified search' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}