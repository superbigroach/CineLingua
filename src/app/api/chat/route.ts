import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { message, movieTitle, movieOverview, language = 'French', history = [] } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build conversation context
    const historyContext = (history || [])
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Tutor'}: ${m.content}`)
      .join('\n');

    const prompt = `You are a friendly ${language} language tutor helping someone learn ${language} through movies.
You're currently discussing the movie "${movieTitle}".

Movie synopsis: ${movieOverview}

Previous conversation:
${historyContext}

User's new message: ${message}

Instructions:
- Be helpful and encouraging
- If asked about ${language} words/phrases, provide translation, pronunciation tips, and examples
- If asked grammar questions, explain clearly with examples
- Keep responses concise but informative (2-3 paragraphs max)
- Use some ${language} words naturally (with translations in parentheses)
- If relevant, connect your answer to the movie being discussed
- Be conversational and friendly

Respond naturally as a ${language} tutor:`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: errorMessage,
        hasApiKey: !!process.env.GEMINI_API_KEY
      },
      { status: 500 }
    );
  }
}
