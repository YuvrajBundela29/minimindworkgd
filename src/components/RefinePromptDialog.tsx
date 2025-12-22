import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RefreshCw, Sparkles } from 'lucide-react';

interface RefinePromptDialogProps {
  isOpen: boolean;
  originalPrompt: string;
  refinedPrompt: string;
  onAccept: () => void;
  onReject: () => void;
  onReRefine: () => void;
  isRefining: boolean;
}

const RefinePromptDialog: React.FC<RefinePromptDialogProps> = ({
  isOpen,
  originalPrompt,
  refinedPrompt,
  onAccept,
  onReject,
  onReRefine,
  isRefining,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onReject}
        >
          <motion.div
            className="w-full max-w-md bg-background rounded-2xl shadow-xl border border-border overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-2 p-4 border-b border-border bg-muted/50">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-semibold text-foreground">Refined Prompt</h3>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Original */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Original:</p>
                <p className="text-sm text-foreground/70 bg-muted/50 rounded-lg p-3">
                  {originalPrompt}
                </p>
              </div>

              {/* Refined */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Refined:</p>
                <p className="text-sm text-foreground bg-primary/10 border border-primary/20 rounded-lg p-3">
                  {refinedPrompt}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 p-4 border-t border-border bg-muted/30">
              <motion.button
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm"
                onClick={onAccept}
                whileTap={{ scale: 0.98 }}
              >
                <Check className="w-4 h-4" />
                Use This
              </motion.button>

              <motion.button
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 font-medium text-sm"
                onClick={onReRefine}
                whileTap={{ scale: 0.98 }}
                disabled={isRefining}
              >
                {isRefining ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Re-refine
              </motion.button>

              <motion.button
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted hover:bg-destructive/10 hover:text-destructive"
                onClick={onReject}
                whileTap={{ scale: 0.98 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RefinePromptDialog;
