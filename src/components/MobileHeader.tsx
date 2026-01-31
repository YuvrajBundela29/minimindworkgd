import React, { useEffect, useState } from 'react';
import { Menu, User, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import EarlyAccessCreditDisplay from './EarlyAccessCreditDisplay';
import { useEarlyAccess } from '@/contexts/EarlyAccessContext';
import { supabase } from '@/integrations/supabase/client';

interface MobileHeaderProps {
  onMenuClick: () => void;
  onProfileClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick, onProfileClick }) => {
  const { isEarlyAccess } = useEarlyAccess();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [streakCount, setStreakCount] = useState<number>(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch avatar
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }

        // Fetch streak
        const { data: streakData } = await supabase
          .from('user_streaks')
          .select('current_streak')
          .eq('user_id', user.id)
          .single();
        
        if (streakData?.current_streak) {
          setStreakCount(streakData.current_streak);
        }
      }
    };

    fetchUserData();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const getFlameColor = () => {
    if (streakCount === 0) return 'text-muted-foreground';
    if (streakCount >= 30) return 'text-red-500';
    if (streakCount >= 7) return 'text-orange-500';
    if (streakCount >= 3) return 'text-amber-500';
    return 'text-yellow-500';
  };

  return (
    <header className="mobile-header">
      <motion.button
        className="icon-btn icon-btn-ghost"
        onClick={onMenuClick}
        whileTap={{ scale: 0.95 }}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </motion.button>
      
      <div className="flex items-center gap-2">
        <img 
          src="https://i.ibb.co/fGLH5Dxs/minimind-logo.png" 
          alt="MiniMind Logo" 
          className="w-8 h-8 object-contain"
        />
        <span className="logo-text">MiniMind</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Streak Counter Mini */}
        {streakCount > 0 && (
          <motion.div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full glass-card-subtle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Flame className={`w-4 h-4 ${getFlameColor()}`} />
            </motion.div>
            <span className="text-sm font-bold">{streakCount}</span>
          </motion.div>
        )}

        {/* Persistent Credit Pill */}
        {isEarlyAccess && <EarlyAccessCreditDisplay variant="minimal" />}
        
        <motion.button
          className="icon-btn icon-btn-surface w-9 h-9 rounded-full overflow-hidden p-0"
          onClick={onProfileClick}
          whileTap={{ scale: 0.95 }}
          aria-label="Profile"
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
        </motion.button>
      </div>
    </header>
  );
};

export default MobileHeader;
