import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, ChevronRight, Sparkles, Clock, Target, 
  CheckCircle2, Circle, Play, Lock, Zap, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useSubscription, CREDIT_COSTS } from '@/contexts/SubscriptionContext';
import { ModeKey, modes } from '@/config/minimind';
import AIService from '@/services/aiService';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface Topic {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  explanations?: Partial<Record<ModeKey, string>>;
  loading?: boolean;
}

interface LearningPath {
  id: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  topics: Topic[];
  currentIndex: number;
  createdAt: Date;
}

const SUBJECTS = [
  { id: 'ai', name: 'Artificial Intelligence', icon: '🤖' },
  { id: 'physics', name: 'Physics', icon: '⚛️' },
  { id: 'philosophy', name: 'Philosophy', icon: '🧘' },
  { id: 'finance', name: 'Finance & Investing', icon: '💰' },
  { id: 'biology', name: 'Biology', icon: '🧬' },
  { id: 'history', name: 'World History', icon: '📜' },
  { id: 'psychology', name: 'Psychology', icon: '🧠' },
  { id: 'mathematics', name: 'Mathematics', icon: '📐' },
  { id: 'programming', name: 'Programming', icon: '💻' },
  { id: 'astronomy', name: 'Astronomy', icon: '🌌' },
];

const LEVELS = [
  { id: 'beginner', name: 'Beginner', description: 'Start from basics', icon: '🌱' },
  { id: 'intermediate', name: 'Intermediate', description: 'Build on fundamentals', icon: '🌿' },
  { id: 'advanced', name: 'Advanced', description: 'Deep expertise', icon: '🌳' },
];

const LearningPathPage: React.FC = () => {
  const { tier, credits, useCredits, hasCredits, showUpgradePrompt } = useSubscription();
  const [step, setStep] = useState<'select' | 'path' | 'topic'>('select');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedMode, setSelectedMode] = useState<ModeKey>('beginner');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedPaths, setSavedPaths] = useState<LearningPath[]>(() => {
    const saved = localStorage.getItem('minimind-learning-paths');
    return saved ? JSON.parse(saved) : [];
  });

  const generatePath = useCallback(async () => {
    if (!selectedSubject || !selectedLevel) return;
    
    const cost = CREDIT_COSTS.learningPath;
    if (!hasCredits(cost)) {
      showUpgradePrompt('Learning Path Generation');
      return;
    }

    setIsGenerating(true);
    
    try {
      const subject = SUBJECTS.find(s => s.id === selectedSubject);
      const prompt = `Generate a learning path for ${subject?.name} at ${selectedLevel} level. Return ONLY a JSON array of 5-7 topics, each with "title" and "description" fields. Format: [{"title": "Topic 1", "description": "Brief description"}, ...]`;
      
      const response = await AIService.getExplanation(prompt, 'thinker', 'en');
      
      // Parse the JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Failed to parse topics');
      
      const topicsData = JSON.parse(jsonMatch[0]);
      
      const topics: Topic[] = topicsData.map((t: any, i: number) => ({
        id: `topic-${i}`,
        title: t.title,
        description: t.description,
        completed: false,
      }));

      const newPath: LearningPath = {
        id: `path-${Date.now()}`,
        subject: subject?.name || selectedSubject,
        level: selectedLevel as any,
        topics,
        currentIndex: 0,
        createdAt: new Date(),
      };

      useCredits(cost, 'learningPath');
      setCurrentPath(newPath);
      setSavedPaths(prev => {
        const updated = [newPath, ...prev.slice(0, 9)];
        localStorage.setItem('minimind-learning-paths', JSON.stringify(updated));
        return updated;
      });
      setStep('path');
      toast.success('Learning path created!');
    } catch (error) {
      console.error('Failed to generate path:', error);
      toast.error('Failed to generate learning path');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedSubject, selectedLevel, hasCredits, useCredits, showUpgradePrompt]);

  const loadTopicExplanation = useCallback(async (topic: Topic, mode: ModeKey) => {
    if (topic.explanations?.[mode]) {
      return; // Already loaded
    }

    const cost = CREDIT_COSTS[mode];
    if (!hasCredits(cost)) {
      showUpgradePrompt('Topic Explanation');
      return;
    }

    setSelectedTopic(prev => prev ? { ...prev, loading: true } : null);
    
    try {
      const prompt = `Explain "${topic.title}" in the context of ${currentPath?.subject}. ${topic.description}`;
      const response = await AIService.getExplanation(prompt, mode, 'en');
      
      useCredits(cost, mode);
      
      setSelectedTopic(prev => {
        if (!prev) return null;
        return {
          ...prev,
          loading: false,
          explanations: {
            ...prev.explanations,
            [mode]: response,
          },
        };
      });

      // Update in path
      setCurrentPath(prev => {
        if (!prev) return null;
        const updatedTopics = prev.topics.map(t => 
          t.id === topic.id 
            ? { ...t, explanations: { ...t.explanations, [mode]: response } }
            : t
        );
        return { ...prev, topics: updatedTopics };
      });
    } catch (error) {
      console.error('Failed to load explanation:', error);
      toast.error('Failed to load explanation');
      setSelectedTopic(prev => prev ? { ...prev, loading: false } : null);
    }
  }, [currentPath, hasCredits, useCredits, showUpgradePrompt]);

  const markTopicComplete = useCallback((topicId: string) => {
    setCurrentPath(prev => {
      if (!prev) return null;
      const updatedTopics = prev.topics.map(t => 
        t.id === topicId ? { ...t, completed: true } : t
      );
      const newIndex = Math.min(prev.currentIndex + 1, updatedTopics.length - 1);
      const updated = { ...prev, topics: updatedTopics, currentIndex: newIndex };
      
      // Save to localStorage
      setSavedPaths(paths => {
        const newPaths = paths.map(p => p.id === updated.id ? updated : p);
        localStorage.setItem('minimind-learning-paths', JSON.stringify(newPaths));
        return newPaths;
      });
      
      return updated;
    });
    toast.success('Topic completed! 🎉');
  }, []);

  // Selection step
  if (step === 'select') {
    return (
      <div className="space-y-6 pb-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">Learning Paths</span>
          </motion.div>
          
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
            What do you want to master?
          </h1>
          <p className="text-muted-foreground text-sm">
            Choose a subject and we'll create a structured learning journey
          </p>
        </div>

        {/* Saved Paths */}
        {savedPaths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h2 className="text-sm font-medium text-muted-foreground">Continue Learning</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {savedPaths.slice(0, 3).map((path) => (
                <motion.button
                  key={path.id}
                  className="flex-shrink-0 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors text-left min-w-[200px]"
                  onClick={() => {
                    setCurrentPath(path);
                    setStep('path');
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <p className="font-medium text-foreground text-sm">{path.subject}</p>
                  <p className="text-xs text-muted-foreground capitalize">{path.level}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(path.topics.filter(t => t.completed).length / path.topics.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {path.topics.filter(t => t.completed).length}/{path.topics.length}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Subject Selection */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Choose Subject</h2>
          <div className="grid grid-cols-2 gap-3">
            {SUBJECTS.map((subject) => (
              <motion.button
                key={subject.id}
                className={`p-4 rounded-xl border-2 transition-colors text-left ${
                  selectedSubject === subject.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
                onClick={() => setSelectedSubject(subject.id)}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl mb-2 block">{subject.icon}</span>
                <p className="font-medium text-foreground text-sm">{subject.name}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Level Selection */}
        <AnimatePresence>
          {selectedSubject && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <h2 className="text-sm font-medium text-muted-foreground">Choose Level</h2>
              <div className="grid grid-cols-3 gap-3">
                {LEVELS.map((level) => (
                  <motion.button
                    key={level.id}
                    className={`p-4 rounded-xl border-2 transition-colors text-center ${
                      selectedLevel === level.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                    onClick={() => setSelectedLevel(level.id)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-xl mb-1 block">{level.icon}</span>
                    <p className="font-medium text-foreground text-sm">{level.name}</p>
                    <p className="text-xs text-muted-foreground">{level.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Button */}
        <AnimatePresence>
          {selectedSubject && selectedLevel && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <motion.button
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={generatePath}
                disabled={isGenerating || !hasCredits(CREDIT_COSTS.learningPath)}
                whileTap={{ scale: 0.98 }}
              >
                {isGenerating ? (
                  <>
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                    <span>Creating your path...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Learning Path</span>
                    <span className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                      <Zap className="w-3 h-3" />
                      {CREDIT_COSTS.learningPath}
                    </span>
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Path view
  if (step === 'path' && currentPath) {
    return (
      <div className="space-y-6 pb-8">
        <motion.button
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setStep('select')}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to paths</span>
        </motion.button>

        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {currentPath.subject}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="capitalize flex items-center gap-1">
              <Target className="w-4 h-4" />
              {currentPath.level}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {currentPath.topics.length} topics
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm text-muted-foreground">
              {currentPath.topics.filter(t => t.completed).length} / {currentPath.topics.length} completed
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(currentPath.topics.filter(t => t.completed).length / currentPath.topics.length) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Topics Roadmap */}
        <div className="space-y-3">
          {currentPath.topics.map((topic, index) => {
            const isActive = index === currentPath.currentIndex;
            const isLocked = !topic.completed && index > currentPath.currentIndex + 1 && tier === 'free';
            
            return (
              <motion.button
                key={topic.id}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  topic.completed
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : isActive
                    ? 'border-primary bg-primary/5'
                    : isLocked
                    ? 'border-border bg-muted/50 opacity-60'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
                onClick={() => {
                  if (isLocked) {
                    showUpgradePrompt('Full Learning Path Access');
                    return;
                  }
                  setSelectedTopic(topic);
                  setStep('topic');
                }}
                whileTap={isLocked ? undefined : { scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    topic.completed
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-primary text-primary-foreground'
                      : isLocked
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-muted text-foreground'
                  }`}>
                    {topic.completed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : isActive ? (
                      <Play className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${topic.completed || isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {topic.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {topic.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // Topic detail view
  if (step === 'topic' && selectedTopic && currentPath) {
    const currentExplanation = selectedTopic.explanations?.[selectedMode];
    
    return (
      <div className="space-y-4 pb-8">
        <motion.button
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setStep('path')}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to path</span>
        </motion.button>

        <div>
          <h1 className="text-xl font-heading font-bold text-foreground">
            {selectedTopic.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedTopic.description}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {(Object.keys(modes) as ModeKey[]).map((modeKey) => {
            const mode = modes[modeKey];
            const hasExplanation = !!selectedTopic.explanations?.[modeKey];
            
            return (
              <motion.button
                key={modeKey}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                  selectedMode === modeKey
                    ? 'bg-primary text-primary-foreground'
                    : hasExplanation
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={() => {
                  setSelectedMode(modeKey);
                  if (!hasExplanation) {
                    loadTopicExplanation(selectedTopic, modeKey);
                  }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{mode.icon}</span>
                <span className="text-sm font-medium">{mode.name}</span>
                {!hasExplanation && (
                  <span className="flex items-center gap-0.5 text-xs opacity-70">
                    <Zap className="w-3 h-3" />
                    {CREDIT_COSTS[modeKey]}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Explanation Content */}
        <div className="bg-card rounded-2xl border border-border p-4 min-h-[300px]">
          {selectedTopic.loading ? (
            <div className="flex items-center gap-2 py-4">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
              <span className="text-muted-foreground text-sm">Loading explanation...</span>
            </div>
          ) : currentExplanation ? (
            <MarkdownRenderer content={currentExplanation} className="text-sm" />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-4">{modes[selectedMode].icon}</div>
              <p className="text-foreground font-medium">
                Get {modes[selectedMode].name} explanation
              </p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Uses {CREDIT_COSTS[selectedMode]} credits
              </p>
              <motion.button
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
                onClick={() => loadTopicExplanation(selectedTopic, selectedMode)}
                whileTap={{ scale: 0.98 }}
              >
                Load Explanation
              </motion.button>
            </div>
          )}
        </div>

        {/* Mark Complete */}
        {!selectedTopic.completed && currentExplanation && (
          <motion.button
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 text-white font-medium flex items-center justify-center gap-2"
            onClick={() => {
              markTopicComplete(selectedTopic.id);
              setStep('path');
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle2 className="w-5 h-5" />
            Mark as Complete
          </motion.button>
        )}
      </div>
    );
  }

  return null;
};

export default LearningPathPage;
