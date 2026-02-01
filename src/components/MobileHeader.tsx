import React, { useEffect, useState } from 'react';
import { Menu, User } from 'lucide-react';
import { motion } from 'framer-motion';
import EarlyAccessCreditDisplay from './EarlyAccessCreditDisplay';
import { useEarlyAccess } from '@/contexts/EarlyAccessContext';
import { supabase } from '@/integrations/supabase/client';
import { purposeLenses, PurposeLensKey } from '@/config/minimind';

interface MobileHeaderProps {
  onMenuClick: () => void;
  onProfileClick: () => void;
  currentLens?: PurposeLensKey;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick, onProfileClick, currentLens = 'general' }) => {
  const { isEarlyAccess } = useEarlyAccess();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const lensData = purposeLenses[currentLens];

  useEffect(() => {
    const fetchAvatar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        }
      }
    };

    fetchAvatar();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchAvatar();
    });

    return () => subscription.unsubscribe();
  }, []);

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
        {/* Purpose Lens Badge */}
        {currentLens !== 'general' && (
          <motion.span
            className="text-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            title={`${lensData.name} mode`}
          >
            {lensData.icon}
          </motion.span>
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
