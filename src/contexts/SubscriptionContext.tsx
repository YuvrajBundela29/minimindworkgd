import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export type SubscriptionTier = 'free' | 'pro' | 'ultimate';

export interface SubscriptionLimits {
  creditsPerMonth: number;
  features: {
    truthMode: boolean;
    learningPaths: boolean;
    multiPerspective: boolean;
    ekaksharAdvanced: boolean;
    offlineNotes: boolean;
    weeklyReports: boolean;
    mentorPersonas: boolean;
    adaptiveDifficulty: boolean;
    memoryGraph: boolean;
    priorityResponses: boolean;
  };
}

const FREE_LIMITS: SubscriptionLimits = {
  creditsPerMonth: 50,
  features: {
    truthMode: false,
    learningPaths: false,
    multiPerspective: false,
    ekaksharAdvanced: false,
    offlineNotes: false,
    weeklyReports: false,
    mentorPersonas: false,
    adaptiveDifficulty: false,
    memoryGraph: false,
    priorityResponses: false,
  },
};

const PRO_LIMITS: SubscriptionLimits = {
  creditsPerMonth: 500,
  features: {
    truthMode: true,
    learningPaths: true,
    multiPerspective: true,
    ekaksharAdvanced: true,
    offlineNotes: true,
    weeklyReports: true,
    mentorPersonas: true,
    adaptiveDifficulty: false,
    memoryGraph: false,
    priorityResponses: false,
  },
};

const ULTIMATE_LIMITS: SubscriptionLimits = {
  creditsPerMonth: Infinity,
  features: {
    truthMode: true,
    learningPaths: true,
    multiPerspective: true,
    ekaksharAdvanced: true,
    offlineNotes: true,
    weeklyReports: true,
    mentorPersonas: true,
    adaptiveDifficulty: true,
    memoryGraph: true,
    priorityResponses: true,
  },
};

export type MentorPersona = 'default' | 'calm' | 'hardcore' | 'friendly' | 'expert';

export const mentorPersonas: Record<MentorPersona, { name: string; description: string; icon: string }> = {
  default: { name: 'Default', description: 'Balanced and helpful', icon: '🤖' },
  calm: { name: 'Calm Teacher', description: 'Patient and reassuring', icon: '🧘' },
  hardcore: { name: 'Hardcore Mentor', description: 'Challenging and demanding', icon: '💪' },
  friendly: { name: 'Friendly Guide', description: 'Warm and encouraging', icon: '😊' },
  expert: { name: 'No-Nonsense Expert', description: 'Direct and efficient', icon: '🎯' },
};

interface SubscriptionContextType {
  tier: SubscriptionTier;
  limits: SubscriptionLimits;
  creditsUsed: number;
  creditsRemaining: number;
  isProFeature: (feature: keyof SubscriptionLimits['features']) => boolean;
  hasFeature: (feature: keyof SubscriptionLimits['features']) => boolean;
  canUseCredits: (amount?: number) => boolean;
  useCredits: (amount?: number) => boolean;
  upgradeToPro: () => void;
  upgradeToUltimate: () => void;
  downgradeToFree: () => void;
  showUpgradePrompt: (feature: string) => void;
  isUpgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  upgradeFeature: string;
  // Pro features state
  truthModeEnabled: boolean;
  setTruthModeEnabled: (enabled: boolean) => void;
  selectedMentor: MentorPersona;
  setSelectedMentor: (mentor: MentorPersona) => void;
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
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  
  // Pro feature states
  const [truthModeEnabled, setTruthModeEnabled] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<MentorPersona>('default');

  const limits = tier === 'ultimate' ? ULTIMATE_LIMITS : tier === 'pro' ? PRO_LIMITS : FREE_LIMITS;
  const creditsRemaining = Math.max(0, limits.creditsPerMonth - creditsUsed);

  // Load subscription state from localStorage
  useEffect(() => {
    const savedTier = localStorage.getItem('minimind-tier') as SubscriptionTier;
    const savedCredits = localStorage.getItem('minimind-credits-used');
    const savedMonth = localStorage.getItem('minimind-credits-month');
    const savedTruthMode = localStorage.getItem('minimind-truth-mode');
    const savedMentor = localStorage.getItem('minimind-mentor') as MentorPersona;
    
    if (savedTier && ['free', 'pro', 'ultimate'].includes(savedTier)) {
      setTier(savedTier);
    }
    
    if (savedTruthMode === 'true') {
      setTruthModeEnabled(true);
    }
    
    if (savedMentor && Object.keys(mentorPersonas).includes(savedMentor)) {
      setSelectedMentor(savedMentor);
    }
    
    // Reset credits if it's a new month
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (savedMonth === currentMonth && savedCredits) {
      setCreditsUsed(parseInt(savedCredits, 10));
    } else {
      localStorage.setItem('minimind-credits-month', currentMonth);
      localStorage.setItem('minimind-credits-used', '0');
    }
  }, []);

  // Save credits
  useEffect(() => {
    localStorage.setItem('minimind-credits-used', creditsUsed.toString());
  }, [creditsUsed]);

  // Save tier
  useEffect(() => {
    localStorage.setItem('minimind-tier', tier);
  }, [tier]);

  // Save truth mode
  useEffect(() => {
    localStorage.setItem('minimind-truth-mode', truthModeEnabled.toString());
  }, [truthModeEnabled]);

  // Save mentor
  useEffect(() => {
    localStorage.setItem('minimind-mentor', selectedMentor);
  }, [selectedMentor]);

  const isProFeature = useCallback((feature: keyof SubscriptionLimits['features']) => {
    return !FREE_LIMITS.features[feature];
  }, []);

  const hasFeature = useCallback((feature: keyof SubscriptionLimits['features']) => {
    return limits.features[feature];
  }, [limits.features]);

  const canUseCredits = useCallback((amount: number = 1) => {
    if (tier === 'ultimate') return true;
    return creditsUsed + amount <= limits.creditsPerMonth;
  }, [tier, creditsUsed, limits.creditsPerMonth]);

  const useCredits = useCallback((amount: number = 1) => {
    if (!canUseCredits(amount)) {
      showUpgradePrompt('More Credits');
      return false;
    }
    setCreditsUsed(prev => prev + amount);
    return true;
  }, [canUseCredits]);

  const upgradeToPro = useCallback(() => {
    setTier('pro');
    toast.success('🎉 Welcome to MiniMind Pro!', {
      description: 'You now have 500 credits/month and premium features.',
    });
    setUpgradeModalOpen(false);
  }, []);

  const upgradeToUltimate = useCallback(() => {
    setTier('ultimate');
    toast.success('🚀 Welcome to MiniMind Ultimate!', {
      description: 'Unlimited credits and all features unlocked!',
    });
    setUpgradeModalOpen(false);
  }, []);

  const downgradeToFree = useCallback(() => {
    setTier('free');
    setTruthModeEnabled(false);
    setSelectedMentor('default');
    toast.info('You are now on the Free plan');
  }, []);

  const showUpgradePrompt = useCallback((feature: string) => {
    setUpgradeFeature(feature);
    setUpgradeModalOpen(true);
  }, []);

  const handleSetTruthMode = useCallback((enabled: boolean) => {
    if (enabled && !hasFeature('truthMode')) {
      showUpgradePrompt('Truth Mode');
      return;
    }
    setTruthModeEnabled(enabled);
  }, [hasFeature, showUpgradePrompt]);

  const handleSetMentor = useCallback((mentor: MentorPersona) => {
    if (mentor !== 'default' && !hasFeature('mentorPersonas')) {
      showUpgradePrompt('AI Mentor Personas');
      return;
    }
    setSelectedMentor(mentor);
  }, [hasFeature, showUpgradePrompt]);

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        limits,
        creditsUsed,
        creditsRemaining,
        isProFeature,
        hasFeature,
        canUseCredits,
        useCredits,
        upgradeToPro,
        upgradeToUltimate,
        downgradeToFree,
        showUpgradePrompt,
        isUpgradeModalOpen,
        setUpgradeModalOpen,
        upgradeFeature,
        truthModeEnabled,
        setTruthModeEnabled: handleSetTruthMode,
        selectedMentor,
        setSelectedMentor: handleSetMentor,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
