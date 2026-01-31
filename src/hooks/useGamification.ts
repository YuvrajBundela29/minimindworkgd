import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  streak_shields: number;
  xp: number;
  level: number;
  last_activity_date: string | null;
}

interface MilestoneData {
  type: 'streak' | 'xp' | 'level' | 'questions' | 'achievement';
  title: string;
  description: string;
  value?: number;
}

const XP_PER_QUESTION = 10;
const XP_PER_MODE_BONUS = 5;
const STREAK_BONUS_MULTIPLIER = 0.1; // 10% bonus per streak day

const getXPForLevel = (level: number) => {
  return Math.floor(100 * Math.pow(2, level - 1));
};

const getTotalXPForLevel = (level: number) => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i);
  }
  return total;
};

export const useGamification = () => {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [milestone, setMilestone] = useState<MilestoneData | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);

  const fetchStreakData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return null;
      }

      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching streak data:', error);
        return null;
      }

      if (data) {
        setStreakData(data);
        return data;
      }

      // Create initial streak data if it doesn't exist
      const { data: newData, error: insertError } = await supabase
        .from('user_streaks')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating streak data:', insertError);
        return null;
      }

      setStreakData(newData);
      return newData;
    } catch (err) {
      console.error('Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreakData();
  }, [fetchStreakData]);

  const recordActivity = useCallback(async (modesUsed: number = 1) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !streakData) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = streakData.last_activity_date;
    
    let newStreak = streakData.current_streak;
    let usedShield = false;

    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day, no streak change
      } else if (diffDays === 1) {
        // Consecutive day
        newStreak = streakData.current_streak + 1;
      } else if (diffDays === 2 && streakData.streak_shields > 0) {
        // Missed one day but has shield
        newStreak = streakData.current_streak + 1;
        usedShield = true;
      } else {
        // Streak broken
        newStreak = 1;
      }
    } else {
      // First activity ever
      newStreak = 1;
    }

    // Calculate XP with streak bonus
    const streakBonus = Math.floor(XP_PER_QUESTION * STREAK_BONUS_MULTIPLIER * newStreak);
    const modeBonus = XP_PER_MODE_BONUS * modesUsed;
    const xpGained = XP_PER_QUESTION + streakBonus + modeBonus;
    const newXP = streakData.xp + xpGained;

    // Check for level up
    let newLevel = streakData.level;
    let xpNeededForNextLevel = getTotalXPForLevel(streakData.level + 1);
    
    while (newXP >= xpNeededForNextLevel) {
      newLevel++;
      xpNeededForNextLevel = getTotalXPForLevel(newLevel + 1);
    }

    // Calculate new shields (earn 1 shield per 7-day streak)
    const newShields = usedShield 
      ? streakData.streak_shields - 1 
      : Math.floor(newStreak / 7);

    const longestStreak = Math.max(streakData.longest_streak, newStreak);

    // Update database
    const { error } = await supabase
      .from('user_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        streak_shields: newShields,
        xp: newXP,
        level: newLevel,
        last_activity_date: today,
        streak_updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating streak:', error);
      return;
    }

    // Check for milestones
    const milestones: MilestoneData[] = [];

    // Level up milestone
    if (newLevel > streakData.level) {
      milestones.push({
        type: 'level',
        title: 'Level Up!',
        description: `You've reached Level ${newLevel}!`,
        value: newLevel
      });
    }

    // Streak milestones
    const streakMilestones = [3, 7, 14, 30, 60, 100, 365];
    if (newStreak > streakData.current_streak) {
      for (const m of streakMilestones) {
        if (newStreak >= m && streakData.current_streak < m) {
          milestones.push({
            type: 'streak',
            title: `${m}-Day Streak!`,
            description: `You've learned for ${m} days in a row!`,
            value: m
          });
          break;
        }
      }
    }

    // XP milestones
    const xpMilestones = [100, 500, 1000, 5000, 10000, 50000, 100000];
    for (const m of xpMilestones) {
      if (newXP >= m && streakData.xp < m) {
        milestones.push({
          type: 'xp',
          title: `${m.toLocaleString()} XP!`,
          description: `You've earned ${m.toLocaleString()} experience points!`,
          value: m
        });
        break;
      }
    }

    // Show the most significant milestone
    if (milestones.length > 0) {
      setMilestone(milestones[0]);
      setShowMilestone(true);
    }

    // Update local state
    setStreakData({
      ...streakData,
      current_streak: newStreak,
      longest_streak: longestStreak,
      streak_shields: newShields,
      xp: newXP,
      level: newLevel,
      last_activity_date: today
    });

    return { xpGained, newStreak, newLevel };
  }, [streakData]);

  const closeMilestone = useCallback(() => {
    setShowMilestone(false);
    setTimeout(() => setMilestone(null), 300);
  }, []);

  return {
    streakData,
    loading,
    milestone,
    showMilestone,
    recordActivity,
    closeMilestone,
    refetch: fetchStreakData
  };
};

export default useGamification;
