import { NextRequest } from 'next/server';
import { GroqFoodService } from '../../../../lib/groq';
import { z } from 'zod';

const ContextSchema = z.object({
  foodItem: z.object({
    text: z.string(),
    region: z.string(),
    type: z.string(),
  }),
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
    const { foodItem } = ContextSchema.parse(body);

    // Create streaming response
    const stream = await GroqFoodService.createStreamingFoodContext(foodItem);

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
    console.error('Streaming context error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to stream food context' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}