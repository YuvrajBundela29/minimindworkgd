import React from 'react';
import { Menu, User } from 'lucide-react';
import { motion } from 'framer-motion';
import EarlyAccessCreditDisplay from './EarlyAccessCreditDisplay';
import { useEarlyAccess } from '@/contexts/EarlyAccessContext';

interface MobileHeaderProps {
  onMenuClick: () => void;
  onProfileClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick, onProfileClick }) => {
  const { isEarlyAccess } = useEarlyAccess();

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
        {/* Persistent Credit Pill */}
        {isEarlyAccess && <EarlyAccessCreditDisplay variant="minimal" />}
        
        <motion.button
          className="icon-btn icon-btn-surface"
          onClick={onProfileClick}
          whileTap={{ scale: 0.95 }}
          aria-label="Profile"
        >
          <User className="w-5 h-5" />
        </motion.button>
      </div>
    </header>
  );
};

export default MobileHeader;
