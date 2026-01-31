import React, { createContext, useContext, ReactNode } from 'react';

// Early Access Configuration - Central place to manage launch phase settings
// Early Access is now DISABLED - Credit-based monetization is ACTIVE
export const EARLY_ACCESS_CONFIG = {
  isEarlyAccess: false,
  unlimitedCredits: false,
  freeTrialDays: 0,
  dailyCreditsAfterLaunch: 15,
  showLifetimeReward: false,
  launchDate: new Date(), // Launched!
};

interface EarlyAccessContextType {
  isEarlyAccess: boolean;
  unlimitedCredits: boolean;
  freeTrialDays: number;
  dailyCreditsAfterLaunch: number;
  showLifetimeReward: boolean;
}

const EarlyAccessContext = createContext<EarlyAccessContextType | undefined>(undefined);

export const useEarlyAccess = () => {
  const context = useContext(EarlyAccessContext);
  if (!context) {
    throw new Error('useEarlyAccess must be used within an EarlyAccessProvider');
  }
  return context;
};

interface EarlyAccessProviderProps {
  children: ReactNode;
}

export const EarlyAccessProvider: React.FC<EarlyAccessProviderProps> = ({ children }) => {
  return (
    <EarlyAccessContext.Provider value={EARLY_ACCESS_CONFIG}>
      {children}
    </EarlyAccessContext.Provider>
  );
};
