import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles, BookOpen, Zap, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simplified 4-slide onboarding focused on core value proposition
const slides = [
  {
    icon: <Sparkles className="w-12 h-12 text-primary" />,
    title: "Welcome to MiniMind! 🎓",
    description: "Your AI study companion that explains any concept in 4 different styles. Perfect for JEE, NEET & Board exam prep!",
    visual: "🧠✨📚🎓",
    tip: "Trusted by 10,000+ Indian students",
  },
  {
    icon: <BookOpen className="w-12 h-12 text-primary" />,
    title: "4 Ways to Understand",
    description: "Every question gets explained in 4 unique styles:",
    features: [
      { emoji: "🌱", name: "Beginner", desc: "ELI5 - Super simple explanations" },
      { emoji: "🧠", name: "Thinker", desc: "Deep analysis & logic" },
      { emoji: "📖", name: "Story", desc: "Learn through real-world stories" },
      { emoji: "🎓", name: "Mastery", desc: "Expert-level for toppers" },
    ],
  },
  {
    icon: <Zap className="w-12 h-12 text-primary" />,
    title: "Quick Recall ⚡",
    description: "Get flashcard-style one-word summaries for rapid revision. Perfect before exams!",
    features: [
      { emoji: "📝", name: "One-Word Summary", desc: "Condense any topic to essentials" },
      { emoji: "🗣️", name: "Voice Input", desc: "Ask questions by speaking" },
      { emoji: "📥", name: "Download PDF", desc: "Save explanations for offline study" },
    ],
  },
  {
    icon: <MessageCircle className="w-12 h-12 text-primary" />,
    title: "You're All Set! 🚀",
    description: "Type any question below to get started. MiniMind will explain it in 4 amazing ways. Happy learning!",
    visual: "✨🎯📚",
    tip: "Tip: Try asking about DNA replication or Pythagoras theorem!",
  },
];

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome guide"
      >
        {/* Close/Skip button - more prominent */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
          aria-label="Skip tour"
        >
          Skip
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <motion.div
          key={currentSlide}
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {/* Icon */}
          <motion.div
            className="mb-6 flex justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
          >
            <div className="p-4 rounded-full bg-primary/10">
              {slide.icon}
            </div>
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {slide.title}
          </h2>

          {/* Description */}
          <p className="text-muted-foreground mb-6">
            {slide.description}
          </p>

          {/* Visual emoji */}
          {slide.visual && (
            <div className="text-4xl mb-4 animate-float" role="img" aria-hidden="true">
              {slide.visual}
            </div>
          )}

          {/* Tip text */}
          {slide.tip && (
            <p className="text-xs text-primary font-medium mb-6 bg-primary/10 px-3 py-2 rounded-full inline-block">
              {slide.tip}
            </p>
          )}

          {/* Features list */}
          {slide.features && (
            <div className="space-y-3 mb-6">
              {slide.features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 text-left"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                >
                  <span className="text-2xl" role="img" aria-hidden="true">{feature.emoji}</span>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{feature.name}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6" role="tablist" aria-label="Onboarding progress">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                role="tab"
                aria-selected={idx === currentSlide}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3 justify-center">
            {currentSlide > 0 && (
              <Button
                variant="outline"
                onClick={prevSlide}
                className="gap-2 h-11 min-w-[100px]"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            
            <Button
              onClick={nextSlide}
              className="gap-2 bg-primary hover:bg-primary/90 h-11 min-w-[120px]"
            >
              {currentSlide === slides.length - 1 ? (
                <>
                  Start Learning
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingGuide;
