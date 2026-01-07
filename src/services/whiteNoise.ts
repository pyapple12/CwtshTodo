import { useCallback, useEffect, useRef, useState } from 'react';

// Noise types available
export type NoiseType = 'white' | 'pink' | 'brown';

// Audio context for noise generation
class NoiseGenerator {
  private context: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;

  constructor() {
    // Initialize on demand
  }

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return this.context;
  }

  private createNoiseBuffer(type: NoiseType): AudioBuffer {
    const ctx = this.getContext();
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * 2; // 2 seconds of noise
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      // White noise - random values
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      // Pink noise - 1/f noise (approximation)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else if (type === 'brown') {
      // Brown noise - 1/f^2 noise
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Compensate for gain loss
      }
    }

    return buffer;
  }

  play(type: NoiseType, volume: number = 0.5): void {
    const ctx = this.getContext();

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Stop any existing playback
    this.stop();

    // Create nodes
    this.sourceNode = ctx.createBufferSource();
    this.gainNode = ctx.createGain();

    // Configure
    this.sourceNode.buffer = this.createNoiseBuffer(type);
    this.gainNode.gain.value = volume;

    // Connect
    this.sourceNode.connect(this.gainNode);
    this.gainNode.connect(ctx.destination);

    // Play loop
    this.sourceNode.loop = true;
    this.sourceNode.start();
    this.isPlaying = true;
  }

  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  stop(): void {
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
        this.sourceNode.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
      this.sourceNode = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    this.isPlaying = false;
  }

  isPlayingAudio(): boolean {
    return this.isPlaying;
  }

  destroy(): void {
    this.stop();
    if (this.context) {
      this.context.close();
      this.context = null;
    }
  }
}

// Singleton instance
let noiseGenerator: NoiseGenerator | null = null;

function getNoiseGenerator(): NoiseGenerator {
  if (!noiseGenerator) {
    noiseGenerator = new NoiseGenerator();
  }
  return noiseGenerator;
}

// Hook for using white noise in components
export function useWhiteNoise() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.3);
  const [noiseType, setNoiseType] = useState<NoiseType>('brown');
  const generatorRef = useRef<NoiseGenerator | null>(null);

  useEffect(() => {
    generatorRef.current = getNoiseGenerator();
    return () => {
      // Don't destroy on unmount - keep the generator for reuse
    };
  }, []);

  const play = useCallback((type?: NoiseType, vol?: number) => {
    const gen = generatorRef.current;
    if (gen) {
      const nType = type ?? noiseType;
      const nVolume = vol ?? volume;
      gen.play(nType, nVolume);
      setIsPlaying(true);
      if (type) setNoiseType(type);
      if (vol !== undefined) setVolumeState(vol);
    }
  }, [noiseType, volume]);

  const stop = useCallback(() => {
    const gen = generatorRef.current;
    if (gen) {
      gen.stop();
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, play, stop]);

  const setVolume = useCallback((vol: number) => {
    const gen = generatorRef.current;
    if (gen) {
      gen.setVolume(vol);
      setVolumeState(vol);
    }
  }, []);

  const setType = useCallback((type: NoiseType) => {
    const gen = generatorRef.current;
    if (gen && isPlaying) {
      // Restart with new type
      gen.stop();
      gen.play(type, volume);
      setNoiseType(type);
    } else {
      setNoiseType(type);
    }
  }, [isPlaying, volume]);

  return {
    isPlaying,
    volume,
    noiseType,
    play,
    stop,
    toggle,
    setVolume,
    setType,
  };
}

// Persist volume preference
const VOLUME_KEY = 'cwtshtodo-noise-volume';
const TYPE_KEY = 'cwtshtodo-noise-type';

export function getSavedVolume(): number {
  const saved = localStorage.getItem(VOLUME_KEY);
  return saved ? parseFloat(saved) : 0.3;
}

export function saveVolume(volume: number): void {
  localStorage.setItem(VOLUME_KEY, volume.toString());
}

export function getSavedNoiseType(): NoiseType {
  const saved = localStorage.getItem(TYPE_KEY);
  return (saved as NoiseType) || 'brown';
}

export function saveNoiseType(type: NoiseType): void {
  localStorage.setItem(TYPE_KEY, type);
}
