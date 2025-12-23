import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Send, Mic, Sparkles, Download, Share2, Copy, 
  List, Network, RefreshCw, Check, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  gradient: string;
  credits: number;
}

const COMPRESSION_MODES: CompressionMode[] = [
  {
    id: 'oneword',
    label: 'One Word',
    description: 'The absolute essence',
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
    description: 'Simple to deep ladder',
    icon: List,
    gradient: 'from-cyan-500 to-blue-600',
    credits: 2,
  },
  {
    id: 'visual',
    label: 'Visual Map',
    description: 'Structured concept view',
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
  const [history, setHistory] = useState<Array<{ input: string; mode: string; result: string }>>([]);

  // Auto-load from session storage
  useEffect(() => {
    const autoQuestion = sessionStorage.getItem('ekakshar-auto-question');
    if (autoQuestion) {
      setInput(autoQuestion);
      sessionStorage.removeItem('ekakshar-auto-question');
    }
  }, []);

  const handleCompress = useCallback(async () => {
    if (!input.trim()) {
      toast.error('Please enter something to compress');
      return;
    }

    const mode = COMPRESSION_MODES.find(m => m.id === selectedMode);
    if (!mode) return;

    if (!hasCredits(mode.credits)) {
      showUpgradePrompt('Ekakshar');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          prompt: input,
          type: selectedMode,
          language: language,
        },
      });

      if (error) throw error;

      useCredits(mode.credits, `ekakshar_${selectedMode}`);
      setResult(data.response);
      setHistory(prev => [{ input, mode: selectedMode, result: data.response }, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Compression error:', error);
      toast.error('Failed to process. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [input, selectedMode, language, hasCredits, useCredits, showUpgradePrompt]);

  const handleVoiceInput = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'en' ? 'en-US' : `${language}-IN`;
      
      recognition.onstart = () => toast.info('Listening...');
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

  const handleCopy = useCallback(() => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const handleDownload = () => {
    if (result && input) {
      downloadPDF(result, 'beginner', input);
      toast.success('PDF downloaded!');
    }
  };

  const handleShare = async () => {
    if (result && input) {
      await sharePDF(result, 'beginner', input);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  const currentMode = COMPRESSION_MODES.find(m => m.id === selectedMode);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-4"
          whileHover={{ scale: 1.02 }}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Ekakshar</span>
        </motion.div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
          Compress Knowledge
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Transform any concept into its purest form
        </p>
      </motion.div>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4 bg-card border-border shadow-lg">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a topic, concept, or paste any text..."
            className="min-h-[100px] resize-none border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground text-base"
          />
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {input.length} characters
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceInput}
                className="text-muted-foreground hover:text-foreground"
              >
                <Mic className="w-4 h-4" />
              </Button>
              {input && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput('')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Mode Selection */}
      {!result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-medium text-foreground">Compression Level</h3>
          <div className="grid grid-cols-2 gap-3">
            {COMPRESSION_MODES.map((mode, index) => {
              const Icon = mode.icon;
              const isActive = selectedMode === mode.id;
              return (
                <motion.button
                  key={mode.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                    isActive
                      ? `border-transparent bg-gradient-to-br ${mode.gradient} text-white shadow-lg`
                      : 'border-border bg-card hover:border-primary/30 hover:shadow-md'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
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

          {/* Compress Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={handleCompress}
              disabled={isProcessing || !input.trim()}
              className={`w-full h-14 text-base font-semibold bg-gradient-to-r ${currentMode?.gradient} hover:opacity-90 text-white shadow-lg`}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Compressing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>Compress to {currentMode?.label}</span>
                </div>
              )}
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className={`p-6 bg-gradient-to-br ${currentMode?.gradient} text-white shadow-xl overflow-hidden relative`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex items-center justify-between mb-4 relative">
                <div className="flex items-center gap-2">
                  {currentMode && React.createElement(currentMode.icon, { className: 'w-5 h-5' })}
                  <span className="font-semibold">{currentMode?.label}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="text-white/80 hover:text-white hover:bg-white/20"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="relative">
                {selectedMode === 'oneword' ? (
                  <p className="text-4xl font-bold text-center py-6">{result}</p>
                ) : selectedMode === 'oneline' ? (
                  <p className="text-xl font-medium text-center py-4 leading-relaxed">{result}</p>
                ) : selectedMode === 'visual' ? (
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="prose prose-invert prose-sm max-w-none">
                      <MarkdownRenderer content={result} />
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <MarkdownRenderer content={result} />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 mt-4 border-t border-white/20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="text-white/80 hover:text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-white/80 hover:text-white hover:bg-white/20"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Another Mode
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setInput('');
                  handleReset();
                }}
                className="flex-1"
              >
                New Topic
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 0 && !result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <ChevronDown className="w-4 h-4" />
            Recent
          </h3>
          <div className="space-y-2">
            {history.slice(0, 3).map((item, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => {
                  setInput(item.input);
                  setSelectedMode(item.mode);
                  setResult(item.result);
                }}
                className="w-full p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all text-left"
              >
                <p className="text-sm font-medium text-foreground truncate">{item.input}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {COMPRESSION_MODES.find(m => m.id === item.mode)?.label}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EkaksharPage;
