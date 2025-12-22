import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Route, Users, Lock, ChevronRight } from 'lucide-react';
import { useSubscription, mentorPersonas, MentorPersona } from '@/contexts/SubscriptionContext';
import ProBadge from './ProBadge';

interface ProFeaturesPanelProps {
  onGenerateLearningPath?: () => void;
}

const ProFeaturesPanel: React.FC<ProFeaturesPanelProps> = ({ onGenerateLearningPath }) => {
  const { 
    hasFeature, 
    showUpgradePrompt,
    truthModeEnabled, 
    setTruthModeEnabled,
    selectedMentor,
    setSelectedMentor,
  } = useSubscription();

  const handleTruthModeToggle = () => {
    if (!hasFeature('truthMode')) {
      showUpgradePrompt('Truth Mode');
      return;
    }
    setTruthModeEnabled(!truthModeEnabled);
  };

  const handleMentorSelect = (mentor: MentorPersona) => {
    if (mentor !== 'default' && !hasFeature('mentorPersonas')) {
      showUpgradePrompt('AI Mentor Personas');
      return;
    }
    setSelectedMentor(mentor);
  };

  const handleLearningPathClick = () => {
    if (!hasFeature('learningPaths')) {
      showUpgradePrompt('Learning Paths');
      return;
    }
    onGenerateLearningPath?.();
  };

  return (
    <div className="space-y-4">
      {/* Truth Mode Toggle */}
      <motion.div
        className="p-4 rounded-2xl bg-card border border-border"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${truthModeEnabled ? 'bg-red-500/20 text-red-500' : 'bg-muted text-muted-foreground'}`}>
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">Truth Mode</span>
                {!hasFeature('truthMode') && <ProBadge size="sm" variant="subtle" />}
              </div>
              <p className="text-xs text-muted-foreground">
                Brutally honest, no sugar-coating
              </p>
            </div>
          </div>
          
          <motion.button
            className={`relative w-12 h-7 rounded-full transition-colors ${
              truthModeEnabled ? 'bg-red-500' : 'bg-muted'
            } ${!hasFeature('truthMode') ? 'opacity-60' : ''}`}
            onClick={handleTruthModeToggle}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
              animate={{ left: truthModeEnabled ? '24px' : '4px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
            {!hasFeature('truthMode') && (
              <Lock className="absolute right-1.5 top-1.5 w-3 h-3 text-muted-foreground" />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Learning Paths */}
      <motion.button
        className="w-full p-4 rounded-2xl bg-card border border-border text-left"
        onClick={handleLearningPathClick}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${hasFeature('learningPaths') ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <Route className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">Learning Paths</span>
                {!hasFeature('learningPaths') && <ProBadge size="sm" variant="subtle" />}
              </div>
              <p className="text-xs text-muted-foreground">
                Generate 3-step, 7-day, or 30-day plans
              </p>
            </div>
          </div>
          
          {hasFeature('learningPaths') ? (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Lock className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </motion.button>

      {/* AI Mentor Personas */}
      <motion.div
        className="p-4 rounded-2xl bg-card border border-border"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-xl ${hasFeature('mentorPersonas') ? 'bg-purple-500/20 text-purple-500' : 'bg-muted text-muted-foreground'}`}>
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">AI Mentor Personas</span>
              {!hasFeature('mentorPersonas') && <ProBadge size="sm" variant="subtle" />}
            </div>
            <p className="text-xs text-muted-foreground">
              Choose your teaching style
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(mentorPersonas) as [MentorPersona, typeof mentorPersonas[MentorPersona]][]).map(([key, persona]) => {
            const isSelected = selectedMentor === key;
            const isLocked = key !== 'default' && !hasFeature('mentorPersonas');
            
            return (
              <motion.button
                key={key}
                className={`p-2 rounded-xl text-left transition-colors ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                } ${isLocked ? 'opacity-60' : ''}`}
                onClick={() => handleMentorSelect(key)}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{persona.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{persona.name}</div>
                  </div>
                  {isLocked && <Lock className="w-3 h-3 flex-shrink-0" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default ProFeaturesPanel;
