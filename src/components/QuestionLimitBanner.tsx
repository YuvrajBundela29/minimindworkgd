import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Crown } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Progress } from '@/components/ui/progress';

const QuestionLimitBanner: React.FC = () => {
  const { tier, questionsUsedToday, limits, showUpgradePrompt } = useSubscription();

  if (tier === 'pro') return null;

  const remaining = Math.max(0, limits.questionsPerDay - questionsUsedToday);
  const percentage = (questionsUsedToday / limits.questionsPerDay) * 100;
  const isLow = remaining <= 3;
  const isExhausted = remaining === 0;

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
          <Zap className={`w-4 h-4 ${isExhausted ? 'text-destructive' : isLow ? 'text-amber-500' : 'text-primary'}`} />
          <span className="text-sm font-medium">
            {isExhausted 
              ? 'Daily limit reached' 
              : `${remaining} questions left today`
            }
          </span>
        </div>
        <button
          onClick={() => showUpgradePrompt('Unlimited Questions')}
          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 rounded-full hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
        >
          <Crown className="w-3 h-3" />
          Go Pro
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
