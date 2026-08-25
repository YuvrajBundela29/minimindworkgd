import React from 'react';
import { motion } from 'framer-motion';
import minimindLogo from '@/assets/minimind-logo.png';

interface HeroEmptyStateProps {
  onPromptClick: (prompt: string) => void;
}

const SUGGESTED_PROMPTS = [
  { emoji: '🧬', text: 'How does DNA replicate itself before cell division?', tag: 'Biology' },
  { emoji: '⚡', text: 'Why does E = mc² matter and what does it really mean?', tag: 'Physics' },
  { emoji: '🧮', text: 'What is calculus and why was it invented?', tag: 'Maths' },
  { emoji: '⚗️', text: 'Why do some reactions release heat and others absorb it?', tag: 'Chemistry' },
  { emoji: '🌍', text: 'How do tectonic plates shape Earth over millions of years?', tag: 'Geography' },
  { emoji: '🤖', text: 'How does artificial intelligence actually learn from data?', tag: 'Technology' },
];

const HeroEmptyState: React.FC<HeroEmptyStateProps> = ({ onPromptClick }) => {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center pt-6 pb-2">
      {/* Brand */}
      <motion.div
        className="flex items-center justify-center gap-2.5 mb-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <img src={minimindLogo} alt="MiniMind" className="w-9 h-9 sm:w-11 sm:h-11" width={44} height={44} />
        <span className="logo-text-premium text-2xl sm:text-3xl">MiniMind</span>
      </motion.div>

      <motion.h1
        className="text-lg sm:text-2xl font-heading font-semibold text-foreground leading-snug mb-1.5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        What do you want to <span className="gradient-text">understand today?</span>
      </motion.h1>

      <motion.p
        className="text-xs sm:text-sm text-muted-foreground max-w-md mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        One question — four explanations, from playful Beginner to exam-ready Mastery.
      </motion.p>

      {/* Suggestion grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 px-1">
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <motion.button
            key={prompt.text}
            onClick={() => onPromptClick(prompt.text)}
            className="group flex flex-col items-start gap-1.5 p-3 sm:p-3.5 rounded-2xl border border-border/60 bg-card/70 hover:bg-card hover:border-primary/30 hover:shadow-sm transition-all text-left min-h-[44px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 + i * 0.04 }}
            whileTap={{ scale: 0.98 }}
            aria-label={`Ask: ${prompt.text}`}
          >
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="text-base leading-none" role="img" aria-hidden="true">{prompt.emoji}</span>
              {prompt.tag}
            </span>
            <span className="text-[13px] sm:text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
              {prompt.text}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default HeroEmptyState;
