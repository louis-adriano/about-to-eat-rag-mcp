// app/api/groq/test/route.ts
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy-key-for-build',
});

export async function GET() {
  try {
    // Check if Groq API key is available
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'dummy-key-for-build') {
      return NextResponse.json({
        success: false,
        message: "Groq API key not configured",
        error: "GROQ_API_KEY environment variable is missing",
        timestamp: new Date().toISOString()
      });
    }

    // Test Groq connection with a simple food-related query
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful food expert. Respond with exactly one interesting food fact in under 50 words."
        },
        {
          role: "user",
          content: "Tell me a quick fact about Korean kimchi."
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 100,
    });

    const response = completion.choices[0]?.message?.content;

    return NextResponse.json({
      success: true,
      message: "Groq integration working!",
      testResponse: response,
      model: "llama-3.1-8b-instant",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Groq test error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Groq connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}