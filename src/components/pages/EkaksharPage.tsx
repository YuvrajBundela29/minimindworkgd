import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Send, Mic, Sparkles, Download, Share2, Copy, Check,
  List, Network, Loader2, RefreshCw, ArrowRight, Brain
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AIService from '@/services/aiService';
import { LanguageKey } from '@/config/minimind';
import MarkdownRenderer from '../MarkdownRenderer';
import TrustFooter from '../TrustFooter';
import FeedbackPrompt from '../FeedbackPrompt';
import SkeletonLoader from '../SkeletonLoader';
import { downloadPDF, sharePDF } from '@/utils/pdfGenerator';
import { useSubscription, CREDIT_COSTS } from '@/contexts/SubscriptionContext';
import { useEarlyAccess } from '@/contexts/EarlyAccessContext';
import { supabase } from '@/integrations/supabase/client';

interface EkaksharPageProps {
  language: LanguageKey;
}

interface CompressionMode {
  id: string;
  label: string;
  description: string;
  icon: typeof Zap;
  gradient: string;
  credits: number;
}

const COMPRESSION_MODES: CompressionMode[] = [
  {
    id: 'oneword',
    label: 'One Word',
    description: 'Pure essence',
    icon: Zap,
    gradient: 'from-amber-500 to-orange-600',
    credits: 1,
  },
  {
    id: 'oneline',
    label: 'One Sentence',
    description: 'Complete thought',
    icon: Sparkles,
    gradient: 'from-violet-500 to-purple-600',
    credits: 1,
  },
  {
    id: 'bullets',
    label: 'Key Insights',
    description: '3-5 bullet points',
    icon: List,
    gradient: 'from-cyan-500 to-blue-600',
    credits: 2,
  },
  {
    id: 'visual_map',
    label: 'Mind Map',
    description: 'Visual structure',
    icon: Network,
    gradient: 'from-emerald-500 to-teal-600',
    credits: 3,
  },
];

const EkaksharPage: React.FC<EkaksharPageProps> = ({ language }) => {
  const { hasCredits, useCredits, showUpgradePrompt } = useSubscription();
  const { isEarlyAccess } = useEarlyAccess();
  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFeedback, setShowFeedback] = useState(true);

  // Auto-submit if question comes from home page
  useEffect(() => {
    const autoQuestion = sessionStorage.getItem('ekakshar-auto-question');
    if (autoQuestion) {
      sessionStorage.removeItem('ekakshar-auto-question');
      setInput(autoQuestion);
      handleQuickCompress(autoQuestion);
    }
  }, [language]);

  const handleQuickCompress = async (question?: string) => {
    const q = question || input;
    if (!q.trim() || isProcessing) return;

    setIsProcessing(true);
    setSelectedMode('oneword');
    
    try {
      // Get all compressions at once for premium feel
      const modes = ['oneword', 'oneline', 'bullets'];
      const promises = modes.map(async (modeId) => {
        const { data, error } = await supabase.functions.invoke('chat', {
          body: { prompt: q, type: modeId, language },
        });
        if (error) throw error;
        return { modeId, response: data.response };
      });

      const responses = await Promise.all(promises);
      const newResults: Record<string, string> = {};
      responses.forEach(({ modeId, response }) => {
        newResults[modeId] = response;
      });
      
      setResults(newResults);
      if (!question) setInput('');
    } catch (error) {
      console.error('Error getting answer:', error);
      toast.error('Failed to compress. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSingleCompress = useCallback(async (modeId: string) => {
    if (!input.trim()) {
      toast.error('Please enter something to compress');
      return;
    }

    const mode = COMPRESSION_MODES.find(m => m.id === modeId);
    if (!mode) return;

    if (!isEarlyAccess && !hasCredits(mode.credits)) {
      showUpgradePrompt('Ekakshar');
      return;
    }

    setSelectedMode(modeId);
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { prompt: input, type: modeId, language },
      });

      if (error) throw error;

      if (!isEarlyAccess) {
        useCredits(mode.credits, `ekakshar_${modeId}`);
      }
      setResults(prev => ({ ...prev, [modeId]: data.response }));
    } catch (error) {
      console.error('Compression error:', error);
      toast.error('Failed to process. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [input, hasCredits, useCredits, showUpgradePrompt, language, isEarlyAccess]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleDownload = (text: string) => {
    downloadPDF(text, 'beginner', input);
    toast.success('PDF downloaded!');
  };

  const handleShare = async (text: string) => {
    await sharePDF(text, 'beginner', input);
  };

  const handleReset = () => {
    setResults({});
    setSelectedMode(null);
    setShowFeedback(true);
  };

  const handleVoiceInput = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'en' ? 'en-US' : `${language}-IN`;
      recognition.onstart = () => toast.info('🎤 Listening...');
      recognition.onresult = (event: any) => {
        setInput(event.results[0][0].transcript);
        toast.success('✅ Got it!');
      };
      recognition.onerror = (event: any) => toast.error(`Error: ${event.error}`);
      recognition.start();
    } else {
      toast.error('Voice input not supported');
    }
  }, [language]);

  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/20 mb-4"
          whileHover={{ scale: 1.02 }}
        >
          <Zap className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Ekakshar
          </span>
          {isEarlyAccess && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">
              Free
            </span>
          )}
        </motion.div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Compress Any Idea
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          From paragraphs to a single word — pure knowledge compression
        </p>
      </motion.div>

      {/* Input Card */}
      <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleQuickCompress(); }}
          className="flex items-center gap-2"
        >
          <motion.button
            type="button"
            className="icon-btn icon-btn-ghost flex-shrink-0"
            onClick={handleVoiceInput}
            whileTap={{ scale: 0.95 }}
          >
            <Mic className="w-5 h-5 text-muted-foreground" />
          </motion.button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter any topic or concept..."
            className="flex-1 bg-transparent border-none outline-none text-foreground text-sm"
            disabled={isProcessing}
          />
          
          <motion.button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm"
            whileTap={{ scale: 0.95 }}
            disabled={!input.trim() || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Compress
              </>
            )}
          </motion.button>
        </form>
      </Card>

      {/* Loading State */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <SkeletonLoader variant="card" lines={2} message="Compressing knowledge..." />
          <SkeletonLoader variant="card" lines={1} />
          <SkeletonLoader variant="card" lines={3} />
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {hasResults && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* One Word Result - Hero */}
            {results.oneword && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden"
              >
                <Card className="p-6 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      <span className="font-semibold">One Word</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(results.oneword)}
                      className="text-white/80 hover:text-white hover:bg-white/20"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  <motion.p 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="text-4xl md:text-5xl font-bold text-center py-8"
                  >
                    {results.oneword}
                  </motion.p>
                  
                  <p className="text-center text-white/70 text-sm">
                    The purest essence of your concept
                  </p>
                </Card>
              </motion.div>
            )}

            {/* One Line Result */}
            {results.oneline && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-5 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    <span className="font-semibold text-foreground text-sm">One Sentence</span>
                  </div>
                  <p className="text-lg font-medium text-foreground leading-relaxed">
                    {results.oneline}
                  </p>
                </Card>
              </motion.div>
            )}

            {/* Bullet Points */}
            {results.bullets && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-5 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <List className="w-4 h-4 text-cyan-500" />
                    <span className="font-semibold text-foreground text-sm">Key Insights</span>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <MarkdownRenderer content={results.bullets} />
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Mind Map Button */}
            {!results.visual_map && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => handleSingleCompress('visual_map')}
                disabled={isProcessing}
                className="w-full p-4 rounded-xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-3"
              >
                <Network className="w-5 h-5 text-emerald-500" />
                <span className="font-medium text-foreground">Generate Mind Map</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            )}

            {/* Mind Map Result */}
            {results.visual_map && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-emerald-500" />
                      <span className="font-semibold text-foreground text-sm">Mind Map</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(results.visual_map)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4 bg-background/50 rounded-xl backdrop-blur-sm">
                    <pre className="whitespace-pre-wrap text-sm font-mono overflow-x-auto text-foreground">
                      {results.visual_map}
                    </pre>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Trust Footer & Feedback */}
            <div className="space-y-2">
              <TrustFooter 
                creditCost={0}
                confidence="high"
                sourceType="reasoning"
              />
              
              {isEarlyAccess && showFeedback && (
                <FeedbackPrompt 
                  onFeedback={(type, comment) => {
                    console.log('Ekakshar Feedback:', { type, comment });
                    setShowFeedback(false);
                  }}
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                New Topic
              </Button>
              <Button 
                variant="outline" 
                onClick={() => results.oneword && handleDownload(Object.values(results).join('\n\n'))}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => results.oneword && handleShare(Object.values(results).join('\n\n'))}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State - Mode Selector */}
      {!hasResults && !isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">
              Enter any topic above and watch it compress into pure understanding
            </p>
          </div>

          {/* Quick Examples */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground text-center">Try these:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Quantum Computing', 'Blockchain', 'Machine Learning', 'Photosynthesis'].map((example) => (
                <motion.button
                  key={example}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setInput(example); handleQuickCompress(example); }}
                  className="px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted text-xs font-medium text-foreground transition-colors"
                >
                  {example}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-4">
        <p>Powered by AI • Compress knowledge instantly</p>
      </div>
    </div>
  );
};

export default EkaksharPage;