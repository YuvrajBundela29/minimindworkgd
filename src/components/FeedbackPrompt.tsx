import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackPromptProps {
  onFeedback?: (type: 'helpful' | 'not_helpful', comment?: string) => void;
}

const FeedbackPrompt: React.FC<FeedbackPromptProps> = ({ onFeedback }) => {
  const [hasResponded, setHasResponded] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [feedbackType, setFeedbackType] = useState<'helpful' | 'not_helpful' | null>(null);

  const handleFeedback = (type: 'helpful' | 'not_helpful') => {
    setFeedbackType(type);
    if (type === 'helpful') {
      setHasResponded(true);
      onFeedback?.(type);
      toast.success('Thanks for your feedback! 💙');
    } else {
      setShowComment(true);
    }
  };

  const submitComment = () => {
    setHasResponded(true);
    setShowComment(false);
    onFeedback?.('not_helpful', comment);
    toast.success('Thanks! Your feedback helps us improve.');
  };

  if (hasResponded) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-xs text-muted-foreground mt-2"
      >
        <span>You're helping shape MiniMind ✨</span>
      </motion.div>
    );
  }

  return (
    <div className="mt-3">
      <AnimatePresence mode="wait">
        {!showComment ? (
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs text-muted-foreground">Was this helpful?</span>
            <motion.button
              onClick={() => handleFeedback('helpful')}
              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <ThumbsUp className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => handleFeedback('not_helpful')}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <ThumbsDown className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="comment"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">What could be better?</span>
              <button
                onClick={() => setShowComment(false)}
                className="ml-auto p-1 rounded-full hover:bg-muted text-muted-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Quick suggestion..."
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-muted border-none outline-none focus:ring-2 focus:ring-primary/20"
              />
              <motion.button
                onClick={submitComment}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground"
                whileTap={{ scale: 0.95 }}
              >
                Send
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackPrompt;
