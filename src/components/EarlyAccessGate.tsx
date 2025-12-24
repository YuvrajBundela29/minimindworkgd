import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, BookOpen, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EarlyAccessGateProps {
  onSignIn: () => void;
}

const EarlyAccessGate: React.FC<EarlyAccessGateProps> = ({ onSignIn }) => {
  const benefits = [
    { icon: Shield, text: 'Save your progress & learning paths' },
    { icon: Zap, text: 'Unlimited credits during Early Access' },
    { icon: BookOpen, text: 'Access all 4 learning modes' },
    { icon: Sparkles, text: 'Shape MiniMind with your feedback' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background via-background to-muted/30"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="mb-6"
        >
          <img 
            src="https://i.ibb.co/fGLH5Dxs/minimind-logo.png" 
            alt="MiniMind" 
            className="w-20 h-20 mx-auto mb-4"
          />
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Welcome to MiniMind
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Early Access
          </div>
        </motion.div>

        {/* Value Proposition */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground mb-8 text-balance"
        >
          Sign in to save your progress, credits, and learning paths. 
          Your data stays private and secure.
        </motion.p>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 mb-8"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.text}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <benefit.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-foreground text-left">{benefit.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            onClick={onSignIn}
            size="lg"
            className="w-full py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          >
            Get Started
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="mt-4 text-xs text-muted-foreground">
            Free to use • No credit card required • Your data is protected
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EarlyAccessGate;
