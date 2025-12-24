import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
interface HeroEmptyStateProps {
  onPromptClick: (prompt: string) => void;
}
const SUGGESTED_PROMPTS = [{
  emoji: '🤖',
  text: 'How does AI actually work?'
}, {
  emoji: '📈',
  text: 'Explain stock market like I\'m 10'
}, {
  emoji: '🌌',
  text: 'Why do black holes exist?'
}, {
  emoji: '🧬',
  text: 'What is DNA and why is it important?'
}, {
  emoji: '💡',
  text: 'How does electricity power our homes?'
}, {
  emoji: '🌍',
  text: 'Why is climate change happening?'
}];
const HeroEmptyState: React.FC<HeroEmptyStateProps> = ({
  onPromptClick
}) => {
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} className="flex flex-col items-center justify-center py-8">
      {/* Hero Text */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.1
    }} className="text-center mb-8">
        <motion.div initial={{
        scale: 0.8
      }} animate={{
        scale: 1
      }} transition={{
        type: 'spring',
        damping: 15
      }} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">MiniMind AI</span>
        </motion.div>
        
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
          Ask anything.
          <br />
          <span className="text-primary">Understand it 4 ways.</span>
        </h1>
        
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          From simple to expert. Stories to logic. One question, four perspectives.
        </p>
      </motion.div>

      {/* Prompt Carousel */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.2
    }} className="w-full">
        <p className="text-xs font-medium text-muted-foreground mb-3 text-center">
          Try asking...
        </p>
        
        <div className="gap-3 overflow-x-auto pb-4 px-1 -mx-1 custom-scrollbar snap-x snap-mandatory items-center justify-center flex flex-col">
          {SUGGESTED_PROMPTS.map((prompt, index) => <motion.button key={prompt.text} initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.3 + index * 0.05
        }} whileHover={{
          scale: 1.02,
          y: -2
        }} whileTap={{
          scale: 0.98
        }} onClick={() => onPromptClick(prompt.text)} className="flex-shrink-0 snap-start group flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all min-w-[200px] text-left">
              <span className="text-xl">{prompt.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {prompt.text}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </motion.button>)}
        </div>
      </motion.div>

      {/* Trust signal */}
      <motion.p initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 0.5
    }} className="text-[10px] text-muted-foreground/60 mt-4">
        Powered by AI • 4 explanation modes • Unlimited during Early Access
      </motion.p>
    </motion.div>;
};
export default HeroEmptyState;