import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Trophy, Target, Flame, Calendar, Edit2, Save, X, LogOut,
  TrendingUp, BookOpen, Brain, ChevronRight, BarChart3, Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ModeKey, modes } from '@/config/minimind';

const displayNameSchema = z.string()
  .max(100, 'Display name must be less than 100 characters')
  .refine(val => val.length === 0 || val.trim().length > 0, 'Display name cannot be only whitespace')
  .refine(val => !/<[^>]*>/.test(val), 'Display name cannot contain HTML tags')
  .refine(val => !/javascript:/i.test(val), 'Invalid characters in display name');

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  unlocked?: boolean;
  unlocked_at?: string;
}

interface ProfilePageProps {
  onSignOut: () => void;
  stats?: {
    totalQuestions: number;
    todayQuestions: number;
    favoriteMode: ModeKey;
    streak: number;
  };
  history?: Array<{ question: string; answers: Record<ModeKey, string> }>;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onSignOut, stats, history = [] }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'achievements'>('overview');

  // Calculate mode usage from history
  const modeUsage = history.reduce((acc, item) => {
    Object.keys(item.answers).forEach((mode) => {
      acc[mode as ModeKey] = (acc[mode as ModeKey] || 0) + 1;
    });
    return acc;
  }, {} as Record<ModeKey, number>);

  const maxUsage = Math.max(...Object.values(modeUsage), 1);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setEditName(profileData.display_name || '');
      }

      const { data: statsData } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (statsData) {
        setStatistics(statsData);
      }

      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (settingsData) {
        setSettings(settingsData);
      }

      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*');

      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', user.id);

      if (allAchievements) {
        const achievementsWithStatus = allAchievements.map(achievement => ({
          ...achievement,
          unlocked: userAchievements?.some(ua => ua.achievement_id === achievement.id),
          unlocked_at: userAchievements?.find(ua => ua.achievement_id === achievement.id)?.unlocked_at
        }));
        setAchievements(achievementsWithStatus);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    const validationResult = displayNameSchema.safeParse(editName);
    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0]?.message || 'Invalid display name');
      return;
    }
    
    const sanitizedName = editName.trim();
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: sanitizedName })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({ ...profile, display_name: sanitizedName });
      setEditName(sanitizedName);
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Not Signed In</h2>
        <p className="text-muted-foreground">Sign in to view your profile and track your progress.</p>
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const localStats = stats || { totalQuestions: statistics?.total_questions || 0, todayQuestions: statistics?.questions_today || 0, streak: statistics?.current_streak || 0 };

  return (
    <div className="space-y-6 pb-24">
      {/* Profile Header */}
      <motion.div
        className="bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 rounded-3xl p-6 border border-primary/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="Display name"
                />
                <motion.button
                  onClick={handleSaveProfile}
                  className="p-2 rounded-xl bg-primary text-primary-foreground"
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={() => setIsEditing(false)}
                  className="p-2 rounded-xl bg-muted"
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-foreground">{profile?.display_name || 'Learner'}</h2>
                  <motion.button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </motion.button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-muted rounded-2xl">
        {(['overview', 'progress', 'achievements'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <Target className="w-6 h-6 text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-foreground">{localStats.totalQuestions}</p>
                <p className="text-xs text-muted-foreground">Total Questions</p>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
                <Flame className="w-6 h-6 text-orange-500 mb-2" />
                <p className="text-2xl font-bold text-foreground">{localStats.streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <Calendar className="w-6 h-6 text-green-500 mb-2" />
                <p className="text-2xl font-bold text-foreground">{localStats.todayQuestions}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
                <Trophy className="w-6 h-6 text-yellow-500 mb-2" />
                <p className="text-2xl font-bold text-foreground">{unlockedCount}/{achievements.length || '?'}</p>
                <p className="text-xs text-muted-foreground">Achievements</p>
              </Card>
            </div>

            {/* Preferences */}
            <Card className="p-5 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Theme</span>
                  <span className="font-medium capitalize text-foreground">{settings?.theme || 'System'}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Language</span>
                  <span className="font-medium text-foreground">{settings?.language || 'English'}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Mode Usage */}
            <Card className="p-5 bg-card border-border">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Mode Usage</h3>
              </div>
              <div className="space-y-4">
                {(Object.keys(modes) as ModeKey[]).map((modeKey) => {
                  const usage = modeUsage[modeKey] || 0;
                  const percentage = (usage / maxUsage) * 100;
                  return (
                    <div key={modeKey} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{modes[modeKey].icon}</span>
                          <span className="text-foreground font-medium">{modes[modeKey].name}</span>
                        </span>
                        <span className="text-muted-foreground">{usage} uses</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Learning Tip */}
            <Card className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Learning Tip</h4>
                  <p className="text-sm text-muted-foreground">
                    Try using different modes for the same question! Each mode offers a unique perspective to deepen your understanding.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="grid grid-cols-2 gap-3">
              {achievements.length > 0 ? achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  className={`p-4 rounded-2xl border ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30'
                      : 'bg-card border-border opacity-60'
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h4 className={`font-semibold text-sm ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {achievement.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                  {achievement.unlocked && achievement.unlocked_at && (
                    <p className="text-xs text-yellow-600 mt-2">
                      Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                    </p>
                  )}
                </motion.div>
              )) : (
                <div className="col-span-2 text-center py-8">
                  <Trophy className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">Keep learning to unlock achievements!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign Out Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors border border-destructive/20"
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
