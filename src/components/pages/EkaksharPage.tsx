import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Send, Mic, Sparkles, Download, Share2, Copy, Check,
  List, Network, ArrowRight, Loader2, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIService from '@/services/aiService';
import { LanguageKey } from '@/config/minimind';
import MarkdownRenderer from '../MarkdownRenderer';
import { downloadPDF, sharePDF } from '@/utils/pdfGenerator';
import { useSubscription, CREDIT_COSTS } from '@/contexts/SubscriptionContext';
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
    description: 'Absolute essence',
    icon: Zap,
    gradient: 'from-amber-500 to-orange-600',
    credits: 1,
  },
  {
    id: 'oneline',
    label: 'One Line',
    description: 'Complete in a sentence',
    icon: Sparkles,
    gradient: 'from-violet-500 to-purple-600',
    credits: 1,
  },
  {
    id: 'bullets',
    label: 'Key Points',
    description: 'Bullet summary',
    icon: List,
    gradient: 'from-cyan-500 to-blue-600',
    credits: 2,
  },
  {
    id: 'mindmap',
    label: 'Mind Map',
    description: 'Visual structure',
    icon: Network,
    gradient: 'from-emerald-500 to-teal-600',
    credits: 3,
  },
];

const EkaksharPage: React.FC<EkaksharPageProps> = ({ language }) => {
  const { hasCredits, useCredits, showUpgradePrompt } = useSubscription();
  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('oneword');
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'compress'>('quick');
  const [quickAnswer, setQuickAnswer] = useState<string | null>(null);
  const [quickLoading, setQuickLoading] = useState(false);

  // Auto-submit if question comes from home page
  useEffect(() => {
    const autoQuestion = sessionStorage.getItem('ekakshar-auto-question');
    if (autoQuestion) {
      sessionStorage.removeItem('ekakshar-auto-question');
      setInput(autoQuestion);
      handleQuickAnswer(autoQuestion);
    }
  }, [language]);

  const handleQuickAnswer = async (question?: string) => {
    const q = question || input;
    if (!q.trim() || quickLoading) return;

    setQuickLoading(true);
    try {
      const answer = await AIService.getEkaksharAnswer(q, language);
      setQuickAnswer(answer);
      if (!question) setInput('');
    } catch (error) {
      console.error('Error getting answer:', error);
      toast.error('Failed to get answer');
    } finally {
      setQuickLoading(false);
    }
  };

  const handleCompress = useCallback(async (modeId: string) => {
    if (!input.trim()) {
      toast.error('Please enter something to compress');
      return;
    }

    const mode = COMPRESSION_MODES.find(m => m.id === modeId);
    if (!mode) return;

    if (!hasCredits(mode.credits)) {
      showUpgradePrompt('Ekakshar');
      return;
    }

    setSelectedMode(modeId);
    setIsProcessing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          prompt: input,
          type: modeId,
          language: language,
        },
      });

      if (error) throw error;

      useCredits(mode.credits, `ekakshar_${modeId}`);
      setResult(data.response);
    } catch (error) {
      console.error('Compression error:', error);
      toast.error('Failed to process. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [input, hasCredits, useCredits, showUpgradePrompt, language]);

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
    setResult(null);
    setQuickAnswer(null);
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

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-4"
          whileHover={{ scale: 1.02 }}
        >
          <Zap className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Ekakshar</span>
        </motion.div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Compress Knowledge
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Transform any concept into its purest form
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'quick' | 'compress')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="quick" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Quick Insights
          </TabsTrigger>
          <TabsTrigger value="compress" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Compress
          </TabsTrigger>
        </TabsList>

        {/* Quick Insights Tab */}
        <TabsContent value="quick" className="mt-4 space-y-4">
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleQuickAnswer(); }}
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
                placeholder="Ask anything for quick insights..."
                className="flex-1 bg-transparent border-none outline-none text-foreground text-sm"
                disabled={quickLoading}
              />
              
              <motion.button
                type="submit"
                className="icon-btn icon-btn-primary flex-shrink-0"
                whileTap={{ scale: 0.95 }}
                disabled={!input.trim() || quickLoading}
              >
                {quickLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            </form>
          </Card>

          {/* Quick Answer Result */}
          <AnimatePresence>
            {quickAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="font-heading font-semibold text-foreground">Key Points</h2>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    <MarkdownRenderer content={quickAnswer} className="text-sm" />
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-border mt-4">
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(quickAnswer)}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(quickAnswer)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleShare(quickAnswer)}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Compress Tab */}
        <TabsContent value="compress" className="mt-4 space-y-4">
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a topic, concept, or paste any text to compress..."
              className="min-h-[100px] resize-none border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
            />
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">
                {input.length} characters
              </span>
              {input && (
                <Button variant="ghost" size="sm" onClick={() => setInput('')}>
                  Clear
                </Button>
              )}
            </div>
          </Card>

          {/* Compression Modes */}
          {!result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <p className="text-sm font-medium text-muted-foreground">Choose compression level:</p>
              <div className="grid grid-cols-2 gap-3">
                {COMPRESSION_MODES.map((mode, index) => {
                  const Icon = mode.icon;
                  const isActive = selectedMode === mode.id && isProcessing;
                  return (
                    <motion.button
                      key={mode.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * index }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCompress(mode.id)}
                      disabled={isProcessing || !input.trim()}
                      className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                        isActive
                          ? `border-transparent bg-gradient-to-br ${mode.gradient} text-white shadow-lg`
                          : 'border-border bg-card hover:border-primary/30 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {isActive ? (
                        <Loader2 className="w-6 h-6 mb-2 text-white animate-spin" />
                      ) : (
                        <Icon className={`w-6 h-6 mb-2 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                      )}
                      <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-foreground'}`}>
                        {mode.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {mode.description}
                      </p>
                      <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        {mode.credits}c
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Compression Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <Card className={`p-6 bg-gradient-to-br ${COMPRESSION_MODES.find(m => m.id === selectedMode)?.gradient} text-white shadow-xl`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {React.createElement(COMPRESSION_MODES.find(m => m.id === selectedMode)?.icon || Zap, {
                        className: 'w-5 h-5',
                      })}
                      <span className="font-semibold">
                        {COMPRESSION_MODES.find(m => m.id === selectedMode)?.label}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(result)}
                      className="text-white/80 hover:text-white hover:bg-white/20"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  {selectedMode === 'oneword' ? (
                    <p className="text-4xl font-bold text-center py-6">{result}</p>
                  ) : selectedMode === 'oneline' ? (
                    <p className="text-xl font-medium text-center py-4">{result}</p>
                  ) : selectedMode === 'mindmap' ? (
                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                      <pre className="whitespace-pre-wrap text-sm font-mono overflow-x-auto">{result}</pre>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <MarkdownRenderer content={result} />
                    </div>
                  )}
                </Card>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleReset} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Another
                  </Button>
                  <Button variant="outline" onClick={() => { setInput(''); handleReset(); }} className="flex-1">
                    New Topic
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-4">
        <p>Powered by AI • Compress knowledge instantly</p>
      </div>
    </div>
  );
};

export default EkaksharPage;
