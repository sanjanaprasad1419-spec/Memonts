// Typewriter Audio Manager strictly playing the user's newly uploaded MP3 file

let typingAudio: HTMLAudioElement | null = null;
let isAudioUnlocked = false;

const NEW_UPLOADED_MP3_PATH =
  '/sounds/estudiocoati-maquina-de-escribir_tipeo-typewritter-machine-typing-218133 (1).mp3';

// Get or initialize the user's newly uploaded typewriter MP3 file
const getAudio = (): HTMLAudioElement => {
  if (!typingAudio) {
    typingAudio = new Audio(NEW_UPLOADED_MP3_PATH);
    typingAudio.volume = 1.0; // 100% Maximum Volume
    typingAudio.loop = true; // Loops seamlessly while active typing is in progress

    typingAudio.onerror = () => {
      if (typingAudio) {
        typingAudio.src = '/sounds/typing.mp3';
      }
    };
  }
  return typingAudio;
};

// Force unlock browser audio permissions on user interaction
export const unlockAudio = () => {
  if (isAudioUnlocked) return;
  isAudioUnlocked = true;

  try {
    const audio = getAudio();
    audio.load();
  } catch (e) {
    console.info('Audio preload:', e);
  }
};

// Register automatic unlock listeners across document/window
if (typeof window !== 'undefined') {
  const events = ['click', 'keydown', 'pointerdown', 'touchstart', 'mousedown', 'mousemove', 'scroll'];
  const handler = () => {
    unlockAudio();
  };
  events.forEach((evt) => {
    window.addEventListener(evt, handler, { passive: true, once: false });
  });

  unlockAudio();
}

// Start playing the user's newly uploaded typewriter MP3 track when line typing starts
export const startTypingSound = () => {
  unlockAudio();

  try {
    const audio = getAudio();
    audio.volume = 1.0;

    if (audio.paused) {
      audio.currentTime = 0;
      const p = audio.play();
      if (p !== undefined) {
        p.catch((err) => {
          console.info('Autoplay waiting for tap:', err);
        });
      }
    }
  } catch (e) {
    console.info('Play error:', e);
  }
};

// Stop playing the user's newly uploaded typewriter MP3 track IMMEDIATELY when line typing stops
export const stopTypingSound = () => {
  try {
    if (typingAudio && !typingAudio.paused) {
      typingAudio.pause();
      typingAudio.currentTime = 0;
    }
  } catch (e) {
    console.info('Stop error:', e);
  }
};

// Per-character trigger delegating to the newly uploaded MP3 track
export const playSoftClickSound = () => {
  startTypingSound();
};
