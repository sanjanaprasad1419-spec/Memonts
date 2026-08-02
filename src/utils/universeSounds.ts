// Universe Sound FX Utility with safe audio loading and error handling

const audioCache: Record<string, HTMLAudioElement> = {};

export const playUniverseSound = (soundName: 'hover' | 'click' | 'heartbeat' | 'enter') => {
  try {
    const path = `/sounds/${soundName}.mp3`;
    
    if (!audioCache[soundName]) {
      const audio = new Audio(path);
      audio.volume = soundName === 'heartbeat' ? 0.35 : 0.2;
      audioCache[soundName] = audio;
    }

    const audio = audioCache[soundName];
    audio.currentTime = 0;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fail silently without throwing console errors if sound file is missing or blocked
      });
    }
  } catch {
    // Fail gracefully
  }
};
