import React from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Paperclip } from 'lucide-react';

interface BottomInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onVoiceInput: () => void;
  placeholder?: string;
  isLoading?: boolean;
}

const BottomInputBar: React.FC<BottomInputBarProps> = ({
  value,
  onChange,
  onSubmit,
  onVoiceInput,
  placeholder = "Ask anything...",
  isLoading = false,
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
        <motion.button
          type="button"
          className="icon-btn icon-btn-ghost flex-shrink-0"
          onClick={onVoiceInput}
          whileTap={{ scale: 0.95 }}
          aria-label="Voice input"
        >
          <Mic className="w-5 h-5 text-muted-foreground" />
        </motion.button>
        
        <div className="input-container flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none text-foreground text-base py-1"
            disabled={isLoading}
          />
        </div>
        
        <motion.button
          type="button"
          className="icon-btn icon-btn-ghost flex-shrink-0"
          whileTap={{ scale: 0.95 }}
          aria-label="Attach file"
        >
          <Paperclip className="w-5 h-5 text-muted-foreground" />
        </motion.button>
        
        <motion.button
          type="submit"
          className="icon-btn icon-btn-primary flex-shrink-0"
          whileTap={{ scale: 0.95 }}
          disabled={!value.trim() || isLoading}
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </form>
    </div>
  );
};

export default BottomInputBar;
