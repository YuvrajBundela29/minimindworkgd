import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { EARLY_ACCESS_CONFIG } from './EarlyAccessContext';

export type SubscriptionTier = 'free' | 'pro';

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
    learningPaths: true, // Available but limited depth
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

interface CreditUsage {
  daily: number;
  monthly: number;
  lastDailyReset: string;
  lastMonthlyReset: string;
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
  isProFeature: (feature: keyof SubscriptionLimits['features']) => boolean;
  hasCredits: (cost?: number) => boolean;
  useCredits: (cost: number, mode?: string) => boolean;
  getCreditCost: (mode: string) => number;
  upgradeToPro: () => void;
  showUpgradePrompt: (feature: string) => void;
  isUpgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  upgradeFeature: string;
  showLowCreditsWarning: boolean;
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
  const [creditUsage, setCreditUsage] = useState<CreditUsage>({
    daily: 0,
    monthly: 0,
    lastDailyReset: new Date().toDateString(),
    lastMonthlyReset: new Date().toISOString().slice(0, 7),
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

  // Load and manage subscription state
  useEffect(() => {
    const savedTier = localStorage.getItem('minimind-tier') as SubscriptionTier;
    const savedUsage = localStorage.getItem('minimind-credit-usage');
    
    if (savedTier === 'pro') {
      setTier('pro');
    }
    
    if (savedUsage) {
      try {
        const usage = JSON.parse(savedUsage) as CreditUsage;
        const today = new Date().toDateString();
        const thisMonth = new Date().toISOString().slice(0, 7);
        
        // Reset daily if new day
        if (usage.lastDailyReset !== today) {
          usage.daily = 0;
          usage.lastDailyReset = today;
        }
        
        // Reset monthly if new month
        if (usage.lastMonthlyReset !== thisMonth) {
          usage.monthly = 0;
          usage.lastMonthlyReset = thisMonth;
        }
        
        setCreditUsage(usage);
      } catch (e) {
        console.error('Error parsing credit usage:', e);
      }
    }
  }, []);

  // Save credit usage
  useEffect(() => {
    localStorage.setItem('minimind-credit-usage', JSON.stringify(creditUsage));
  }, [creditUsage]);

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

  const useCredits = useCallback((cost: number, mode?: string) => {
    // Early Access: No credit deduction
    if (EARLY_ACCESS_CONFIG.isEarlyAccess && EARLY_ACCESS_CONFIG.unlimitedCredits) {
      return true;
    }
    
    if (!hasCredits(cost)) {
      showUpgradePrompt('More Credits');
      return false;
    }
    
    setCreditUsage(prev => ({
      ...prev,
      daily: prev.daily + cost,
      monthly: prev.monthly + cost,
    }));
    
    return true;
  }, [hasCredits]);

  const upgradeToPro = useCallback(() => {
    // Demo mode: just toggle the tier
    setTier('pro');
    localStorage.setItem('minimind-tier', 'pro');
    toast.success('🎉 Welcome to MiniMind Pro!', {
      description: 'All premium features and bonus credits unlocked.',
    });
    setUpgradeModalOpen(false);
  }, []);

  const showUpgradePrompt = useCallback((feature: string) => {
    setUpgradeFeature(feature);
    setUpgradeModalOpen(true);
  }, []);

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
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
