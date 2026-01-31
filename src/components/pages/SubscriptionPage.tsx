import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Zap, Crown, Sparkles, Brain, BookOpen, MessageSquare, Shield, 
  Gift, Rocket, Clock, TrendingUp, Calendar, CreditCard, ChevronRight,
  Star, Lock, Unlock, IndianRupee, ArrowRight, AlertCircle
} from 'lucide-react';
import { useSubscription, CREDIT_COSTS } from '@/contexts/SubscriptionContext';
import { useEarlyAccess } from '@/contexts/EarlyAccessContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const SubscriptionPage: React.FC = () => {
  const { tier, credits, upgradeToPro, limits, showLowCreditsWarning } = useSubscription();
  const { isEarlyAccess, freeTrialDays, dailyCreditsAfterLaunch, showLifetimeReward } = useEarlyAccess();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const pricing = {
    monthly: { price: 199, period: 'month', savings: null },
    yearly: { price: 1999, period: 'year', savings: '17% off', monthlyEquiv: 167 },
  };

  const handleUpgrade = async (plan: 'monthly' | 'yearly') => {
    setIsProcessing(true);
    
    // Razorpay integration placeholder
    // In production, this will call your backend to create an order
    // and then open the Razorpay checkout
    
    try {
      // Simulating API call for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This is where Razorpay will be integrated
      // const order = await createRazorpayOrder(plan);
      // openRazorpayCheckout(order);
      
      toast.info('Payment integration coming soon!', {
        description: 'Razorpay checkout will open here in production.',
      });
      
      // For demo, upgrade immediately
      upgradeToPro();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const dailyUsagePercent = (credits.dailyUsed / credits.dailyLimit) * 100;
  const monthlyUsagePercent = tier === 'pro' ? (credits.monthlyUsed / credits.monthlyLimit) * 100 : 0;

  const proFeatures = [
    { icon: Zap, text: '100 daily + 500 monthly credits', highlight: true },
    { icon: Brain, text: 'All 4 learning modes unlocked' },
    { icon: Sparkles, text: 'Advanced Ekakshar++ compression' },
    { icon: TrendingUp, text: 'Unlimited Learning Paths' },
    { icon: Star, text: 'AI Mentor Personas' },
    { icon: BookOpen, text: 'Weekly Mind Reports' },
    { icon: Shield, text: 'Priority AI responses' },
    { icon: MessageSquare, text: 'Unlimited history storage' },
  ];

  const creditCosts = [
    { mode: 'Beginner', cost: CREDIT_COSTS.beginner, icon: '🌱', color: 'bg-emerald-500' },
    { mode: 'Thinker', cost: CREDIT_COSTS.thinker, icon: '🧠', color: 'bg-blue-500' },
    { mode: 'Story', cost: CREDIT_COSTS.story, icon: '📖', color: 'bg-purple-500' },
    { mode: 'Mastery', cost: CREDIT_COSTS.mastery, icon: '🎓', color: 'bg-amber-500' },
    { mode: 'Ekakshar', cost: CREDIT_COSTS.ekakshar, icon: '⚡', color: 'bg-pink-500' },
    { mode: 'Learning Path', cost: CREDIT_COSTS.learningPath, icon: '🗺️', color: 'bg-cyan-500' },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4"
        >
          {isEarlyAccess ? (
            <>
              <Gift className="w-4 h-4" />
              <span className="text-sm font-medium">Early Access — Free Forever for Early Users</span>
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              <span className="text-sm font-medium">Unlock unlimited learning power</span>
            </>
          )}
        </motion.div>
        
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
          {tier === 'pro' ? 'Your Pro Dashboard' : 'Upgrade to Pro'}
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          {tier === 'pro' 
            ? 'Manage your subscription and track your learning credits'
            : 'Get unlimited access to all features and never run out of credits'}
        </p>
      </div>

      {/* Current Usage Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card border-border/50 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${tier === 'pro' ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-primary'}`}>
                  {tier === 'pro' ? (
                    <Crown className="w-5 h-5 text-white" />
                  ) : (
                    <Zap className="w-5 h-5 text-primary-foreground" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {tier === 'pro' ? 'Pro Member' : 'Free Plan'}
                  </CardTitle>
                  <CardDescription>
                    {isEarlyAccess ? 'Unlimited credits during Early Access' : 'Your credit usage'}
                  </CardDescription>
                </div>
              </div>
              {tier === 'pro' && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  <Crown className="w-3 h-3 mr-1" />
                  PRO
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Daily Credits */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Daily Credits</span>
                <span className="font-semibold text-foreground">
                  {Math.floor(credits.dailyLimit - credits.dailyUsed)} / {credits.dailyLimit} remaining
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={100 - dailyUsagePercent} 
                  className={`h-3 ${showLowCreditsWarning ? 'bg-amber-200 dark:bg-amber-900' : ''}`}
                />
                {showLowCreditsWarning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -right-1 -top-1"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  </motion.div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Resets at midnight • {credits.dailyUsed} credits used today
              </p>
            </div>

            {/* Monthly Credits (Pro only) */}
            {tier === 'pro' && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Pool</span>
                  <span className="font-semibold text-foreground">
                    {credits.monthlyLimit - credits.monthlyUsed} / {credits.monthlyLimit} remaining
                  </span>
                </div>
                <Progress value={100 - monthlyUsagePercent} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  Resets on billing date • {credits.monthlyUsed} credits used this month
                </p>
              </div>
            )}

            {/* Upgrade prompt for free users */}
            {tier === 'free' && !isEarlyAccess && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
              >
                <div className="p-2 rounded-lg bg-primary/20">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Running low on credits?</p>
                  <p className="text-xs text-muted-foreground">Upgrade to Pro for 100 daily + 500 monthly credits</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Early Access Notice */}
      {isEarlyAccess && showLifetimeReward && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-rose-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shrink-0">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">🎉 Early Adopter Reward</h3>
                  <p className="text-sm text-muted-foreground">
                    You're one of our first users! Enjoy{' '}
                    <span className="font-semibold text-foreground">lifetime Pro access — free forever</span>.
                    Thank you for believing in MiniMind.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pricing Section (only for non-pro users and not in early access) */}
      {tier !== 'pro' && !isEarlyAccess && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Plan Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex items-center p-1 rounded-xl bg-muted/50 border border-border">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPlan === 'monthly'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedPlan === 'yearly'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Yearly
                {pricing.yearly.savings && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-0">
                    {pricing.yearly.savings}
                  </Badge>
                )}
              </button>
            </div>
          </div>

          {/* Pricing Card */}
          <Card className="border-primary/50 shadow-lg shadow-primary/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-primary" />
                  <CardTitle className="text-xl">MiniMind Pro</CardTitle>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  RECOMMENDED
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-6">
              {/* Price */}
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-1">
                  <IndianRupee className="w-8 h-8 text-foreground" />
                  <span className="text-5xl font-bold text-foreground">
                    {selectedPlan === 'monthly' ? pricing.monthly.price : pricing.yearly.price}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1">
                  per {pricing[selectedPlan].period}
                  {selectedPlan === 'yearly' && (
                    <span className="text-emerald-600 ml-2">
                      (₹{pricing.yearly.monthlyEquiv}/mo)
                    </span>
                  )}
                </p>
              </div>

              {/* Features */}
              <div className="grid gap-3">
                {proFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      feature.highlight ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${feature.highlight ? 'bg-primary' : 'bg-muted'}`}>
                      <feature.icon className={`w-4 h-4 ${feature.highlight ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`text-sm ${feature.highlight ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                      {feature.text}
                    </span>
                    {feature.highlight && (
                      <Badge variant="secondary" className="ml-auto text-[10px] bg-primary/10 text-primary border-0">
                        Top Value
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => handleUpgrade(selectedPlan)}
                disabled={isProcessing}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Upgrade Now — ₹{selectedPlan === 'monthly' ? pricing.monthly.price : pricing.yearly.price}
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                🔒 Secure payment via Razorpay • Cancel anytime • Instant access
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pro Member Management */}
      {tier === 'pro' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div>
                  <p className="text-sm font-medium text-foreground">Pro Monthly</p>
                  <p className="text-xs text-muted-foreground">Next billing: February 28, 2026</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-0">Active</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Billing History
                </Button>
                <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                  Cancel Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Credit Costs Reference */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Credit Costs
            </CardTitle>
            <CardDescription>
              Each mode costs different credits based on AI processing depth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {creditCosts.map((item) => (
                <div
                  key={item.mode}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50"
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.mode}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-xs font-semibold text-primary">{item.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trust Signals */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="p-4 rounded-xl bg-muted/30 text-center">
          <Shield className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
          <p className="text-xs font-medium text-foreground">Secure Payments</p>
          <p className="text-[10px] text-muted-foreground">via Razorpay</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/30 text-center">
          <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <p className="text-xs font-medium text-foreground">Cancel Anytime</p>
          <p className="text-[10px] text-muted-foreground">No lock-in</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/30 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <p className="text-xs font-medium text-foreground">Instant Access</p>
          <p className="text-[10px] text-muted-foreground">Credits added immediately</p>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">What happens when I run out of credits?</h4>
              <p className="text-xs text-muted-foreground">
                Daily credits reset at midnight. If you run out, upgrade to Pro for more or wait for the reset.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Can I change plans?</h4>
              <p className="text-xs text-muted-foreground">
                Yes! Switch between monthly and yearly anytime. Prorated credits apply.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">How do refunds work?</h4>
              <p className="text-xs text-muted-foreground">
                Full refund within 7 days of purchase if you're not satisfied. No questions asked.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SubscriptionPage;
