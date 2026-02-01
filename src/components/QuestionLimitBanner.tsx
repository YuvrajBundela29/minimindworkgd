import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Crown, AlertCircle } from 'lucide-react';
import { useSubscription, FREE_DAILY_LIMIT } from '@/contexts/SubscriptionContext';
import { Progress } from '@/components/ui/progress';

const QuestionLimitBanner: React.FC = () => {
  const { tier, subscription, showUpgradePrompt, getRemainingQuestions, canAskQuestion } = useSubscription();

  // Don't show for paid users
  if (tier === 'plus' || tier === 'pro') return null;

  const remaining = getRemainingQuestions();
  if (remaining === 'unlimited') return null;

  const percentage = (subscription.dailyQuestionsUsed / FREE_DAILY_LIMIT) * 100;
  const isLow = remaining <= 2;
  const isExhausted = remaining <= 0;

  // Only show when low or exhausted
  if (remaining > 2) return null;

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
            <Zap className={`w-4 h-4 ${isLow ? 'text-amber-500' : 'text-primary'}`} />
          )}
          <span className="text-sm font-medium">
            {isExhausted 
              ? 'Daily limit reached' 
              : `${remaining} question${remaining !== 1 ? 's' : ''} left today`
            }
          </span>
        </div>
        <button
          onClick={() => showUpgradePrompt('Unlimited Questions')}
          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/30 rounded-full hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
        >
          <Crown className="w-3 h-3" />
          Get Unlimited
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
