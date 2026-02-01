import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Info } from 'lucide-react';
import { purposeLenses, PurposeLensKey } from '@/config/minimind';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PurposeLensPageProps {
  currentLens: PurposeLensKey;
  customPrompt: string;
  onLensChange: (lens: PurposeLensKey, customPrompt?: string) => void;
}

const PurposeLensPage: React.FC<PurposeLensPageProps> = ({
  currentLens,
  customPrompt: initialCustomPrompt,
  onLensChange,
}) => {
  const [selectedLens, setSelectedLens] = useState<PurposeLensKey>(currentLens);
  const [customPrompt, setCustomPrompt] = useState(initialCustomPrompt);
  const [isSaving, setIsSaving] = useState(false);

  const presetLenses = Object.entries(purposeLenses).filter(([key]) => key !== 'custom') as [PurposeLensKey, typeof purposeLenses[PurposeLensKey]][];
  const currentLensData = purposeLenses[currentLens];

  const handleSelectPreset = async (lens: PurposeLensKey) => {
    setSelectedLens(lens);
    setIsSaving(true);
    
    try {
      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_settings')
          .update({ purpose_lens: lens, custom_lens_prompt: null })
          .eq('user_id', user.id);
      }
      
      // Save to localStorage
      localStorage.setItem('minimind-purpose-lens', lens);
      localStorage.removeItem('minimind-custom-lens-prompt');
      
      onLensChange(lens);
      toast.success(`Switched to ${purposeLenses[lens].name} mode!`);
    } catch (error) {
      console.error('Error saving lens:', error);
      toast.error('Failed to save preference');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCustom = async () => {
    if (!customPrompt.trim()) {
      toast.error('Please enter your learning purpose');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_settings')
          .update({ purpose_lens: 'custom', custom_lens_prompt: customPrompt.trim() })
          .eq('user_id', user.id);
      }
      
      // Save to localStorage
      localStorage.setItem('minimind-purpose-lens', 'custom');
      localStorage.setItem('minimind-custom-lens-prompt', customPrompt.trim());
      
      setSelectedLens('custom');
      onLensChange('custom', customPrompt.trim());
      toast.success('Custom purpose saved!');
    } catch (error) {
      console.error('Error saving custom lens:', error);
      toast.error('Failed to save preference');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🎯</div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Learning Purpose</h1>
        <p className="text-muted-foreground text-sm mt-1">
          MiniMind adapts all explanations to match your goal
        </p>
      </div>

      {/* Current Lens Display */}
      <motion.div
        className="p-4 rounded-2xl bg-primary/10 border border-primary/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{currentLensData.icon}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Current: {currentLensData.name}</h3>
            <p className="text-sm text-muted-foreground">
              {currentLens === 'custom' && initialCustomPrompt 
                ? initialCustomPrompt.slice(0, 60) + (initialCustomPrompt.length > 60 ? '...' : '')
                : currentLensData.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        className="p-4 rounded-2xl bg-muted/50 border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground text-sm">How it works</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Your learning purpose adapts all 4 explanation modes (Beginner, Thinker, Story, Mastery) 
              to use relevant examples, tone, and focus areas that match your specific goals.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Preset Lens Grid */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Choose a preset</h3>
        <div className="grid grid-cols-2 gap-3">
          {presetLenses.map(([key, lens], index) => (
            <motion.button
              key={key}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${
                selectedLens === key 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-card hover:border-primary/50'
              }`}
              onClick={() => handleSelectPreset(key)}
              disabled={isSaving}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl">{lens.icon}</span>
                {selectedLens === key && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </div>
              <h3 className="font-semibold text-foreground text-sm mt-2">{lens.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {lens.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Custom Lens Section */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground">Or create your own</h3>
        </div>
        
        <div className={`p-4 rounded-2xl border-2 transition-all ${
          selectedLens === 'custom' 
            ? 'border-primary bg-primary/5' 
            : 'border-border bg-card'
        }`}>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value.slice(0, 500))}
            placeholder="Describe your learning purpose... E.g., I'm preparing for GATE Computer Science exam"
            className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 bg-transparent"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">{customPrompt.length}/500</span>
            <Button
              size="sm"
              onClick={handleSaveCustom}
              disabled={!customPrompt.trim() || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Custom'}
            </Button>
          </div>
        </div>

        {/* Custom Examples */}
        <div className="p-3 rounded-xl bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-2">💡 Example purposes:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• "I'm a UPSC aspirant focusing on Indian History and Polity"</li>
            <li>• "I'm a Class 10 CBSE student preparing for boards"</li>
            <li>• "I'm learning programming to switch careers"</li>
            <li>• "I'm a medical professional explaining to patients"</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default PurposeLensPage;
