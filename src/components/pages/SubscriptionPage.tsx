import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Sparkles, Brain, BookOpen, MessageSquare, Shield } from 'lucide-react';
import { useSubscription, CREDIT_COSTS } from '@/contexts/SubscriptionContext';
import CreditDisplay from '@/components/CreditDisplay';

const SubscriptionPage: React.FC = () => {
  const { tier, credits, upgradeToPro, limits } = useSubscription();

  const tiers = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Explore all modes with daily credits',
      credits: '15 credits/day',
      features: [
        'Access to ALL 4 learning modes',
        '15 daily credits (reset every 24h)',
        'Basic Learning Paths',
        'Last 20 history items',
        'Standard response speed',
      ],
      limitations: [
        'No monthly credit pool',
        'Limited Learning Path depth',
        'No weekly reports',
      ],
      current: tier === 'free',
      cta: tier === 'free' ? 'Current Plan' : null,
    },
    {
      name: 'Pro',
      price: '₹199',
      period: '/month',
      description: 'Unlimited thinking power',
      credits: '100/day + 500/month',
      features: [
        'Everything in Free, plus:',
        '100 daily + 500 monthly credits',
        'Full Learning Paths with all depths',
        'Multi-perspective answers',
        'Weekly Mind Reports',
        'Advanced Ekakshar++',
        'Priority AI responses',
        'Unlimited history',
        'Offline smart notes',
        'AI Mentor Personas',
      ],
      limitations: [],
      current: tier === 'pro',
      cta: tier === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      highlighted: true,
    },
  ];

  const creditExplanation = [
    { mode: 'Beginner', cost: CREDIT_COSTS.beginner, description: 'Simple explanations', icon: '🌱' },
    { mode: 'Thinker', cost: CREDIT_COSTS.thinker, description: 'Logical depth', icon: '🧠' },
    { mode: 'Story', cost: CREDIT_COSTS.story, description: 'Narrative learning', icon: '📖' },
    { mode: 'Mastery', cost: CREDIT_COSTS.mastery, description: 'Expert detail', icon: '🎓' },
    { mode: 'Ekakshar', cost: CREDIT_COSTS.ekakshar, description: 'Compression', icon: '⚡' },
    { mode: 'Learning Path', cost: CREDIT_COSTS.learningPath, description: 'Structured', icon: '🗺️' },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Pay for thinking power, not restrictions</span>
        </motion.div>
        
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
          MiniMind Subscription
        </h1>
        <p className="text-muted-foreground">
          All modes are always unlocked. Credits fuel your learning journey.
        </p>
      </div>

      {/* Current Credits */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <CreditDisplay variant="detailed" />
      </motion.div>

      {/* How Credits Work - Fixed grid layout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">How Credits Work</h2>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Each AI response costs credits based on depth and complexity. 
          Deeper explanations require more processing power.
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          {creditExplanation.map((item) => (
            <motion.div
              key={item.mode}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50 border border-border/50"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-foreground">{item.mode}</p>
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                    <Zap className="w-2.5 h-2.5" />
                    {item.cost}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pricing Tiers */}
      <div className="grid md:grid-cols-2 gap-6">
        {tiers.map((tierInfo, index) => (
          <motion.div
            key={tierInfo.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={`relative bg-card rounded-2xl border-2 p-6 ${
              tierInfo.highlighted 
                ? 'border-primary shadow-lg shadow-primary/20' 
                : 'border-border'
            } ${tierInfo.current ? 'ring-2 ring-primary/30' : ''}`}
          >
            {tierInfo.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold">
                MOST POPULAR
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  {tierInfo.highlighted ? (
                    <Crown className="w-5 h-5 text-primary" />
                  ) : (
                    <Brain className="w-5 h-5 text-muted-foreground" />
                  )}
                  <h3 className="text-xl font-bold text-foreground">{tierInfo.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{tierInfo.description}</p>
              </div>
              
              {tierInfo.current && (
                <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium">
                  Active
                </span>
              )}
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold text-foreground">{tierInfo.price}</span>
              <span className="text-muted-foreground">{tierInfo.period}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 mb-4">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{tierInfo.credits}</span>
            </div>

            <ul className="space-y-2 mb-6">
              {tierInfo.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
              {tierInfo.limitations.map((limitation, i) => (
                <li key={`limit-${i}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-4 h-4 shrink-0 text-center">–</span>
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>

            {tierInfo.cta && (
              <motion.button
                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                  tierInfo.current
                    ? 'bg-muted text-muted-foreground cursor-default'
                    : 'bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90'
                }`}
                onClick={tierInfo.current ? undefined : upgradeToPro}
                whileTap={tierInfo.current ? undefined : { scale: 0.98 }}
              >
                {tierInfo.cta}
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Trust Signals */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-4 text-center"
      >
        <div className="p-4 rounded-xl bg-muted/30">
          <Shield className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
          <p className="text-xs font-medium text-foreground">No Hidden Fees</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/30">
          <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <p className="text-xs font-medium text-foreground">Cancel Anytime</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/30">
          <BookOpen className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <p className="text-xs font-medium text-foreground">Credits Never Expire*</p>
        </div>
      </motion.div>
      
      <p className="text-xs text-center text-muted-foreground">
        *While subscribed. Daily credits reset every 24 hours. Monthly credits reset each billing cycle.
      </p>
    </div>
  );
};

export default SubscriptionPage;
