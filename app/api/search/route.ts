import { NextRequest, NextResponse } from 'next/server';
import { searchSimilarFoods } from '@/lib/vector-db';
import { z } from 'zod';

const SearchSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty').max(500, 'Query too long'),
  limit: z.number().min(1).max(20).optional().default(5),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const validation = SearchSchema.safeParse({ query, limit });
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const results = await searchSimilarFoods(query, limit);

    return NextResponse.json({
      success: true,
      query,
      results,
      count: results.length
    });
  } catch (error) {
    console.error('Search error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = SearchSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { query, limit } = validation.data;
    const results = await searchSimilarFoods(query, limit);

    return NextResponse.json({
      success: true,
      query,
      results,
      count: results.length
    });
  } catch (error) {
    console.error('Search error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}