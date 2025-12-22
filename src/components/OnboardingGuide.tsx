import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles, BookOpen, Wand2, Share2, Download, Volume2, MessageSquare, Settings, Languages, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const slides = [
  {
    icon: <Sparkles className="w-12 h-12 text-primary" />,
    title: "Welcome to MiniMind!",
    description: "Your AI learning companion that explains any topic in 4 different styles. Let's take a quick tour of all the features!",
    visual: "🧠✨📚🎓",
  },
  {
    icon: <BookOpen className="w-12 h-12 text-primary" />,
    title: "4 Learning Modes",
    description: "Every question gets explained in 4 unique ways:",
    features: [
      { emoji: "🌱", name: "Beginner", desc: "Simple, friendly explanations" },
      { emoji: "🧠", name: "Thinker", desc: "Deeper analysis & insights" },
      { emoji: "📖", name: "Story", desc: "Learn through storytelling" },
      { emoji: "🎓", name: "Mastery", desc: "Expert-level detail" },
    ],
  },
  {
    icon: <Wand2 className="w-12 h-12 text-primary" />,
    title: "Smart Features",
    description: "Enhance your learning experience:",
    features: [
      { emoji: "✨", name: "Refine Prompt", desc: "AI improves your question" },
      { emoji: "🎤", name: "Voice Input", desc: "Ask questions by speaking" },
      { emoji: "📝", name: "Ekakshar Mode", desc: "Get flashcard-style summaries" },
    ],
  },
  {
    icon: <Maximize2 className="w-12 h-12 text-primary" />,
    title: "Fullscreen & Actions",
    description: "Each mode card has powerful actions:",
    features: [
      { emoji: "⤢", name: "Fullscreen", desc: "Expand any mode for focused reading" },
      { emoji: "🔊", name: "Read Aloud", desc: "Listen to explanations" },
      { emoji: "📋", name: "Copy", desc: "Copy text to clipboard" },
    ],
  },
  {
    icon: <Share2 className="w-12 h-12 text-primary" />,
    title: "Download & Share",
    description: "Save and share your learning:",
    features: [
      { emoji: "📥", name: "Download PDF", desc: "Save formatted PDF to your device" },
      { emoji: "📤", name: "Share PDF", desc: "Share directly to any app" },
    ],
  },
  {
    icon: <Languages className="w-12 h-12 text-primary" />,
    title: "Multi-Language Support",
    description: "Learn in your preferred language! Go to Settings to choose from 20+ languages including Hindi, Tamil, Roman transliterations, and Hinglish.",
    visual: "🌍🗣️",
  },
  {
    icon: <Settings className="w-12 h-12 text-primary" />,
    title: "Settings & History",
    description: "Customize your experience:",
    features: [
      { emoji: "🌙", name: "Dark Mode", desc: "Switch between light and dark themes" },
      { emoji: "📊", name: "Progress", desc: "Track your learning journey" },
      { emoji: "📜", name: "History", desc: "Access past questions & answers" },
    ],
  },
  {
    icon: <MessageSquare className="w-12 h-12 text-primary" />,
    title: "Continue the Conversation",
    description: "Each mode has a chat input at the bottom. Ask follow-up questions to dive deeper into any topic!",
    visual: "💬🔄",
  },
  {
    icon: <Sparkles className="w-12 h-12 text-primary" />,
    title: "You're All Set!",
    description: "Start by typing a question in the input bar at the bottom. MiniMind will explain it in 4 amazing ways. Happy learning! 🎉",
    visual: "🚀✨🎓",
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
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <X className="w-5 h-5" />
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
            <div className="text-4xl mb-6 animate-float">
              {slide.visual}
            </div>
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
                  <span className="text-2xl">{feature.emoji}</span>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{feature.name}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'w-6 bg-primary'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3 justify-center">
            {currentSlide > 0 && (
              <Button
                variant="outline"
                onClick={prevSlide}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            
            <Button
              onClick={nextSlide}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              {currentSlide === slides.length - 1 ? (
                <>
                  Get Started
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

          {/* Skip button */}
          {currentSlide < slides.length - 1 && (
            <button
              onClick={onClose}
              className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tour
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingGuide;
