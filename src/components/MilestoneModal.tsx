import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Flame, Sparkles, X, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MilestoneData {
  type: 'streak' | 'xp' | 'level' | 'questions' | 'achievement';
  title: string;
  description: string;
  value?: number;
  icon?: React.ReactNode;
}

interface MilestoneModalProps {
  milestone: MilestoneData | null;
  isOpen: boolean;
  onClose: () => void;
  onShare?: () => void;
}

const ConfettiParticle: React.FC<{ delay: number; color: string }> = ({ delay, color }) => (
  <motion.div
    className={cn("absolute w-3 h-3 rounded-full", color)}
    initial={{ 
      y: 0, 
      x: 0, 
      opacity: 1, 
      scale: 0,
      rotate: 0 
    }}
    animate={{ 
      y: [0, -200, 400], 
      x: [0, Math.random() * 200 - 100, Math.random() * 400 - 200], 
      opacity: [1, 1, 0],
      scale: [0, 1, 0.5],
      rotate: [0, 360, 720]
    }}
    transition={{ 
      duration: 2.5, 
      delay, 
      ease: "easeOut" 
    }}
  />
);

const MilestoneModal: React.FC<MilestoneModalProps> = ({ 
  milestone, 
  isOpen, 
  onClose,
  onShare 
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getIcon = () => {
    if (milestone?.icon) return milestone.icon;
    
    switch (milestone?.type) {
      case 'streak':
        return <Flame className="w-12 h-12 text-orange-500" />;
      case 'xp':
        return <Sparkles className="w-12 h-12 text-amber-500" />;
      case 'level':
        return <Star className="w-12 h-12 text-yellow-500" />;
      case 'achievement':
        return <Trophy className="w-12 h-12 text-primary" />;
      default:
        return <Trophy className="w-12 h-12 text-primary" />;
    }
  };

  const getGradient = () => {
    switch (milestone?.type) {
      case 'streak':
        return 'from-orange-500/30 to-red-500/30';
      case 'xp':
        return 'from-amber-500/30 to-yellow-500/30';
      case 'level':
        return 'from-yellow-500/30 to-amber-500/30';
      case 'achievement':
        return 'from-primary/30 to-accent/30';
      default:
        return 'from-primary/30 to-accent/30';
    }
  };

  const confettiColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
  ];

  return (
    <AnimatePresence>
      {isOpen && milestone && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Confetti Container */}
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
              {Array.from({ length: 50 }).map((_, i) => (
                <ConfettiParticle
                  key={i}
                  delay={i * 0.03}
                  color={confettiColors[i % confettiColors.length]}
                />
              ))}
            </div>
          )}

          {/* Modal Content */}
          <motion.div
            className="relative z-10 w-full max-w-sm"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <div className="glass-card rounded-3xl p-8 text-center relative overflow-hidden">
              {/* Animated gradient background */}
              <motion.div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-50",
                  getGradient()
                )}
                animate={{ 
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              {/* Close button */}
              <motion.button
                className="absolute top-4 right-4 p-2 rounded-full glass-card-subtle hover:bg-muted transition-colors z-10"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>

              {/* Icon */}
              <motion.div
                className="relative z-10 inline-flex mb-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", damping: 10 }}
              >
                <div className={cn(
                  "p-6 rounded-3xl bg-gradient-to-br",
                  getGradient()
                )}>
                  {getIcon()}
                </div>
                <motion.div
                  className={cn(
                    "absolute -inset-4 rounded-[2rem] bg-gradient-to-br -z-10 blur-xl",
                    getGradient()
                  )}
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [0.9, 1.1, 0.9]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              {/* Content */}
              <motion.div
                className="relative z-10 space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold gradient-text">
                  {milestone.title}
                </h2>
                {milestone.value && (
                  <motion.p
                    className="text-5xl font-black"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    {milestone.value}
                  </motion.p>
                )}
                <p className="text-muted-foreground">
                  {milestone.description}
                </p>
              </motion.div>

              {/* Actions */}
              <motion.div
                className="relative z-10 flex gap-3 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={onClose}
                >
                  Continue
                </Button>
                {onShare && (
                  <Button
                    className="flex-1 rounded-xl gap-2 premium-button"
                    onClick={onShare}
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MilestoneModal;
