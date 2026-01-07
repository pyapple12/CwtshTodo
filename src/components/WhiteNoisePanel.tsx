import React, { useEffect } from 'react';
import { useWhiteNoise, NoiseType, getSavedVolume, getSavedNoiseType, saveVolume, saveNoiseType } from '../services/whiteNoise';

interface WhiteNoisePanelProps {
  compact?: boolean;
}

const NOISE_OPTIONS: { type: NoiseType; label: string; description: string; color: string }[] = [
  { type: 'white', label: 'White', description: 'Uniform random noise', color: '#6B7280' },
  { type: 'pink', label: 'Pink', description: 'Softer, natural sound', color: '#8B5CF6' },
  { type: 'brown', label: 'Brown', description: 'Deep, calming rumble', color: '#059669' },
];

export const WhiteNoisePanel: React.FC<WhiteNoisePanelProps> = ({ compact = false }) => {
  const {
    isPlaying,
    volume,
    noiseType,
    play,
    toggle,
    setVolume,
    setType,
  } = useWhiteNoise();

  // Load saved preferences
  useEffect(() => {
    const savedVolume = getSavedVolume();
    const savedType = getSavedNoiseType();
    setVolume(savedVolume);
    setType(savedType);
  }, [setVolume, setType]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    saveVolume(newVolume);
  };

  const handleTypeChange = (type: NoiseType) => {
    setType(type);
    saveNoiseType(type);
    // Restart with new type if playing
    if (isPlaying) {
      play(type, volume);
    }
  };

  return (
    <div className={`bg-white rounded-2xl ${compact ? 'p-4' : 'p-6'} shadow-sm border border-gray-100`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-gray-800 ${compact ? 'text-sm' : 'text-lg'}`}>
          Background Noise
        </h3>
        <button
          onClick={toggle}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isPlaying
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isPlaying ? '⏹ Stop' : '▶ Play'}
        </button>
      </div>

      {/* Volume control */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Volume</span>
          <span className="text-sm text-gray-500">{Math.round(volume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          disabled={!isPlaying}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50"
        />
      </div>

      {/* Noise type selector */}
      <div className="grid grid-cols-3 gap-2">
        {NOISE_OPTIONS.map((option) => (
          <button
            key={option.type}
            onClick={() => handleTypeChange(option.type)}
            disabled={!isPlaying}
            className={`p-3 rounded-lg text-center transition-all ${
              noiseType === option.type
                ? 'ring-2 ring-offset-1'
                : 'hover:bg-gray-50'
            } disabled:opacity-50`}
            style={{
              backgroundColor: noiseType === option.type ? `${option.color}15` : undefined,
              ['--tw-ring-color' as string]: option.color,
            } as React.CSSProperties}
          >
            <div
              className="w-8 h-8 mx-auto rounded-full mb-2 flex items-center justify-center"
              style={{ backgroundColor: `${option.color}20` }}
            >
              <div
                className="w-4 h-4 rounded-full animate-pulse"
                style={{
                  backgroundColor: option.color,
                  opacity: isPlaying && noiseType === option.type ? 1 : 0.3,
                }}
              />
            </div>
            <p className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`} style={{ color: option.color }}>
              {option.label}
            </p>
            {!compact && (
              <p className="text-xs text-gray-500 mt-1">{option.description}</p>
            )}
          </button>
        ))}
      </div>

      {/* Audio indicator */}
      {isPlaying && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 bg-primary-500 rounded-full animate-pulse"
                style={{
                  height: `${12 + Math.sin(Date.now() / 200 + i * 0.8) * 8}px`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">Playing {noiseType} noise</span>
        </div>
      )}
    </div>
  );
};

export default WhiteNoisePanel;
