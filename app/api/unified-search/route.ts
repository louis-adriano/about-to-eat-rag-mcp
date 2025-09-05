// File: app/api/unified-search/route.ts (Updated with memory support)
import { NextRequest } from 'next/server';
import { searchSimilarFoods } from '../../../lib/vector-db';
import { EnhancedGroqService } from '../../../lib/enhanced-groq';
import { GROQ_MODELS } from '../../../lib/model-config';
import { ConversationMessage } from '../../../types/conversation';
import { z } from 'zod';

const ConversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const UnifiedSearchSchema = z.object({
  query: z.string().min(1).max(500),
  conversationHistory: z.array(ConversationMessageSchema).optional().default([]),
});

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
    const { query, conversationHistory = [] } = UnifiedSearchSchema.parse(body);

    const encoder = new TextEncoder();

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log(`Starting enhanced unified search with memory for: "${query}"`);
          console.log(`Conversation history length: ${conversationHistory.length} messages`);
          
          // Step 1: AI Query Analysis and Translation with Memory
          console.log('Step 1: Analyzing and translating query with conversation context...');
          let translatedQuery = query; // fallback
          let queryAnalysis = null;
          
          try {
            const analysisResult = await EnhancedGroqService.analyzeAndTranslateQueryWithMemory(
              query, 
              conversationHistory
            );
            translatedQuery = analysisResult.translatedQuery;
            queryAnalysis = analysisResult.analysis;
            
            // Stream the enhanced analysis with memory context
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ 
                type: 'analysis', 
                content: analysisResult.analysis 
              })}\n\n`
            ));
          } catch (error) {
            console.error('Query analysis with memory error:', error);
            // Send fallback analysis
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ 
                type: 'analysis', 
                content: `Looking for food related to "${query}"...` 
              })}\n\n`
            ));
          }

          // Step 2: Vector Search
          console.log(`Step 2: Performing vector search with: "${translatedQuery}"`);
          const vectorResults = await searchSimilarFoods(translatedQuery, 8);
          
          // Step 3: Check if we have meaningful results
          const meaningfulResults = vectorResults.filter(result => result.score > 0.1); // 10% threshold
          const hasGoodMatches = meaningfulResults.length > 0;
          
          console.log(`Found ${vectorResults.length} total results, ${meaningfulResults.length} meaningful matches`);
          
          if (!hasGoodMatches) {
            // Step 3a: AI says "no" - no good matches found (with memory context)
            console.log('Step 3a: No good matches, letting AI explain with memory context...');
            
            try {
              const noResultsStream = await EnhancedGroqService.createNoResultsExplanationWithMemory(
                query,
                queryAnalysis || `Looking for food related to "${query}"`,
                vectorResults, // Pass all results so AI can see what was close
                conversationHistory // Include conversation history for better suggestions
              );
              
              const reader = noResultsStream.getReader();
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
                      
                      if (data.type === 'no_results_content') {
                        controller.enqueue(encoder.encode(
                          `data: ${JSON.stringify({ 
                            type: 'ai_no_results', 
                            content: data.content 
                          })}\n\n`
                        ));
                      } else if (data.type === 'done') {
                        break;
                      }
                    } catch (parseError) {
                      console.error('No results stream parse error:', parseError);
                    }
                  }
                }
              }
            } catch (noResultsError) {
              console.error('No results explanation with memory error:', noResultsError);
              // Send fallback no results message
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ 
                  type: 'ai_no_results', 
                  content: `I couldn't find any dishes in our database that match "${query}". Based on our conversation, try describing the cuisine type, cooking method, or main ingredients differently. For example, instead of specific dish names, try "Korean fermented vegetables" or "Thai spicy noodles".`
                })}\n\n`
              ));
            }
            
            // Send empty results
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({
                type: 'search_results',
                results: {
                  vectorResults: [],
                  originalQuery: query,
                  translatedQuery: translatedQuery,
                  hasMatches: false
                }
              })}\n\n`
            ));
            
          } else {
            // Step 3b: We have good matches - create summary with memory
            console.log('Step 3b: Good matches found, creating AI summary with memory context...');
            const top3Results = meaningfulResults.slice(0, 3);
            
            try {
              const summaryStream = await EnhancedGroqService.createEnhancedSummaryWithMemory(
                query,
                queryAnalysis || `Looking for food related to "${query}"`,
                top3Results,
                conversationHistory // Include conversation history for personalized summaries
              );
              
              const reader = summaryStream.getReader();
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
                      
                      if (data.type === 'summary_content') {
                        controller.enqueue(encoder.encode(
                          `data: ${JSON.stringify({ 
                            type: 'ai_summary', 
                            content: data.content 
                          })}\n\n`
                        ));
                      } else if (data.type === 'done') {
                        break;
                      }
                    } catch (parseError) {
                      console.error('Summary stream parse error:', parseError);
                    }
                  }
                }
              }
            } catch (summaryError) {
              console.error('Summary generation with memory error:', summaryError);
              // Send fallback summary
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ 
                  type: 'ai_summary', 
                  content: `Found ${meaningfulResults.length} matching dishes based on your search for "${query}". The top results include dishes from ${top3Results.map(r => r.region).join(', ')}.`
                })}\n\n`
              ));
            }

            // Send meaningful results
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({
                type: 'search_results',
                results: {
                  vectorResults: meaningfulResults,
                  originalQuery: query,
                  translatedQuery: translatedQuery,
                  top3Results: top3Results,
                  hasMatches: true
                }
              })}\n\n`
            ));
          }

          // Step 4: Signal completion
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'done' })}\n\n`
          ));

          controller.close();

        } catch (error) {
          console.error('Unified search with memory error:', error);
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
    console.error('Unified search with memory endpoint error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process unified search' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}