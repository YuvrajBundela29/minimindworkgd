import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EARLY_ACCESS_CONFIG } from './EarlyAccessContext';

export type SubscriptionTier = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';
export type PlanType = 'monthly' | 'yearly';

// Credit costs per mode (deeper = more credits)
export const CREDIT_COSTS = {
  beginner: 1,
  thinker: 2,
  story: 2,
  mastery: 3,
  ekakshar: 0.5,
  learningPath: 5,
} as const;

export interface SubscriptionLimits {
  dailyCredits: number;
  monthlyCredits: number;
  historyItems: number;
  features: {
    ekaksharAdvanced: boolean;
    learningPaths: boolean;
    truthMode: boolean;
    multiPerspective: boolean;
    offlineNotes: boolean;
    weeklyReports: boolean;
    mentorPersonas: boolean;
    adaptiveDifficulty: boolean;
    memoryGraph: boolean;
    priorityResponses: boolean;
  };
}

const FREE_LIMITS: SubscriptionLimits = {
  dailyCredits: 15,
  monthlyCredits: 0,
  historyItems: 20,
  features: {
    ekaksharAdvanced: false,
    learningPaths: true,
    truthMode: false,
    multiPerspective: false,
    offlineNotes: false,
    weeklyReports: false,
    mentorPersonas: false,
    adaptiveDifficulty: false,
    memoryGraph: false,
    priorityResponses: false,
  },
};

const PRO_LIMITS: SubscriptionLimits = {
  dailyCredits: 100,
  monthlyCredits: 500,
  historyItems: Infinity,
  features: {
    ekaksharAdvanced: true,
    learningPaths: true,
    truthMode: true,
    multiPerspective: true,
    offlineNotes: true,
    weeklyReports: true,
    mentorPersonas: true,
    adaptiveDifficulty: true,
    memoryGraph: true,
    priorityResponses: true,
  },
};

interface SubscriptionData {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  planType: PlanType | null;
  currentPeriodEnd: string | null;
  creditsDaily: number;
  creditsMonthly: number;
}

interface SubscriptionContextType {
  tier: SubscriptionTier;
  limits: SubscriptionLimits;
  credits: {
    available: number;
    dailyUsed: number;
    monthlyUsed: number;
    dailyLimit: number;
    monthlyLimit: number;
  };
  subscription: SubscriptionData | null;
  isLoading: boolean;
  isProFeature: (feature: keyof SubscriptionLimits['features']) => boolean;
  hasCredits: (cost?: number) => boolean;
  useCredits: (cost: number, mode?: string) => Promise<boolean>;
  getCreditCost: (mode: string) => number;
  upgradeToPro: () => void;
  showUpgradePrompt: (feature: string) => void;
  isUpgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  upgradeFeature: string;
  showLowCreditsWarning: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [creditUsage, setCreditUsage] = useState({
    daily: 0,
    monthly: 0,
  });
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [showLowCreditsWarning, setShowLowCreditsWarning] = useState(false);

  const limits = tier === 'pro' ? PRO_LIMITS : FREE_LIMITS;

  // Calculate available credits
  const dailyRemaining = limits.dailyCredits - creditUsage.daily;
  const monthlyRemaining = tier === 'pro' ? limits.monthlyCredits - creditUsage.monthly : 0;
  const availableCredits = tier === 'pro' 
    ? Math.min(dailyRemaining, monthlyRemaining + dailyRemaining)
    : dailyRemaining;

  // Clear any stale localStorage tier data on mount
  useEffect(() => {
    localStorage.removeItem('minimind-tier');
  }, []);

  // Fetch subscription from database
  const fetchSubscription = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setTier('free');
        setSubscription(null);
        setCreditUsage({ daily: 0, monthly: 0 });
        setIsLoading(false);
        return;
      }

      // Fetch subscription from database
      const { data: subData, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setTier('free');
        setIsLoading(false);
        return;
      }

      if (!subData) {
        // No subscription record exists - create one
        const { data: newSub, error: insertError } = await supabase
          .from('user_subscriptions')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating subscription:', insertError);
          setTier('free');
          setIsLoading(false);
          return;
        }

        setTier('free');
        setSubscription({
          tier: 'free',
          status: 'active',
          planType: null,
          currentPeriodEnd: null,
          creditsDaily: 0,
          creditsMonthly: 0,
        });
        setCreditUsage({ daily: 0, monthly: 0 });
        setIsLoading(false);
        return;
      }

      // Check if we need to reset credits
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7);
      
      let dailyUsed = subData.credits_daily_used;
      let monthlyUsed = subData.credits_monthly_used;
      let needsUpdate = false;

      // Reset daily credits if new day
      if (subData.credits_last_daily_reset !== today) {
        dailyUsed = 0;
        needsUpdate = true;
      }

      // Reset monthly credits if new month
      const lastMonthlyReset = subData.credits_last_monthly_reset?.slice(0, 7);
      if (lastMonthlyReset !== thisMonth) {
        monthlyUsed = 0;
        needsUpdate = true;
      }

      // Update database if resets occurred
      if (needsUpdate) {
        await supabase
          .from('user_subscriptions')
          .update({
            credits_daily_used: dailyUsed,
            credits_monthly_used: monthlyUsed,
            credits_last_daily_reset: today,
            credits_last_monthly_reset: new Date().toISOString().split('T')[0],
          })
          .eq('user_id', user.id);
      }

      // Check if subscription has expired
      const subscriptionTier = subData.tier as SubscriptionTier;
      const subscriptionStatus = subData.status as SubscriptionStatus;
      
      let effectiveTier = subscriptionTier;
      if (subscriptionTier === 'pro' && subData.current_period_end) {
        const periodEnd = new Date(subData.current_period_end);
        if (periodEnd < new Date() && subscriptionStatus !== 'active') {
          effectiveTier = 'free';
        }
      }

      setTier(effectiveTier);
      setSubscription({
        tier: effectiveTier,
        status: subscriptionStatus,
        planType: subData.plan_type as PlanType | null,
        currentPeriodEnd: subData.current_period_end,
        creditsDaily: dailyUsed,
        creditsMonthly: monthlyUsed,
      });
      setCreditUsage({
        daily: dailyUsed,
        monthly: monthlyUsed,
      });
      setIsLoading(false);
    } catch (err) {
      console.error('Error in fetchSubscription:', err);
      setTier('free');
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and auth state listener
  useEffect(() => {
    fetchSubscription();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          fetchSubscription();
        } else {
          setTier('free');
          setSubscription(null);
          setCreditUsage({ daily: 0, monthly: 0 });
          setIsLoading(false);
        }
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, [fetchSubscription]);

  // Check for low credits warning
  useEffect(() => {
    const warningThreshold = limits.dailyCredits * 0.2;
    setShowLowCreditsWarning(dailyRemaining <= warningThreshold && dailyRemaining > 0);
  }, [dailyRemaining, limits.dailyCredits]);

  const isProFeature = useCallback((feature: keyof SubscriptionLimits['features']) => {
    return !FREE_LIMITS.features[feature];
  }, []);

  const getCreditCost = useCallback((mode: string): number => {
    return CREDIT_COSTS[mode as keyof typeof CREDIT_COSTS] || 1;
  }, []);

  const hasCredits = useCallback((cost: number = 1) => {
    return availableCredits >= cost;
  }, [availableCredits]);

  const useCredits = useCallback(async (cost: number, mode?: string) => {
    // Early Access: No credit deduction
    if (EARLY_ACCESS_CONFIG.isEarlyAccess && EARLY_ACCESS_CONFIG.unlimitedCredits) {
      return true;
    }
    
    if (!hasCredits(cost)) {
      showUpgradePrompt('More Credits');
      return false;
    }
    
    const newDailyUsed = creditUsage.daily + cost;
    const newMonthlyUsed = creditUsage.monthly + cost;
    
    setCreditUsage({
      daily: newDailyUsed,
      monthly: newMonthlyUsed,
    });
    
    // Update database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_subscriptions')
        .update({
          credits_daily_used: newDailyUsed,
          credits_monthly_used: newMonthlyUsed,
        })
        .eq('user_id', user.id);
    }
    
    return true;
  }, [hasCredits, creditUsage]);

  const upgradeToPro = useCallback(() => {
    // This now only opens the upgrade modal
    // Actual upgrade happens via Razorpay webhook
    setUpgradeModalOpen(true);
    toast.info('Select a plan to upgrade', {
      description: 'Complete payment via Razorpay to activate Pro.',
    });
  }, []);

  const showUpgradePrompt = useCallback((feature: string) => {
    setUpgradeFeature(feature);
    setUpgradeModalOpen(true);
  }, []);

  const refreshSubscription = useCallback(async () => {
    await fetchSubscription();
  }, [fetchSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        limits,
        credits: {
          available: availableCredits,
          dailyUsed: creditUsage.daily,
          monthlyUsed: creditUsage.monthly,
          dailyLimit: limits.dailyCredits,
          monthlyLimit: limits.monthlyCredits,
        },
        subscription,
        isLoading,
        isProFeature,
        hasCredits,
        useCredits,
        getCreditCost,
        upgradeToPro,
        showUpgradePrompt,
        isUpgradeModalOpen,
        setUpgradeModalOpen,
        upgradeFeature,
        showLowCreditsWarning,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
