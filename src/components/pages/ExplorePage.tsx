import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, ShoppingBag, Award, BookOpen, Target, 
  MessageCircle, Zap, GraduationCap, Compass
} from 'lucide-react';

interface ExplorePageProps {
  onNavigate: (page: string) => void;
}

const EXPLORE_ITEMS = [
  { id: 'arena', label: 'Arena', description: 'Daily challenge — compete & win coins', icon: Trophy, gradient: 'from-amber-500 to-orange-500', emoji: '🏆' },
  { id: 'shop', label: 'Shop', description: 'Spend coins on themes & power-ups', icon: ShoppingBag, gradient: 'from-emerald-500 to-green-500', emoji: '🛍️' },
  { id: 'certificates', label: 'Certificates', description: 'View & download your earned certificates', icon: Award, gradient: 'from-blue-500 to-cyan-500', emoji: '🎓' },
  { id: 'learningpath', label: 'Study Plans', description: 'AI-powered structured learning paths', icon: GraduationCap, gradient: 'from-violet-500 to-purple-500', emoji: '📚' },
  { id: 'purposelens', label: 'Learning Purpose', description: 'Set your learning context (JEE, NEET, etc.)', icon: Target, gradient: 'from-pink-500 to-rose-500', emoji: '🎯' },
  { id: 'explainback', label: 'Test Yourself', description: 'Explain concepts back to check understanding', icon: MessageCircle, gradient: 'from-teal-500 to-cyan-500', emoji: '🧠' },
  { id: 'ekakshar', label: 'Quick Recall', description: 'Flashcard-style one-word summaries', icon: Zap, gradient: 'from-yellow-500 to-amber-500', emoji: '⚡' },
];

const ExplorePage: React.FC<ExplorePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-5 pb-24 max-w-lg mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center pt-2"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 mb-3">
          <Compass className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-primary">Explore</span>
        </div>
        <h1 className="text-xl font-bold text-foreground">Discover MiniMind Features</h1>
        <p className="text-xs text-muted-foreground mt-1">All your learning tools in one place</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-3">
        {EXPLORE_ITEMS.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all text-left group"
            onClick={() => onNavigate(item.id)}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl shrink-0 shadow-md`}>
              {item.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                {item.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
            </div>
            <div className="text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;
