import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  // Check if key exists
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'GEMINI_API_KEY not found in environment',
      keyExists: false,
    });
  }

  // Check key format
  if (!apiKey.startsWith('AIza')) {
    return NextResponse.json({
      success: false,
      error: 'API key does not have expected format (should start with AIza)',
      keyExists: true,
      keyPrefix: apiKey.substring(0, 4),
    });
  }

  // Try to use the API
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Try different model names
    const modelNames = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash-001', 'gemini-pro'];
    let workingModel = null;
    let lastError = '';

    for (const modelName of modelNames) {
      try {
        const testModel = genAI.getGenerativeModel({ model: modelName });
        const testResult = await testModel.generateContent('Say hi');
        workingModel = modelName;
        break;
      } catch (e) {
        lastError = e instanceof Error ? e.message : 'Unknown';
      }
    }

    if (!workingModel) {
      return NextResponse.json({
        success: false,
        error: `No working model found. Last error: ${lastError}`,
        triedModels: modelNames,
        keyExists: true,
      });
    }

    const model = genAI.getGenerativeModel({ model: workingModel });

    const result = await model.generateContent('Say "Hello, CineLingua!" in French');
    const text = result.response.text();

    return NextResponse.json({
      success: true,
      message: 'Gemini API is working!',
      workingModel,
      response: text,
      keyExists: true,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage,
      keyExists: true,
      keyPrefix: apiKey.substring(0, 8) + '...',
    });
  }
}
