import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import MobileHeader from '@/components/MobileHeader';
import BottomInputBar from '@/components/BottomInputBar';
import ModeCard from '@/components/ModeCard';
import SideMenu from '@/components/SideMenu';
import ProgressPage from '@/components/pages/ProgressPage';
import EkaksharPage from '@/components/pages/EkaksharPage';
import HistoryPage from '@/components/pages/HistoryPage';
import SettingsPage from '@/components/pages/SettingsPage';
import { modes, ModeKey, languages, LanguageKey, suggestedPrompts, NavigationId } from '@/config/minimind';
import AIService from '@/services/aiService';

// Types for history
export interface HistoryItem {
  id: string;
  question: string;
  answers: Record<ModeKey, string>;
  timestamp: Date;
  language: LanguageKey;
}

// Default welcome messages for each mode
const defaultAnswers: Record<ModeKey, string> = {
  beginner: "Hi there! 😊 How are you today? Do you want to learn something fun?",
  thinker: "Hey there! What's up? Need help with something specific, or just hanging out? Let's dive into whatever's on your mind! 📚 ✨",
  story: "Once upon a time, in a cozy little town, there had lived a cheerful cat named Whiskers. Whiskers loved to play with his best friend, a fluffy mouse named Nibbles.\n\nOne sunny day, they found a shiny red ball in the garden. Whiskers...",
  mastery: "Hello! How can I assist you today? If you have a specific topic or question in mind, feel free to share, and I'll provide a comprehensive, research-level explanation.",
};

const Index = () => {
  // State Management
  const [currentPage, setCurrentPage] = useState<NavigationId>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageKey>('en');
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);
  
  // Question & Answers
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState<Record<ModeKey, string | null>>(defaultAnswers);
  const [loadingModes, setLoadingModes] = useState<Record<ModeKey, boolean>>({
    beginner: false,
    thinker: false,
    story: false,
    mastery: false,
  });
  
  // Refining state
  const [isRefining, setIsRefining] = useState(false);
  
  // Chat inputs per mode
  const [chatInputs, setChatInputs] = useState<Record<ModeKey, string>>({
    beginner: '',
    thinker: '',
    story: '',
    mastery: '',
  });
  
  // Chat history per mode
  const [chatHistories, setChatHistories] = useState<Record<ModeKey, Array<{ role: string; content: string }>>>({
    beginner: [],
    thinker: [],
    story: [],
    mastery: [],
  });
  
  // Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState<SpeechSynthesisUtterance | null>(null);
  
  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Progress stats
  const [stats, setStats] = useState({
    totalQuestions: 0,
    todayQuestions: 0,
    favoriteMode: 'beginner' as ModeKey,
    streak: 0,
  });
  
  // Load saved data
  useEffect(() => {
    const savedTheme = localStorage.getItem('minimind-theme') as 'light' | 'dark' || 'light';
    const savedLanguage = localStorage.getItem('minimind-language') as LanguageKey || 'en';
    const savedHistory = localStorage.getItem('minimind-history');
    const savedStats = localStorage.getItem('minimind-stats');
    
    setTheme(savedTheme);
    setSelectedLanguage(savedLanguage);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (e) {
        console.error('Error parsing history:', e);
      }
    }
    
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error('Error parsing stats:', e);
      }
    }
  }, []);
  
  // Save history
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('minimind-history', JSON.stringify(history));
    }
  }, [history]);
  
  // Save stats
  useEffect(() => {
    localStorage.setItem('minimind-stats', JSON.stringify(stats));
  }, [stats]);
  
  // Save language preference
  useEffect(() => {
    localStorage.setItem('minimind-language', selectedLanguage);
  }, [selectedLanguage]);
  
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('minimind-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, [theme]);
  
  // Handle prompt refining
  const handleRefinePrompt = useCallback(async () => {
    if (!question.trim() || isRefining) return;
    
    setIsRefining(true);
    try {
      const refined = await AIService.refinePrompt(question, selectedLanguage);
      setQuestion(refined);
      toast.success('✨ Prompt refined!');
    } catch (error) {
      console.error('Error refining prompt:', error);
      toast.error('Failed to refine prompt');
    } finally {
      setIsRefining(false);
    }
  }, [question, selectedLanguage, isRefining]);
  
  // Handle question submission
  const handleSubmit = useCallback(async () => {
    if (!question.trim()) return;
    
    const currentQuestion = question;
    setHasAskedQuestion(true);
    
    // Reset answers and set loading for all modes
    setAnswers({ beginner: null, thinker: null, story: null, mastery: null });
    setLoadingModes({ beginner: true, thinker: true, story: true, mastery: true });
    
    // Initialize chat histories
    setChatHistories({
      beginner: [{ role: 'user', content: currentQuestion }],
      thinker: [{ role: 'user', content: currentQuestion }],
      story: [{ role: 'user', content: currentQuestion }],
      mastery: [{ role: 'user', content: currentQuestion }],
    });
    
    // Fetch answers for all modes in parallel
    const modeKeys = Object.keys(modes) as ModeKey[];
    const newAnswers: Record<ModeKey, string> = {} as Record<ModeKey, string>;
    
    await Promise.all(
      modeKeys.map(async (modeKey) => {
        try {
          const response = await AIService.getExplanation(currentQuestion, modeKey, selectedLanguage);
          setAnswers(prev => ({ ...prev, [modeKey]: response }));
          newAnswers[modeKey] = response;
          
          // Update chat history
          setChatHistories(prev => ({
            ...prev,
            [modeKey]: [...prev[modeKey], { role: 'assistant', content: response }]
          }));
        } catch (error) {
          console.error(`Error for ${modeKey}:`, error);
          const errorMsg = 'Sorry, something went wrong. Please try again.';
          setAnswers(prev => ({ ...prev, [modeKey]: errorMsg }));
          newAnswers[modeKey] = errorMsg;
        } finally {
          setLoadingModes(prev => ({ ...prev, [modeKey]: false }));
        }
      })
    );
    
    // Add to history
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      question: currentQuestion,
      answers: newAnswers,
      timestamp: new Date(),
      language: selectedLanguage,
    };
    setHistory(prev => [historyItem, ...prev.slice(0, 49)]);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalQuestions: prev.totalQuestions + 1,
      todayQuestions: prev.todayQuestions + 1,
    }));
    
    // Clear input after submission
    setQuestion('');
  }, [question, selectedLanguage]);
  
  // Voice Input Handler
  const handleVoiceInput = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLanguage === 'en' ? 'en-US' : `${selectedLanguage}-IN`;
      
      recognition.onstart = () => {
        toast.info('🎤 Listening... Speak now!');
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        toast.success('✅ Voice input captured!');
      };
      
      recognition.onerror = (event: any) => {
        toast.error(`Voice input error: ${event.error}`);
      };
      
      recognition.start();
    } else {
      toast.error('Voice input not supported in your browser');
    }
  }, [selectedLanguage]);
  
  // Text-to-Speech Handler
  const handleSpeak = useCallback((text: string, mode: string) => {
    if (isSpeaking && currentSpeech) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeech(null);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeech(null);
    };
    
    setCurrentSpeech(utterance);
    setIsSpeaking(true);
    speechSynthesis.speak(utterance);
  }, [isSpeaking, currentSpeech]);
  
  // Copy to clipboard
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  }, []);
  
  // Download as text file
  const handleDownload = useCallback((text: string, mode: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minimind-${mode}-answer.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  }, []);
  
  // Share
  const handleShare = useCallback(async (text: string, mode: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MiniMind ${mode} Answer`,
          text: text.substring(0, 200) + '...',
          url: window.location.href,
        });
      } catch {
        handleCopy(text);
      }
    } else {
      handleCopy(text);
    }
  }, [handleCopy]);
  
  // Get one word summary
  const handleGetOneWord = useCallback(async (mode: string) => {
    const answer = answers[mode as ModeKey];
    if (!answer) return;
    
    toast.promise(
      AIService.getOneWordAnswer(answer, selectedLanguage),
      {
        loading: 'Getting summary...',
        success: (data) => `One-word summary: ${data}`,
        error: 'Failed to get summary',
      }
    );
  }, [answers, selectedLanguage]);
  
  // Chat submit handler
  const handleChatSubmit = useCallback(async (message: string, mode: string) => {
    const modeKey = mode as ModeKey;
    if (!message.trim()) return;
    
    // Add user message to history
    setChatHistories(prev => ({
      ...prev,
      [modeKey]: [...prev[modeKey], { role: 'user', content: message }]
    }));
    
    // Set loading
    setLoadingModes(prev => ({ ...prev, [modeKey]: true }));
    
    try {
      const response = await AIService.continueConversation(
        [...chatHistories[modeKey], { role: 'user', content: message }],
        modeKey,
        selectedLanguage
      );
      
      setAnswers(prev => ({ ...prev, [modeKey]: response }));
      setChatHistories(prev => ({
        ...prev,
        [modeKey]: [...prev[modeKey], { role: 'assistant', content: response }]
      }));
    } catch (error) {
      console.error('Error in chat:', error);
      toast.error('Failed to get response');
    } finally {
      setLoadingModes(prev => ({ ...prev, [modeKey]: false }));
    }
    
    setChatInputs(prev => ({ ...prev, [modeKey]: '' }));
  }, [chatHistories, selectedLanguage]);
  
  // Update chat input
  const handleChatInputChange = useCallback((mode: string, value: string) => {
    setChatInputs(prev => ({ ...prev, [mode as ModeKey]: value }));
  }, []);
  
  // Load history item
  const handleLoadHistory = useCallback((item: HistoryItem) => {
    setAnswers(item.answers);
    setHasAskedQuestion(true);
    setCurrentPage('home');
    toast.success('Loaded from history!');
  }, []);
  
  // Clear history
  const handleClearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('minimind-history');
    toast.success('History cleared!');
  }, []);

  const hasAnswers = Object.values(answers).some(a => a !== null);
  const isAnyLoading = Object.values(loadingModes).some(l => l);

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <MobileHeader 
        onMenuClick={() => setIsMenuOpen(true)}
        onProfileClick={() => setCurrentPage('settings')}
      />
      
      {/* Side Menu */}
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        theme={theme}
        onToggleTheme={toggleTheme}
        selectedLanguage={selectedLanguage}
        onLanguageSelect={setSelectedLanguage}
      />
      
      {/* Main Content */}
      <main className="page-content px-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {(Object.keys(modes) as ModeKey[]).map((modeKey, index) => (
                <motion.div
                  key={modeKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ModeCard
                    modeKey={modeKey}
                    answer={answers[modeKey]}
                    isLoading={loadingModes[modeKey]}
                    onSpeak={handleSpeak}
                    onCopy={handleCopy}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    onGetOneWord={handleGetOneWord}
                    onChatSubmit={handleChatSubmit}
                    isSpeaking={isSpeaking}
                    chatInputValue={chatInputs[modeKey]}
                    onChatInputChange={handleChatInputChange}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {currentPage === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ProgressPage stats={stats} history={history} />
            </motion.div>
          )}
          
          {currentPage === 'oneword' && (
            <motion.div
              key="oneword"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <EkaksharPage language={selectedLanguage} />
            </motion.div>
          )}
          
          {currentPage === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <HistoryPage 
                history={history} 
                onLoadItem={handleLoadHistory}
                onClearHistory={handleClearHistory}
              />
            </motion.div>
          )}
          
          {currentPage === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SettingsPage
                theme={theme}
                onToggleTheme={toggleTheme}
                selectedLanguage={selectedLanguage}
                onLanguageSelect={setSelectedLanguage}
                onClearHistory={handleClearHistory}
                stats={stats}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Bottom Input Bar - only on home */}
      {currentPage === 'home' && (
        <BottomInputBar
          value={question}
          onChange={setQuestion}
          onSubmit={handleSubmit}
          onVoiceInput={handleVoiceInput}
          onRefinePrompt={handleRefinePrompt}
          placeholder="Ask anything... MiniMind explains it 4 ways!"
          isLoading={isAnyLoading}
          isRefining={isRefining}
        />
      )}
    </div>
  );
};

export default Index;
