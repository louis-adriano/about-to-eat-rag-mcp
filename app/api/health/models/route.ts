// app/api/health/models/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GROQ_MODELS, testModel } from '../../../../lib/model-config';
import Groq from 'groq-sdk';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'dummy-key-for-build') {
      return NextResponse.json({
        error: 'Groq API key not configured',
        status: 'error'
      }, { status: 503 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    // Get available models from Groq
    let availableModels: string[] = [];
    try {
      const modelsResponse = await groq.models.list();
      availableModels = modelsResponse.data.map(model => model.id);
    } catch (error) {
      console.error('Failed to fetch available models:', error);
    }

    // Test our configured models
    const modelTests = await Promise.allSettled([
      testModel(GROQ_MODELS.CONVERSATION),
      testModel(GROQ_MODELS.QUICK),
      testModel(GROQ_MODELS.FALLBACK_CONVERSATION),
      testModel(GROQ_MODELS.FALLBACK_QUICK),
    ]);

    const results = {
      timestamp: new Date().toISOString(),
      apiKeyValid: true,
      availableModels: availableModels,
      configuredModels: {
        conversation: {
          model: GROQ_MODELS.CONVERSATION,
          working: modelTests[0].status === 'fulfilled' && modelTests[0].value,
          available: availableModels.includes(GROQ_MODELS.CONVERSATION)
        },
        quick: {
          model: GROQ_MODELS.QUICK,
          working: modelTests[1].status === 'fulfilled' && modelTests[1].value,
          available: availableModels.includes(GROQ_MODELS.QUICK)
        },
        fallbackConversation: {
          model: GROQ_MODELS.FALLBACK_CONVERSATION,
          working: modelTests[2].status === 'fulfilled' && modelTests[2].value,
          available: availableModels.includes(GROQ_MODELS.FALLBACK_CONVERSATION)
        },
        fallbackQuick: {
          model: GROQ_MODELS.FALLBACK_QUICK,
          working: modelTests[3].status === 'fulfilled' && modelTests[3].value,
          available: availableModels.includes(GROQ_MODELS.FALLBACK_QUICK)
        }
      },
      warnings: [] as string[],
      recommendations: [] as string[]
    };

    // Add warnings for deprecated models
    Object.entries(results.configuredModels).forEach(([type, config]) => {
      if (!config.available) {
        results.warnings.push(`Model ${config.model} (${type}) is not in available models list`);
      }
      if (!config.working) {
        results.warnings.push(`Model ${config.model} (${type}) failed health check`);
      }
    });

    // Add recommendations
    if (results.warnings.length > 0) {
      results.recommendations.push('Update model configuration in lib/model-config.ts');
      results.recommendations.push('Check Groq console for model deprecation notices');
    }

    const status = results.warnings.length > 0 ? 'warning' : 'healthy';
    const statusCode = results.warnings.length > 0 ? 200 : 200; // Still 200 for warnings

    return NextResponse.json({
      status,
      ...results
    }, { status: statusCode });

  } catch (error) {
    console.error('Model health check error:', error);
    return NextResponse.json({
      status: 'error',
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Helper endpoint to get just the working models
export async function POST(request: NextRequest) {
  try {
    const { getWorkingModel } = await import('../../../../lib/model-config');
    
    const [conversationModel, quickModel] = await Promise.allSettled([
      getWorkingModel('conversation'),
      getWorkingModel('quick')
    ]);

    return NextResponse.json({
      conversation: conversationModel.status === 'fulfilled' ? conversationModel.value : null,
      quick: quickModel.status === 'fulfilled' ? quickModel.value : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get working models',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}