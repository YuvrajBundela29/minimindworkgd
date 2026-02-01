import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';

interface HeroEmptyStateProps {
  onPromptClick: (prompt: string) => void;
}

// Exam-focused prompts for Indian students (JEE, NEET, Class 10/12)
const SUGGESTED_PROMPTS = [
  {
    emoji: '🧬',
    text: 'Explain DNA replication step by step',
    tag: 'Class 12 Biology',
    tagColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  },
  {
    emoji: '⚗️',
    text: 'Why do atoms form chemical bonds?',
    tag: 'Chemistry',
    tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  },
  {
    emoji: '📐',
    text: 'Prove Pythagoras theorem with examples',
    tag: 'Class 10 Math',
    tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  },
  {
    emoji: '💡',
    text: 'How does an electric motor work?',
    tag: 'Physics',
    tagColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  },
  {
    emoji: '🧮',
    text: 'What is integration and why do we need it?',
    tag: 'JEE Math',
    tagColor: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  },
  {
    emoji: '🫀',
    text: 'Explain the human circulatory system',
    tag: 'NEET Biology',
    tagColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
  },
];
const HeroEmptyState: React.FC<HeroEmptyStateProps> = ({
  onPromptClick
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col items-center justify-center py-8"
    >
      {/* Hero Text */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }} 
        className="text-center mb-8"
      >
        <motion.div 
          initial={{ scale: 0.8 }} 
          animate={{ scale: 1 }} 
          transition={{ type: 'spring', damping: 15 }} 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 mb-4"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">MiniMind AI</span>
        </motion.div>
        
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
          Stuck on a concept?
          <br />
          <span className="text-primary">4 AI tutors explain it your way.</span>
        </h1>
        
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          From ELI5 to expert. Stories to logic. Perfect for JEE, NEET & Board exams.
        </p>
      </motion.div>

      {/* Prompt Carousel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }} 
        className="w-full"
      >
        <p className="text-xs font-medium text-muted-foreground mb-3 text-center">
          🎯 Popular study topics...
        </p>
        
        <div className="gap-3 overflow-x-auto pb-4 px-1 -mx-1 custom-scrollbar snap-x snap-mandatory items-center justify-center flex flex-col">
          {SUGGESTED_PROMPTS.map((prompt, index) => (
            <motion.button 
              key={prompt.text} 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.3 + index * 0.05 }} 
              whileHover={{ scale: 1.02, y: -2 }} 
              whileTap={{ scale: 0.98 }} 
              onClick={() => onPromptClick(prompt.text)} 
              className="flex-shrink-0 snap-start group flex items-center gap-3 px-4 py-3.5 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all min-w-[280px] w-full max-w-sm text-left"
              aria-label={`Ask: ${prompt.text}`}
            >
              <span className="text-2xl" role="img" aria-hidden="true">{prompt.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1">
                  {prompt.text}
                </p>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${prompt.tagColor}`}>
                  {prompt.tag}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Trust signal */}
      <motion.p 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.5 }} 
        className="text-[10px] text-muted-foreground/60 mt-4 text-center"
      >
        ✨ Trusted by 10,000+ students • 4 explanation styles • Exam-focused learning
      </motion.p>
    </motion.div>
  );
};

export default HeroEmptyState;