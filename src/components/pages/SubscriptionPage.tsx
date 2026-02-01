import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, Zap, Brain, BookOpen, Rocket, Shield, Clock, X } from 'lucide-react';
import { useSubscription, PRICING, FREE_DAILY_LIMIT } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';

const SubscriptionPage: React.FC = () => {
  const { tier, subscription, initiateCheckout, isCheckoutLoading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const tiers = [
    {
      id: 'free' as const,
      name: 'Free',
      description: 'Explore with limits',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        `${FREE_DAILY_LIMIT} questions per day`,
        'All 4 learning modes',
        'Basic explanations',
      ],
      limitations: [
        'No personalization memory',
        'No learning history',
        'Standard response time',
      ],
      cta: tier === 'free' ? 'Current Plan' : null,
      current: tier === 'free',
    },
    {
      id: 'plus' as const,
      name: 'MiniMind Plus',
      description: 'Unlimited learning',
      monthlyPrice: PRICING.plus.monthly,
      yearlyPrice: PRICING.plus.yearly,
      yearlyMonthly: PRICING.plus.yearlyMonthly,
      features: [
        'Unlimited questions',
        'Purpose Lens personalization',
        'Explain-it-back feedback',
        'Full learning history',
        'All 4 learning modes',
      ],
      limitations: [],
      cta: tier === 'plus' ? 'Current Plan' : 'Get Plus',
      current: tier === 'plus',
      highlighted: true,
      popular: true,
    },
    {
      id: 'pro' as const,
      name: 'MiniMind Pro',
      description: 'Maximum depth',
      monthlyPrice: PRICING.pro.monthly,
      yearlyPrice: PRICING.pro.yearly,
      yearlyMonthly: PRICING.pro.yearlyMonthly,
      features: [
        'Everything in Plus',
        'Priority AI responses',
        'Deeper mastery explanations',
        'Advanced learning paths',
        'Early feature access',
      ],
      limitations: [],
      cta: tier === 'pro' ? 'Current Plan' : 'Get Pro',
      current: tier === 'pro',
    },
  ];

  const handleSubscribe = (tierId: 'plus' | 'pro') => {
    initiateCheckout(tierId, selectedPlan);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-400 mb-4"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Invest in understanding</span>
        </motion.div>
        
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
          Choose Your Journey
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          MiniMind helps you truly understand concepts. Pick the plan that matches your learning pace.
        </p>
      </div>

      {/* Plan Toggle */}
      <div className="flex justify-center">
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              selectedPlan === 'monthly'
                ? 'bg-background text-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              selectedPlan === 'yearly'
                ? 'bg-background text-foreground shadow'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500 text-white rounded-full">
              SAVE 33%
            </span>
          </button>
        </div>
      </div>

      {/* Early Learner Advantage */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border border-violet-500/20"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Early Learner Advantage</h3>
            <p className="text-sm text-muted-foreground">
              Join now and lock in this pricing forever. We believe in rewarding early believers with honest, stable pricing — no surprise hikes.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {tiers.map((tierInfo, index) => (
          <motion.div
            key={tierInfo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.1 }}
            className={`relative bg-card rounded-2xl border-2 p-6 ${
              tierInfo.highlighted 
                ? 'border-violet-500 shadow-lg shadow-violet-500/10' 
                : 'border-border'
            } ${tierInfo.current ? 'ring-2 ring-emerald-500/30' : ''}`}
          >
            {tierInfo.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs font-semibold">
                MOST POPULAR
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  {tierInfo.id === 'pro' ? (
                    <Crown className="w-5 h-5 text-amber-500" />
                  ) : tierInfo.id === 'plus' ? (
                    <Sparkles className="w-5 h-5 text-violet-500" />
                  ) : (
                    <Brain className="w-5 h-5 text-muted-foreground" />
                  )}
                  <h3 className="text-xl font-bold text-foreground">{tierInfo.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{tierInfo.description}</p>
              </div>
              
              {tierInfo.current && (
                <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                  Active
                </span>
              )}
            </div>

            <div className="mb-6">
              {tierInfo.id === 'free' ? (
                <div className="text-3xl font-bold text-foreground">Free</div>
              ) : (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">
                      ₹{selectedPlan === 'yearly' ? tierInfo.yearlyMonthly : tierInfo.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {selectedPlan === 'yearly' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Billed ₹{tierInfo.yearlyPrice}/year
                    </p>
                  )}
                </>
              )}
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
                  <X className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>

            {tierInfo.id !== 'free' && !tierInfo.current && (
              <Button
                onClick={() => handleSubscribe(tierInfo.id as 'plus' | 'pro')}
                disabled={isCheckoutLoading}
                className={`w-full py-3 font-medium rounded-xl ${
                  tierInfo.highlighted
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {isCheckoutLoading ? 'Processing...' : tierInfo.cta}
              </Button>
            )}

            {tierInfo.current && (
              <div className="w-full py-3 text-center font-medium text-muted-foreground bg-muted rounded-xl">
                Current Plan
              </div>
            )}

            {tierInfo.id === 'free' && !tierInfo.current && (
              <div className="w-full py-3 text-center text-sm text-muted-foreground">
                Included by default
              </div>
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
          <p className="text-[10px] text-muted-foreground mt-1">What you see is what you pay</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/30">
          <Zap className="w-6 h-6 mx-auto mb-2 text-violet-500" />
          <p className="text-xs font-medium text-foreground">Cancel Anytime</p>
          <p className="text-[10px] text-muted-foreground mt-1">No questions asked</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/30">
          <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <p className="text-xs font-medium text-foreground">Secure Payments</p>
          <p className="text-[10px] text-muted-foreground mt-1">Powered by Razorpay</p>
        </div>
      </motion.div>

      {/* Subscription Status */}
      {subscription.currentPeriodEnd && tier !== 'free' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-muted/50 text-center"
        >
          <p className="text-sm text-muted-foreground">
            {subscription.status === 'cancelled' 
              ? `Your subscription ends on ${subscription.currentPeriodEnd.toLocaleDateString()}`
              : `Next billing date: ${subscription.currentPeriodEnd.toLocaleDateString()}`
            }
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default SubscriptionPage;
