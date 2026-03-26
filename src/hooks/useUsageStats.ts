import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DailyCount {
  date: string;
  count: number;
}

interface LanguageCount {
  language: string;
  count: number;
}

interface ModeCount {
  mode: string;
  count: number;
}

export function useWeeklyActivity() {
  return useQuery({
    queryKey: ['usage-weekly'],
    queryFn: async (): Promise<DailyCount[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('usage_logs')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (error) throw error;

      // Group by date
      const counts = new Map<string, number>();
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().slice(0, 10);
        counts.set(key, 0);
      }

      (data ?? []).forEach((row) => {
        const key = row.created_at.slice(0, 10);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });

      return Array.from(counts.entries()).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
        count,
      }));
    },
  });
}

export function useLanguageBreakdown() {
  return useQuery({
    queryKey: ['usage-languages'],
    queryFn: async (): Promise<LanguageCount[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('usage_logs')
        .select('language')
        .eq('user_id', user.id);

      if (error) throw error;

      const counts = new Map<string, number>();
      (data ?? []).forEach((row) => {
        const lang = row.language ?? 'Unknown';
        counts.set(lang, (counts.get(lang) ?? 0) + 1);
      });

      return Array.from(counts.entries())
        .map(([language, count]) => ({ language, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    },
  });
}

export function useModeDistribution() {
  return useQuery({
    queryKey: ['usage-modes'],
    queryFn: async (): Promise<ModeCount[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('usage_logs')
        .select('mode')
        .eq('user_id', user.id);

      if (error) throw error;

      const counts = new Map<string, number>();
      (data ?? []).forEach((row) => {
        const mode = row.mode ?? 'Unknown';
        counts.set(mode, (counts.get(mode) ?? 0) + 1);
      });

      return Array.from(counts.entries())
        .map(([mode, count]) => ({ mode, count }))
        .sort((a, b) => b.count - a.count);
    },
  });
}

export function useLearningStreak() {
  return useQuery({
    queryKey: ['usage-streak'],
    queryFn: async (): Promise<number> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data, error } = await supabase
        .from('usage_logs')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return 0;

      // Get unique dates
      const dates = new Set<string>();
      data.forEach((row) => dates.add(row.created_at.slice(0, 10)));
      const sortedDates = Array.from(dates).sort().reverse();

      const today = new Date().toISOString().slice(0, 10);
      if (sortedDates[0] !== today) return 0;

      let streak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diffDays = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
        if (Math.round(diffDays) === 1) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    },
  });
}

export function useTotalLogCount() {
  return useQuery({
    queryKey: ['usage-total-count'],
    queryFn: async (): Promise<number> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('usage_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      return count ?? 0;
    },
  });
}
