import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSubscription, CREDIT_LIMITS } from '@/contexts/SubscriptionContext';

interface HeroEmptyStateProps {
  onPromptClick: (prompt: string) => void;
  onNavigateToSubscription?: () => void;
}

// Daily challenge prompts
const DAILY_CHALLENGES = [
  { text: 'Explain photosynthesis like you\'re 5', tag: 'Biology', tagColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
  { text: 'What\'s the difference between mitosis and meiosis?', tag: 'Biology', tagColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300' },
  { text: 'Prove why 0.999... = 1', tag: 'Math', tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  { text: 'How does gravity bend light?', tag: 'Physics', tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
  { text: 'Why do we dream?', tag: 'Psychology', tagColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
  { text: 'Explain blockchain like a story', tag: 'Technology', tagColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300' },
  { text: 'How do vaccines work?', tag: 'Medicine', tagColor: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
];

const SUGGESTED_PROMPTS = [
  { emoji: '🧬', text: 'Explain DNA replication step by step', tag: 'Class 12 Biology', tagColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
  { emoji: '⚗️', text: 'Why do atoms form chemical bonds?', tag: 'Chemistry', tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
  { emoji: '📐', text: 'Prove Pythagoras theorem with examples', tag: 'Class 10 Math', tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  { emoji: '💡', text: 'How does an electric motor work?', tag: 'Physics', tagColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
  { emoji: '🧮', text: 'What is integration and why do we need it?', tag: 'JEE Math', tagColor: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
  { emoji: '🫀', text: 'Explain the human circulatory system', tag: 'NEET Biology', tagColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300' },
];

const HeroEmptyState: React.FC<HeroEmptyStateProps> = ({ onPromptClick, onNavigateToSubscription }) => {
  const { tier, getCredits } = useSubscription();
  const credits = getCredits();
  const tierLabel = tier === 'pro' ? 'Pro plan' : tier === 'plus' ? 'Plus plan' : 'Free plan';

  // Today's challenge
  const dayIndex = new Date().getDay();
  const todayChallenge = DAILY_CHALLENGES[dayIndex % DAILY_CHALLENGES.length];

  // Continue where you left off
  const lastHistory = (() => {
    try {
      const saved = localStorage.getItem('minimind-history');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch { /* ignore */ }
    return null;
  })();

  return (
    <div className="flex flex-col items-center justify-center py-6 animate-in fade-in duration-300">
      {/* Hero Text */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">MiniMind AI</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
          Stuck on a concept?
          <br />
          <span className="text-primary">4 AI tutors explain it your way.</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          From ELI5 to expert. Stories to logic. Perfect for JEE, NEET & Board exams.
        </p>
      </div>

      {/* Feature A: Today's Challenge */}
      <motion.div
        className="w-full max-w-sm mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="challenge-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">🎯 Today's Challenge</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${todayChallenge.tagColor}`}>
              {todayChallenge.tag}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground mb-3">{todayChallenge.text}</p>
          <button
            onClick={() => onPromptClick(todayChallenge.text)}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 active:scale-[0.98] transition-transform"
          >
            Try this challenge <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>

      {/* Feature B: Continue where you left off */}
      {lastHistory && (
        <motion.div
          className="w-full max-w-sm mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <button
            onClick={() => onPromptClick(lastHistory.question)}
            className="w-full text-left p-3 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all active:scale-[0.98]"
          >
            <span className="text-xs text-muted-foreground">Continue learning →</span>
            <p className="text-sm font-medium text-foreground mt-1 line-clamp-1">{lastHistory.question}</p>
          </button>
        </motion.div>
      )}

      {/* Popular Topics */}
      <div className="w-full">
        <p className="text-xs font-medium text-muted-foreground mb-3 text-center">
          🎯 Popular study topics
        </p>
        <div className="gap-3 overflow-x-auto pb-4 px-1 -mx-1 custom-scrollbar snap-x snap-mandatory items-center justify-center flex flex-col">
          {SUGGESTED_PROMPTS.map((prompt, index) => (
            <button
              key={prompt.text}
              onClick={() => onPromptClick(prompt.text)}
              className="flex-shrink-0 snap-start group flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 min-w-[280px] w-full max-w-sm text-left active:scale-[0.98]"
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
            </button>
          ))}
        </div>
      </div>

      {/* Trust signal */}
      <p className="text-[10px] text-muted-foreground/60 mt-4 text-center">
        ✨ Trusted by 10,000+ students • 4 explanation styles • Exam-focused learning
      </p>
    </div>
  );
};

export default HeroEmptyState;
