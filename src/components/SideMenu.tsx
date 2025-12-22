import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, BarChart3, Brain, History, Settings, Sun, Moon, Globe } from 'lucide-react';
import { navigationItems, NavigationId, languages, LanguageKey } from '@/config/minimind';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Home,
  BarChart3,
  Brain,
  History,
  Cog: Settings,
};

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: NavigationId;
  onNavigate: (page: NavigationId) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  selectedLanguage: LanguageKey;
  onLanguageSelect: (lang: LanguageKey) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
  theme,
  onToggleTheme,
  selectedLanguage,
  onLanguageSelect,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Side Panel */}
          <motion.div
            className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-card border-r border-border overflow-y-auto"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <img 
                  src="https://i.ibb.co/fGLH5Dxs/minimind-logo.png" 
                  alt="MiniMind" 
                  className="w-8 h-8"
                />
                <span className="logo-text">MiniMind</span>
              </div>
              <motion.button
                className="icon-btn icon-btn-ghost"
                onClick={onClose}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            
            {/* Navigation */}
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
            
            {/* Divider */}
            <div className="mx-4 h-px bg-border" />
            
            {/* Theme Toggle */}
            <div className="p-4">
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
            </div>
            
            {/* Language Selection */}
            <div className="p-4 pt-0">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-4 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Language
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(languages).map(([key, lang]) => (
                  <motion.button
                    key={key}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedLanguage === key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    onClick={() => onLanguageSelect(key as LanguageKey)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{lang.flag}</span>
                    <span className="truncate">{lang.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideMenu;
