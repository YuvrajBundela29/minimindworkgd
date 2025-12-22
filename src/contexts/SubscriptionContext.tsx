import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export type SubscriptionTier = 'free' | 'pro';

export interface SubscriptionLimits {
  questionsPerDay: number;
  historyItems: number;
  modes: ('beginner' | 'thinker' | 'story' | 'mastery')[];
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
  };
}

const FREE_LIMITS: SubscriptionLimits = {
  questionsPerDay: 10,
  historyItems: 20,
  modes: ['beginner', 'thinker'],
  features: {
    ekaksharAdvanced: false,
    learningPaths: false,
    truthMode: false,
    multiPerspective: false,
    offlineNotes: false,
    weeklyReports: false,
    mentorPersonas: false,
    adaptiveDifficulty: false,
    memoryGraph: false,
  },
};

const PRO_LIMITS: SubscriptionLimits = {
  questionsPerDay: Infinity,
  historyItems: Infinity,
  modes: ['beginner', 'thinker', 'story', 'mastery'],
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
  },
};

interface SubscriptionContextType {
  tier: SubscriptionTier;
  limits: SubscriptionLimits;
  questionsUsedToday: number;
  isProFeature: (feature: keyof SubscriptionLimits['features']) => boolean;
  isModeAvailable: (mode: string) => boolean;
  canAskQuestion: () => boolean;
  useQuestion: () => boolean;
  upgradeToPro: () => void;
  showUpgradePrompt: (feature: string) => void;
  isUpgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  upgradeFeature: string;
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
  const [questionsUsedToday, setQuestionsUsedToday] = useState(0);
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');

  const limits = tier === 'pro' ? PRO_LIMITS : FREE_LIMITS;

  // Load subscription state from localStorage
  useEffect(() => {
    const savedTier = localStorage.getItem('minimind-tier') as SubscriptionTier;
    const savedQuestions = localStorage.getItem('minimind-questions-today');
    const savedDate = localStorage.getItem('minimind-questions-date');
    
    if (savedTier === 'pro') {
      setTier('pro');
    }
    
    // Reset questions count if it's a new day
    const today = new Date().toDateString();
    if (savedDate === today && savedQuestions) {
      setQuestionsUsedToday(parseInt(savedQuestions, 10));
    } else {
      localStorage.setItem('minimind-questions-date', today);
      localStorage.setItem('minimind-questions-today', '0');
    }
  }, []);

  // Save questions count
  useEffect(() => {
    localStorage.setItem('minimind-questions-today', questionsUsedToday.toString());
  }, [questionsUsedToday]);

  const isProFeature = useCallback((feature: keyof SubscriptionLimits['features']) => {
    return !FREE_LIMITS.features[feature];
  }, []);

  const isModeAvailable = useCallback((mode: string) => {
    return limits.modes.includes(mode as any);
  }, [limits.modes]);

  const canAskQuestion = useCallback(() => {
    if (tier === 'pro') return true;
    return questionsUsedToday < limits.questionsPerDay;
  }, [tier, questionsUsedToday, limits.questionsPerDay]);

  const useQuestion = useCallback(() => {
    if (!canAskQuestion()) {
      showUpgradePrompt('Unlimited Questions');
      return false;
    }
    setQuestionsUsedToday(prev => prev + 1);
    return true;
  }, [canAskQuestion]);

  const upgradeToPro = useCallback(() => {
    // Demo mode: just toggle the tier
    setTier('pro');
    localStorage.setItem('minimind-tier', 'pro');
    toast.success('🎉 Welcome to MiniMind Pro!', {
      description: 'All premium features are now unlocked.',
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
        questionsUsedToday,
        isProFeature,
        isModeAvailable,
        canAskQuestion,
        useQuestion,
        upgradeToPro,
        showUpgradePrompt,
        isUpgradeModalOpen,
        setUpgradeModalOpen,
        upgradeFeature,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
