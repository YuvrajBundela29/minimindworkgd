import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Brain, CheckCircle, XCircle, Lightbulb,
  ArrowRight, Loader2, RefreshCw, Trophy, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useSubscription } from '@/contexts/SubscriptionContext';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import AIService from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';

interface EvaluationResult {
  score: number;
  feedback: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
}

const SAMPLE_TOPICS = [
  'What is photosynthesis?',
  'How does the internet work?',
  'What causes earthquakes?',
  'How do vaccines protect us?',
  'What is artificial intelligence?',
  'How does memory work in the brain?',
];

const ExplainBackPage: React.FC = () => {
  const { credits, hasCredits, useCredits, showUpgradePrompt } = useSubscription();
  const [step, setStep] = useState<'topic' | 'learn' | 'explain' | 'feedback'>('topic');
  const [topic, setTopic] = useState('');
  const [aiExplanation, setAiExplanation] = useState('');
  const [userExplanation, setUserExplanation] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetExplanation = useCallback(async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    if (!hasCredits(2)) {
      showUpgradePrompt('Explain-It-Back');
      return;
    }

    setIsLoading(true);
    try {
      const response = await AIService.getExplanation(
        `Explain this concept clearly and thoroughly so that someone could learn and then explain it back: ${topic}`,
        'thinker',
        'en'
      );
      
      useCredits(2, 'explain_back_learn');
      setAiExplanation(response);
      setStep('learn');
    } catch (error) {
      console.error('Error getting explanation:', error);
      toast.error('Failed to get explanation');
    } finally {
      setIsLoading(false);
    }
  }, [topic, hasCredits, useCredits, showUpgradePrompt]);

  const handleEvaluate = useCallback(async () => {
    if (!userExplanation.trim()) {
      toast.error('Please write your explanation');
      return;
    }

    if (!hasCredits(3)) {
      showUpgradePrompt('Explain-It-Back Evaluation');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          type: 'explain_back_evaluate',
          prompt: userExplanation,
          originalConcept: aiExplanation,
          language: 'en',
        },
      });

      if (error) throw error;

      useCredits(3, 'explain_back_evaluate');
      
      // Parse the evaluation response
      const responseText = data.response;
      
      // Extract score (look for patterns like "Score: 8/10" or "8/10")
      const scoreMatch = responseText.match(/(\d+)\s*\/\s*10/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) * 10 : 70;

      setEvaluation({
        score,
        feedback: responseText,
        strengths: [],
        gaps: [],
        suggestions: [],
      });
      
      setStep('feedback');
    } catch (error) {
      console.error('Error evaluating:', error);
      toast.error('Failed to evaluate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userExplanation, aiExplanation, hasCredits, useCredits, showUpgradePrompt]);

  const handleReset = () => {
    setStep('topic');
    setTopic('');
    setAiExplanation('');
    setUserExplanation('');
    setEvaluation(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent!';
    if (score >= 80) return 'Great job!';
    if (score >= 70) return 'Good understanding';
    if (score >= 60) return 'Getting there';
    return 'Keep learning';
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 mb-4">
          <Brain className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-300">Explain-It-Back</span>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Test Your Understanding
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Learn a concept, then explain it back for AI feedback
        </p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-2"
      >
        {['topic', 'learn', 'explain', 'feedback'].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
              step === s 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                : ['topic', 'learn', 'explain', 'feedback'].indexOf(step) > i
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {i + 1}
            </div>
            {i < 3 && (
              <div className={`w-8 h-0.5 ${
                ['topic', 'learn', 'explain', 'feedback'].indexOf(step) > i
                  ? 'bg-emerald-500'
                  : 'bg-muted'
              }`} />
            )}
          </React.Fragment>
        ))}
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Topic Selection */}
        {step === 'topic' && (
          <motion.div
            key="topic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What do you want to learn and then explain?"
                className="min-h-[80px] resize-none border-0 bg-transparent focus-visible:ring-0"
              />
            </Card>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Or try one of these:</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className="px-3 py-1.5 text-xs rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGetExplanation}
              disabled={isLoading || !topic.trim()}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Start Learning
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Step 2: Learn */}
        {step === 'learn' && (
          <motion.div
            key="learn"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-emerald-400" />
                <span className="font-medium text-foreground">Learn this concept:</span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none max-h-[300px] overflow-y-auto">
                <MarkdownRenderer content={aiExplanation} />
              </div>
            </Card>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-sm text-amber-300">
                📚 Take your time to understand this. When ready, you'll explain it back in your own words!
              </p>
            </div>

            <Button
              onClick={() => setStep('explain')}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600"
            >
              I'm Ready to Explain
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Step 3: User Explanation */}
        {step === 'explain' && (
          <motion.div
            key="explain"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-emerald-400 mb-2" />
              <p className="text-foreground font-medium">Your turn!</p>
              <p className="text-sm text-muted-foreground">
                Explain "{topic}" in your own words
              </p>
            </div>

            <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <Textarea
                value={userExplanation}
                onChange={(e) => setUserExplanation(e.target.value)}
                placeholder="Write your explanation here... Don't look back! Use your own understanding."
                className="min-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">
                  {userExplanation.length} characters
                </span>
                <span className="text-xs text-muted-foreground">
                  Tip: Be thorough but use your own words
                </span>
              </div>
            </Card>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('learn')}
                className="flex-1"
              >
                Review Again
              </Button>
              <Button
                onClick={handleEvaluate}
                disabled={isLoading || !userExplanation.trim()}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Get Feedback
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Feedback */}
        {step === 'feedback' && evaluation && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Score */}
            <Card className="p-6 text-center bg-gradient-to-br from-card to-muted/50">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * evaluation.score) / 100}
                    className={getScoreColor(evaluation.score)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${getScoreColor(evaluation.score)}`}>
                    {evaluation.score}%
                  </span>
                </div>
              </div>
              <p className="text-lg font-medium text-foreground">
                {getScoreLabel(evaluation.score)}
              </p>
              {evaluation.score >= 80 && (
                <Trophy className="w-8 h-8 mx-auto mt-2 text-amber-400" />
              )}
            </Card>

            {/* Detailed Feedback */}
            <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-emerald-400" />
                <span className="font-medium text-foreground">Detailed Feedback</span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <MarkdownRenderer content={evaluation.feedback} />
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('learn')}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={handleReset}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600"
              >
                New Topic
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExplainBackPage;
