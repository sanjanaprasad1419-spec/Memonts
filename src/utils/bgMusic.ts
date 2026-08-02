// Soft Background Music Manager for Surili Akhiyon Wale Instrumental

let bgAudio: HTMLAudioElement | null = null;
let fadeInterval: number | null = null;

const BG_MUSIC_PATH = '/sounds/_Surili_Akhiyon_Wale_Instrumental_Ringtone_(by Fringster.com).mp3';
const TARGET_VOLUME = 0.12; // 12% volume - very light, soft background atmosphere

const getBgAudio = (): HTMLAudioElement => {
  if (!bgAudio) {
    bgAudio = new Audio(BG_MUSIC_PATH);
    bgAudio.volume = 0; // Start at 0 for smooth fade-in
    bgAudio.loop = true;
    
    // Fallback if primary name fails
    bgAudio.onerror = () => {
      if (bgAudio) {
        bgAudio.src = '/sounds/bg_music.mp3';
      }
    };
  }
  return bgAudio;
};

// Start soft background music with a gentle fade-in to ~12% volume
export const startSoftBgMusic = () => {
  try {
    const audio = getBgAudio();
    
    if (audio.paused) {
      audio.volume = 0;
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Smoothly fade in volume over 2 seconds up to 12% target volume
            if (fadeInterval) clearInterval(fadeInterval);
            let currentVol = 0;
            fadeInterval = window.setInterval(() => {
              currentVol += 0.01;
              if (currentVol >= TARGET_VOLUME) {
                currentVol = TARGET_VOLUME;
                if (fadeInterval) clearInterval(fadeInterval);
              }
              if (audio) audio.volume = currentVol;
            }, 150);
          })
          .catch((err) => {
            console.info('Autoplay background music waiting for interaction:', err);
          });
      }
    }
  } catch (e) {
    console.info('Background music play error:', e);
  }
};

// Stop or pause background music smoothly
export const stopBgMusic = () => {
  try {
    if (bgAudio && !bgAudio.paused) {
      if (fadeInterval) clearInterval(fadeInterval);
      let currentVol = bgAudio.volume;
      fadeInterval = window.setInterval(() => {
        currentVol -= 0.02;
        if (currentVol <= 0) {
          currentVol = 0;
          if (bgAudio) {
            bgAudio.volume = 0;
            bgAudio.pause();
          }
          if (fadeInterval) clearInterval(fadeInterval);
        } else if (bgAudio) {
          bgAudio.volume = currentVol;
        }
      }, 100);
    }
  } catch (e) {
    console.info('Background music stop error:', e);
  }
};
