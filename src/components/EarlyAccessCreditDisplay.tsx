import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Infinity, Sparkles } from 'lucide-react';
import { useEarlyAccess } from '@/contexts/EarlyAccessContext';

interface EarlyAccessCreditDisplayProps {
  variant?: 'minimal' | 'compact' | 'detailed';
  className?: string;
}

const EarlyAccessCreditDisplay: React.FC<EarlyAccessCreditDisplayProps> = ({ 
  variant = 'compact', 
  className = '' 
}) => {
  const { isEarlyAccess, unlimitedCredits } = useEarlyAccess();

  if (!isEarlyAccess || !unlimitedCredits) {
    return null; // Use regular CreditDisplay when not in early access
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/10 text-primary ${className}`}>
        <Infinity className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold">Unlimited</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
          <Infinity className="w-4 h-4 text-primary" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground">Unlimited</span>
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
              <Sparkles className="w-2.5 h-2.5" />
              Early Access
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">Free during launch phase</p>
        </div>
      </motion.div>
    );
  }

  // Detailed variant
  return (
    <motion.div
      className={`p-4 rounded-2xl bg-card border border-border ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
            <Infinity className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Early Access Credits
            </h3>
            <p className="text-xs text-muted-foreground">
              You're part of our founding community
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-primary">
            <Zap className="w-4 h-4" />
            <span className="text-lg font-bold">∞</span>
          </div>
          <p className="text-xs text-muted-foreground">unlimited</p>
        </div>
      </div>

      {/* Early Access Badge */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
        <Sparkles className="w-4 h-4 text-primary" />
        <p className="text-xs text-foreground">
          <span className="font-medium">Free unlimited access</span>
          <span className="text-muted-foreground"> • Thanks for being early!</span>
        </p>
      </div>
    </motion.div>
  );
};

export default EarlyAccessCreditDisplay;
