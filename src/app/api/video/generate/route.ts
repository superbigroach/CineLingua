import { NextRequest, NextResponse } from 'next/server';
import {
  generateVideoWithVeo,
  checkVeoJobStatus,
  enhancePromptForVeo,
  VIDEO_DURATION_SECONDS,
  VeoGenerationJob,
} from '@/lib/veo';

// Store active jobs (in production, use Redis or database)
const activeJobs = new Map<string, {
  operationName: string;
  prompt: string;
  createdAt: Date;
  userId?: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'generate': {
        const { prompt, enhancedPrompt, aspectRatio, resolution, userId } = body;

        if (!prompt && !enhancedPrompt) {
          return NextResponse.json(
            { error: 'Prompt is required' },
            { status: 400 }
          );
        }

        // Use enhanced prompt if available, otherwise raw prompt
        const finalPrompt = enhancedPrompt || prompt;

        // Generate video with Veo
        const job = await generateVideoWithVeo(finalPrompt, {
          duration: VIDEO_DURATION_SECONDS,
          aspectRatio: aspectRatio || '16:9',
          resolution: resolution || '720p',
        });

        // Store job for status checking
        activeJobs.set(job.jobId, {
          operationName: job.operationName,
          prompt: finalPrompt,
          createdAt: new Date(),
          userId,
        });

        return NextResponse.json({
          success: true,
          jobId: job.jobId,
          estimatedTime: job.estimatedTime,
          message: 'Video generation started. Poll /api/video/generate with action=status to check progress.',
        });
      }

      case 'status': {
        const { jobId } = body;

        if (!jobId) {
          return NextResponse.json(
            { error: 'Job ID is required' },
            { status: 400 }
          );
        }

        const jobData = activeJobs.get(jobId);
        if (!jobData) {
          return NextResponse.json(
            { error: 'Job not found' },
            { status: 404 }
          );
        }

        // Check status with Vertex AI
        const status = await checkVeoJobStatus(jobData.operationName);

        // Clean up completed jobs
        if (status.status === 'completed' || status.status === 'failed') {
          // Keep for 10 minutes for retrieval
          setTimeout(() => activeJobs.delete(jobId), 10 * 60 * 1000);
        }

        return NextResponse.json({
          jobId,
          ...status,
          prompt: jobData.prompt.substring(0, 100) + '...',
          createdAt: jobData.createdAt,
        });
      }

      case 'enhance': {
        const { userPrompt, requiredWords, language, style } = body;

        if (!userPrompt) {
          return NextResponse.json(
            { error: 'User prompt is required' },
            { status: 400 }
          );
        }

        const enhanced = await enhancePromptForVeo({
          userPrompt,
          requiredWords: requiredWords || [],
          language: language || 'French',
          style: style || 'drama',
        });

        return NextResponse.json({
          success: true,
          ...enhanced,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action. Use: generate, status, or enhance' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Video API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check for common configuration errors
    if (errorMessage.includes('GOOGLE_CLOUD_PROJECT')) {
      return NextResponse.json(
        {
          error: 'Google Cloud not configured',
          details: 'Set GOOGLE_CLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS_JSON environment variables',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Video generation failed',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

// GET endpoint for simple status checks
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { error: 'Job ID required as query parameter' },
      { status: 400 }
    );
  }

  const jobData = activeJobs.get(jobId);
  if (!jobData) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    );
  }

  try {
    const status = await checkVeoJobStatus(jobData.operationName);
    return NextResponse.json({
      jobId,
      ...status,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to check status', details: errorMessage },
      { status: 500 }
    );
  }
}
