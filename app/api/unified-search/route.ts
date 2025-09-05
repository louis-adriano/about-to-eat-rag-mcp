import { NextRequest } from 'next/server';
import { searchSimilarFoods } from '../../../lib/vector-db';
import { EnhancedGroqService } from '../../../lib/enhanced-groq';
import { GROQ_MODELS } from '../../../lib/model-config';
import { SearchResult } from '../../../types/food';
import { z } from 'zod';

const ConversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const UnifiedSearchSchema = z.object({
  query: z.string().min(1).max(500),
  conversationHistory: z.array(ConversationMessageSchema).optional().default([]),
});

interface StrictFilters {
  excludeSpicy: boolean;
  excludeSweet: boolean;
  excludeFermented: boolean;
  requiredCuisine: string | null;
  spiceLevel: string | null;
}

function parseStrictRequirements(query: string): StrictFilters {
  const lowerQuery = query.toLowerCase();
  
  return {
    excludeSpicy: lowerQuery.includes('not spicy') || lowerQuery.includes('no spice') || lowerQuery.includes('mild only') || lowerQuery.includes('non-spicy'),
    excludeSweet: lowerQuery.includes('not sweet') || lowerQuery.includes('no sugar') || lowerQuery.includes('savory only'),
    excludeFermented: lowerQuery.includes('not fermented') || lowerQuery.includes('no fermentation') || lowerQuery.includes('fresh only'),
    requiredCuisine: extractRequiredCuisine(lowerQuery),
    spiceLevel: extractSpiceLevel(lowerQuery)
  };
}

function extractRequiredCuisine(query: string): string | null {
  const cuisines = ['korean', 'chinese', 'japanese', 'thai', 'italian', 'mexican', 'indian', 'french', 'vietnamese', 'mediterranean'];
  
  for (const cuisine of cuisines) {
    if (query.includes(cuisine)) {
      return cuisine;
    }
  }
  return null;
}

function extractSpiceLevel(query: string): string | null {
  if (query.includes('very spicy') || query.includes('extremely spicy')) return 'very-spicy';
  if (query.includes('moderately spicy') || query.includes('medium spice')) return 'moderate';
  if (query.includes('mildly spicy') || query.includes('little spice')) return 'mild';
  if (query.includes('not spicy') || query.includes('no spice')) return 'none';
  return null;
}

function strictFilterResults(results: SearchResult[], filters: StrictFilters, originalQuery: string): SearchResult[] {
  console.log(`Applying strict filters to ${results.length} results:`, filters);
  
  const filtered = results.filter(result => {
    const text = result.text.toLowerCase();
    const region = result.region.toLowerCase();
    
    // STRICT spice filtering - if they said "not spicy", exclude ANYTHING with spice mentions
    if (filters.excludeSpicy) {
      const spiceWords = ['spicy', 'hot', 'chili', 'pepper', 'fiery', 'burning', 'jalapeño', 'habanero', 'cayenne', 'sriracha', 'gochujang'];
      if (spiceWords.some(word => text.includes(word))) {
        console.log(`Filtered out "${result.text.substring(0, 50)}..." - contains spice words`);
        return false;
      }
    }

    // STRICT sweet filtering
    if (filters.excludeSweet) {
      const sweetWords = ['sweet', 'sugar', 'honey', 'syrup', 'dessert', 'candy', 'cake', 'chocolate'];
      if (sweetWords.some(word => text.includes(word))) {
        console.log(`Filtered out "${result.text.substring(0, 50)}..." - contains sweet words`);
        return false;
      }
    }

    // STRICT fermented filtering
    if (filters.excludeFermented) {
      const fermentedWords = ['fermented', 'pickled', 'aged', 'kimchi', 'sauerkraut', 'miso', 'yogurt', 'kefir', 'tempeh'];
      if (fermentedWords.some(word => text.includes(word))) {
        console.log(`Filtered out "${result.text.substring(0, 50)}..." - contains fermented words`);
        return false;
      }
    }

    // STRICT cuisine requirement
    if (filters.requiredCuisine) {
      if (!region.includes(filters.requiredCuisine) && !text.includes(filters.requiredCuisine)) {
        console.log(`Filtered out "${result.text.substring(0, 50)}..." - not ${filters.requiredCuisine} cuisine`);
        return false;
      }
    }

    return true;
  });

  console.log(`Strict filtering: ${results.length} -> ${filtered.length} results remaining`);
  return filtered;
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
    const { query, conversationHistory = [] } = UnifiedSearchSchema.parse(body);

    const encoder = new TextEncoder();

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log(`Starting STRICT unified search with memory for: "${query}"`);
          console.log(`Conversation history length: ${conversationHistory.length} messages`);
          
          // Parse strict requirements from the query
          const strictFilters = parseStrictRequirements(query);
          console.log('Detected strict filters:', strictFilters);
          
          // Step 1: AI Query Analysis and Translation with Memory (now with strict awareness)
          console.log('Step 1: Analyzing query with strict requirements...');
          let translatedQuery = query;
          let queryAnalysis = null;
          
          try {
            const analysisResult = await EnhancedGroqService.analyzeAndTranslateQueryWithMemory(
              query, 
              conversationHistory
            );
            translatedQuery = analysisResult.translatedQuery;
            queryAnalysis = analysisResult.analysis;
            
            // Stream the enhanced analysis
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ 
                type: 'analysis', 
                content: analysisResult.analysis 
              })}\n\n`
            ));
          } catch (error) {
            console.error('Query analysis with strict filtering error:', error);
            // Send fallback analysis
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ 
                type: 'analysis', 
                content: `Searching for foods that strictly match: "${query}"` 
              })}\n\n`
            ));
          }

          // Step 2: Vector Search (get more results for filtering)
          console.log(`Step 2: Performing vector search with: "${translatedQuery}"`);
          const vectorResults: SearchResult[] = await searchSimilarFoods(translatedQuery, 20); // Get more for filtering
          
          // Step 3: Apply STRICT filtering
          console.log('Step 3: Applying strict filtering to results...');
          const strictlyFilteredResults = strictFilterResults(vectorResults, strictFilters, query);
          
          // Step 4: Check if we have meaningful results after strict filtering
          const finalResults = strictlyFilteredResults.filter(result => result.score > 0.1);
          const hasGoodMatches = finalResults.length > 0;
          
          console.log(`After strict filtering: ${vectorResults.length} -> ${strictlyFilteredResults.length} -> ${finalResults.length} final results`);
          
          if (!hasGoodMatches) {
            // Step 4a: No matches after strict filtering - be honest about it
            console.log('Step 4a: No matches after strict filtering, providing honest explanation...');
            
            try {
              const noResultsStream = await EnhancedGroqService.createNoResultsExplanationWithMemory(
                query,
                queryAnalysis || `Looking for foods that strictly match "${query}"`,
                vectorResults.slice(0, 5), // Show what was close before filtering
                conversationHistory
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
              console.error('No results explanation error:', noResultsError);
              // Send honest fallback message
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ 
                  type: 'ai_no_results', 
                  content: `No dishes in our database match your strict requirements for "${query}". The closest matches didn't meet your criteria. Try broadening your search or removing some restrictions.`
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
                  hasMatches: false,
                  strictlyFiltered: true,
                  filteredOut: vectorResults.length - finalResults.length
                }
              })}\n\n`
            ));
            
          } else {
            // Step 4b: We have good matches after strict filtering
            console.log('Step 4b: Good matches found after strict filtering, creating summary...');
            const top3Results = finalResults.slice(0, 3);
            
            try {
              const summaryStream = await EnhancedGroqService.createEnhancedSummaryWithMemory(
                query,
                queryAnalysis || `Found foods that strictly match "${query}"`,
                top3Results,
                conversationHistory
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
              console.error('Summary generation error:', summaryError);
              // Send honest fallback summary
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ 
                  type: 'ai_summary', 
                  content: `Found ${finalResults.length} dishes that strictly match your requirements for "${query}". These results respect your specific criteria.`
                })}\n\n`
              ));
            }

            // Send strictly filtered results (limit to top 8)
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({
                type: 'search_results',
                results: {
                  vectorResults: finalResults.slice(0, 8),
                  originalQuery: query,
                  translatedQuery: translatedQuery,
                  top3Results: top3Results,
                  hasMatches: true,
                  strictlyFiltered: true,
                  filteredOut: vectorResults.length - finalResults.length
                }
              })}\n\n`
            ));
          }

          // Step 5: Signal completion
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'done' })}\n\n`
          ));

          controller.close();

        } catch (error) {
          console.error('Strict unified search error:', error);
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
    console.error('Strict unified search endpoint error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process unified search with strict filtering' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}