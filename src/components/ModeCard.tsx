import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Copy, Download, Send, Wand2, Maximize2, Zap } from 'lucide-react';
import { modes, ModeKey } from '@/config/minimind';
import MarkdownRenderer from './MarkdownRenderer';
import FeedbackPrompt from './FeedbackPrompt';
import TrustFooter from './TrustFooter';
import SkeletonLoader from './SkeletonLoader';
import ShareMenu from './ShareMenu';
import { useSubscription, CREDIT_COSTS } from '@/contexts/SubscriptionContext';
import { useEarlyAccess } from '@/contexts/EarlyAccessContext';

interface ModeCardProps {
  modeKey: ModeKey;
  answer: string | null;
  isLoading: boolean;
  onSpeak: (text: string, mode: string) => void;
  onCopy: (text: string) => void;
  onDownload: (text: string, mode: string, question: string) => void;
  onShare: (text: string, mode: string, question: string, platform: 'whatsapp' | 'email' | 'copy' | 'native' | 'download') => void;
  onGetOneWord: (mode: string) => void;
  onChatSubmit: (message: string, mode: string) => void;
  onFullscreen: (mode: string) => void;
  isSpeaking: boolean;
  chatInputValue: string;
  onChatInputChange: (mode: string, value: string) => void;
  currentQuestion: string;
}

// Determine confidence level based on mode
const getConfidence = (mode: ModeKey): 'high' | 'medium' | 'low' => {
  switch (mode) {
    case 'mastery':
      return 'high';
    case 'thinker':
      return 'high';
    case 'beginner':
      return 'medium';
    case 'story':
      return 'medium';
    default:
      return 'medium';
  }
};

const getSourceType = (mode: ModeKey): 'reasoning' | 'knowledge' | 'creative' => {
  switch (mode) {
    case 'thinker':
      return 'reasoning';
    case 'story':
      return 'creative';
    default:
      return 'knowledge';
  }
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
  const { isEarlyAccess } = useEarlyAccess();
  const creditCost = getCreditCost(modeKey);
  const [showFeedback, setShowFeedback] = useState(true);
  
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInputValue.trim()) {
      // Open fullscreen first, then submit the chat
      onFullscreen(modeKey);
      // Small delay to ensure fullscreen opens before submitting
      setTimeout(() => {
        onChatSubmit(chatInputValue, modeKey);
      }, 100);
    }
  };
  
  const handleInputFocus = () => {
    // Open fullscreen when user focuses on input to continue chat there
    onFullscreen(modeKey);
  };

  const thinkingMessages = [
    'Thinking deeply...',
    'Crafting explanation...',
    'Processing...',
  ];
  const randomMessage = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];

  return (
    <motion.div
      className="mode-card relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header - Fixed layout with proper spacing */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-2xl animate-float shrink-0">{mode.icon}</span>
          <h3 className="font-heading font-semibold text-lg text-foreground truncate">
            {mode.name}
          </h3>
          <span className={`mode-badge ${mode.badgeClass} shrink-0 text-[10px] px-1.5 py-0.5`}>
            {mode.badge}
          </span>
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium shrink-0">
            <Zap className="w-2.5 h-2.5" />
            {isEarlyAccess ? 'Free' : creditCost}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          <motion.button
            className="action-btn bg-muted hover:bg-primary hover:text-primary-foreground w-10 h-10"
            onClick={() => onFullscreen(modeKey)}
            whileTap={{ scale: 0.95 }}
            aria-label={`Open ${mode.name} in fullscreen`}
          >
            <Maximize2 className="w-4 h-4" />
          </motion.button>
          
          {answer && (
            <motion.button
              className="action-btn bg-muted hover:bg-primary hover:text-primary-foreground w-10 h-10"
              onClick={() => onSpeak(answer, modeKey)}
              whileTap={{ scale: 0.95 }}
              aria-label={isSpeaking ? 'Stop reading' : `Read ${mode.name} explanation aloud`}
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-primary animate-pulse-glow' : ''}`} />
            </motion.button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="card-content-scroll custom-scrollbar mb-3" role="region" aria-label={`${mode.name} explanation`}>
        {isLoading ? (
          <SkeletonLoader 
            variant="paragraph" 
            lines={4} 
            modeKey={modeKey}
          />
        ) : answer ? (
          <>
            <MarkdownRenderer content={answer} className="text-sm" />
            
            {/* Trust Footer */}
            <TrustFooter 
              creditCost={creditCost}
              confidence={getConfidence(modeKey)}
              sourceType={getSourceType(modeKey)}
            />
            
            {/* Feedback Prompt */}
            {isEarlyAccess && showFeedback && (
              <FeedbackPrompt 
                onFeedback={(type, comment) => {
                  console.log('Feedback:', { type, comment, mode: modeKey });
                  setShowFeedback(false);
                }}
              />
            )}
          </>
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
            className="action-btn bg-muted hover:bg-muted/80 w-10 h-10"
            onClick={() => onCopy(answer)}
            whileTap={{ scale: 0.95 }}
            aria-label="Copy explanation to clipboard"
          >
            <Copy className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            className="action-btn bg-muted hover:bg-muted/80 w-10 h-10"
            onClick={() => onDownload(answer, modeKey, currentQuestion)}
            whileTap={{ scale: 0.95 }}
            aria-label="Download as PDF"
          >
            <Download className="w-4 h-4" />
          </motion.button>
          
          <ShareMenu 
            onShare={(platform) => onShare(answer, modeKey, currentQuestion, platform)} 
          />
        </div>
      )}
      
      {/* Chat Input - Opens fullscreen on focus */}
      <div 
        className="capsule-input cursor-pointer"
        onClick={handleInputFocus}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleInputFocus();
          }
        }}
      >
        <span className="flex-1 text-muted-foreground text-sm">
          Continue chat in {mode.name} mode...
        </span>
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
          <Send className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
};

export default ModeCard;
