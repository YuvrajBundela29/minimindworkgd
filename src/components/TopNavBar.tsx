import React, { useEffect, useState } from 'react';
import { Bell, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSubscription, CREDIT_LIMITS } from '@/contexts/SubscriptionContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Sparkles, Brain, CalendarClock, ArrowUpRight } from 'lucide-react';

interface TopNavBarProps {
  onNavigateToSubscription?: () => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ onNavigateToSubscription }) => {
  const { tier, getCredits, subscription } = useSubscription();
  const [creditOpen, setCreditOpen] = useState(false);
  const credits = getCredits();
  const limits = CREDIT_LIMITS[tier];
  const totalLimit = limits.daily + limits.monthly;
  const percentage = totalLimit > 0 ? (credits.total / totalLimit) * 100 : 0;
  const isLow = percentage > 0 && percentage <= 30;
  const isZero = credits.total <= 0;

  const resetDate = subscription.currentPeriodEnd
    ? subscription.currentPeriodEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : 'Tomorrow';

  const tierLabel = tier === 'pro' ? 'Pro' : tier === 'plus' ? 'Plus' : 'Free';
  const TierIcon = tier === 'pro' ? Crown : tier === 'plus' ? Sparkles : Brain;

  const pillBg = tier !== 'free'
    ? 'bg-primary/10 text-primary border-primary/20'
    : isLow || isZero
    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    : 'bg-muted text-foreground border-border';

  return (
    <header className="top-navbar">
      {/* Left: Logo text only */}
      <div className="flex items-center">
        <span className="logo-text-clean">MiniMind</span>
      </div>

      {/* Right: Credit badge + bell */}
      <div className="flex items-center gap-2">
        {/* Credit Pill */}
        <Popover open={creditOpen} onOpenChange={setCreditOpen}>
          <PopoverTrigger asChild>
            <motion.button
              className={`credit-pill ${pillBg}`}
              whileTap={{ scale: 0.95 }}
              aria-label={`${credits.total} credits remaining`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{credits.total}</span>
            </motion.button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TierIcon className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm text-foreground">MiniMind {tierLabel}</span>
                </div>
                <span className="text-xs text-muted-foreground">{credits.total} credits</span>
              </div>
              <Progress value={Math.min(percentage, 100)} className="h-2" />
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Daily</span>
                  <span>{credits.daily} / {limits.daily}</span>
                </div>
                {limits.monthly > 0 && (
                  <div className="flex justify-between">
                    <span>Monthly</span>
                    <span>{credits.monthly} / {limits.monthly}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 border-t border-border">
                <CalendarClock className="w-3.5 h-3.5" />
                <span>{tier === 'free' ? 'Daily credits reset at midnight' : `Credits refill on ${resetDate}`}</span>
              </div>
              {tier !== 'pro' && onNavigateToSubscription && (
                <Button size="sm" className="w-full mt-1" onClick={() => { setCreditOpen(false); onNavigateToSubscription(); }}>
                  Upgrade Plan <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Notification bell */}
        <motion.button
          className="icon-btn-nav"
          whileTap={{ scale: 0.95 }}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      </div>
    </header>
  );
};

export default TopNavBar;
