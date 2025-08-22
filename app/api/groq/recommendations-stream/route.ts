import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';
import { z } from 'zod';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const RecommendationsSchema = z.object({
  query: z.string().min(1),
  searchResults: z.array(z.any()),
  preferences: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, searchResults, preferences } = RecommendationsSchema.parse(body);

    const resultsSummary = searchResults.slice(0, 3).map(r => 
      `${r.region} ${r.type}: ${r.text.substring(0, 100)}...`
    ).join('\n');

    const stream = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a culinary expert AI. Based on search results and user preferences, recommend 3 similar or complementary foods.

          Write in a conversational, engaging style. For each recommendation:
          1. Start with the food name in **bold**
          2. Describe why it's similar/complementary
          3. Add interesting cultural context
          4. Suggest how to search for it

          Focus on variety and authentic cultural foods. Write naturally, not in JSON format.`
        },
        {
          role: "user",
          content: `User searched for: "${query}"
          
          Search results found:
          ${resultsSummary}
          
          User preferences: ${preferences?.join(', ') || 'None specified'}
          
          Recommend 3 foods they might enjoy and explain why:`
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.8,
      max_tokens: 600,
      stream: true, // 🔥 STREAMING ENABLED
    });

    const encoder = new TextEncoder();
    
    const readableStream = new ReadableStream({
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

    return new Response(readableStream, {
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
    console.error('Streaming recommendations error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to stream recommendations' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}