import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Copy, Download, Send } from 'lucide-react';
import { modes, ModeKey } from '@/config/minimind';
import MarkdownRenderer from './MarkdownRenderer';
import ShareMenu from './ShareMenu';

interface FullscreenModeProps {
  isOpen: boolean;
  modeKey: ModeKey;
  answer: string | null;
  onClose: () => void;
  onSpeak: (text: string, mode: string) => void;
  onCopy: (text: string) => void;
  onDownload: (text: string, mode: string, question: string) => void;
  onShare: (text: string, mode: string, question: string, platform: 'whatsapp' | 'email' | 'copy' | 'native' | 'download') => void;
  onChatSubmit: (message: string, mode: string) => void;
  isSpeaking: boolean;
  chatInputValue: string;
  onChatInputChange: (mode: string, value: string) => void;
  currentQuestion: string;
}

const FullscreenMode: React.FC<FullscreenModeProps> = ({
  isOpen,
  modeKey,
  answer,
  onClose,
  onSpeak,
  onCopy,
  onDownload,
  onShare,
  onChatSubmit,
  isSpeaking,
  chatInputValue,
  onChatInputChange,
  currentQuestion,
}) => {
  const mode = modes[modeKey];

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInputValue.trim()) {
      onChatSubmit(chatInputValue, modeKey);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{mode.icon}</span>
              <h2 className="font-heading font-bold text-xl text-foreground">{mode.name}</h2>
              <span className={`mode-badge ${mode.badgeClass}`}>{mode.badge}</span>
            </div>
            <motion.button
              className="icon-btn icon-btn-ghost"
              onClick={onClose}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 pb-24 custom-scrollbar" style={{ height: 'calc(100vh - 140px)' }}>
            {answer ? (
              <MarkdownRenderer content={answer} className="text-base leading-relaxed" />
            ) : (
              <p className="text-muted-foreground italic">No content yet...</p>
            )}
          </div>

          {/* Action Bar */}
          {answer && (
            <div className="fixed bottom-20 left-0 right-0 p-4 border-t border-border bg-background/95 backdrop-blur">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <motion.button
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80"
                  onClick={() => onSpeak(answer, modeKey)}
                  whileTap={{ scale: 0.95 }}
                >
                  <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-primary animate-pulse' : ''}`} />
                  <span className="text-sm">Read</span>
                </motion.button>

                <motion.button
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80"
                  onClick={() => onCopy(answer)}
                  whileTap={{ scale: 0.95 }}
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copy</span>
                </motion.button>

                <motion.button
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80"
                  onClick={() => onDownload(answer, modeKey, currentQuestion)}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download</span>
                </motion.button>

                <ShareMenu 
                  onShare={(platform) => onShare(answer, modeKey, currentQuestion, platform)} 
                />
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
            <form onSubmit={handleChatSubmit} className="capsule-input max-w-2xl mx-auto">
              <input
                type="text"
                value={chatInputValue}
                onChange={(e) => onChatInputChange(modeKey, e.target.value)}
                placeholder={`Continue chat with ${mode.name}...`}
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullscreenMode;
