import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Brain, Sparkles } from 'lucide-react';
import { useEarlyAccess } from '@/contexts/EarlyAccessContext';

interface TrustFooterProps {
  creditCost: number;
  confidence?: 'high' | 'medium' | 'low';
  sourceType?: 'reasoning' | 'knowledge' | 'creative';
}

const TrustFooter: React.FC<TrustFooterProps> = ({
  creditCost,
  confidence = 'high',
  sourceType = 'reasoning',
}) => {
  const { isEarlyAccess, unlimitedCredits } = useEarlyAccess();

  const confidenceConfig = {
    high: { label: 'High confidence', color: 'text-emerald-600 bg-emerald-500/10' },
    medium: { label: 'Good confidence', color: 'text-amber-600 bg-amber-500/10' },
    low: { label: 'Exploratory', color: 'text-blue-600 bg-blue-500/10' },
  };

  const sourceConfig = {
    reasoning: { label: 'Logical reasoning', icon: Brain },
    knowledge: { label: 'Knowledge base', icon: Sparkles },
    creative: { label: 'Creative synthesis', icon: Sparkles },
  };

  const conf = confidenceConfig[confidence];
  const source = sourceConfig[sourceType];
  const SourceIcon = source.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex items-center flex-wrap gap-2 mt-3 pt-3 border-t border-border/50"
    >
      {/* Credit Usage */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-medium">
        <Zap className="w-3 h-3" />
        {unlimitedCredits && isEarlyAccess ? (
          <span>Free (Early Access)</span>
        ) : (
          <span>{creditCost} credit{creditCost !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Confidence Level */}
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${conf.color}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {conf.label}
      </div>

      {/* Source Type */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-medium">
        <SourceIcon className="w-3 h-3" />
        {source.label}
      </div>
    </motion.div>
  );
};

export default TrustFooter;
