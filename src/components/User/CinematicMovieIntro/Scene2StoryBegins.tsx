import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { startTypingSound, stopTypingSound, unlockAudio } from '../../../utils/typeSound';

interface Scene2StoryBeginsProps {
  onComplete: () => void;
}

interface Story {
  lines: string[];
}

export const Scene2StoryBegins: React.FC<Scene2StoryBeginsProps> = ({ onComplete }) => {
  const stories: Story[] = [
    {
      lines: ['Some memonts...', 'are too beautiful...', 'to be forgotten.'],
    },
    {
      lines: ['Some people...', 'change our lives...', 'without even realizing it.'],
    },
    {
      lines: ['Some stories...', 'deserve more...', 'than words.'],
    },
  ];

  const [storyIndex, setStoryIndex] = useState(0);
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [currentTypedText, setCurrentTypedText] = useState('');
  const [isWaitingStart, setIsWaitingStart] = useState(true);
  const [isFadingStory, setIsFadingStory] = useState(false);

  const handleTap = () => {
    unlockAudio();
    startTypingSound();
  };

  useEffect(() => {
    let isCancelled = false;

    const runStorySequence = async () => {
      // Force unlock audio
      unlockAudio();

      // Initial 0.8s silence with blinking cursor before typing starts
      setIsWaitingStart(true);
      setTypedLines([]);
      setCurrentTypedText('');
      setIsFadingStory(false);
      stopTypingSound();

      await new Promise((res) => setTimeout(res, 800));
      if (isCancelled) return;

      setIsWaitingStart(false);
      const currentStory = stories[storyIndex];

      // Type each line with exact sound sync matching the uploaded MP3 typewriter track
      for (let l = 0; l < currentStory.lines.length; l++) {
        if (isCancelled) {
          stopTypingSound();
          return;
        }
        const targetLine = currentStory.lines[l];
        let typed = '';

        // Start user's uploaded typewriter MP3 track
        startTypingSound();

        for (let c = 0; c < targetLine.length; c++) {
          if (isCancelled) {
            stopTypingSound();
            return;
          }
          typed += targetLine[c];
          setCurrentTypedText(typed);

          // 115ms per character matches the typewriter typing speed of the uploaded MP3
          await new Promise((res) => setTimeout(res, 115));
        }

        // Stop user's uploaded typewriter MP3 track IMMEDIATELY when line finishes
        stopTypingSound();

        if (isCancelled) return;
        setTypedLines((prev) => [...prev, targetLine]);
        setCurrentTypedText('');

        // 1.2 second pause between lines (sound is completely stopped)
        if (l < currentStory.lines.length - 1) {
          await new Promise((res) => setTimeout(res, 1200));
        }
      }

      // Ensure sound is stopped during scene transition
      stopTypingSound();

      // Keep all 3 lines visible together for 1.8 seconds
      await new Promise((res) => setTimeout(res, 1800));
      if (isCancelled) return;

      // Fade away to black
      setIsFadingStory(true);
      await new Promise((res) => setTimeout(res, 800));
      if (isCancelled) return;

      // Transition to next story or complete scene
      if (storyIndex < stories.length - 1) {
        setStoryIndex((prev) => prev + 1);
      } else {
        onComplete();
      }
    };

    runStorySequence();

    return () => {
      isCancelled = true;
      stopTypingSound();
    };
  }, [storyIndex, onComplete]);

  return (
    <motion.div
      onClick={handleTap}
      onPointerDown={handleTap}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {!isFadingStory && (
          <motion.div
            key={`story-${storyIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(8px)', transition: { duration: 0.8 } }}
            className="flex flex-col items-center space-y-3 max-w-2xl font-serif text-slate-100 font-light text-2xl sm:text-4xl tracking-wider leading-relaxed"
          >
            {/* Completed Stacked Lines */}
            {typedLines.map((line, i) => (
              <div key={i} className="text-slate-100/90">
                {line}
              </div>
            ))}

            {/* Currently Typing Line with Thin Vertical Cursor */}
            {!isWaitingStart && (
              <div className="flex items-center justify-center text-slate-100">
                <span>{currentTypedText}</span>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-[1.5px] h-6 sm:h-8 bg-white ml-1 shadow-[0_0_6px_rgba(255,255,255,0.9)] shrink-0"
                />
              </div>
            )}

            {/* Initial Silence Cursor */}
            {isWaitingStart && (
              <div className="flex items-center justify-center">
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-[1.5px] h-6 sm:h-8 bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
