import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, Send, Mic, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import AIService from '@/services/aiService';
import { LanguageKey } from '@/config/minimind';

interface EkaksharPageProps {
  language: LanguageKey;
}

const EkaksharPage: React.FC<EkaksharPageProps> = ({ language }) => {
  const [question, setQuestion] = useState('');
  const [oneWordAnswer, setOneWordAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ question: string; answer: string }>>([]);

  const handleSubmit = useCallback(async () => {
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const answer = await AIService.getOneWordAnswer(question, language);
      setOneWordAnswer(answer);
      setHistory(prev => [{ question, answer }, ...prev.slice(0, 9)]);
      setQuestion('');
    } catch (error) {
      console.error('Error getting one-word answer:', error);
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

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">⚡</div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Ekakshar</h1>
        <p className="text-muted-foreground text-sm mt-1">One word. Infinite meaning.</p>
      </div>

      {/* Main Result */}
      <motion.div
        className="mode-card text-center py-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Finding the perfect word...</p>
          </div>
        ) : oneWordAnswer ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <Sparkles className="w-8 h-8 mx-auto text-primary mb-2" />
            <h2 className="text-4xl font-heading font-bold gradient-text">
              {oneWordAnswer}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              The essence of your question
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <Zap className="w-12 h-12 mx-auto text-primary/30" />
            <p className="text-muted-foreground">
              Ask anything and get a one-word answer
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
            placeholder="What's the meaning of life?"
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
          <div className="space-y-2">
            {history.map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <span className="text-sm text-muted-foreground truncate flex-1 mr-2">
                  {item.question}
                </span>
                <span className="font-semibold text-primary flex-shrink-0">
                  {item.answer}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Info */}
      <div className="text-center text-xs text-muted-foreground">
        <p>Powered by AI • Captures the essence in a single word</p>
      </div>
    </div>
  );
};

export default EkaksharPage;
