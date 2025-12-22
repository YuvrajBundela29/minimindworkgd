import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Crown, CreditCard } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Progress } from '@/components/ui/progress';

const QuestionLimitBanner: React.FC = () => {
  const { tier, creditsUsed, creditsRemaining, limits, showUpgradePrompt } = useSubscription();

  if (tier === 'ultimate') return null;

  const percentage = limits.creditsPerMonth === Infinity 
    ? 0 
    : (creditsUsed / limits.creditsPerMonth) * 100;
  const isLow = creditsRemaining <= 10;
  const isExhausted = creditsRemaining === 0;

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
          <CreditCard className={`w-4 h-4 ${isExhausted ? 'text-destructive' : isLow ? 'text-amber-500' : 'text-primary'}`} />
          <span className="text-sm font-medium">
            {isExhausted 
              ? 'Credits exhausted' 
              : `${creditsRemaining} credits remaining`
            }
          </span>
        </div>
        {tier === 'free' && (
          <button
            onClick={() => showUpgradePrompt('More Credits')}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 rounded-full hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
          >
            <Crown className="w-3 h-3" />
            Upgrade
          </button>
        )}
      </div>
      <Progress 
        value={percentage} 
        className={`h-1.5 ${isExhausted ? 'bg-destructive/20' : isLow ? 'bg-amber-200 dark:bg-amber-900' : ''}`}
      />
    </motion.div>
  );
};

export default QuestionLimitBanner;
