import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Crown, AlertCircle, Coins } from 'lucide-react';
import { useSubscription, CREDIT_LIMITS } from '@/contexts/SubscriptionContext';
import { Progress } from '@/components/ui/progress';

const QuestionLimitBanner: React.FC = () => {
  const { tier, showUpgradePrompt, getCredits } = useSubscription();

  const credits = getCredits();
  const limits = CREDIT_LIMITS[tier];
  
  // Show credit info for all tiers
  const percentage = limits.daily > 0 
    ? ((limits.daily - credits.daily) / limits.daily) * 100 
    : 0;
  
  const isLow = credits.total <= 5;
  const isExhausted = credits.total <= 0;

  // Only show when low or exhausted
  if (credits.total > 5) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mx-4 mb-3 p-3 rounded-xl border ${
        isExhausted 
          ? 'bg-destructive/10 border-destructive/30' 
          : isLow 
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' 
            : 'bg-muted/50 border-border'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isExhausted ? (
            <AlertCircle className="w-4 h-4 text-destructive" />
          ) : (
            <Coins className={`w-4 h-4 ${isLow ? 'text-amber-500' : 'text-primary'}`} />
          )}
          <span className="text-sm font-medium">
            {isExhausted 
              ? 'Out of credits' 
              : `${credits.total} credit${credits.total !== 1 ? 's' : ''} remaining`
            }
          </span>
        </div>
        <button
          onClick={() => showUpgradePrompt('More Credits')}
          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/30 rounded-full hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
        >
          <Crown className="w-3 h-3" />
          {tier === 'free' ? 'Upgrade' : 'Top Up'}
        </button>
      </div>
      <Progress 
        value={percentage} 
        className={`h-1.5 ${isExhausted ? 'bg-destructive/20' : isLow ? 'bg-amber-200 dark:bg-amber-900' : ''}`}
      />
    </motion.div>
  );
};

export default QuestionLimitBanner;
