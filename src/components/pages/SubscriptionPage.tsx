import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Zap, Crown, CreditCard } from 'lucide-react';
import { useSubscription, SubscriptionTier } from '@/contexts/SubscriptionContext';

const tiers: { 
  id: SubscriptionTier; 
  name: string; 
  price: string; 
  credits: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
}[] = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    credits: '50 credits/month',
    description: 'Perfect for getting started',
    icon: <Zap className="w-6 h-6" />,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹299',
    credits: '500 credits/month',
    description: 'For serious learners',
    icon: <Sparkles className="w-6 h-6" />,
    popular: true,
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: '₹799',
    credits: 'Unlimited credits',
    description: 'Maximum learning potential',
    icon: <Crown className="w-6 h-6" />,
  },
];

const features = [
  { name: 'All 4 Learning Modes', free: true, pro: true, ultimate: true },
  { name: 'Basic Ekakshar Summaries', free: true, pro: true, ultimate: true },
  { name: 'Voice Input/Output', free: true, pro: true, ultimate: true },
  { name: 'Question History', free: '20 items', pro: 'Unlimited', ultimate: 'Unlimited' },
  { name: 'Truth Mode', free: false, pro: true, ultimate: true },
  { name: 'Learning Paths', free: false, pro: true, ultimate: true },
  { name: 'AI Mentor Personas', free: false, pro: true, ultimate: true },
  { name: 'Multi-Perspective Answers', free: false, pro: true, ultimate: true },
  { name: 'Advanced Ekakshar++', free: false, pro: true, ultimate: true },
  { name: 'Offline Notes Export', free: false, pro: true, ultimate: true },
  { name: 'Weekly Mind Reports', free: false, pro: true, ultimate: true },
  { name: 'Adaptive Difficulty', free: false, pro: false, ultimate: true },
  { name: 'Memory Graph', free: false, pro: false, ultimate: true },
  { name: 'Priority AI Responses', free: false, pro: false, ultimate: true },
];

const SubscriptionPage: React.FC = () => {
  const { 
    tier: currentTier, 
    creditsUsed, 
    creditsRemaining, 
    limits,
    upgradeToPro, 
    upgradeToUltimate, 
    downgradeToFree 
  } = useSubscription();

  const handleSelectTier = (tierId: SubscriptionTier) => {
    if (tierId === currentTier) return;
    
    if (tierId === 'free') {
      downgradeToFree();
    } else if (tierId === 'pro') {
      upgradeToPro();
    } else if (tierId === 'ultimate') {
      upgradeToUltimate();
    }
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'string') {
      return <span className="text-sm text-foreground">{value}</span>;
    }
    return value ? (
      <Check className="w-5 h-5 text-emerald-500" />
    ) : (
      <X className="w-5 h-5 text-muted-foreground/40" />
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground">
          Unlock your full learning potential
        </p>
      </div>

      {/* Credit Usage Card */}
      <motion.div
        className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Credits This Month</span>
          </div>
          <span className="text-sm text-muted-foreground capitalize">{currentTier} Plan</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Used: {creditsUsed}</span>
            <span className="text-foreground font-medium">
              {limits.creditsPerMonth === Infinity ? '∞' : creditsRemaining} remaining
            </span>
          </div>
          
          {limits.creditsPerMonth !== Infinity && (
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (creditsUsed / limits.creditsPerMonth) * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Tier Cards */}
      <div className="space-y-4">
        {tiers.map((tierItem, index) => {
          const isCurrentTier = currentTier === tierItem.id;
          
          return (
            <motion.div
              key={tierItem.id}
              className={`relative p-4 rounded-2xl border-2 transition-all ${
                isCurrentTier
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              } ${tierItem.popular ? 'ring-2 ring-amber-500/20' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {tierItem.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    isCurrentTier ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}>
                    {tierItem.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{tierItem.name}</h3>
                    <p className="text-sm text-muted-foreground">{tierItem.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-foreground">{tierItem.price}</div>
                  <div className="text-xs text-muted-foreground">/month</div>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-primary font-medium">{tierItem.credits}</span>
                
                <motion.button
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isCurrentTier
                      ? 'bg-muted text-muted-foreground cursor-default'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}
                  onClick={() => handleSelectTier(tierItem.id)}
                  whileTap={!isCurrentTier ? { scale: 0.95 } : {}}
                  disabled={isCurrentTier}
                >
                  {isCurrentTier ? 'Current Plan' : tierItem.id === 'free' ? 'Downgrade' : 'Upgrade'}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
          Feature Comparison
        </h2>
        
        <div className="rounded-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 bg-muted/50 p-3 text-xs font-medium text-muted-foreground">
            <div>Feature</div>
            <div className="text-center">Free</div>
            <div className="text-center">Pro</div>
            <div className="text-center">Ultimate</div>
          </div>
          
          {/* Rows */}
          {features.map((feature, index) => (
            <div
              key={feature.name}
              className={`grid grid-cols-4 p-3 text-sm items-center ${
                index % 2 === 0 ? 'bg-card' : 'bg-muted/20'
              }`}
            >
              <div className="text-foreground text-xs">{feature.name}</div>
              <div className="flex justify-center">{renderFeatureValue(feature.free)}</div>
              <div className="flex justify-center">{renderFeatureValue(feature.pro)}</div>
              <div className="flex justify-center">{renderFeatureValue(feature.ultimate)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Notice */}
      <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <p className="text-sm text-amber-600 dark:text-amber-400">
          🚧 Demo Mode: Payments will be integrated with Razorpay soon.
          <br />
          For now, click any tier button to simulate the upgrade.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPage;
