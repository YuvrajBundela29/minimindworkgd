import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Moon, Sun, Globe, Trash2, Info, Heart, ExternalLink } from 'lucide-react';
import { languages, LanguageKey, ModeKey } from '@/config/minimind';

interface SettingsPageProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  selectedLanguage: LanguageKey;
  onLanguageSelect: (lang: LanguageKey) => void;
  onClearHistory: () => void;
  stats: {
    totalQuestions: number;
    todayQuestions: number;
    favoriteMode: ModeKey;
    streak: number;
  };
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  theme,
  onToggleTheme,
  selectedLanguage,
  onLanguageSelect,
  onClearHistory,
  stats,
}) => {
  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">⚙️</div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Customize your experience</p>
      </div>

      {/* Theme Toggle */}
      <motion.div
        className="mode-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'light' ? (
              <Sun className="w-6 h-6 text-amber-500" />
            ) : (
              <Moon className="w-6 h-6 text-blue-400" />
            )}
            <div>
              <h3 className="font-medium text-foreground">Appearance</h3>
              <p className="text-xs text-muted-foreground">
                {theme === 'light' ? 'Light mode' : 'Dark mode'}
              </p>
            </div>
          </div>
          
          <motion.button
            className="w-14 h-8 rounded-full p-1 transition-colors"
            style={{
              backgroundColor: theme === 'dark' ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
            }}
            onClick={onToggleTheme}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-6 h-6 rounded-full bg-white shadow-md"
              animate={{ x: theme === 'dark' ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>
      </motion.div>

      {/* Language Selection */}
      <motion.div
        className="mode-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-medium text-foreground">Language</h3>
            <p className="text-xs text-muted-foreground">Select your preferred language</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
          {Object.entries(languages).map(([key, lang]) => (
            <motion.button
              key={key}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                selectedLanguage === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
              onClick={() => onLanguageSelect(key as LanguageKey)}
              whileTap={{ scale: 0.98 }}
            >
              <span>{lang.flag}</span>
              <span className="truncate">{lang.nativeName}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Clear Data */}
      <motion.div
        className="mode-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="w-6 h-6 text-destructive" />
          <div>
            <h3 className="font-medium text-foreground">Clear Data</h3>
            <p className="text-xs text-muted-foreground">Delete all saved history</p>
          </div>
        </div>
        
        <motion.button
          className="w-full py-3 px-4 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors font-medium"
          onClick={onClearHistory}
          whileTap={{ scale: 0.98 }}
        >
          Clear History
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="mode-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Info className="w-6 h-6 text-primary" />
          <div>
            <h3 className="font-medium text-foreground">Your Stats</h3>
            <p className="text-xs text-muted-foreground">Learning activity summary</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-xl">
            <div className="text-2xl font-bold text-foreground">{stats.totalQuestions}</div>
            <div className="text-xs text-muted-foreground">Total Questions</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-xl">
            <div className="text-2xl font-bold text-foreground">{stats.todayQuestions}</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </div>
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        className="mode-card bg-gradient-to-br from-primary/5 to-accent/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src="https://i.ibb.co/fGLH5Dxs/minimind-logo.png" 
              alt="MiniMind" 
              className="w-8 h-8"
            />
            <span className="font-heading font-bold text-lg gradient-text">MiniMind</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            AI-powered learning companion that explains anything in 4 unique ways.
          </p>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>for curious minds</span>
          </div>
        </div>
      </motion.div>

      {/* Version */}
      <div className="text-center text-xs text-muted-foreground">
        <p>Version 2.0 • Powered by AI</p>
      </div>
    </div>
  );
};

export default SettingsPage;
