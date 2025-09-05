// scripts/validate-models.mjs
import { readFileSync, existsSync } from 'fs';

function validateModelReferences() {
  console.log('🔍 Validating model references in codebase...');
  
  const filesToCheck = [
    'app/api/agent-chat/route.ts',
    'lib/enhanced-groq.ts',
    'app/api/unified-search/route.ts',
    'app/api/groq/context-stream/route.ts'
  ];
  
  // Deprecated model patterns
  const deprecatedModels = [
    'llama3-70b-8192',
    'llama3-8b-8192',
    'llama-3-70b-8192',
    'llama-3-8b-8192'
  ];
  
  let hasIssues = false;
  
  filesToCheck.forEach(file => {
    if (existsSync(file)) {
      const content = readFileSync(file, 'utf8');
      
      deprecatedModels.forEach(model => {
        if (content.includes(`"${model}"`) || content.includes(`'${model}'`)) {
          console.log(`❌ Found deprecated model "${model}" in ${file}`);
          hasIssues = true;
        }
      });
      
      if (!hasIssues) {
        console.log(`✅ ${file} - No deprecated models found`);
      }
    }
  });
  
  if (hasIssues) {
    console.log('\n🚨 Deprecated models found!');
    console.log('Please update to use the centralized model config in lib/model-config.ts');
    process.exit(1);
  } else {
    console.log('\n✅ All model references look good!');
  }
}

validateModelReferences();