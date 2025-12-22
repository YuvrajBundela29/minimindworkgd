import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Trophy, Target, Flame, Calendar, Edit2, Save, X, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schema for display name
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
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onSignOut }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);

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

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setEditName(profileData.display_name || '');
      }

      // Fetch statistics
      const { data: statsData } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (statsData) {
        setStatistics(statsData);
      }

      // Fetch settings
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (settingsData) {
        setSettings(settingsData);
      }

      // Fetch all achievements with user unlocked status
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
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    // Validate display name before saving
    const validationResult = displayNameSchema.safeParse(editName);
    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0]?.message || 'Invalid display name');
      return;
    }
    
    // Sanitize the display name (trim whitespace)
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

  return (
    <div className="space-y-6 pb-24">
      {/* Profile Header */}
      <motion.div
        className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-6 border border-primary/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="px-3 py-1 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Display name"
                  />
                  <motion.button
                    onClick={handleSaveProfile}
                    className="p-2 rounded-lg bg-primary text-primary-foreground"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Save className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => setIsEditing(false)}
                    className="p-2 rounded-lg bg-muted"
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{profile?.display_name || 'Learner'}</h2>
                  <motion.button
                    onClick={() => setIsEditing(true)}
                    className="p-1 rounded hover:bg-muted"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </motion.button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
        </div>
        </div>
      </motion.div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          className="bg-card rounded-xl p-4 border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statistics?.total_questions || 0}</p>
              <p className="text-xs text-muted-foreground">Total Questions</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-card rounded-xl p-4 border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statistics?.current_streak || 0}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-card rounded-xl p-4 border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statistics?.questions_today || 0}</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-card rounded-xl p-4 border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unlockedCount}/{achievements.length}</p>
              <p className="text-xs text-muted-foreground">Achievements</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Achievements Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Achievements
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              className={`p-4 rounded-xl border ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/30'
                  : 'bg-card border-border opacity-60'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <div className="text-2xl mb-2">{achievement.icon}</div>
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
          ))}
        </div>
      </motion.div>

      {/* Settings Section */}
      <motion.div
        className="bg-card rounded-xl p-5 border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold mb-4">Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Theme</span>
            <span className="font-medium capitalize">{settings?.theme || 'System'}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Language</span>
            <span className="font-medium">{settings?.language || 'English'}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Notifications</span>
            <span className="font-medium">{settings?.notifications_enabled ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Manage these settings from the Settings page.
        </p>
      </motion.div>

      {/* Sign Out Button at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors border border-destructive/20"
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
