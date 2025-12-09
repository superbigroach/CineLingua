// Google Veo Video Generation API
// https://cloud.google.com/vertex-ai/generative-ai/pricing
//
// Official Pricing (Dec 2025):
// - Veo 3.1 Fast (video only): $0.10/second  <-- Best value, we use this
// - Veo 3.1 Fast (video+audio): $0.15/second
// - Veo 3.1 (video only): $0.20/second
// - Veo 3.1 (video+audio): $0.40/second
// - Veo 3 (video only): $0.20/second
// - Veo 3 (video+audio): $0.40/second
//
// Supported: 720p, 1080p output

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Cost constants - using Veo 3.1 Fast (video only) for best value
export const VEO_MODEL = 'veo-3.1-fast';
export const VEO_COST_PER_SECOND = 0.10; // USD - Veo 3.1 Fast video-only
export const VIDEO_DURATION_SECONDS = 8;
export const VIDEO_RESOLUTION = '720p';
export const TOTAL_GENERATION_COST = VEO_COST_PER_SECOND * VIDEO_DURATION_SECONDS; // $0.80 per 8-sec clip

// Contest economics
// Stake = 2x generation cost = $1.60
// Total to enter contest = generation ($0.80) + stake ($1.60) = $2.40
export const CONTEST_STAKE_MULTIPLIER = 2; // Stake is 2x the generation cost
export const MINIMUM_STAKE = TOTAL_GENERATION_COST * CONTEST_STAKE_MULTIPLIER; // $1.60
export const PLATFORM_FEE_PERCENTAGE = 0.20; // 20% of prize pool (taken from winnings)
export const PRIZE_SPLIT = {
  first: 0.50,   // 50% of 80% = 40% of total pool
  second: 0.30,  // 30% of 80% = 24% of total pool
  third: 0.20,   // 20% of 80% = 16% of total pool
};

export interface ScenePrompt {
  userPrompt: string;
  requiredWords: string[];
  language: string;
  style?: 'film_noir' | 'comedy' | 'drama' | 'romance' | 'thriller' | 'documentary';
}

export interface EnhancedPrompt {
  cinematicPrompt: string;
  variations: string[];
  visualStyle: string;
  cameraDirections: string;
  mood: string;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  thumbnailUrl: string;
  duration: number;
  prompt: string;
  variation: number;
}

export interface ContestSubmission {
  userId: string;
  contestId: string;
  originalPrompt: string;
  enhancedPrompt: EnhancedPrompt;
  videos: GeneratedVideo[];
  selectedVideoId: string;
  stakeAmount: number;
  generationCost: number;
  createdAt: Date;
}

// Film style presets for different genres
const STYLE_PRESETS = {
  film_noir: {
    lighting: 'high contrast chiaroscuro lighting, deep shadows, single light source',
    color: 'desaturated with hints of amber, moody blacks and grays',
    camera: 'low angles, dutch tilts, slow tracking shots',
    mood: 'mysterious, brooding, atmospheric tension',
  },
  comedy: {
    lighting: 'bright, even lighting with warm tones',
    color: 'vibrant, saturated colors, cheerful palette',
    camera: 'medium shots, quick cuts, reactive zooms',
    mood: 'playful, energetic, lighthearted',
  },
  drama: {
    lighting: 'natural lighting with dramatic highlights',
    color: 'rich, deep colors with emotional undertones',
    camera: 'intimate close-ups, steady tracking, meaningful pauses',
    mood: 'emotional, contemplative, human',
  },
  romance: {
    lighting: 'soft, golden hour lighting, lens flares',
    color: 'warm pastels, rose tints, dreamy haze',
    camera: 'slow motion, shallow depth of field, circular movements',
    mood: 'tender, intimate, yearning',
  },
  thriller: {
    lighting: 'harsh contrasts, flickering lights, neon accents',
    color: 'cold blues and greens with red accents',
    camera: 'handheld, quick pans, disorienting angles',
    mood: 'tense, urgent, paranoid',
  },
  documentary: {
    lighting: 'natural, available light',
    color: 'realistic, ungraded, authentic',
    camera: 'observational, long takes, steady tripod',
    mood: 'authentic, intimate, revealing',
  },
};

// Enhance user prompt into cinematic Veo-ready prompt
export async function enhancePromptForVeo(
  scenePrompt: ScenePrompt
): Promise<EnhancedPrompt> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const style = STYLE_PRESETS[scenePrompt.style || 'drama'];

  const prompt = `You are a world-class cinematographer and screenwriter creating prompts for AI video generation.

TASK: Transform this user's scene idea into 3 cinematic video generation prompts.

USER'S SCENE IDEA: "${scenePrompt.userPrompt}"

REQUIRED WORDS/PHRASES (must appear naturally in the scene):
${scenePrompt.requiredWords.map(w => `- ${w}`).join('\n')}

TARGET LANGUAGE: ${scenePrompt.language}

VISUAL STYLE GUIDELINES:
- Lighting: ${style.lighting}
- Color palette: ${style.color}
- Camera work: ${style.camera}
- Mood: ${style.mood}

Create a JSON response with:
{
  "cinematicPrompt": "Main detailed 8-second scene description with specific visual details, camera movements, lighting, and atmosphere. Include the required words naturally.",
  "variations": [
    "Variation 1: Same scene but different camera angle or time of day",
    "Variation 2: Same scene but different emotional beat or weather",
    "Variation 3: Same scene but different character action or reveal"
  ],
  "visualStyle": "Brief style summary",
  "cameraDirections": "Specific camera movements and framing",
  "mood": "Emotional tone in one line"
}

IMPORTANT:
- Each prompt should be 50-100 words
- Be specific about lighting, colors, textures
- Include camera movement directions (pan, track, push in, etc.)
- Describe the scene as if directing a cinematographer
- Ensure required ${scenePrompt.language} words appear naturally
- Make each variation distinct but coherent`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  // Fallback if parsing fails
  return {
    cinematicPrompt: scenePrompt.userPrompt,
    variations: [scenePrompt.userPrompt, scenePrompt.userPrompt, scenePrompt.userPrompt],
    visualStyle: 'Cinematic',
    cameraDirections: 'Slow push in',
    mood: 'Atmospheric',
  };
}

// Validate that user prompt contains required words
export function validatePromptContainsWords(
  prompt: string,
  requiredWords: string[]
): { valid: boolean; missing: string[] } {
  const promptLower = prompt.toLowerCase();
  const missing: string[] = [];

  for (const word of requiredWords) {
    // Check for word or close variations
    const wordLower = word.toLowerCase();
    if (!promptLower.includes(wordLower)) {
      missing.push(word);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

// Vertex AI configuration
const VERTEX_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || '';
const VERTEX_LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';
const VEO_MODEL_ID = 'veo-2.0-generate-001'; // Veo 2 model

// Get access token from service account or ADC
async function getAccessToken(): Promise<string> {
  // Check for service account JSON credentials
  const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (serviceAccountJson) {
    // Parse service account credentials and generate JWT
    const credentials = JSON.parse(serviceAccountJson);
    const jwt = await generateServiceAccountJWT(credentials);
    return jwt;
  }

  // Fallback: use metadata server (for Cloud Run/GCE)
  try {
    const response = await fetch(
      'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
      { headers: { 'Metadata-Flavor': 'Google' } }
    );
    const data = await response.json();
    return data.access_token;
  } catch {
    throw new Error('No Google Cloud credentials configured. Set GOOGLE_APPLICATION_CREDENTIALS_JSON env var.');
  }
}

// Generate JWT from service account credentials
async function generateServiceAccountJWT(credentials: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    sub: credentials.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
  };

  // Create the JWT
  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signatureInput = `${headerB64}.${payloadB64}`;

  // Sign with private key using Web Crypto API
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(credentials.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    encoder.encode(signatureInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${signatureInput}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  }

  return tokenData.access_token;
}

// Convert PEM to ArrayBuffer
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export interface VeoGenerationJob {
  jobId: string;
  operationName: string;
  estimatedTime: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// Generate video using Veo 2 API (via Vertex AI)
export async function generateVideoWithVeo(
  prompt: string,
  options: {
    duration?: number;
    aspectRatio?: '16:9' | '9:16' | '1:1';
    resolution?: '720p' | '1080p';
    negativePrompt?: string;
  } = {}
): Promise<VeoGenerationJob> {
  if (!VERTEX_PROJECT_ID) {
    throw new Error('GOOGLE_CLOUD_PROJECT environment variable not set');
  }

  const accessToken = await getAccessToken();

  // Vertex AI Veo endpoint
  const endpoint = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${VERTEX_PROJECT_ID}/locations/${VERTEX_LOCATION}/publishers/google/models/${VEO_MODEL_ID}:generateVideo`;

  const requestBody = {
    instances: [{
      prompt: prompt,
    }],
    parameters: {
      aspectRatio: options.aspectRatio || '16:9',
      durationSeconds: options.duration || VIDEO_DURATION_SECONDS,
      resolution: options.resolution || '720p',
      ...(options.negativePrompt && { negativePrompt: options.negativePrompt }),
    },
  };

  console.log('Veo Generation Request:', {
    endpoint,
    prompt: prompt.substring(0, 100) + '...',
    duration: options.duration || VIDEO_DURATION_SECONDS,
    aspectRatio: options.aspectRatio || '16:9',
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Veo API error:', errorText);
    throw new Error(`Veo API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  // Veo returns a long-running operation
  const operationName = result.name || result.operationName;
  const jobId = `veo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    jobId,
    operationName,
    estimatedTime: 180, // Veo typically takes 2-5 minutes
    status: 'pending',
  };
}

// Check video generation status
export async function checkVeoJobStatus(
  operationName: string
): Promise<{
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  videoUrl?: string;
  videoGcsUri?: string;
  error?: string;
}> {
  if (!VERTEX_PROJECT_ID) {
    throw new Error('GOOGLE_CLOUD_PROJECT environment variable not set');
  }

  const accessToken = await getAccessToken();

  // Poll the long-running operation
  const endpoint = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/${operationName}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      status: 'failed',
      error: `Failed to check status: ${response.status} - ${errorText}`,
    };
  }

  const result = await response.json();

  // Check if operation is done
  if (result.done) {
    if (result.error) {
      return {
        status: 'failed',
        error: result.error.message || 'Video generation failed',
      };
    }

    // Extract video URL from response
    const videos = result.response?.generatedVideos || result.response?.videos || [];
    if (videos.length > 0) {
      const video = videos[0];
      return {
        status: 'completed',
        progress: 100,
        videoUrl: video.uri || video.url,
        videoGcsUri: video.gcsUri,
      };
    }

    return {
      status: 'completed',
      progress: 100,
    };
  }

  // Still processing
  const metadata = result.metadata || {};
  return {
    status: 'processing',
    progress: metadata.progressPercent || 50,
  };
}

// Download video from GCS and get a temporary signed URL
export async function getVideoDownloadUrl(gcsUri: string): Promise<string> {
  if (!gcsUri.startsWith('gs://')) {
    return gcsUri; // Already a URL
  }

  const accessToken = await getAccessToken();

  // Parse GCS URI: gs://bucket/path/to/file
  const match = gcsUri.match(/^gs:\/\/([^\/]+)\/(.+)$/);
  if (!match) {
    throw new Error(`Invalid GCS URI: ${gcsUri}`);
  }

  const [, bucket, object] = match;
  const encodedObject = encodeURIComponent(object);

  // Generate signed URL using the storage API
  const endpoint = `https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodedObject}?alt=media`;

  // For now, return a proxy URL through our API
  // In production, you'd generate a signed URL
  return `/api/video/proxy?uri=${encodeURIComponent(gcsUri)}`;
}

// Calculate costs for a submission
export function calculateSubmissionCost(options: {
  generateOnly: boolean;
  stakeMultiplier?: number;
}): {
  generationCost: number;
  stakeCost: number;
  platformFee: number;
  prizePoolContribution: number;
  total: number;
} {
  const generationCost = TOTAL_GENERATION_COST;

  if (options.generateOnly) {
    return {
      generationCost,
      stakeCost: 0,
      platformFee: 0,
      prizePoolContribution: 0,
      total: generationCost,
    };
  }

  const stakeCost = generationCost * (options.stakeMultiplier || 1);
  const platformFee = stakeCost * PLATFORM_FEE_PERCENTAGE;
  const prizePoolContribution = stakeCost - platformFee;

  return {
    generationCost,
    stakeCost,
    platformFee,
    prizePoolContribution,
    total: generationCost + stakeCost,
  };
}

// AI Judge scoring system
export interface JudgeScore {
  judgeId: 'cinematographer' | 'linguist' | 'audience';
  judgeName: string;
  judgeEmoji: string;
  score: number; // 1-10
  feedback: string;
  criteria: string[];
}

const JUDGE_PERSONAS = {
  cinematographer: {
    name: 'Le Cinéaste',
    emoji: '🎬',
    personality: 'A legendary French film director who has won multiple César Awards. Extremely particular about mise-en-scène, lighting, and visual storytelling. Speaks with authority but appreciates bold choices.',
    criteria: [
      'Visual composition and framing',
      'Lighting and atmosphere',
      'Camera movement and dynamics',
      'Color palette and mood',
      'Cinematic storytelling',
    ],
  },
  linguist: {
    name: 'Le Linguiste',
    emoji: '🗣️',
    personality: 'A distinguished member of the Académie Française, passionate about preserving and celebrating the French language. Values authentic usage, cultural accuracy, and natural integration of vocabulary.',
    criteria: [
      'Natural integration of required vocabulary',
      'Cultural authenticity',
      'Language register appropriateness',
      'Idiomatic expression usage',
      'Regional linguistic accuracy',
    ],
  },
  audience: {
    name: 'Le Public',
    emoji: '🎭',
    personality: 'An enthusiastic film festival attendee who has seen thousands of films. Loves being surprised, moved, and entertained. Appreciates creativity, emotional impact, and memorable moments.',
    criteria: [
      'Entertainment value',
      'Emotional impact',
      'Creativity and originality',
      'Memorability',
      'Overall enjoyment',
    ],
  },
};

// Generate AI judge scores for a submission
export async function judgeSubmission(
  submission: {
    prompt: string;
    requiredWords: string[];
    language: string;
    videoDescription: string;
  }
): Promise<JudgeScore[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const scores: JudgeScore[] = [];

  for (const [judgeId, judge] of Object.entries(JUDGE_PERSONAS)) {
    const prompt = `You are ${judge.name}, ${judge.personality}

You are judging a video submission for a ${submission.language} language learning film contest.

SCENE PROMPT: "${submission.prompt}"
REQUIRED ${submission.language.toUpperCase()} WORDS USED: ${submission.requiredWords.join(', ')}
VIDEO DESCRIPTION: "${submission.videoDescription}"

YOUR JUDGING CRITERIA:
${judge.criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Provide your judgment in JSON format. Be fair but critical - not everyone gets a 10!
{
  "score": <number 1-10>,
  "feedback": "<2-3 sentences of feedback in character, mixing ${submission.language} and English for flair>",
  "highlights": "<what you liked most>",
  "improvements": "<constructive criticism>"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      scores.push({
        judgeId: judgeId as JudgeScore['judgeId'],
        judgeName: judge.name,
        judgeEmoji: judge.emoji,
        score: Math.min(10, Math.max(1, parsed.score)),
        feedback: parsed.feedback,
        criteria: judge.criteria,
      });
    }
  }

  return scores;
}

// Calculate final ranking from judge scores
export function calculateFinalScore(scores: JudgeScore[]): number {
  if (scores.length === 0) return 0;
  const total = scores.reduce((sum, s) => sum + s.score, 0);
  return total; // Max 30 points (3 judges × 10 points each)
}
