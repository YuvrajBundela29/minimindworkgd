import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface CoachMarkProps {
  id: string;
  title: string;
  description: string;
  emoji?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  isVisible: boolean;
  onDismiss: (id: string) => void;
  targetRef?: React.RefObject<HTMLElement>;
}

const CoachMark: React.FC<CoachMarkProps> = ({
  id,
  title,
  description,
  emoji = '💡',
  position = 'bottom',
  isVisible,
  onDismiss,
}) => {
  if (!isVisible) return null;

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 10 : -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`absolute z-50 ${positionClasses[position]} w-64`}
          role="tooltip"
          aria-live="polite"
        >
          <div className="relative bg-card border border-primary/30 rounded-xl p-4 shadow-lg">
            {/* Arrow */}
            <div 
              className={`absolute w-3 h-3 bg-card border-l border-t border-primary/30 transform rotate-45 ${
                position === 'bottom' ? '-top-1.5 left-6' : 
                position === 'top' ? '-bottom-1.5 left-6 rotate-[225deg]' : ''
              }`}
            />
            
            {/* Close button */}
            <button
              onClick={() => onDismiss(id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Dismiss tip"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0" role="img" aria-hidden="true">
                {emoji}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground mb-1">{title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>

            {/* Got it button */}
            <Button
              size="sm"
              onClick={() => onDismiss(id)}
              className="w-full mt-3 h-8 text-xs"
            >
              Got it!
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Floating coach mark for nav items
export const FloatingCoachMark: React.FC<{
  isVisible: boolean;
  onDismiss: () => void;
  emoji: string;
  title: string;
  description: string;
}> = ({ isVisible, onDismiss, emoji, title, description }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-4 right-4 z-50"
          role="alert"
          aria-live="polite"
        >
          <div className="bg-card border border-primary/30 rounded-2xl p-4 shadow-xl max-w-sm mx-auto">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">Tip</span>
                </div>
                <h4 className="font-semibold text-sm text-foreground mb-1">{title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
              <button
                onClick={onDismiss}
                className="p-1.5 rounded-full hover:bg-muted transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <Button
              size="sm"
              onClick={onDismiss}
              className="w-full mt-3 h-9"
            >
              Got it! 👍
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CoachMark;
