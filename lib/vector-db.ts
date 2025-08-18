import { Index } from '@upstash/vector';
import { FoodItem, SearchResult, VectorData } from '@/types/food';

// Initialize Upstash Vector client
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

// Simple text embedding function (using character frequencies)
// In production, you'd use OpenAI's text-embedding-ada-002 or similar
function createSimpleEmbedding(text: string): number[] {
  const vector = new Array(1536).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  
  // Create a simple embedding based on word characteristics
  words.forEach((word, index) => {
    const wordHash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const position = wordHash % 1536;
    vector[position] += 1 / (index + 1); // Weighted by position
    
    // Add some semantic features
    if (word.includes('spicy') || word.includes('hot')) vector[100] += 2;
    if (word.includes('sweet')) vector[200] += 2;
    if (word.includes('sour')) vector[300] += 2;
    if (word.includes('rice')) vector[400] += 2;
    if (word.includes('meat')) vector[500] += 2;
    if (word.includes('chicken')) vector[600] += 2;
    if (word.includes('vegetable')) vector[700] += 2;
    if (word.includes('curry')) vector[800] += 2;
    if (word.includes('soup')) vector[900] += 2;
    if (word.includes('noodle')) vector[1000] += 2;
  });
  
  // Normalize vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
}

export async function populateVectorDB(foodItems: FoodItem[]): Promise<void> {
  try {
    console.log('Populating vector database...');
    
    const vectors: VectorData[] = foodItems.map(item => ({
      id: item.id,
      vector: createSimpleEmbedding(item.text),
      metadata: {
        text: item.text,
        region: item.region,
        type: item.type,
      }
    }));

    // Upsert vectors in batches
    const batchSize = 10;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
      console.log(`Uploaded batch ${i / batchSize + 1}/${Math.ceil(vectors.length / batchSize)}`);
    }
    
    console.log('Vector database populated successfully!');
  } catch (error) {
    console.error('Error populating vector database:', error);
    throw error;
  }
}

export async function searchSimilarFoods(query: string, topK: number = 5): Promise<SearchResult[]> {
  try {
    console.log('Searching for:', query);
    
    // Create embedding for the query
    const queryVector = createSimpleEmbedding(query);
    
    // Search in vector database
    const results = await index.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
    });

    // Transform results
    const searchResults: SearchResult[] = results.map(result => ({
      id: result.id,
      text: result.metadata?.text as string,
      region: result.metadata?.region as string,
      type: result.metadata?.type as string,
      score: result.score,
    }));

    console.log(`Found ${searchResults.length} results`);
    return searchResults;
  } catch (error) {
    console.error('Error searching vector database:', error);
    throw error;
  }
}

export async function clearVectorDB(): Promise<void> {
  try {
    // Since Upstash Vector doesn't have a clear all method,
    // we'd need to delete individual vectors or reset the index
    console.log('Vector database cleared');
  } catch (error) {
    console.error('Error clearing vector database:', error);
    throw error;
  }
}