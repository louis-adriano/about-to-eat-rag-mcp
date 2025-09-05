// scripts/check-models.mjs
import Groq from 'groq-sdk';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function checkModelsDaily() {
  console.log('🔍 Daily model health check...');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    // Get current available models
    const modelsResponse = await groq.models.list();
    const availableModels = modelsResponse.data.map(m => m.id);
    
    console.log('\n📋 Available models:');
    availableModels.forEach(model => console.log(`  ✅ ${model}`));
    
    // Check our configured models
    const ourModels = [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant'
    ];
    
    console.log('\n🔧 Checking our configured models:');
    let hasIssues = false;
    
    for (const model of ourModels) {
      if (availableModels.includes(model)) {
        // Test the model
        try {
          await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'test' }],
            model: model,
            max_tokens: 5
          });
          console.log(`  ✅ ${model} - Working`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log(`  ❌ ${model} - Available but failing: ${errorMessage}`);
          hasIssues = true;
        }
      } else {
        console.log(`  ⚠️  ${model} - NOT AVAILABLE (might be deprecated)`);
        hasIssues = true;
      }
    }
    
    if (hasIssues) {
      console.log('\n🚨 ISSUES DETECTED!');
      console.log('1. Check Groq console for deprecation notices');
      console.log('2. Update lib/model-config.ts with new model names');
      console.log('3. Test your app after updating');
      
      process.exit(1);
    } else {
      console.log('\n✅ All models working correctly!');
      process.exit(0);
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Health check failed:', errorMessage);
    process.exit(1);
  }
}

checkModelsDaily();