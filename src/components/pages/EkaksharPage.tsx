import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Send, Mic, Sparkles, Download, Share2, Copy, Check,
  List, Network, Loader2, RefreshCw, Type, AlignLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AIService from '@/services/aiService';
import { LanguageKey } from '@/config/minimind';
import MarkdownRenderer from '../MarkdownRenderer';
import { downloadPDF, sharePDF } from '@/utils/pdfGenerator';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';

interface EkaksharPageProps {
  language: LanguageKey;
}

interface CompressionMode {
  id: string;
  label: string;
  description: string;
  icon: typeof Zap;
  color: string;
  bgColor: string;
}

const COMPRESSION_MODES: CompressionMode[] = [
  {
    id: 'oneword',
    label: 'One Word',
    description: 'Pure essence',
    icon: Type,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20',
  },
  {
    id: 'oneline',
    label: 'One Line',
    description: 'Complete sentence',
    icon: AlignLeft,
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20',
  },
  {
    id: 'bullets',
    label: 'Key Points',
    description: 'Bullet summary',
    icon: List,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20',
  },
  {
    id: 'visual_map',
    label: 'Mind Map',
    description: 'Visual structure',
    icon: Network,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20',
  },
];

const EkaksharPage: React.FC<EkaksharPageProps> = ({ language }) => {
  const { hasCredits, useCredits, showUpgradePrompt } = useSubscription();
  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-submit if question comes from home page
  useEffect(() => {
    const autoQuestion = sessionStorage.getItem('ekakshar-auto-question');
    if (autoQuestion) {
      sessionStorage.removeItem('ekakshar-auto-question');
      setInput(autoQuestion);
    }
  }, []);

  const handleCompress = useCallback(async (modeId: string) => {
    if (!input.trim()) {
      toast.error('Please enter something first');
      return;
    }

    const mode = COMPRESSION_MODES.find(m => m.id === modeId);
    if (!mode) return;

    if (!hasCredits(1)) {
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

      useCredits(1, `ekakshar_${modeId}`);
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
    setSelectedMode(null);
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
        toast.success('Got it!');
      };
      recognition.onerror = (event: any) => toast.error(`Error: ${event.error}`);
      recognition.start();
    } else {
      toast.error('Voice input not supported');
    }
  }, [language]);

  const getActiveMode = () => COMPRESSION_MODES.find(m => m.id === selectedMode);

  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="text-center mb-8"
      >
        <motion.div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/20 mb-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
            Ekakshar
          </span>
        </motion.div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
          Compress Any Knowledge
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Transform complex concepts into their purest, most memorable form
        </p>
      </motion.div>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="relative mb-6"
      >
        <div className="relative rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm overflow-hidden">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter any topic, concept, or paste text to compress..."
            className="min-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground p-4 pr-12"
            disabled={isProcessing}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <motion.button
              type="button"
              onClick={handleVoiceInput}
              className="p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isProcessing}
            >
              <Mic className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="text-xs text-muted-foreground">
            {input.length} characters
          </span>
          {input && !isProcessing && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setInput('')}
              className="text-xs h-6 px-2"
            >
              Clear
            </Button>
          )}
        </div>
      </motion.div>

      {/* Compression Modes */}
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="modes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex-1"
          >
            <p className="text-xs font-medium text-muted-foreground mb-4 px-1">
              Choose compression level
            </p>
            <div className="grid grid-cols-2 gap-3">
              {COMPRESSION_MODES.map((mode, index) => {
                const Icon = mode.icon;
                const isActive = selectedMode === mode.id && isProcessing;
                
                return (
                  <motion.button
                    key={mode.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + 0.05 * index, duration: 0.3 }}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCompress(mode.id)}
                    disabled={isProcessing || !input.trim()}
                    className={`relative p-4 rounded-2xl border text-left transition-all duration-300 ${mode.bgColor} ${
                      isProcessing && selectedMode !== mode.id ? 'opacity-50' : ''
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-xl bg-background/50 ${mode.color}`}>
                        {isActive ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                    <p className="font-semibold text-sm text-foreground mb-0.5">
                      {mode.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mode.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex-1 flex flex-col"
          >
            {/* Result Card */}
            <div className={`flex-1 rounded-2xl border p-5 ${getActiveMode()?.bgColor} transition-all`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getActiveMode() && (
                    <>
                      {React.createElement(getActiveMode()!.icon, {
                        className: `w-4 h-4 ${getActiveMode()!.color}`,
                      })}
                      <span className={`text-sm font-medium ${getActiveMode()!.color}`}>
                        {getActiveMode()!.label}
                      </span>
                    </>
                  )}
                </div>
                <motion.button
                  onClick={() => handleCopy(result)}
                  className="p-2 rounded-lg hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </motion.button>
              </div>
              
              <div className="min-h-[120px]">
                {selectedMode === 'oneword' ? (
                  <motion.p 
                    className="text-4xl font-bold text-center py-8 text-foreground"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  >
                    {result}
                  </motion.p>
                ) : selectedMode === 'oneline' ? (
                  <motion.p 
                    className="text-lg font-medium text-center py-6 text-foreground leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    "{result}"
                  </motion.p>
                ) : selectedMode === 'visual_map' ? (
                  <motion.div 
                    className="p-4 bg-background/30 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <pre className="whitespace-pre-wrap text-sm font-mono text-foreground overflow-x-auto">
                      {result}
                    </pre>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="prose prose-sm dark:prose-invert max-w-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <MarkdownRenderer content={result} />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Actions */}
            <motion.div 
              className="flex items-center gap-2 mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownload(result)}
                className="flex-1 rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleShare(result)}
                className="flex-1 rounded-xl"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </motion.div>

            <motion.div 
              className="flex items-center gap-2 mt-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Button 
                variant="ghost" 
                onClick={handleReset}
                className="flex-1 rounded-xl text-muted-foreground"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Another Mode
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => { setInput(''); handleReset(); }}
                className="flex-1 rounded-xl text-muted-foreground"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                New Topic
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div 
        className="text-center text-xs text-muted-foreground pt-6 mt-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p>Powered by AI • Compress knowledge instantly</p>
      </motion.div>
    </div>
  );
};

export default EkaksharPage;
