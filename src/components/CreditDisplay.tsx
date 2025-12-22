import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Crown, AlertCircle } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface CreditDisplayProps {
  variant?: 'minimal' | 'compact' | 'detailed';
  className?: string;
}

const CreditDisplay: React.FC<CreditDisplayProps> = ({ variant = 'compact', className = '' }) => {
  const { tier, credits, showLowCreditsWarning, showUpgradePrompt } = useSubscription();

  const percentUsed = (credits.dailyUsed / credits.dailyLimit) * 100;
  const isLow = credits.available <= credits.dailyLimit * 0.2;

  if (variant === 'minimal') {
    return (
      <button
        onClick={() => showUpgradePrompt('More Credits')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-colors ${
          isLow 
            ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' 
            : 'bg-primary/10 text-primary hover:bg-primary/20'
        } ${className}`}
      >
        <Zap className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold">{Math.floor(credits.available)}</span>
        {tier === 'pro' && <Crown className="w-3 h-3 text-amber-500" />}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.button
        onClick={() => showUpgradePrompt('More Credits')}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors ${className}`}
        whileTap={{ scale: 0.98 }}
      >
        <div className={`p-1.5 rounded-lg ${isLow ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
          <Zap className={`w-4 h-4 ${isLow ? 'text-amber-500' : 'text-primary'}`} />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground">
              {Math.floor(credits.available)} credits
            </span>
            {tier === 'pro' && <Crown className="w-3.5 h-3.5 text-amber-500" />}
          </div>
          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isLow ? 'bg-amber-500' : 'bg-primary'}`}
              initial={{ width: 0 }}
              animate={{ width: `${100 - percentUsed}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        {isLow && <AlertCircle className="w-4 h-4 text-amber-500" />}
      </motion.button>
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
          <div className={`p-2 rounded-xl ${tier === 'pro' ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-primary'}`}>
            {tier === 'pro' ? (
              <Crown className="w-5 h-5 text-white" />
            ) : (
              <Zap className="w-5 h-5 text-primary-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {tier === 'pro' ? 'Pro Credits' : 'Free Credits'}
            </h3>
            <p className="text-xs text-muted-foreground">
              Resets daily at midnight
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{Math.floor(credits.available)}</p>
          <p className="text-xs text-muted-foreground">available</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Daily: {credits.dailyUsed}/{credits.dailyLimit}</span>
          {tier === 'pro' && <span>Monthly: {credits.monthlyUsed}/{credits.monthlyLimit}</span>}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isLow ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-primary to-accent'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${100 - percentUsed}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {isLow && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 text-amber-600"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-xs">
            Running low! {tier === 'free' ? 'Upgrade for more credits' : 'Credits reset at midnight'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CreditDisplay;
