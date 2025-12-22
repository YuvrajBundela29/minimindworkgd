import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Copy, Download, Share2, Send, Wand2, Maximize2, Lock } from 'lucide-react';
import { modes, ModeKey } from '@/config/minimind';
import MarkdownRenderer from './MarkdownRenderer';
import { useSubscription } from '@/contexts/SubscriptionContext';
import ProBadge from './ProBadge';

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
  const { isModeAvailable, showUpgradePrompt, tier } = useSubscription();
  
  const isLocked = !isModeAvailable(modeKey);
  
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      showUpgradePrompt(`${mode.name} Mode`);
      return;
    }
    if (chatInputValue.trim()) {
      onChatSubmit(chatInputValue, modeKey);
    }
  };

  const handleLockedClick = () => {
    if (isLocked) {
      showUpgradePrompt(`${mode.name} Mode`);
    }
  };

  return (
    <motion.div
      className={`mode-card relative ${isLocked ? 'cursor-pointer' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={isLocked ? handleLockedClick : undefined}
    >
      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px] rounded-2xl border-2 border-dashed border-amber-500/30">
          <div className="flex flex-col items-center gap-3 p-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <ProBadge size="md" variant="glow" />
            <p className="text-sm font-medium text-foreground">{mode.name} Mode</p>
            <p className="text-xs text-muted-foreground">Tap to unlock</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className={`text-2xl ${isLocked ? 'grayscale' : 'animate-float'}`}>{mode.icon}</span>
          <h3 className="font-heading font-semibold text-lg text-foreground">
            {mode.name}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`mode-badge ${mode.badgeClass}`}>
            {mode.badge}
          </span>
          
          {isLocked && <ProBadge size="sm" variant="subtle" />}
          
          {/* Fullscreen button - always visible */}
          {!isLocked && (
            <motion.button
              className="action-btn bg-muted hover:bg-primary hover:text-primary-foreground"
              onClick={() => onFullscreen(modeKey)}
              whileTap={{ scale: 0.95 }}
              aria-label="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </motion.button>
          )}
          
          {answer && !isLocked && (
            <>
              <motion.button
                className="action-btn bg-muted hover:bg-primary hover:text-primary-foreground"
                onClick={() => onSpeak(answer, modeKey)}
                whileTap={{ scale: 0.95 }}
                aria-label="Read aloud"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-primary animate-pulse-glow' : ''}`} />
              </motion.button>
            </>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className={`card-content-scroll custom-scrollbar mb-3 ${isLocked ? 'opacity-40' : ''}`}>
        {isLoading ? (
          <div className="flex items-center gap-2 py-4">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="text-muted-foreground text-sm">Thinking...</span>
          </div>
        ) : answer ? (
          <MarkdownRenderer content={answer} className="text-sm" />
        ) : (
          <p className="text-sm text-muted-foreground/60 italic py-4">
            {isLocked ? 'Unlock to access this mode...' : 'Ready to explain...'}
          </p>
        )}
      </div>
      
      {/* Action Buttons */}
      {answer && !isLocked && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <motion.button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary to-accent text-primary-foreground"
            onClick={() => onGetOneWord(modeKey)}
            whileTap={{ scale: 0.95 }}
          >
            <Wand2 className="w-3.5 h-3.5" />
            Get One-Word Summary
          </motion.button>
          
          <motion.button
            className="action-btn bg-muted hover:bg-muted/80"
            onClick={() => onCopy(answer)}
            whileTap={{ scale: 0.95 }}
            aria-label="Copy"
          >
            <Copy className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            className="action-btn bg-muted hover:bg-muted/80"
            onClick={() => onDownload(answer, modeKey, currentQuestion)}
            whileTap={{ scale: 0.95 }}
            aria-label="Download"
          >
            <Download className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            className="action-btn bg-muted hover:bg-muted/80"
            onClick={() => onShare(answer, modeKey, currentQuestion)}
            whileTap={{ scale: 0.95 }}
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      )}
      
      {/* Chat Input */}
      {!isLocked && (
        <form onSubmit={handleChatSubmit} className="capsule-input">
          <input
            type="text"
            value={chatInputValue}
            onChange={(e) => onChatInputChange(modeKey, e.target.value)}
            placeholder={`Chat with ${mode.name}...`}
            className="flex-1 bg-transparent border-none outline-none text-foreground text-sm"
          />
          <motion.button
            type="submit"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground"
            whileTap={{ scale: 0.95 }}
            disabled={!chatInputValue.trim()}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </form>
      )}
    </motion.div>
  );
};

export default ModeCard;
