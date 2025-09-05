// lib/model-config.ts
export const GROQ_MODELS = {
  // Main conversation model - for complex, detailed responses
  CONVERSATION: 'llama-3.3-70b-versatile',
  
  // Quick tasks model - for fast analysis, translations, etc.
  QUICK: 'llama-3.1-8b-instant',
  
  // Fallback models in case primary ones fail
  FALLBACK_CONVERSATION: 'llama-3.3-70b-versatile', // Updated: was llama-3.1-70b-versatile
  FALLBACK_QUICK: 'llama-3.1-8b-instant',
} as const;

// Type for valid model names
export type GroqModelName = typeof GROQ_MODELS[keyof typeof GROQ_MODELS];

// Model validation function
export function validateModel(modelName: string): modelName is GroqModelName {
  return Object.values(GROQ_MODELS).includes(modelName as GroqModelName);
}

// Get model with fallback
export function getModel(type: 'conversation' | 'quick', useFallback = false): GroqModelName {
  if (type === 'conversation') {
    return useFallback ? GROQ_MODELS.FALLBACK_CONVERSATION : GROQ_MODELS.CONVERSATION;
  }
  return useFallback ? GROQ_MODELS.FALLBACK_QUICK : GROQ_MODELS.QUICK;
}

// Model testing function
export async function testModel(modelName: string): Promise<boolean> {
  try {
    const { default: Groq } = await import('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'test' }],
      model: modelName,
      max_tokens: 5,
    });
    
    return true;
  } catch (error) {
    console.error(`Model ${modelName} failed:`, (error as Error).message);
    return false;
  }
}

// Auto-fallback function
export async function getWorkingModel(type: 'conversation' | 'quick'): Promise<GroqModelName> {
  const primaryModel = getModel(type, false);
  const fallbackModel = getModel(type, true);
  
  // Test primary model first
  if (await testModel(primaryModel)) {
    return primaryModel;
  }
  
  console.warn(`Primary model ${primaryModel} failed, trying fallback ${fallbackModel}`);
  
  // Test fallback model
  if (await testModel(fallbackModel)) {
    return fallbackModel;
  }
  
  throw new Error(`Both primary and fallback models failed for type: ${type}`);
}