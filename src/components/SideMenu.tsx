import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, BarChart3, Zap, History, Settings, Sun, Moon, HelpCircle, User, BookOpen, Crown } from 'lucide-react';
import { navigationItems, NavigationId } from '@/config/minimind';
import { useSubscription } from '@/contexts/SubscriptionContext';
import CreditDisplay from './CreditDisplay';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Home,
  User,
  BarChart3,
  Zap,
  History,
  Cog: Settings,
  BookOpen,
  Crown,
};

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: NavigationId;
  onNavigate: (page: NavigationId) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onShowGuide?: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
  theme,
  onToggleTheme,
  onShowGuide,
}) => {
  const { tier } = useSubscription();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-card border-r border-border overflow-y-auto"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <img 
                  src="https://i.ibb.co/fGLH5Dxs/minimind-logo.png" 
                  alt="MiniMind" 
                  className="w-8 h-8"
                />
                <span className="logo-text">MiniMind</span>
                {tier === 'pro' && (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold">
                    PRO
                  </span>
                )}
              </div>
              <motion.button
                className="icon-btn icon-btn-ghost"
                onClick={onClose}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Credit Display */}
            <div className="p-4 border-b border-border">
              <CreditDisplay variant="compact" />
            </div>
            
            <nav className="p-4">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = iconMap[item.icon] || Home;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted text-foreground'
                      }`}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </nav>
            
            <div className="mx-4 h-px bg-border" />
            
            <div className="p-4 space-y-1">
              <motion.button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
                onClick={onToggleTheme}
                whileTap={{ scale: 0.98 }}
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-5 h-5" />
                    <span className="font-medium">Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-5 h-5" />
                    <span className="font-medium">Light Mode</span>
                  </>
                )}
              </motion.button>
              
              {onShowGuide && (
                <motion.button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-primary"
                  onClick={() => {
                    onShowGuide();
                    onClose();
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <HelpCircle className="w-5 h-5" />
                  <span className="font-medium">App Guide</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideMenu;
