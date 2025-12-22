import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/contexts/SubscriptionContext';
import ProBadge from './ProBadge';

interface LockedFeatureProps {
  featureName: string;
  featureKey?: keyof ReturnType<typeof useSubscription>['limits']['features'];
  children: React.ReactNode;
  className?: string;
  variant?: 'overlay' | 'blur' | 'disabled';
  showPreview?: boolean;
}

const LockedFeature: React.FC<LockedFeatureProps> = ({
  featureName,
  featureKey,
  children,
  className,
  variant = 'overlay',
  showPreview = true,
}) => {
  const { tier, showUpgradePrompt, isProFeature } = useSubscription();

  // Check if feature is locked
  const isLocked = featureKey ? (tier === 'free' && isProFeature(featureKey)) : tier === 'free';

  if (!isLocked) {
    return <>{children}</>;
  }

  const handleClick = () => {
    showUpgradePrompt(featureName);
  };

  if (variant === 'disabled') {
    return (
      <div 
        className={cn('relative cursor-pointer', className)}
        onClick={handleClick}
      >
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute top-2 right-2">
          <ProBadge size="sm" variant="subtle" />
        </div>
      </div>
    );
  }

  if (variant === 'blur') {
    return (
      <div 
        className={cn('relative cursor-pointer group', className)}
        onClick={handleClick}
      >
        <div className="blur-sm pointer-events-none transition-all group-hover:blur-md">
          {showPreview && children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 rounded-xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-2 p-4"
          >
            <div className="p-3 rounded-full bg-gradient-to-br from-amber-500 to-orange-500">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <ProBadge size="md" variant="glow" />
            <p className="text-sm text-muted-foreground text-center mt-1">
              Tap to unlock {featureName}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Default: overlay
  return (
    <div 
      className={cn('relative cursor-pointer group', className)}
      onClick={handleClick}
    >
      {showPreview && (
        <div className="opacity-40 pointer-events-none">
          {children}
        </div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-[2px] rounded-xl border-2 border-dashed border-amber-500/30 group-hover:border-amber-500/50 transition-colors"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center gap-3 p-6"
        >
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <ProBadge size="md" variant="glow" className="mb-2" />
            <p className="text-sm font-medium text-foreground">{featureName}</p>
            <p className="text-xs text-muted-foreground mt-1">Tap to unlock</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LockedFeature;
