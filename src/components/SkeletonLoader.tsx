import React from 'react';
import { motion } from 'framer-motion';
import { ModeKey } from '@/config/minimind';

interface SkeletonLoaderProps {
  variant?: 'card' | 'text' | 'paragraph' | 'learning-path';
  lines?: number;
  className?: string;
  message?: string;
  modeKey?: ModeKey;
}

// Mode-specific thinking messages with time estimates
const MODE_MESSAGES: Record<ModeKey, { message: string; time: string }> = {
  beginner: { message: 'Making it super simple... 🌱', time: '~5-10 seconds' },
  thinker: { message: 'Analyzing deeply... 🧠', time: '~10-15 seconds' },
  story: { message: 'Crafting your story... 📖', time: '~10-15 seconds' },
  mastery: { message: 'Preparing expert content... 🎓', time: '~15-20 seconds' },
};

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'card', 
  lines = 3,
  className = '',
  message,
  modeKey,
}) => {
  // Use mode-specific message if modeKey is provided
  const displayMessage = modeKey ? MODE_MESSAGES[modeKey].message : message;
  const timeEstimate = modeKey ? MODE_MESSAGES[modeKey].time : null;
  if (variant === 'learning-path') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`space-y-4 ${className}`}
      >
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded-lg bg-muted animate-pulse" />
            <div className="h-3 w-20 rounded-lg bg-muted/70 animate-pulse" />
          </div>
        </div>

        {/* Progress skeleton */}
        <div className="h-16 rounded-2xl bg-muted/50 animate-pulse" />

        {/* Topics skeleton */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded-lg bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded-lg bg-muted/70 animate-pulse" />
              </div>
            </div>
          </div>
        ))}

        {/* Message with accessibility */}
        {displayMessage && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-2 py-4"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 bg-primary rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 * i }}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{displayMessage}</span>
            </div>
            {timeEstimate && (
              <span className="text-[10px] text-muted-foreground/60">{timeEstimate}</span>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`space-y-3 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
            <div className="h-5 w-24 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-12 rounded-full bg-muted/70 animate-pulse" />
          </div>
          <div className="flex gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-muted animate-pulse" />
            <div className="w-7 h-7 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>

        {/* Content lines */}
        <div className="space-y-2 py-4">
          {Array.from({ length: lines }).map((_, i) => (
            <motion.div
              key={i}
              className="h-3 rounded-lg bg-muted animate-pulse"
              style={{ width: `${Math.random() * 30 + 60}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            />
          ))}
        </div>

        {/* Message with accessibility */}
        {displayMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-1 pt-2"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 bg-primary rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 * i }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{displayMessage}</span>
            </div>
            {timeEstimate && (
              <span className="text-[10px] text-muted-foreground/60 ml-6">{timeEstimate}</span>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  }

  if (variant === 'paragraph') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`space-y-2 ${className}`}
      >
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded-lg bg-muted animate-pulse"
            style={{ width: i === lines - 1 ? '60%' : '100%' }}
          />
        ))}
        {displayMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-muted-foreground pt-2 flex flex-col gap-1"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              <span className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="w-1 h-1 bg-primary rounded-full"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 * i }}
                  />
                ))}
              </span>
              {displayMessage}
            </div>
            {timeEstimate && (
              <span className="text-[10px] text-muted-foreground/60 ml-5">{timeEstimate}</span>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Text variant
  return (
    <div className={`h-4 rounded-lg bg-muted animate-pulse ${className}`} />
  );
};

export default SkeletonLoader;
