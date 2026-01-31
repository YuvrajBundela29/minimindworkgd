import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Shield, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  streak_shields: number;
  xp: number;
  level: number;
}

interface StreakCounterProps {
  variant?: 'full' | 'compact' | 'minimal';
  className?: string;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ variant = 'compact', className }) => {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreakData();
  }, []);

  const fetchStreakData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak, streak_shields, xp, level')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching streak data:', error);
      }

      if (data) {
        setStreakData(data);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFlameSize = () => {
    if (!streakData) return 'w-5 h-5';
    if (streakData.current_streak >= 30) return 'w-8 h-8';
    if (streakData.current_streak >= 7) return 'w-7 h-7';
    if (streakData.current_streak >= 3) return 'w-6 h-6';
    return 'w-5 h-5';
  };

  const getFlameColor = () => {
    if (!streakData || streakData.current_streak === 0) return 'text-muted-foreground';
    if (streakData.current_streak >= 30) return 'text-red-500';
    if (streakData.current_streak >= 7) return 'text-orange-500';
    if (streakData.current_streak >= 3) return 'text-amber-500';
    return 'text-yellow-500';
  };

  if (loading) {
    return (
      <div className={cn("animate-pulse bg-muted rounded-full h-8 w-16", className)} />
    );
  }

  if (!streakData) {
    return null;
  }

  if (variant === 'minimal') {
    return (
      <motion.div
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full glass-card-subtle",
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={streakData.current_streak > 0 ? { 
            scale: [1, 1.1, 1],
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Flame className={cn(getFlameSize(), getFlameColor())} />
        </motion.div>
        <span className="text-sm font-semibold">{streakData.current_streak}</span>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-2xl glass-card",
          className
        )}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
      >
        <motion.div
          className="relative"
          animate={streakData.current_streak > 0 ? { 
            scale: [1, 1.15, 1],
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Flame className={cn(getFlameSize(), getFlameColor(), "drop-shadow-glow")} />
          {streakData.current_streak >= 7 && (
            <motion.div 
              className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-full blur-md -z-10"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
        <div className="flex flex-col">
          <span className="text-lg font-bold gradient-text">{streakData.current_streak}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">day streak</span>
        </div>
        {streakData.streak_shields > 0 && (
          <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-primary/10 rounded-full">
            <Shield className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium">{streakData.streak_shields}</span>
          </div>
        )}
      </motion.div>
    );
  }

  // Full variant
  return (
    <motion.div
      className={cn(
        "glass-card rounded-3xl p-6 space-y-4",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            className="relative"
            animate={streakData.current_streak > 0 ? { 
              scale: [1, 1.1, 1],
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
              <Flame className={cn("w-10 h-10", getFlameColor(), "drop-shadow-glow")} />
            </div>
            {streakData.current_streak >= 7 && (
              <motion.div 
                className="absolute -inset-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-xl -z-10"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold gradient-text">{streakData.current_streak}</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            <p className="text-sm text-muted-foreground">Current Streak</p>
          </div>
        </div>
        
        {streakData.streak_shields > 0 && (
          <motion.div 
            className="flex items-center gap-2 px-3 py-2 glass-card-subtle rounded-xl"
            whileHover={{ scale: 1.05 }}
          >
            <Shield className="w-5 h-5 text-primary" />
            <div className="text-right">
              <p className="text-lg font-bold">{streakData.streak_shields}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Shields</p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card-subtle rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground uppercase">Best Streak</span>
          </div>
          <p className="text-2xl font-bold">{streakData.longest_streak}</p>
        </div>
        <div className="glass-card-subtle rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-muted-foreground uppercase">Total XP</span>
          </div>
          <p className="text-2xl font-bold">{streakData.xp.toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default StreakCounter;
