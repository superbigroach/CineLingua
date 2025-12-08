'use client';

import { useState } from 'react';
import {
  STYLE_PRESETS,
  CAMERA_MOVEMENTS,
  AUDIO_MOODS,
  StylePreset,
  CameraMovement,
  AudioMood,
} from '@/lib/videoEffects';

interface VideoEnhancementSelectorProps {
  onSelect: (options: {
    styleId: string | null;
    cameraId: string | null;
    moodId: string | null;
  }) => void;
  initialStyle?: string | null;
  initialCamera?: string | null;
  initialMood?: string | null;
}

export default function VideoEnhancementSelector({
  onSelect,
  initialStyle = null,
  initialCamera = null,
  initialMood = null,
}: VideoEnhancementSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(initialStyle);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(initialCamera);
  const [selectedMood, setSelectedMood] = useState<string | null>(initialMood);
  const [expandedSection, setExpandedSection] = useState<'style' | 'camera' | 'mood' | null>('style');

  const handleStyleSelect = (styleId: string) => {
    const newStyle = selectedStyle === styleId ? null : styleId;
    setSelectedStyle(newStyle);
    onSelect({ styleId: newStyle, cameraId: selectedCamera, moodId: selectedMood });
  };

  const handleCameraSelect = (cameraId: string) => {
    const newCamera = selectedCamera === cameraId ? null : cameraId;
    setSelectedCamera(newCamera);
    onSelect({ styleId: selectedStyle, cameraId: newCamera, moodId: selectedMood });
  };

  const handleMoodSelect = (moodId: string) => {
    const newMood = selectedMood === moodId ? null : moodId;
    setSelectedMood(newMood);
    onSelect({ styleId: selectedStyle, cameraId: selectedCamera, moodId: newMood });
  };

  const selectedStyleData = STYLE_PRESETS.find(s => s.id === selectedStyle);
  const selectedCameraData = CAMERA_MOVEMENTS.find(c => c.id === selectedCamera);
  const selectedMoodData = AUDIO_MOODS.find(m => m.id === selectedMood);

  return (
    <div className="space-y-3">
      {/* Header with selected summary */}
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm flex items-center gap-2">
          <span>✨</span> Enhance Your Scene
        </h4>
        {(selectedStyle || selectedCamera || selectedMood) && (
          <button
            onClick={() => {
              setSelectedStyle(null);
              setSelectedCamera(null);
              setSelectedMood(null);
              onSelect({ styleId: null, cameraId: null, moodId: null });
            }}
            className="text-xs text-white/40 hover:text-white/60"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Selected Summary Pills */}
      {(selectedStyle || selectedCamera || selectedMood) && (
        <div className="flex flex-wrap gap-2 pb-2">
          {selectedStyleData && (
            <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 flex items-center gap-1">
              {selectedStyleData.emoji} {selectedStyleData.name}
              <button onClick={() => handleStyleSelect(selectedStyle!)} className="ml-1 hover:text-white">×</button>
            </span>
          )}
          {selectedCameraData && (
            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30 flex items-center gap-1">
              {selectedCameraData.emoji} {selectedCameraData.name}
              <button onClick={() => handleCameraSelect(selectedCamera!)} className="ml-1 hover:text-white">×</button>
            </span>
          )}
          {selectedMoodData && (
            <span className="px-2 py-1 text-xs bg-pink-500/20 text-pink-300 rounded-full border border-pink-500/30 flex items-center gap-1">
              {selectedMoodData.emoji} {selectedMoodData.name}
              <button onClick={() => handleMoodSelect(selectedMood!)} className="ml-1 hover:text-white">×</button>
            </span>
          )}
        </div>
      )}

      {/* Style Section */}
      <div className="border border-white/10 rounded-xl overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'style' ? null : 'style')}
          className="w-full p-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-all"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <span>🎨</span>
            Visual Style
            {selectedStyleData && (
              <span className="text-purple-400 text-xs">({selectedStyleData.name})</span>
            )}
          </span>
          <i className={`fas fa-chevron-${expandedSection === 'style' ? 'up' : 'down'} text-white/40`}></i>
        </button>

        {expandedSection === 'style' && (
          <div className="p-3 grid grid-cols-2 gap-2">
            {STYLE_PRESETS.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleSelect(style.id)}
                className={`p-3 rounded-lg text-left transition-all border ${
                  selectedStyle === style.id
                    ? 'bg-purple-500/20 border-purple-500/50 ring-1 ring-purple-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{style.emoji}</span>
                  <span className="font-medium text-sm">{style.name}</span>
                </div>
                <p className="text-white/40 text-xs line-clamp-2">{style.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Camera Movement Section */}
      <div className="border border-white/10 rounded-xl overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'camera' ? null : 'camera')}
          className="w-full p-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-all"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <span>🎥</span>
            Camera Movement
            {selectedCameraData && (
              <span className="text-blue-400 text-xs">({selectedCameraData.name})</span>
            )}
          </span>
          <i className={`fas fa-chevron-${expandedSection === 'camera' ? 'up' : 'down'} text-white/40`}></i>
        </button>

        {expandedSection === 'camera' && (
          <div className="p-3 grid grid-cols-2 gap-2">
            {CAMERA_MOVEMENTS.map((camera) => (
              <button
                key={camera.id}
                onClick={() => handleCameraSelect(camera.id)}
                className={`p-3 rounded-lg text-left transition-all border ${
                  selectedCamera === camera.id
                    ? 'bg-blue-500/20 border-blue-500/50 ring-1 ring-blue-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{camera.emoji}</span>
                  <span className="font-medium text-sm">{camera.name}</span>
                </div>
                <p className="text-white/40 text-xs">{camera.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mood Section */}
      <div className="border border-white/10 rounded-xl overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'mood' ? null : 'mood')}
          className="w-full p-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-all"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <span>🎭</span>
            Mood & Atmosphere
            {selectedMoodData && (
              <span className="text-pink-400 text-xs">({selectedMoodData.name})</span>
            )}
          </span>
          <i className={`fas fa-chevron-${expandedSection === 'mood' ? 'up' : 'down'} text-white/40`}></i>
        </button>

        {expandedSection === 'mood' && (
          <div className="p-3 grid grid-cols-2 gap-2">
            {AUDIO_MOODS.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className={`p-3 rounded-lg text-left transition-all border ${
                  selectedMood === mood.id
                    ? 'bg-pink-500/20 border-pink-500/50 ring-1 ring-pink-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{mood.emoji}</span>
                  <span className="font-medium text-sm">{mood.name}</span>
                </div>
                <p className="text-white/40 text-xs">{mood.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Effect Preview */}
      {(selectedStyle || selectedCamera || selectedMood) && (
        <div className="p-3 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 rounded-xl border border-white/10">
          <p className="text-xs text-white/60 mb-2">Your video will be enhanced with:</p>
          <div className="space-y-1 text-xs">
            {selectedStyleData && (
              <p className="text-purple-300">
                <span className="text-white/40">Style:</span> {selectedStyleData.promptModifier.slice(0, 60)}...
              </p>
            )}
            {selectedCameraData && (
              <p className="text-blue-300">
                <span className="text-white/40">Camera:</span> {selectedCameraData.promptModifier}
              </p>
            )}
            {selectedMoodData && (
              <p className="text-pink-300">
                <span className="text-white/40">Mood:</span> {selectedMoodData.description} - {selectedMoodData.suggestedMusic}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
