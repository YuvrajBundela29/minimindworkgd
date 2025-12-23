import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Flame, BookOpen } from 'lucide-react';
import { ModeKey, modes } from '@/config/minimind';
import type { HistoryItem } from '@/pages/Index';

interface ProgressPageProps {
  stats: {
    totalQuestions: number;
    todayQuestions: number;
    favoriteMode: ModeKey;
    streak: number;
  };
  history: HistoryItem[];
}

const ProgressPage: React.FC<ProgressPageProps> = ({ stats, history }) => {
  // Calculate mode usage
  const modeUsage = history.reduce((acc, item) => {
    Object.keys(item.answers).forEach((mode) => {
      acc[mode as ModeKey] = (acc[mode as ModeKey] || 0) + 1;
    });
    return acc;
  }, {} as Record<ModeKey, number>);

  const maxUsage = Math.max(...Object.values(modeUsage), 1);

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">📊</div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Your Progress</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your learning journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          className="mode-card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
          <div className="text-3xl font-bold text-foreground">{stats.totalQuestions}</div>
          <div className="text-xs text-muted-foreground">Total Questions</div>
        </motion.div>

        <motion.div
          className="mode-card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Target className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
          <div className="text-3xl font-bold text-foreground">{stats.todayQuestions}</div>
          <div className="text-xs text-muted-foreground">Today</div>
        </motion.div>

        <motion.div
          className="mode-card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
          <div className="text-3xl font-bold text-foreground">{stats.streak}</div>
          <div className="text-xs text-muted-foreground">Day Streak</div>
        </motion.div>

        <motion.div
          className="mode-card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-purple-500" />
          <div className="text-3xl font-bold text-foreground">{history.length}</div>
          <div className="text-xs text-muted-foreground">Saved Sessions</div>
        </motion.div>
      </div>

      {/* Mode Usage */}
      <motion.div
        className="mode-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-foreground">Mode Usage</h2>
        </div>

        <div className="space-y-3">
          {(Object.keys(modes) as ModeKey[]).map((modeKey) => {
            const usage = modeUsage[modeKey] || 0;
            const percentage = (usage / maxUsage) * 100;

            return (
              <div key={modeKey} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>{modes[modeKey].icon}</span>
                    <span className="text-foreground">{modes[modeKey].name}</span>
                  </span>
                  <span className="text-muted-foreground">{usage} uses</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Learning Tips */}
      <motion.div
        className="mode-card bg-gradient-to-br from-primary/5 to-accent/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h2 className="font-heading font-semibold text-foreground mb-2">💡 Learning Tip</h2>
        <p className="text-sm text-muted-foreground">
          Try using different modes for the same question! Beginner mode simplifies, 
          Story mode makes it memorable, Thinker mode adds logic, and Mastery mode goes deep.
        </p>
      </motion.div>
    </div>
  );
};

export default ProgressPage;
