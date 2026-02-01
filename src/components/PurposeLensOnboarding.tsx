import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { purposeLenses, PurposeLensKey } from '@/config/minimind';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface PurposeLensOnboardingProps {
  isOpen: boolean;
  onSelect: (lens: PurposeLensKey, customPrompt?: string) => void;
}

const PurposeLensOnboarding: React.FC<PurposeLensOnboardingProps> = ({ isOpen, onSelect }) => {
  const [selectedLens, setSelectedLens] = useState<PurposeLensKey | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const presetLenses = Object.entries(purposeLenses).filter(([key]) => key !== 'custom') as [PurposeLensKey, typeof purposeLenses[PurposeLensKey]][];

  const handleLensClick = (lens: PurposeLensKey) => {
    if (lens === 'custom') {
      setShowCustomInput(true);
      setSelectedLens('custom');
    } else {
      setSelectedLens(lens);
      onSelect(lens);
    }
  };

  const handleCustomSubmit = () => {
    if (customPrompt.trim()) {
      onSelect('custom', customPrompt.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-background flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar">
          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.3 }}
              >
                <img 
                  src="https://i.ibb.co/fGLH5Dxs/minimind-logo.png" 
                  alt="MiniMind" 
                  className="w-12 h-12"
                />
              </motion.div>
              <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
                Welcome to MiniMind! 👋
              </h1>
              <p className="text-muted-foreground">
                What brings you here today?
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This helps us tailor explanations just for you
              </p>
            </div>

            {!showCustomInput ? (
              <>
                {/* Preset Lens Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {presetLenses.map(([key, lens], index) => (
                    <motion.button
                      key={key}
                      className="p-4 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left"
                      onClick={() => handleLensClick(key)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-3xl mb-2 block">{lens.icon}</span>
                      <h3 className="font-semibold text-foreground text-sm">{lens.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {lens.description}
                      </p>
                    </motion.button>
                  ))}
                </div>

                {/* Custom Option */}
                <motion.button
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-border bg-card/50 hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-4"
                  onClick={() => handleLensClick('custom')}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-3xl">✨</span>
                  <div className="text-left">
                    <h3 className="font-semibold text-foreground">Custom Purpose</h3>
                    <p className="text-xs text-muted-foreground">
                      Define your own learning context
                    </p>
                  </div>
                </motion.button>
              </>
            ) : (
              /* Custom Input Mode */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Describe Your Purpose</h3>
                  </div>
                  <Textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value.slice(0, 500))}
                    placeholder="E.g., I'm a UPSC aspirant focusing on Indian History and Polity, or I'm learning programming to switch careers..."
                    className="min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    {customPrompt.length}/500
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomInput(false)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCustomSubmit}
                    disabled={!customPrompt.trim()}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>

                {/* Examples */}
                <div className="mt-4 p-3 rounded-xl bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2">💡 Examples:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• "I'm preparing for CAT MBA entrance exam"</li>
                    <li>• "I'm a Class 10 CBSE student"</li>
                    <li>• "I'm a medical professional explaining to patients"</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PurposeLensOnboarding;
