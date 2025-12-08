// Video Enhancement & Effects for CinéScene Challenge
// These are prompt modifiers and post-processing options for Veo-generated videos

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ============================================
// VISUAL STYLE PRESETS
// ============================================

export interface StylePreset {
  id: string;
  name: string;
  nameInFrench: string;
  emoji: string;
  description: string;
  promptModifier: string;
  colorGrading: string;
  additionalCost: number; // Extra cost in USD (0 for basic styles)
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'classic_french',
    name: 'Classic French Cinema',
    nameInFrench: 'Cinéma Français Classique',
    emoji: '🎬',
    description: 'Black & white with soft grain, reminiscent of the French New Wave',
    promptModifier: 'Black and white film, soft grain texture, high contrast, reminiscent of French New Wave cinema, Truffaut-style naturalistic lighting',
    colorGrading: 'desaturated, high contrast B&W',
    additionalCost: 0,
  },
  {
    id: 'amelie',
    name: 'Amélie Warm Tones',
    nameInFrench: 'Tons Chauds d\'Amélie',
    emoji: '💚',
    description: 'Warm greens and reds, whimsical Parisian atmosphere',
    promptModifier: 'Warm color palette with prominent greens and deep reds, saturated colors, whimsical fairy-tale atmosphere, soft diffused lighting, Amélie movie aesthetic',
    colorGrading: 'warm greens, deep reds, saturated',
    additionalCost: 0,
  },
  {
    id: 'film_noir',
    name: 'Film Noir',
    nameInFrench: 'Film Noir',
    emoji: '🕵️',
    description: 'Dramatic shadows, venetian blind lighting, mystery atmosphere',
    promptModifier: 'Film noir style, dramatic chiaroscuro lighting, deep shadows, venetian blind light patterns, smoke and mist, 1940s aesthetic',
    colorGrading: 'high contrast B&W with deep blacks',
    additionalCost: 0,
  },
  {
    id: 'golden_hour',
    name: 'Golden Hour Paris',
    nameInFrench: 'Heure Dorée Parisienne',
    emoji: '🌅',
    description: 'Warm sunset lighting on Parisian streets',
    promptModifier: 'Golden hour lighting, warm orange and amber tones, long shadows, romantic atmosphere, soft lens flare, Parisian magic hour',
    colorGrading: 'warm orange amber tint',
    additionalCost: 0,
  },
  {
    id: 'rainy_melancholy',
    name: 'Rainy Melancholy',
    nameInFrench: 'Mélancolie Pluvieuse',
    emoji: '🌧️',
    description: 'Rain-soaked streets, reflections, contemplative mood',
    promptModifier: 'Rainy atmosphere, wet reflective streets, neon reflections in puddles, melancholic mood, cool blue-gray color palette, rain droplets',
    colorGrading: 'cool blue-gray, desaturated',
    additionalCost: 0,
  },
  {
    id: 'vintage_70s',
    name: '70s French Vintage',
    nameInFrench: 'Vintage Années 70',
    emoji: '📼',
    description: 'Faded colors, lens artifacts, nostalgic grain',
    promptModifier: '1970s film stock aesthetic, faded colors, heavy film grain, light leaks, slight vignetting, anamorphic lens flares, vintage French cinema look',
    colorGrading: 'faded warm tones with light leaks',
    additionalCost: 0,
  },
];

// ============================================
// CAMERA MOVEMENT OPTIONS
// ============================================

export interface CameraMovement {
  id: string;
  name: string;
  nameInFrench: string;
  emoji: string;
  description: string;
  promptModifier: string;
}

export const CAMERA_MOVEMENTS: CameraMovement[] = [
  {
    id: 'static',
    name: 'Static Shot',
    nameInFrench: 'Plan Fixe',
    emoji: '🎯',
    description: 'Locked camera, steady frame',
    promptModifier: 'Static camera, locked frame, stable shot',
  },
  {
    id: 'slow_push',
    name: 'Slow Push In',
    nameInFrench: 'Travelling Avant Lent',
    emoji: '➡️',
    description: 'Slowly move towards subject',
    promptModifier: 'Slow dolly push in, gradually approaching subject, building intimacy',
  },
  {
    id: 'pull_back',
    name: 'Dramatic Pull Back',
    nameInFrench: 'Travelling Arrière Dramatique',
    emoji: '⬅️',
    description: 'Reveal the scene by pulling back',
    promptModifier: 'Dramatic pull back reveal, starting close and widening to show environment',
  },
  {
    id: 'tracking',
    name: 'Tracking Shot',
    nameInFrench: 'Plan Séquence',
    emoji: '🎥',
    description: 'Follow the subject smoothly',
    promptModifier: 'Smooth tracking shot, following subject movement, steadicam feel',
  },
  {
    id: 'orbit',
    name: 'Orbital Pan',
    nameInFrench: 'Panoramique Orbital',
    emoji: '🔄',
    description: 'Circle around the subject',
    promptModifier: 'Orbital camera movement, slowly circling around subject, 180 degree arc',
  },
  {
    id: 'crane_up',
    name: 'Crane Up',
    nameInFrench: 'Mouvement de Grue',
    emoji: '⬆️',
    description: 'Rise up to reveal the scene',
    promptModifier: 'Crane shot rising upward, ascending reveal, showing scale of environment',
  },
];

// ============================================
// AUDIO/MOOD OPTIONS
// ============================================

export interface AudioMood {
  id: string;
  name: string;
  nameInFrench: string;
  emoji: string;
  description: string;
  suggestedMusic: string;
}

export const AUDIO_MOODS: AudioMood[] = [
  {
    id: 'romantic',
    name: 'Romantic',
    nameInFrench: 'Romantique',
    emoji: '💕',
    description: 'Soft, tender atmosphere',
    suggestedMusic: 'Soft accordion, gentle piano, string ensemble',
  },
  {
    id: 'mysterious',
    name: 'Mysterious',
    nameInFrench: 'Mystérieux',
    emoji: '🔮',
    description: 'Suspenseful, intriguing',
    suggestedMusic: 'Low strings, ambient tension, subtle percussion',
  },
  {
    id: 'joyful',
    name: 'Joyful',
    nameInFrench: 'Joyeux',
    emoji: '🎉',
    description: 'Light, happy, celebratory',
    suggestedMusic: 'Upbeat accordion, cheerful brass, cafe jazz',
  },
  {
    id: 'melancholic',
    name: 'Melancholic',
    nameInFrench: 'Mélancolique',
    emoji: '😢',
    description: 'Sad, reflective, nostalgic',
    suggestedMusic: 'Solo piano, muted strings, rain ambience',
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    nameInFrench: 'Dramatique',
    emoji: '🎭',
    description: 'Intense, emotional climax',
    suggestedMusic: 'Full orchestra, building crescendo, powerful brass',
  },
  {
    id: 'comedic',
    name: 'Comedic',
    nameInFrench: 'Comique',
    emoji: '😂',
    description: 'Playful, humorous timing',
    suggestedMusic: 'Bouncy piano, comedic woodwinds, whimsical',
  },
];

// ============================================
// TEXT OVERLAY OPTIONS
// ============================================

export interface TextOverlay {
  id: string;
  name: string;
  description: string;
  style: 'subtitle' | 'title_card' | 'handwritten' | 'typewriter';
  position: 'bottom' | 'top' | 'center';
}

export const TEXT_OVERLAYS: TextOverlay[] = [
  {
    id: 'french_subtitles',
    name: 'French Subtitles',
    description: 'Classic white subtitles with black outline',
    style: 'subtitle',
    position: 'bottom',
  },
  {
    id: 'title_card',
    name: 'Opening Title Card',
    description: 'Elegant serif font title at the beginning',
    style: 'title_card',
    position: 'center',
  },
  {
    id: 'handwritten',
    name: 'Handwritten Note',
    description: 'Cursive script, like a love letter',
    style: 'handwritten',
    position: 'center',
  },
  {
    id: 'typewriter',
    name: 'Typewriter Text',
    description: 'Classic typewriter effect, letter by letter',
    style: 'typewriter',
    position: 'bottom',
  },
];

// ============================================
// ENHANCEMENT FUNCTIONS
// ============================================

// Apply style preset to prompt
export function applyStyleToPrompt(
  basePrompt: string,
  styleId: string
): string {
  const style = STYLE_PRESETS.find(s => s.id === styleId);
  if (!style) return basePrompt;

  return `${basePrompt}. Visual style: ${style.promptModifier}. Color grading: ${style.colorGrading}.`;
}

// Apply camera movement to prompt
export function applyCameraToPrompt(
  basePrompt: string,
  cameraId: string
): string {
  const camera = CAMERA_MOVEMENTS.find(c => c.id === cameraId);
  if (!camera) return basePrompt;

  return `${basePrompt}. Camera movement: ${camera.promptModifier}.`;
}

// Generate enhanced prompt with all options
export function buildEnhancedPrompt(options: {
  basePrompt: string;
  styleId?: string;
  cameraId?: string;
  mood?: string;
  additionalDirections?: string;
}): string {
  let prompt = options.basePrompt;

  // Add style
  if (options.styleId) {
    const style = STYLE_PRESETS.find(s => s.id === options.styleId);
    if (style) {
      prompt += ` Visual style: ${style.promptModifier}.`;
    }
  }

  // Add camera
  if (options.cameraId) {
    const camera = CAMERA_MOVEMENTS.find(c => c.id === options.cameraId);
    if (camera) {
      prompt += ` Camera: ${camera.promptModifier}.`;
    }
  }

  // Add mood/atmosphere
  if (options.mood) {
    const mood = AUDIO_MOODS.find(m => m.id === options.mood);
    if (mood) {
      prompt += ` Atmosphere: ${mood.description}.`;
    }
  }

  // Add custom directions
  if (options.additionalDirections) {
    prompt += ` ${options.additionalDirections}`;
  }

  return prompt;
}

// Generate multiple style variations using Gemini
export async function generateStyleVariations(
  basePrompt: string,
  targetLanguage: string
): Promise<{
  original: string;
  variations: { styleId: string; prompt: string }[];
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Generate 3 different style interpretations
  const variations: { styleId: string; prompt: string }[] = [];

  // Pick 3 random styles
  const shuffled = [...STYLE_PRESETS].sort(() => Math.random() - 0.5);
  const selectedStyles = shuffled.slice(0, 3);

  for (const style of selectedStyles) {
    const enhancedPrompt = buildEnhancedPrompt({
      basePrompt,
      styleId: style.id,
      cameraId: CAMERA_MOVEMENTS[Math.floor(Math.random() * CAMERA_MOVEMENTS.length)].id,
    });

    variations.push({
      styleId: style.id,
      prompt: enhancedPrompt,
    });
  }

  return {
    original: basePrompt,
    variations,
  };
}

// Get recommended styles based on prompt content
export async function getRecommendedStyles(
  prompt: string,
  language: string
): Promise<StylePreset[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const analysisPrompt = `Analyze this scene prompt and recommend the 3 best visual styles from the list.

Scene: "${prompt}"
Language: ${language}

Available styles:
${STYLE_PRESETS.map(s => `- ${s.id}: ${s.name} - ${s.description}`).join('\n')}

Respond with JSON array of style IDs:
["style_id_1", "style_id_2", "style_id_3"]

Choose styles that best match the mood and content of the scene.`;

  try {
    const result = await model.generateContent(analysisPrompt);
    const text = result.response.text();

    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      const styleIds = JSON.parse(match[0]);
      return STYLE_PRESETS.filter(s => styleIds.includes(s.id));
    }
  } catch (error) {
    console.error('Failed to get recommendations:', error);
  }

  // Fallback: return first 3 styles
  return STYLE_PRESETS.slice(0, 3);
}
