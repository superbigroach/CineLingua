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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent('Say "Hello, CineLingua!" in French');
    const text = result.response.text();

    return NextResponse.json({
      success: true,
      message: 'Gemini API is working!',
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
