import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Copy, Download, Share2, Send, Wand2, Maximize2, Sparkles } from 'lucide-react';
import { modes, ModeKey } from '@/config/minimind';
import MarkdownRenderer from './MarkdownRenderer';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface ModeCardProps {
  modeKey: ModeKey;
  answer: string | null;
  isLoading: boolean;
  onSpeak: (text: string, mode: string) => void;
  onCopy: (text: string) => void;
  onDownload: (text: string, mode: string, question: string) => void;
  onShare: (text: string, mode: string, question: string) => void;
  onGetOneWord: (mode: string) => void;
  onChatSubmit: (message: string, mode: string) => void;
  onFullscreen: (mode: string) => void;
  isSpeaking: boolean;
  chatInputValue: string;
  onChatInputChange: (mode: string, value: string) => void;
  currentQuestion: string;
}

const modeGradients: Record<ModeKey, string> = {
  beginner: 'from-emerald-500/10 via-teal-500/5 to-cyan-500/10',
  thinker: 'from-violet-500/10 via-purple-500/5 to-fuchsia-500/10',
  story: 'from-amber-500/10 via-orange-500/5 to-rose-500/10',
  mastery: 'from-blue-500/10 via-indigo-500/5 to-violet-500/10',
};

const modeAccentColors: Record<ModeKey, string> = {
  beginner: 'text-emerald-600 dark:text-emerald-400',
  thinker: 'text-violet-600 dark:text-violet-400',
  story: 'text-amber-600 dark:text-amber-400',
  mastery: 'text-blue-600 dark:text-blue-400',
};

const modeBorderColors: Record<ModeKey, string> = {
  beginner: 'border-emerald-500/20 hover:border-emerald-500/40',
  thinker: 'border-violet-500/20 hover:border-violet-500/40',
  story: 'border-amber-500/20 hover:border-amber-500/40',
  mastery: 'border-blue-500/20 hover:border-blue-500/40',
};

const modeBadgeStyles: Record<ModeKey, string> = {
  beginner: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  thinker: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
  story: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  mastery: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
};

const ModeCard: React.FC<ModeCardProps> = ({
  modeKey,
  answer,
  isLoading,
  onSpeak,
  onCopy,
  onDownload,
  onShare,
  onGetOneWord,
  onChatSubmit,
  onFullscreen,
  isSpeaking,
  chatInputValue,
  onChatInputChange,
  currentQuestion,
}) => {
  const mode = modes[modeKey];
  const { getCreditCost } = useSubscription();
  const creditCost = getCreditCost(modeKey);
  
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInputValue.trim()) {
      onChatSubmit(chatInputValue, modeKey);
    }
  };

  return (
    <motion.div
      className={`relative rounded-2xl border bg-gradient-to-br ${modeGradients[modeKey]} ${modeBorderColors[modeKey]} backdrop-blur-sm overflow-hidden transition-all duration-300`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Subtle glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${modeGradients[modeKey]} opacity-50 blur-xl -z-10`} />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <motion.div 
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-card/80 shadow-sm`}
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {mode.icon}
            </motion.div>
            <div className="min-w-0">
              <h3 className={`font-heading font-semibold text-base ${modeAccentColors[modeKey]}`}>
                {mode.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${modeBadgeStyles[modeKey]}`}>
                  {mode.badge}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Sparkles className="w-3 h-3" />
                  {creditCost} credit{creditCost > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <motion.button
              className="p-2 rounded-xl bg-card/60 hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => onFullscreen(modeKey)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </motion.button>
            
            {answer && (
              <motion.button
                className="p-2 rounded-xl bg-card/60 hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => onSpeak(answer, modeKey)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Read aloud"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-primary animate-pulse' : ''}`} />
              </motion.button>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="relative min-h-[120px] max-h-[200px] overflow-y-auto custom-scrollbar mb-4 pr-1">
          {isLoading ? (
            <div className="flex items-center gap-3 py-6">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${modeGradients[modeKey].replace('/10', '').replace('/5', '')}`}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          ) : answer ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <MarkdownRenderer content={answer} className="text-sm" />
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <motion.div 
                className="text-3xl mb-2"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {mode.icon}
              </motion.div>
              <p className="text-sm text-muted-foreground">
                Ready to explain in <span className={modeAccentColors[modeKey]}>{mode.name}</span> style
              </p>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        {answer && (
          <motion.div 
            className="flex items-center gap-2 mb-4 flex-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.button
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm`}
              onClick={() => onGetOneWord(modeKey)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Wand2 className="w-3.5 h-3.5" />
              Compress
            </motion.button>
            
            <div className="flex items-center gap-1 ml-auto">
              <motion.button
                className="p-2 rounded-lg bg-card/60 hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => onCopy(answer)}
                whileTap={{ scale: 0.9 }}
                aria-label="Copy"
              >
                <Copy className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                className="p-2 rounded-lg bg-card/60 hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => onDownload(answer, modeKey, currentQuestion)}
                whileTap={{ scale: 0.9 }}
                aria-label="Download"
              >
                <Download className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                className="p-2 rounded-lg bg-card/60 hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => onShare(answer, modeKey, currentQuestion)}
                whileTap={{ scale: 0.9 }}
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
        
        {/* Chat Input */}
        <form onSubmit={handleChatSubmit} className="relative">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card/80 border border-border/50 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <input
              type="text"
              value={chatInputValue}
              onChange={(e) => onChatInputChange(modeKey, e.target.value)}
              placeholder={`Ask follow-up...`}
              className="flex-1 bg-transparent border-none outline-none text-foreground text-sm placeholder:text-muted-foreground/60"
            />
            <motion.button
              type="submit"
              className={`p-2 rounded-lg transition-all ${
                chatInputValue.trim() 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-muted text-muted-foreground'
              }`}
              whileHover={chatInputValue.trim() ? { scale: 1.05 } : {}}
              whileTap={chatInputValue.trim() ? { scale: 0.95 } : {}}
              disabled={!chatInputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ModeCard;
