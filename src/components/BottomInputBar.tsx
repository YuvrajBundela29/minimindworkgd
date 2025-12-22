import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface BottomInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onVoiceInput: () => void;
  onRefinePrompt?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  isRefining?: boolean;
}

const BottomInputBar: React.FC<BottomInputBarProps> = ({
  value,
  onChange,
  onSubmit,
  onVoiceInput,
  onRefinePrompt,
  placeholder = "Ask anything...",
  isLoading = false,
  isRefining = false,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSubmit();
    }
  };

  return (
    <div className="bottom-input-bar">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Voice Input Button */}
        <motion.button
          type="button"
          className="icon-btn icon-btn-ghost flex-shrink-0"
          onClick={onVoiceInput}
          whileTap={{ scale: 0.95 }}
          aria-label="Voice input"
          disabled={isLoading}
        >
          <Mic className="w-5 h-5 text-muted-foreground" />
        </motion.button>
        
        {/* Input Container */}
        <div className="input-container flex-1 min-w-0">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent border-none outline-none text-foreground text-sm py-1"
            disabled={isLoading}
          />
        </div>
        
        {/* Refine Prompt Button */}
        {onRefinePrompt && value.trim() && (
          <motion.button
            type="button"
            className="icon-btn icon-btn-ghost flex-shrink-0"
            onClick={onRefinePrompt}
            whileTap={{ scale: 0.95 }}
            aria-label="Refine prompt"
            disabled={isLoading || isRefining}
            title="Refine your prompt with AI"
          >
            <Wand2 className={`w-5 h-5 ${isRefining ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
          </motion.button>
        )}
        
        {/* Send Button - Always Visible */}
        <motion.button
          type="submit"
          className="icon-btn icon-btn-primary flex-shrink-0"
          whileTap={{ scale: 0.95 }}
          disabled={!value.trim() || isLoading}
          aria-label="Send message"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default BottomInputBar;
