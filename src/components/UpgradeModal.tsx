import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Zap, Brain, Sparkles, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/contexts/SubscriptionContext';

const proFeatures = [
  { icon: Zap, text: 'Unlimited questions per day' },
  { icon: Brain, text: 'All 4 explanation modes' },
  { icon: Sparkles, text: 'Advanced Ekakshar compression' },
  { icon: Shield, text: 'Learning Memory Graph' },
  { icon: Crown, text: 'AI Mentor Personas' },
  { icon: Check, text: 'Weekly Mind Reports' },
];

const UpgradeModal: React.FC = () => {
  const { isUpgradeModalOpen, setUpgradeModalOpen, upgradeFeature, upgradeToPro, tier } = useSubscription();

  if (tier === 'pro') return null;

  return (
    <AnimatePresence>
      {isUpgradeModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setUpgradeModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-pink-600" />
            
            {/* Content */}
            <div className="relative p-6">
              {/* Close Button */}
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Crown Icon */}
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm">
                  <Crown className="w-10 h-10 text-yellow-300" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Unlock {upgradeFeature || 'Pro Features'}
              </h2>
              <p className="text-white/80 text-center mb-6">
                Upgrade to MiniMind Pro and unlock your full learning potential
              </p>

              {/* Features List */}
              <div className="space-y-3 mb-6">
                {proFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 text-white"
                  >
                    <div className="p-1.5 rounded-full bg-white/20">
                      <feature.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Pricing */}
              <div className="text-center mb-6">
                <div className="inline-flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">₹299</span>
                  <span className="text-white/60">/month</span>
                </div>
                <p className="text-white/60 text-sm mt-1">Cancel anytime</p>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={upgradeToPro}
                  className="w-full py-6 text-lg font-semibold bg-white text-primary hover:bg-white/90 rounded-xl shadow-lg"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Pro (Demo)
                </Button>
                <button
                  onClick={() => setUpgradeModalOpen(false)}
                  className="w-full py-3 text-white/70 hover:text-white transition-colors text-sm"
                >
                  Maybe later
                </button>
              </div>

              {/* Trust Badge */}
              <p className="text-center text-white/50 text-xs mt-4">
                🔒 Secure payment • Instant access • 7-day money-back guarantee
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
