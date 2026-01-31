import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles, Crown, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface XPData {
  xp: number;
  level: number;
}

interface XPProgressBarProps {
  variant?: 'full' | 'compact' | 'minimal';
  className?: string;
  showLabel?: boolean;
}

const LEVEL_TITLES = [
  'Curious Beginner',
  'Knowledge Seeker',
  'Eager Learner',
  'Rising Scholar',
  'Mind Explorer',
  'Wisdom Apprentice',
  'Insight Hunter',
  'Truth Seeker',
  'Knowledge Master',
  'Wisdom Sage',
] as const;

const getXPForLevel = (level: number) => {
  // XP needed for each level: 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000...
  return Math.floor(100 * Math.pow(2, level - 1));
};

const getTotalXPForLevel = (level: number) => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i);
  }
  return total;
};

const XPProgressBar: React.FC<XPProgressBarProps> = ({ 
  variant = 'compact', 
  className,
  showLabel = true 
}) => {
  const [xpData, setXpData] = useState<XPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    fetchXPData();
  }, []);

  const fetchXPData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_streaks')
        .select('xp, level')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching XP data:', error);
      }

      if (data) {
        setXpData(data);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (xpData) {
      const xpInCurrentLevel = xpData.xp - getTotalXPForLevel(xpData.level);
      const xpNeededForNextLevel = getXPForLevel(xpData.level);
      const progress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;
      
      // Animate progress
      setTimeout(() => setAnimatedProgress(progress), 100);
    }
  }, [xpData]);

  const getLevelIcon = () => {
    if (!xpData) return Star;
    if (xpData.level >= 10) return Crown;
    if (xpData.level >= 5) return Sparkles;
    return Star;
  };

  const getLevelTitle = () => {
    if (!xpData) return 'Curious Beginner';
    const index = Math.min(xpData.level - 1, LEVEL_TITLES.length - 1);
    return LEVEL_TITLES[index];
  };

  if (loading) {
    return (
      <div className={cn("animate-pulse bg-muted rounded-2xl h-12 w-full", className)} />
    );
  }

  if (!xpData) {
    return null;
  }

  const LevelIcon = getLevelIcon();
  const xpInCurrentLevel = xpData.xp - getTotalXPForLevel(xpData.level);
  const xpNeededForNextLevel = getXPForLevel(xpData.level);

  if (variant === 'minimal') {
    return (
      <motion.div
        className={cn("flex items-center gap-2", className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-xs font-bold">{xpData.xp}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full glass-card-subtle">
          <LevelIcon className="w-3 h-3 text-amber-500" />
          <span className="text-xs font-medium">Lv.{xpData.level}</span>
        </div>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn("glass-card rounded-2xl p-4", className)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20"
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <LevelIcon className="w-5 h-5 text-amber-500" />
            </motion.div>
            <div>
              <p className="text-sm font-semibold">Level {xpData.level}</p>
              {showLabel && (
                <p className="text-xs text-muted-foreground">{getLevelTitle()}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold gradient-text">{xpData.xp.toLocaleString()} XP</p>
            <p className="text-[10px] text-muted-foreground">
              {xpNeededForNextLevel - xpInCurrentLevel} to level up
            </p>
          </div>
        </div>
        
        <div className="relative h-3 rounded-full overflow-hidden bg-muted">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full xp-progress-bar"
            initial={{ width: 0 }}
            animate={{ width: `${animatedProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-white/30"
            initial={{ width: 0 }}
            animate={{ width: `${animatedProgress}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ filter: 'blur(4px)' }}
          />
        </div>
      </motion.div>
    );
  }

  // Full variant
  return (
    <motion.div
      className={cn("glass-card rounded-3xl p-6 space-y-4", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-4">
        <motion.div
          className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20"
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          <LevelIcon className="w-8 h-8 text-amber-500" />
          <motion.div 
            className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-lg -z-10"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">Level {xpData.level}</span>
            <span className="text-sm text-muted-foreground">• {getLevelTitle()}</span>
          </div>
          <p className="text-lg font-semibold gradient-text">{xpData.xp.toLocaleString()} XP</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress to Level {xpData.level + 1}</span>
          <span className="font-medium">
            {xpInCurrentLevel.toLocaleString()} / {xpNeededForNextLevel.toLocaleString()}
          </span>
        </div>
        <div className="relative h-4 rounded-full overflow-hidden bg-muted">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full xp-progress-bar"
            initial={{ width: 0 }}
            animate={{ width: `${animatedProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-white/40"
            initial={{ width: 0 }}
            animate={{ width: `${animatedProgress}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ filter: 'blur(6px)' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default XPProgressBar;
