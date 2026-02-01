import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Copy, Download, Send, ArrowLeft } from 'lucide-react';
import { modes, ModeKey } from '@/config/minimind';
import MarkdownRenderer from './MarkdownRenderer';
import ShareMenu from './ShareMenu';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FullscreenModeProps {
  isOpen: boolean;
  modeKey: ModeKey;
  answer: string | null;
  chatHistory: ChatMessage[];
  isLoading?: boolean;
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
  chatHistory,
  isLoading = false,
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  // Focus input when fullscreen opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInputValue.trim() && !isLoading) {
      onChatSubmit(chatInputValue, modeKey);
    }
  };

  // Get mode-specific colors for styling
  const getModeColors = () => {
    switch (modeKey) {
      case 'beginner':
        return { bg: 'bg-green-500/10', accent: 'text-green-600 dark:text-green-400', avatar: 'bg-green-500' };
      case 'thinker':
        return { bg: 'bg-blue-500/10', accent: 'text-blue-600 dark:text-blue-400', avatar: 'bg-blue-500' };
      case 'story':
        return { bg: 'bg-purple-500/10', accent: 'text-purple-600 dark:text-purple-400', avatar: 'bg-purple-500' };
      case 'mastery':
        return { bg: 'bg-orange-500/10', accent: 'text-orange-600 dark:text-orange-400', avatar: 'bg-orange-500' };
      default:
        return { bg: 'bg-primary/10', accent: 'text-primary', avatar: 'bg-primary' };
    }
  };

  const colors = getModeColors();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-background flex flex-col"
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {/* Header - WhatsApp style */}
          <div className={`flex items-center gap-3 p-3 border-b border-border ${colors.bg}`}>
            <motion.button
              className="p-2 rounded-full hover:bg-muted/50"
              onClick={onClose}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            
            <Avatar className={`w-10 h-10 ${colors.avatar}`}>
              <AvatarFallback className="text-white text-lg">
                {mode.icon}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h2 className="font-heading font-bold text-base text-foreground truncate">
                {mode.name}
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                {isLoading ? 'Typing...' : 'Online'}
              </p>
            </div>
            
            <div className="flex items-center gap-1">
              {chatHistory.length > 0 && (
                <motion.button
                  className="p-2 rounded-full hover:bg-muted/50"
                  onClick={() => {
                    const lastAssistant = chatHistory.filter(m => m.role === 'assistant').pop();
                    if (lastAssistant) onSpeak(lastAssistant.content, modeKey);
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-primary animate-pulse' : ''}`} />
                </motion.button>
              )}
            </div>
          </div>

          {/* Chat Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            style={{ 
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          >
            {chatHistory.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-card border border-border rounded-bl-md'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="space-y-2">
                      <MarkdownRenderer content={message.content} className="text-sm" />
                      
                      {/* Message Actions - only for assistant messages */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <button
                          onClick={() => onCopy(message.content)}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                        <button
                          onClick={() => onSpeak(message.content, modeKey)}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <Volume2 className={`w-3 h-3 ${isSpeaking ? 'text-primary' : ''}`} />
                          Read
                        </button>
                        <button
                          onClick={() => onDownload(message.content, modeKey, currentQuestion)}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          PDF
                        </button>
                        <ShareMenu 
                          onShare={(platform) => onShare(message.content, modeKey, currentQuestion, platform)}
                          compact
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  
                  {/* Timestamp */}
                  <p className={`text-[10px] mt-1 ${
                    message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {/* Typing Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <motion.div
                      className="w-2 h-2 bg-muted-foreground rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-muted-foreground rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-muted-foreground rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Empty State */}
            {chatHistory.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <span className="text-5xl mb-4">{mode.icon}</span>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                  Chat with {mode.name}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {mode.tagline}
                </p>
              </div>
            )}
          </div>

          {/* Chat Input - WhatsApp style */}
          <div className="p-3 border-t border-border bg-background/95 backdrop-blur">
            <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-muted rounded-full px-4 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={chatInputValue}
                  onChange={(e) => onChatInputChange(modeKey, e.target.value)}
                  placeholder={`Ask ${mode.name}...`}
                  className="flex-1 bg-transparent border-none outline-none text-foreground text-sm placeholder:text-muted-foreground"
                  disabled={isLoading}
                />
              </div>
              <motion.button
                type="submit"
                className={`w-11 h-11 rounded-full flex items-center justify-center ${
                  chatInputValue.trim() && !isLoading
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
                whileTap={{ scale: 0.95 }}
                disabled={!chatInputValue.trim() || isLoading}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullscreenMode;
