import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Three-tier subscription model
export type SubscriptionTier = 'free' | 'plus' | 'pro';
export type PlanType = 'monthly' | 'yearly';

// Feature access per tier
export interface TierFeatures {
  unlimitedQuestions: boolean;
  purposeLens: boolean;
  explainBack: boolean;
  learningHistory: boolean;
  priorityResponses: boolean;
  deeperMastery: boolean;
  advancedLearningPaths: boolean;
  earlyAccess: boolean;
}

const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  free: {
    unlimitedQuestions: false,
    purposeLens: false,
    explainBack: false,
    learningHistory: false,
    priorityResponses: false,
    deeperMastery: false,
    advancedLearningPaths: false,
    earlyAccess: false,
  },
  plus: {
    unlimitedQuestions: true,
    purposeLens: true,
    explainBack: true,
    learningHistory: true,
    priorityResponses: false,
    deeperMastery: false,
    advancedLearningPaths: false,
    earlyAccess: false,
  },
  pro: {
    unlimitedQuestions: true,
    purposeLens: true,
    explainBack: true,
    learningHistory: true,
    priorityResponses: true,
    deeperMastery: true,
    advancedLearningPaths: true,
    earlyAccess: true,
  },
};

// Pricing in INR
export const PRICING = {
  plus: {
    monthly: 149,
    yearly: 1199, // ~33% off
    yearlyMonthly: 100, // per month when billed yearly
  },
  pro: {
    monthly: 299,
    yearly: 2399, // ~33% off
    yearlyMonthly: 200, // per month when billed yearly
  },
};

// Free tier daily limit
export const FREE_DAILY_LIMIT = 5;

interface SubscriptionState {
  tier: SubscriptionTier;
  planType: PlanType | null;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  currentPeriodEnd: Date | null;
  dailyQuestionsUsed: number;
  isInGracePeriod: boolean;
}

interface SubscriptionContextType {
  // State
  tier: SubscriptionTier;
  features: TierFeatures;
  subscription: SubscriptionState;
  isLoading: boolean;
  
  // Checks
  hasFeature: (feature: keyof TierFeatures) => boolean;
  canAskQuestion: () => boolean;
  getRemainingQuestions: () => number | 'unlimited';
  
  // Actions
  useQuestion: () => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
  
  // Upgrade flow
  isUpgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  upgradeFeature: string;
  showUpgradePrompt: (feature: string) => void;
  
  // Checkout
  initiateCheckout: (tier: 'plus' | 'pro', planType: PlanType) => Promise<void>;
  isCheckoutLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  
  const [subscription, setSubscription] = useState<SubscriptionState>({
    tier: 'free',
    planType: null,
    status: 'active',
    currentPeriodEnd: null,
    dailyQuestionsUsed: 0,
    isInGracePeriod: false,
  });

  const tier = subscription.tier;
  const features = TIER_FEATURES[tier];

  // Load subscription from database
  const refreshSubscription = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscription({
          tier: 'free',
          planType: null,
          status: 'active',
          currentPeriodEnd: null,
          dailyQuestionsUsed: 0,
          isInGracePeriod: false,
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        setIsLoading(false);
        return;
      }

      const now = new Date();
      const periodEnd = data.current_period_end ? new Date(data.current_period_end) : null;
      const gracePeriodEnd = data.grace_period_end ? new Date(data.grace_period_end) : null;
      
      // Check if in grace period
      const isInGracePeriod = gracePeriodEnd && now < gracePeriodEnd;
      
      // Reset daily count if new day
      const lastReset = data.last_question_reset ? new Date(data.last_question_reset) : null;
      const isNewDay = !lastReset || lastReset.toDateString() !== now.toDateString();
      const dailyUsed = isNewDay ? 0 : (data.daily_questions_used || 0);

      setSubscription({
        tier: (data.tier as SubscriptionTier) || 'free',
        planType: data.plan_type as PlanType | null,
        status: data.status as 'active' | 'cancelled' | 'expired' | 'pending',
        currentPeriodEnd: periodEnd,
        dailyQuestionsUsed: dailyUsed,
        isInGracePeriod: !!isInGracePeriod,
      });
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount and auth changes
  useEffect(() => {
    refreshSubscription();
    
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(() => {
      refreshSubscription();
    });

    return () => authSub.unsubscribe();
  }, [refreshSubscription]);

  const hasFeature = useCallback((feature: keyof TierFeatures) => {
    return features[feature];
  }, [features]);

  const canAskQuestion = useCallback(() => {
    if (tier === 'plus' || tier === 'pro') return true;
    return subscription.dailyQuestionsUsed < FREE_DAILY_LIMIT;
  }, [tier, subscription.dailyQuestionsUsed]);

  const getRemainingQuestions = useCallback(() => {
    if (tier === 'plus' || tier === 'pro') return 'unlimited';
    return Math.max(0, FREE_DAILY_LIMIT - subscription.dailyQuestionsUsed);
  }, [tier, subscription.dailyQuestionsUsed]);

  const useQuestion = useCallback(async () => {
    // Plus and Pro have unlimited
    if (tier === 'plus' || tier === 'pro') {
      // Still track usage for analytics
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('user_subscriptions')
            .update({ 
              daily_questions_used: subscription.dailyQuestionsUsed + 1,
              last_question_reset: new Date().toISOString().split('T')[0]
            })
            .eq('user_id', user.id);
        }
      } catch (e) {
        // Silent fail for tracking
      }
      return true;
    }
    
    // Free tier - check limit
    if (subscription.dailyQuestionsUsed >= FREE_DAILY_LIMIT) {
      showUpgradePrompt('Unlimited Questions');
      return false;
    }
    
    // Increment usage
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_subscriptions')
          .update({ 
            daily_questions_used: subscription.dailyQuestionsUsed + 1,
            last_question_reset: new Date().toISOString().split('T')[0]
          })
          .eq('user_id', user.id);
      }
      
      setSubscription(prev => ({
        ...prev,
        dailyQuestionsUsed: prev.dailyQuestionsUsed + 1
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating usage:', error);
      return true; // Allow question on error
    }
  }, [tier, subscription.dailyQuestionsUsed]);

  const showUpgradePrompt = useCallback((feature: string) => {
    setUpgradeFeature(feature);
    setUpgradeModalOpen(true);
  }, []);

  const initiateCheckout = useCallback(async (checkoutTier: 'plus' | 'pro', planType: PlanType) => {
    setIsCheckoutLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to subscribe');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { tier: checkoutTier, planType }
      });

      if (error) throw error;

      // Load Razorpay SDK if not loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
      }

      const options = {
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: 'INR',
        name: 'MiniMind',
        description: `MiniMind ${checkoutTier.charAt(0).toUpperCase() + checkoutTier.slice(1)} - ${planType}`,
        handler: async function(response: any) {
          // Verify payment
          const { error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
            body: {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              tier: checkoutTier,
              planType
            }
          });

          if (verifyError) {
            toast.error('Payment verification failed. Please contact support.');
            return;
          }

          toast.success(`🎉 Welcome to MiniMind ${checkoutTier.charAt(0).toUpperCase() + checkoutTier.slice(1)}!`);
          refreshSubscription();
          setUpgradeModalOpen(false);
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#8B5CF6'
        },
        modal: {
          ondismiss: function() {
            setIsCheckoutLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to initiate checkout. Please try again.');
    } finally {
      setIsCheckoutLoading(false);
    }
  }, [refreshSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        features,
        subscription,
        isLoading,
        hasFeature,
        canAskQuestion,
        getRemainingQuestions,
        useQuestion,
        refreshSubscription,
        isUpgradeModalOpen,
        setUpgradeModalOpen,
        upgradeFeature,
        showUpgradePrompt,
        initiateCheckout,
        isCheckoutLoading,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

// Type augmentation for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}
