import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, ChevronRight, Sparkles, Clock, Target, 
  CheckCircle2, Circle, Play, Lock, Zap, ArrowLeft,
  GraduationCap, Rocket, Star, TrendingUp
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
  icon?: string;
}

const SUBJECTS = [
  { id: 'ai', name: 'Artificial Intelligence', icon: '🤖', gradient: 'from-violet-500 to-purple-600' },
  { id: 'physics', name: 'Physics', icon: '⚛️', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'philosophy', name: 'Philosophy', icon: '🧘', gradient: 'from-amber-500 to-orange-500' },
  { id: 'finance', name: 'Finance & Investing', icon: '💰', gradient: 'from-emerald-500 to-green-500' },
  { id: 'biology', name: 'Biology', icon: '🧬', gradient: 'from-pink-500 to-rose-500' },
  { id: 'history', name: 'World History', icon: '📜', gradient: 'from-yellow-500 to-amber-500' },
  { id: 'psychology', name: 'Psychology', icon: '🧠', gradient: 'from-fuchsia-500 to-pink-500' },
  { id: 'mathematics', name: 'Mathematics', icon: '📐', gradient: 'from-indigo-500 to-blue-500' },
  { id: 'programming', name: 'Programming', icon: '💻', gradient: 'from-teal-500 to-cyan-500' },
  { id: 'astronomy', name: 'Astronomy', icon: '🌌', gradient: 'from-slate-600 to-indigo-600' },
];

const LEVELS = [
  { id: 'beginner', name: 'Beginner', description: 'Start from basics', icon: '🌱', color: 'emerald' },
  { id: 'intermediate', name: 'Intermediate', description: 'Build on fundamentals', icon: '🌿', color: 'blue' },
  { id: 'advanced', name: 'Advanced', description: 'Deep expertise', icon: '🌳', color: 'purple' },
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
        icon: subject?.icon,
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
      return;
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
      
      setSavedPaths(paths => {
        const newPaths = paths.map(p => p.id === updated.id ? updated : p);
        localStorage.setItem('minimind-learning-paths', JSON.stringify(newPaths));
        return newPaths;
      });
      
      return updated;
    });
    toast.success('Topic completed! 🎉');
  }, []);

  // Selection step - Enhanced UI
  if (step === 'select') {
    return (
      <div className="space-y-6 pb-8">
        {/* Hero Header */}
        <div className="text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary mb-4 border border-primary/20"
          >
            <Rocket className="w-4 h-4" />
            <span className="text-sm font-medium">Learning Paths</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-heading font-bold text-foreground mb-2"
          >
            What do you want to master?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm"
          >
            AI-powered structured learning journeys
          </motion.p>
        </div>

        {/* Saved Paths - Enhanced Cards */}
        {savedPaths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Continue Learning</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar">
              {savedPaths.slice(0, 3).map((path, i) => {
                const progress = (path.topics.filter(t => t.completed).length / path.topics.length) * 100;
                return (
                  <motion.button
                    key={path.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex-shrink-0 p-4 rounded-2xl bg-gradient-to-br from-card to-muted/30 border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all text-left min-w-[180px] group"
                    onClick={() => {
                      setCurrentPath(path);
                      setStep('path');
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{path.icon || '📚'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                          {path.subject}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{path.level}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        />
                      </div>
                      <span className="text-xs font-medium text-primary">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Subject Selection - Enhanced Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Choose Subject</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {SUBJECTS.map((subject, index) => (
              <motion.button
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className={`relative p-4 rounded-2xl border-2 transition-all text-left overflow-hidden group ${
                  selectedSubject === subject.id
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-border bg-card hover:border-primary/30 hover:shadow-md'
                }`}
                onClick={() => setSelectedSubject(subject.id)}
                whileTap={{ scale: 0.98 }}
              >
                {selectedSubject === subject.id && (
                  <motion.div
                    layoutId="selectedSubject"
                    className={`absolute inset-0 bg-gradient-to-br ${subject.gradient} opacity-5`}
                  />
                )}
                <div className="relative">
                  <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">
                    {subject.icon}
                  </span>
                  <p className="font-medium text-foreground text-sm">{subject.name}</p>
                </div>
                {selectedSubject === subject.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Level Selection - Enhanced */}
        <AnimatePresence>
          {selectedSubject && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Choose Level</h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((level, index) => (
                  <motion.button
                    key={level.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      selectedLevel === level.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                    onClick={() => setSelectedLevel(level.id)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl mb-1 block">{level.icon}</span>
                    <p className="font-medium text-foreground text-xs">{level.name}</p>
                    <p className="text-[10px] text-muted-foreground">{level.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Button - Enhanced */}
        <AnimatePresence>
          {selectedSubject && selectedLevel && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="pt-2"
            >
              <motion.button
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground font-semibold flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
                onClick={generatePath}
                disabled={isGenerating || !hasCredits(CREDIT_COSTS.learningPath)}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
              >
                {isGenerating ? (
                  <>
                    <div className="flex gap-1">
                      <motion.span 
                        className="w-2 h-2 bg-white rounded-full"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                      />
                      <motion.span 
                        className="w-2 h-2 bg-white rounded-full"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      />
                      <motion.span 
                        className="w-2 h-2 bg-white rounded-full"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      />
                    </div>
                    <span>Creating your path...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Learning Path</span>
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-xs font-medium">
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

  // Path view - Enhanced
  if (step === 'path' && currentPath) {
    const completedCount = currentPath.topics.filter(t => t.completed).length;
    const progress = (completedCount / currentPath.topics.length) * 100;
    
    return (
      <div className="space-y-5 pb-8">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setStep('select')}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to paths</span>
        </motion.button>

        {/* Path Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-card to-muted/30 border border-border"
        >
          <div className="flex items-start gap-4">
            <span className="text-4xl">{currentPath.icon || '📚'}</span>
            <div className="flex-1">
              <h1 className="text-xl font-heading font-bold text-foreground">
                {currentPath.subject}
              </h1>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                <span className="capitalize flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  <Target className="w-3 h-3" />
                  {currentPath.level}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {currentPath.topics.length} topics
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">Progress</span>
              <span className="text-xs text-muted-foreground">
                {completedCount} / {currentPath.topics.length} completed
              </span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-accent to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Topics Roadmap - Enhanced with connecting line */}
        <div className="relative space-y-3 pl-4">
          {/* Connecting line */}
          <div className="absolute left-[1.25rem] top-4 bottom-4 w-0.5 bg-border" />
          
          {currentPath.topics.map((topic, index) => {
            const isActive = index === currentPath.currentIndex;
            const isLocked = !topic.completed && index > currentPath.currentIndex + 1 && tier === 'free';
            
            return (
              <motion.button
                key={topic.id}
                className={`relative w-full p-4 pl-10 rounded-xl border-2 transition-all text-left ${
                  topic.completed
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : isActive
                    ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
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
                {/* Status circle on line */}
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-background ${
                  topic.completed
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-primary text-primary-foreground'
                    : isLocked
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-muted text-foreground'
                }`}>
                  {topic.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isLocked ? (
                    <Lock className="w-3 h-3" />
                  ) : isActive ? (
                    <Play className="w-3 h-3" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${topic.completed || isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {topic.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {topic.description}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // Topic detail view - Enhanced
  if (step === 'topic' && selectedTopic && currentPath) {
    const currentExplanation = selectedTopic.explanations?.[selectedMode];
    
    return (
      <div className="space-y-4 pb-8">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setStep('path')}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to path</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl font-heading font-bold text-foreground">
            {selectedTopic.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedTopic.description}
          </p>
        </motion.div>

        {/* Mode Switcher - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar"
        >
          {(Object.keys(modes) as ModeKey[]).map((modeKey) => {
            const mode = modes[modeKey];
            const hasExplanation = !!selectedTopic.explanations?.[modeKey];
            
            return (
              <motion.button
                key={modeKey}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all border ${
                  selectedMode === modeKey
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : hasExplanation
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                    : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/30'
                }`}
                onClick={() => {
                  setSelectedMode(modeKey);
                  if (!hasExplanation) {
                    loadTopicExplanation(selectedTopic, modeKey);
                  }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">{mode.icon}</span>
                <span className="text-sm font-medium">{mode.name}</span>
                {!hasExplanation && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-background/50 text-[10px] font-medium">
                    <Zap className="w-2.5 h-2.5" />
                    {CREDIT_COSTS[modeKey]}
                  </span>
                )}
                {hasExplanation && (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Explanation Content */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-5 min-h-[300px]"
        >
          {selectedTopic.loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex gap-1.5 mb-4">
                <motion.span 
                  className="w-3 h-3 bg-primary rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                />
                <motion.span 
                  className="w-3 h-3 bg-primary rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                />
                <motion.span 
                  className="w-3 h-3 bg-primary rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                />
              </div>
              <span className="text-muted-foreground text-sm">Loading explanation...</span>
            </div>
          ) : currentExplanation ? (
            <MarkdownRenderer content={currentExplanation} className="text-sm" />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-5xl mb-4">{modes[selectedMode].icon}</div>
              <p className="text-foreground font-semibold text-lg">
                Get {modes[selectedMode].name} explanation
              </p>
              <p className="text-sm text-muted-foreground mt-1 mb-5">
                Uses {CREDIT_COSTS[selectedMode]} credits
              </p>
              <motion.button
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium flex items-center gap-2 shadow-lg shadow-primary/20"
                onClick={() => loadTopicExplanation(selectedTopic, selectedMode)}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
              >
                <Zap className="w-4 h-4" />
                Load Explanation
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Mark Complete */}
        {!selectedTopic.completed && currentExplanation && (
          <motion.button
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-colors"
            onClick={() => {
              markTopicComplete(selectedTopic.id);
              setStep('path');
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
