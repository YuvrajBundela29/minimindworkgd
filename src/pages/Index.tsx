import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import MobileHeader from '@/components/MobileHeader';
import BottomInputBar from '@/components/BottomInputBar';
import ModeCard from '@/components/ModeCard';
import SideMenu from '@/components/SideMenu';
import EkaksharPage from '@/components/pages/EkaksharPage';
import HistoryPage from '@/components/pages/HistoryPage';
import SettingsPage from '@/components/pages/SettingsPage';
import AuthPage from '@/components/pages/AuthPage';
import ProfilePage from '@/components/pages/ProfilePage';
import SubscriptionPage from '@/components/pages/SubscriptionPage';
import LearningPathPage from '@/components/pages/LearningPathPage';
import ExplainBackPage from '@/components/pages/ExplainBackPage';
import FullscreenMode from '@/components/FullscreenMode';
import RefinePromptDialog from '@/components/RefinePromptDialog';
import OnboardingGuide from '@/components/OnboardingGuide';
import QuestionLimitBanner from '@/components/QuestionLimitBanner';
import EarlyAccessGate from '@/components/EarlyAccessGate';
import HeroEmptyState from '@/components/HeroEmptyState';
import { modes, ModeKey, LanguageKey, NavigationId } from '@/config/minimind';
import AIService from '@/services/aiService';
import speechService from '@/services/speechService';
import { downloadPDF, sharePDF, SharePlatform } from '@/utils/pdfGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription, CREDIT_COSTS } from '@/contexts/SubscriptionContext';
import { useEarlyAccess } from '@/contexts/EarlyAccessContext';

// Types for history
export interface HistoryItem {
  id: string;
  question: string;
  answers: Record<ModeKey, string>;
  timestamp: Date;
  language: LanguageKey;
}

// Default welcome messages for each mode
const defaultAnswers: Record<ModeKey, string | null> = {
  beginner: null,
  thinker: null,
  story: null,
  mastery: null,
};

const Index = () => {
  const { isEarlyAccess } = useEarlyAccess();
  
  // State Management
  const [currentPage, setCurrentPage] = useState<NavigationId | 'auth'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageKey>('en');
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Question & Answers
  const [question, setQuestion] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answers, setAnswers] = useState<Record<ModeKey, string | null>>(defaultAnswers);
  const [loadingModes, setLoadingModes] = useState<Record<ModeKey, boolean>>({
    beginner: false, thinker: false, story: false, mastery: false,
  });
  
  // Refining state
  const [isRefining, setIsRefining] = useState(false);
  const [showRefineDialog, setShowRefineDialog] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [refinedPrompt, setRefinedPrompt] = useState('');
  
  // Fullscreen state
  const [fullscreenMode, setFullscreenMode] = useState<ModeKey | null>(null);
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Chat inputs per mode
  const [chatInputs, setChatInputs] = useState<Record<ModeKey, string>>({
    beginner: '', thinker: '', story: '', mastery: '',
  });
  
  // Chat history per mode
  const [chatHistories, setChatHistories] = useState<Record<ModeKey, Array<{ role: 'user' | 'assistant'; content: string }>>>({
    beginner: [], thinker: [], story: [], mastery: [],
  });
  
  // Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState<SpeechSynthesisUtterance | null>(null);
  
  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Progress stats
  const [stats, setStats] = useState({
    totalQuestions: 0, todayQuestions: 0, favoriteMode: 'beginner' as ModeKey, streak: 0,
  });
  
  // Load saved data and auth
  useEffect(() => {
    const savedTheme = localStorage.getItem('minimind-theme') as 'light' | 'dark' || 'light';
    const savedLanguage = localStorage.getItem('minimind-language') as LanguageKey || 'en';
    const savedHistory = localStorage.getItem('minimind-history');
    const savedStats = localStorage.getItem('minimind-stats');
    const hasSeenOnboarding = localStorage.getItem('minimind-onboarding-seen');
    
    setTheme(savedTheme);
    setSelectedLanguage(savedLanguage);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    // Show onboarding for first-time users
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
    
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({ ...item, timestamp: new Date(item.timestamp) })));
      } catch (e) { console.error('Error parsing history:', e); }
    }
    
    if (savedStats) {
      try { setStats(JSON.parse(savedStats)); } catch (e) { console.error('Error parsing stats:', e); }
    }

    // Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsCheckingAuth(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsCheckingAuth(false);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  const handleCloseOnboarding = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem('minimind-onboarding-seen', 'true');
  }, []);
  
  useEffect(() => { if (history.length > 0) localStorage.setItem('minimind-history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('minimind-stats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('minimind-language', selectedLanguage); }, [selectedLanguage]);
  
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('minimind-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, [theme]);
  
  // Handle prompt refining with dialog
  const handleRefinePrompt = useCallback(async () => {
    if (!question.trim() || isRefining) return;
    
    setOriginalPrompt(question);
    setIsRefining(true);
    try {
      const refined = await AIService.refinePrompt(question, selectedLanguage);
      setRefinedPrompt(refined);
      setShowRefineDialog(true);
    } catch (error) {
      console.error('Error refining prompt:', error);
      toast.error('Failed to refine prompt');
    } finally {
      setIsRefining(false);
    }
  }, [question, selectedLanguage, isRefining]);

  const handleAcceptRefinedPrompt = () => {
    setQuestion(refinedPrompt);
    setShowRefineDialog(false);
    toast.success('✨ Using refined prompt!');
  };

  const handleReRefine = async () => {
    setIsRefining(true);
    try {
      const refined = await AIService.refinePrompt(refinedPrompt, selectedLanguage);
      setRefinedPrompt(refined);
    } catch (error) {
      toast.error('Failed to re-refine prompt');
    } finally {
      setIsRefining(false);
    }
  };
  
  // Handle question submission
  const handleSubmit = useCallback(async () => {
    if (!question.trim()) return;
    
    const questionText = question;
    setCurrentQuestion(questionText);
    setHasAskedQuestion(true);
    setAnswers({ beginner: null, thinker: null, story: null, mastery: null });
    setLoadingModes({ beginner: true, thinker: true, story: true, mastery: true });
    
    setChatHistories({
      beginner: [{ role: 'user', content: questionText }],
      thinker: [{ role: 'user', content: questionText }],
      story: [{ role: 'user', content: questionText }],
      mastery: [{ role: 'user', content: questionText }],
    });
    
    const modeKeys = Object.keys(modes) as ModeKey[];
    const newAnswers: Record<ModeKey, string> = {} as Record<ModeKey, string>;
    
    await Promise.all(
      modeKeys.map(async (modeKey) => {
        try {
          const response = await AIService.getExplanation(questionText, modeKey, selectedLanguage);
          setAnswers(prev => ({ ...prev, [modeKey]: response }));
          newAnswers[modeKey] = response;
          setChatHistories(prev => ({ ...prev, [modeKey]: [...prev[modeKey], { role: 'assistant', content: response }] }));
        } catch (error) {
          const errorMsg = 'Sorry, something went wrong. Please try again.';
          setAnswers(prev => ({ ...prev, [modeKey]: errorMsg }));
          newAnswers[modeKey] = errorMsg;
        } finally {
          setLoadingModes(prev => ({ ...prev, [modeKey]: false }));
        }
      })
    );
    
    const historyItem: HistoryItem = { id: Date.now().toString(), question: questionText, answers: newAnswers, timestamp: new Date(), language: selectedLanguage };
    setHistory(prev => [historyItem, ...prev.slice(0, 49)]);
    setStats(prev => ({ ...prev, totalQuestions: prev.totalQuestions + 1, todayQuestions: prev.todayQuestions + 1 }));
    setQuestion('');
  }, [question, selectedLanguage]);
  
  const handleVoiceInput = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLanguage === 'en' ? 'en-US' : `${selectedLanguage}-IN`;
      recognition.onstart = () => { toast.info('🎤 Listening... Speak now!'); };
      recognition.onresult = (event: any) => { setQuestion(event.results[0][0].transcript); toast.success('✅ Voice input captured!'); };
      recognition.onerror = (event: any) => { toast.error(`Voice input error: ${event.error}`); };
      recognition.start();
    } else { toast.error('Voice input not supported in your browser'); }
  }, [selectedLanguage]);
  
  const handleSpeak = useCallback(async (text: string, mode: string) => {
    if (!text || text.includes('Ready to explain')) {
      toast.error('No content to speak');
      return;
    }

    if (isSpeaking && currentSpeech) {
      speechService.stop();
      setIsSpeaking(false);
      setCurrentSpeech(null);
      return;
    }
    
    try {
      const utterance = await speechService.speak(text, selectedLanguage, {
        rate: 0.9,
        pitch: 1,
        onStart: () => setIsSpeaking(true),
        onEnd: () => {
          setIsSpeaking(false);
          setCurrentSpeech(null);
        },
        onError: (error) => {
          setIsSpeaking(false);
          setCurrentSpeech(null);
          console.error('Speech error:', error);
          toast.error('Speech not available. Try a different browser.');
        },
      });
      if (utterance) {
        setCurrentSpeech(utterance);
      }
    } catch (error) {
      console.error('Speech error:', error);
      toast.error('Speech synthesis not available');
    }
  }, [isSpeaking, currentSpeech, selectedLanguage]);
  
  const handleCopy = useCallback((text: string) => { navigator.clipboard.writeText(text); toast.success('Copied to clipboard!'); }, []);
  
  const handleDownload = useCallback((text: string, mode: string, q: string) => {
    downloadPDF(text, mode as ModeKey, q || currentQuestion);
    toast.success('PDF downloaded!');
  }, [currentQuestion]);
  
  const handleShare = useCallback(async (text: string, mode: string, q: string, platform: SharePlatform = 'native') => {
    const shared = await sharePDF(text, mode as ModeKey, q || currentQuestion, platform);
    if (shared) {
      const messages: Record<SharePlatform, string> = {
        whatsapp: 'Opening WhatsApp...',
        email: 'Opening email...',
        copy: 'Copied to clipboard!',
        download: 'PDF downloaded!',
        native: 'Shared successfully!',
      };
      toast.success(messages[platform]);
    }
  }, [currentQuestion]);
  
  const handleGetOneWord = useCallback(async (mode: string) => {
    const answer = answers[mode as ModeKey];
    if (!answer) return;
    // Navigate to Ekakshar page with the current question auto-submitted
    setCurrentPage('ekakshar');
    // Store question in session to auto-submit
    sessionStorage.setItem('ekakshar-auto-question', currentQuestion);
  }, [answers, currentQuestion]);
  
  const handleChatSubmit = useCallback(async (message: string, mode: string) => {
    const modeKey = mode as ModeKey;
    if (!message.trim()) return;
    setChatHistories(prev => ({ ...prev, [modeKey]: [...prev[modeKey], { role: 'user', content: message }] }));
    setLoadingModes(prev => ({ ...prev, [modeKey]: true }));
    try {
      const response = await AIService.continueConversation([...chatHistories[modeKey], { role: 'user', content: message }], modeKey, selectedLanguage);
      setAnswers(prev => ({ ...prev, [modeKey]: response }));
      setChatHistories(prev => ({ ...prev, [modeKey]: [...prev[modeKey], { role: 'assistant', content: response }] }));
    } catch (error) { toast.error('Failed to get response'); }
    finally { setLoadingModes(prev => ({ ...prev, [modeKey]: false })); }
    setChatInputs(prev => ({ ...prev, [modeKey]: '' }));
  }, [chatHistories, selectedLanguage]);
  
  const handleChatInputChange = useCallback((mode: string, value: string) => { setChatInputs(prev => ({ ...prev, [mode as ModeKey]: value })); }, []);
  const handleLoadHistory = useCallback((item: HistoryItem) => { setAnswers(item.answers); setCurrentQuestion(item.question); setHasAskedQuestion(true); setCurrentPage('home'); toast.success('Loaded from history!'); }, []);
  const handleClearHistory = useCallback(() => { setHistory([]); localStorage.removeItem('minimind-history'); toast.success('History cleared!'); }, []);
  const handleFullscreen = useCallback((mode: string) => { setFullscreenMode(mode as ModeKey); }, []);
  const handleSignOut = async () => { await supabase.auth.signOut(); setUser(null); toast.success('Signed out!'); };

  const isAnyLoading = Object.values(loadingModes).some(l => l);

  // Mandatory sign-in gate for early access
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex items-center gap-2">
          <img src="https://i.ibb.co/fGLH5Dxs/minimind-logo.png" alt="MiniMind" className="w-10 h-10" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  // Auth page takes priority when navigating to it
  if (currentPage === 'auth') {
    return <AuthPage onBack={() => setCurrentPage('home')} onAuthSuccess={() => setCurrentPage('home')} />;
  }

  // Show early access gate only if not logged in and not navigating to auth
  if (!user && isEarlyAccess) {
    return <EarlyAccessGate onSignIn={() => setCurrentPage('auth')} />;
  }

  return (
    <div className="app-container">
      <MobileHeader onMenuClick={() => setIsMenuOpen(true)} onProfileClick={() => user ? setCurrentPage('profile') : setCurrentPage('auth')} />
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} currentPage={currentPage as NavigationId} onNavigate={setCurrentPage} theme={theme} onToggleTheme={toggleTheme} onShowGuide={() => setShowOnboarding(true)} />
      
      <main className="page-content px-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {/* Hero Empty State when no question asked */}
              {!hasAskedQuestion && !isAnyLoading && (
                <HeroEmptyState onPromptClick={(prompt) => {
                  setQuestion(prompt);
                  // Auto-submit after small delay for UX
                  setTimeout(() => {
                    setCurrentQuestion(prompt);
                    setHasAskedQuestion(true);
                    setAnswers({ beginner: null, thinker: null, story: null, mastery: null });
                    setLoadingModes({ beginner: true, thinker: true, story: true, mastery: true });
                    
                    setChatHistories({
                      beginner: [{ role: 'user', content: prompt }],
                      thinker: [{ role: 'user', content: prompt }],
                      story: [{ role: 'user', content: prompt }],
                      mastery: [{ role: 'user', content: prompt }],
                    });
                    
                    const modeKeys = Object.keys(modes) as ModeKey[];
                    const newAnswers: Record<ModeKey, string> = {} as Record<ModeKey, string>;
                    
                    Promise.all(
                      modeKeys.map(async (modeKey) => {
                        try {
                          const response = await AIService.getExplanation(prompt, modeKey, selectedLanguage);
                          setAnswers(prev => ({ ...prev, [modeKey]: response }));
                          newAnswers[modeKey] = response;
                          setChatHistories(prev => ({ ...prev, [modeKey]: [...prev[modeKey], { role: 'assistant', content: response }] }));
                        } catch (error) {
                          const errorMsg = 'Sorry, something went wrong. Please try again.';
                          setAnswers(prev => ({ ...prev, [modeKey]: errorMsg }));
                          newAnswers[modeKey] = errorMsg;
                        } finally {
                          setLoadingModes(prev => ({ ...prev, [modeKey]: false }));
                        }
                      })
                    ).then(() => {
                      const historyItem: HistoryItem = { id: Date.now().toString(), question: prompt, answers: newAnswers, timestamp: new Date(), language: selectedLanguage };
                      setHistory(prev => [historyItem, ...prev.slice(0, 49)]);
                      setStats(prev => ({ ...prev, totalQuestions: prev.totalQuestions + 1, todayQuestions: prev.todayQuestions + 1 }));
                    });
                    
                    setQuestion('');
                  }, 100);
                }} />
              )}
              
              {/* Mode Cards - shown when loading or has answers */}
              {(hasAskedQuestion || isAnyLoading) && (Object.keys(modes) as ModeKey[]).map((modeKey, index) => (
                <motion.div key={modeKey} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <ModeCard modeKey={modeKey} answer={answers[modeKey]} isLoading={loadingModes[modeKey]} onSpeak={handleSpeak} onCopy={handleCopy} onDownload={handleDownload} onShare={handleShare} onGetOneWord={handleGetOneWord} onChatSubmit={handleChatSubmit} onFullscreen={handleFullscreen} isSpeaking={isSpeaking} chatInputValue={chatInputs[modeKey]} onChatInputChange={handleChatInputChange} currentQuestion={currentQuestion} />
                </motion.div>
              ))}
            </motion.div>
          )}
          {currentPage === 'profile' && <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><ProfilePage onSignOut={handleSignOut} /></motion.div>}
          {currentPage === 'ekakshar' && <motion.div key="ekakshar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><EkaksharPage language={selectedLanguage} /></motion.div>}
          {currentPage === 'history' && <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><HistoryPage history={history} onLoadItem={handleLoadHistory} onClearHistory={handleClearHistory} /></motion.div>}
          {currentPage === 'settings' && <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><SettingsPage theme={theme} onToggleTheme={toggleTheme} selectedLanguage={selectedLanguage} onLanguageSelect={setSelectedLanguage} onClearHistory={handleClearHistory} stats={stats} /></motion.div>}
          {currentPage === 'subscription' && <motion.div key="subscription" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><SubscriptionPage /></motion.div>}
          {currentPage === 'learningpath' && <motion.div key="learningpath" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><LearningPathPage /></motion.div>}
          {currentPage === 'explainback' && <motion.div key="explainback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><ExplainBackPage /></motion.div>}
        </AnimatePresence>
      </main>
      
      <QuestionLimitBanner />
      
      {currentPage === 'home' && <BottomInputBar value={question} onChange={setQuestion} onSubmit={handleSubmit} onVoiceInput={handleVoiceInput} onRefinePrompt={handleRefinePrompt} placeholder="Ask anything... MiniMind explains it 4 ways!" isLoading={isAnyLoading} isRefining={isRefining} />}
      
      {fullscreenMode && (
        <FullscreenMode 
          isOpen={!!fullscreenMode} 
          modeKey={fullscreenMode} 
          answer={answers[fullscreenMode]} 
          chatHistory={chatHistories[fullscreenMode]}
          isLoading={loadingModes[fullscreenMode]}
          onClose={() => setFullscreenMode(null)} 
          onSpeak={handleSpeak} 
          onCopy={handleCopy} 
          onDownload={handleDownload} 
          onShare={handleShare} 
          onChatSubmit={handleChatSubmit} 
          isSpeaking={isSpeaking} 
          chatInputValue={chatInputs[fullscreenMode]} 
          onChatInputChange={handleChatInputChange} 
          currentQuestion={currentQuestion} 
        />
      )}
      
      <RefinePromptDialog isOpen={showRefineDialog} originalPrompt={originalPrompt} refinedPrompt={refinedPrompt} onAccept={handleAcceptRefinedPrompt} onReject={() => setShowRefineDialog(false)} onReRefine={handleReRefine} isRefining={isRefining} />
      
      <OnboardingGuide isOpen={showOnboarding} onClose={handleCloseOnboarding} />
    </div>
  );
};

export default Index;
