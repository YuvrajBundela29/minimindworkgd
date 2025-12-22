import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, Send, Mic, Sparkles, Download, Share2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import AIService from '@/services/aiService';
import { LanguageKey } from '@/config/minimind';
import MarkdownRenderer from '../MarkdownRenderer';
import { downloadPDF, sharePDF } from '@/utils/pdfGenerator';

interface EkaksharPageProps {
  language: LanguageKey;
}

const EkaksharPage: React.FC<EkaksharPageProps> = ({ language }) => {
  const [question, setQuestion] = useState('');
  const [flashcardAnswer, setFlashcardAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ question: string; answer: string }>>([]);

  const handleSubmit = useCallback(async () => {
    if (!question.trim() || isLoading) return;

    const currentQuestion = question;
    setIsLoading(true);
    try {
      const answer = await AIService.getEkaksharAnswer(currentQuestion, language);
      setFlashcardAnswer(answer);
      setHistory(prev => [{ question: currentQuestion, answer }, ...prev.slice(0, 9)]);
      setQuestion('');
    } catch (error) {
      console.error('Error getting Ekakshar answer:', error);
      toast.error('Failed to get answer');
    } finally {
      setIsLoading(false);
    }
  }, [question, language, isLoading]);

  const handleVoiceInput = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'en' ? 'en-US' : `${language}-IN`;
      
      recognition.onstart = () => {
        toast.info('🎤 Listening...');
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        toast.success('✅ Got it!');
      };
      
      recognition.onerror = (event: any) => {
        toast.error(`Error: ${event.error}`);
      };
      
      recognition.start();
    } else {
      toast.error('Voice input not supported');
    }
  }, [language]);

  const handleCopy = () => {
    if (flashcardAnswer) {
      navigator.clipboard.writeText(flashcardAnswer);
      toast.success('Copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (flashcardAnswer && history.length > 0) {
      downloadPDF(flashcardAnswer, 'beginner', history[0].question);
      toast.success('PDF downloaded!');
    }
  };

  const handleShare = async () => {
    if (flashcardAnswer && history.length > 0) {
      await sharePDF(flashcardAnswer, 'beginner', history[0].question);
      toast.success('Shared!');
    }
  };

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">⚡</div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Ekakshar</h1>
        <p className="text-muted-foreground text-sm mt-1">Flash-card insights. Quick learning.</p>
      </div>

      {/* Main Result */}
      <motion.div
        className="mode-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Creating flashcard insights...</p>
          </div>
        ) : flashcardAnswer ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-semibold text-foreground">Key Points</h2>
            </div>
            
            <div className="card-content-scroll custom-scrollbar">
              <MarkdownRenderer content={flashcardAnswer} className="text-sm" />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-3 border-t border-border">
              <motion.button
                className="action-btn bg-muted hover:bg-muted/80"
                onClick={handleCopy}
                whileTap={{ scale: 0.95 }}
              >
                <Copy className="w-4 h-4" />
              </motion.button>
              <motion.button
                className="action-btn bg-muted hover:bg-muted/80"
                onClick={handleDownload}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" />
              </motion.button>
              <motion.button
                className="action-btn bg-muted hover:bg-muted/80"
                onClick={handleShare}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-2 py-8 text-center">
            <Zap className="w-12 h-12 mx-auto text-primary/30" />
            <p className="text-muted-foreground">
              Ask anything and get concise flashcard-style insights
            </p>
          </div>
        )}
      </motion.div>

      {/* Input */}
      <div className="mode-card">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
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
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything for quick insights..."
            className="flex-1 bg-transparent border-none outline-none text-foreground text-sm"
            disabled={isLoading}
          />
          
          <motion.button
            type="submit"
            className="icon-btn icon-btn-primary flex-shrink-0"
            whileTap={{ scale: 0.95 }}
            disabled={!question.trim() || isLoading}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
      </div>

      {/* History */}
      {history.length > 0 && (
        <motion.div
          className="mode-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-heading font-semibold text-foreground mb-3">Recent</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            {history.map((item, index) => (
              <motion.div
                key={index}
                className="py-2 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setFlashcardAnswer(item.answer)}
              >
                <p className="text-sm text-muted-foreground truncate mb-1">
                  {item.question}
                </p>
                <p className="text-xs text-primary">
                  {item.answer.split('\n')[0].substring(0, 60)}...
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Info */}
      <div className="text-center text-xs text-muted-foreground">
        <p>Powered by AI • Quick flashcard-style learning</p>
      </div>
    </div>
  );
};

export default EkaksharPage;
