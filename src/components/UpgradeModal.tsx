import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Sparkles, Zap, Brain, BookOpen, Rocket, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription, PRICING } from '@/contexts/SubscriptionContext';

const plusFeatures = [
  { icon: Zap, text: 'Unlimited questions per day' },
  { icon: Brain, text: 'Purpose Lens personalization' },
  { icon: BookOpen, text: 'Explain-it-back feedback' },
  { icon: Check, text: 'Full learning history' },
];

const proFeatures = [
  { icon: Sparkles, text: 'Everything in Plus' },
  { icon: Rocket, text: 'Priority AI responses' },
  { icon: Crown, text: 'Deeper mastery explanations' },
  { icon: BookOpen, text: 'Advanced learning paths' },
  { icon: Check, text: 'Early feature access' },
];

const UpgradeModal: React.FC = () => {
  const { 
    isUpgradeModalOpen, 
    setUpgradeModalOpen, 
    upgradeFeature, 
    tier,
    initiateCheckout,
    isCheckoutLoading 
  } = useSubscription();

  const [selectedTier, setSelectedTier] = React.useState<'plus' | 'pro'>('plus');
  const [selectedPlan, setSelectedPlan] = React.useState<'monthly' | 'yearly'>('yearly');

  if (tier === 'pro') return null;

  const handleCheckout = () => {
    initiateCheckout(selectedTier, selectedPlan);
  };

  const currentPrice = selectedTier === 'plus' 
    ? (selectedPlan === 'yearly' ? PRICING.plus.yearlyMonthly : PRICING.plus.monthly)
    : (selectedPlan === 'yearly' ? PRICING.pro.yearlyMonthly : PRICING.pro.monthly);

  const features = selectedTier === 'plus' ? plusFeatures : proFeatures;

  return (
    <AnimatePresence>
      {isUpgradeModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setUpgradeModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 pb-4">
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Unlock {upgradeFeature || 'More Power'}
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Invest in your understanding
                  </p>
                </div>
              </div>

              {/* Tier Toggle */}
              <div className="flex gap-2 p-1 bg-zinc-800 rounded-xl">
                <button
                  onClick={() => setSelectedTier('plus')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    selectedTier === 'plus'
                      ? 'bg-violet-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Plus
                </button>
                <button
                  onClick={() => setSelectedTier('pro')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    selectedTier === 'pro'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Pro
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              {/* Plan Toggle */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    selectedPlan === 'monthly'
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <p className="text-sm text-zinc-400">Monthly</p>
                  <p className="text-lg font-bold text-white">
                    ₹{selectedTier === 'plus' ? PRICING.plus.monthly : PRICING.pro.monthly}
                  </p>
                </button>
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all relative ${
                    selectedPlan === 'yearly'
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <span className="absolute -top-2 right-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                    SAVE 33%
                  </span>
                  <p className="text-sm text-zinc-400">Yearly</p>
                  <p className="text-lg font-bold text-white">
                    ₹{selectedTier === 'plus' ? PRICING.plus.yearlyMonthly : PRICING.pro.yearlyMonthly}/mo
                  </p>
                </button>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-1.5 rounded-lg bg-zinc-800">
                      <feature.icon className="w-4 h-4 text-violet-400" />
                    </div>
                    <span className="text-sm text-zinc-300">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <Button
                onClick={handleCheckout}
                disabled={isCheckoutLoading}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-violet-500/25"
              >
                {isCheckoutLoading ? (
                  'Processing...'
                ) : (
                  <>
                    <Crown className="w-5 h-5 mr-2" />
                    Subscribe for ₹{currentPrice}/month
                  </>
                )}
              </Button>

              {/* Trust Signals */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-zinc-500">
                <span>🔒 Secure payment</span>
                <span>•</span>
                <span>Cancel anytime</span>
                <span>•</span>
                <span>No hidden charges</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
