import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Copy, Download, Share2, Send, Wand2, Languages } from 'lucide-react';
import { modes, ModeKey } from '@/config/minimind';
import MarkdownRenderer from './MarkdownRenderer';

interface ModeCardProps {
  modeKey: ModeKey;
  answer: string | null;
  isLoading: boolean;
  onSpeak: (text: string, mode: string) => void;
  onCopy: (text: string) => void;
  onDownload: (text: string, mode: string) => void;
  onShare: (text: string, mode: string) => void;
  onGetOneWord: (mode: string) => void;
  onChatSubmit: (message: string, mode: string) => void;
  isSpeaking: boolean;
  chatInputValue: string;
  onChatInputChange: (mode: string, value: string) => void;
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
  isSpeaking,
  chatInputValue,
  onChatInputChange,
}) => {
  const mode = modes[modeKey];
  
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInputValue.trim()) {
      onChatSubmit(chatInputValue, modeKey);
    }
  };

  return (
    <motion.div
      className="mode-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-float">{mode.icon}</span>
          <h3 className="font-heading font-semibold text-lg text-foreground">
            {mode.name}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`mode-badge ${mode.badgeClass}`}>
            {mode.badge}
          </span>
          
          {answer && (
            <>
              <motion.button
                className="action-btn bg-muted hover:bg-primary hover:text-primary-foreground"
                onClick={() => onSpeak(answer, modeKey)}
                whileTap={{ scale: 0.95 }}
                aria-label="Read aloud"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-primary animate-pulse-glow' : ''}`} />
              </motion.button>
              
              <motion.button
                className="action-btn bg-muted hover:bg-primary hover:text-primary-foreground"
                onClick={() => {}}
                whileTap={{ scale: 0.95 }}
                aria-label="Translate"
              >
                <Languages className="w-4 h-4" />
              </motion.button>
            </>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="card-content-scroll custom-scrollbar mb-3">
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
            Ready to explain...
          </p>
        )}
      </div>
      
      {/* Action Buttons */}
      {answer && (
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
            onClick={() => onDownload(answer, modeKey)}
            whileTap={{ scale: 0.95 }}
            aria-label="Download"
          >
            <Download className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            className="action-btn bg-muted hover:bg-muted/80"
            onClick={() => onShare(answer, modeKey)}
            whileTap={{ scale: 0.95 }}
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      )}
      
      {/* Chat Input */}
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
    </motion.div>
  );
};

export default ModeCard;
