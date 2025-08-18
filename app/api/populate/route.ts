import { NextResponse } from 'next/server';
import { populateVectorDB } from '@/lib/vector-db';
import { FOOD_DATA } from '@/lib/food-data';

export async function GET() {
  try {
    await populateVectorDB(FOOD_DATA);
    
    return NextResponse.json({
      success: true,
      message: `Successfully populated vector database with ${FOOD_DATA.length} food items`,
      count: FOOD_DATA.length
    });
  } catch (error) {
    console.error('Error populating database:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to populate vector database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET(); // Allow both GET and POST requests
}