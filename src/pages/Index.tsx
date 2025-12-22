import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import MobileHeader from '@/components/MobileHeader';
import BottomInputBar from '@/components/BottomInputBar';
import ModeCard from '@/components/ModeCard';
import SideMenu from '@/components/SideMenu';
import { modes, ModeKey, languages, LanguageKey, suggestedPrompts, NavigationId } from '@/config/minimind';
import AIService from '@/services/aiService';

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
  
  // Question & Answers - Start with default answers
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState<Record<ModeKey, string | null>>(defaultAnswers);
  const [loadingModes, setLoadingModes] = useState<Record<ModeKey, boolean>>({
    beginner: false,
    thinker: false,
    story: false,
    mastery: false,
  });
  
  // Chat inputs per mode
  const [chatInputs, setChatInputs] = useState<Record<ModeKey, string>>({
    beginner: '',
    thinker: '',
    story: '',
    mastery: '',
  });
  
  // Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState<SpeechSynthesisUtterance | null>(null);
  
  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('minimind-theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);
  
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('minimind-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, [theme]);
  
  // Handle question submission
  const handleSubmit = useCallback(async () => {
    if (!question.trim()) return;
    
    setHasAskedQuestion(true);
    
    // Reset answers and set loading for all modes
    setAnswers({ beginner: null, thinker: null, story: null, mastery: null });
    setLoadingModes({ beginner: true, thinker: true, story: true, mastery: true });
    
    // Fetch answers for all modes in parallel
    const modeKeys = Object.keys(modes) as ModeKey[];
    
    await Promise.all(
      modeKeys.map(async (modeKey) => {
        try {
          const response = await AIService.getExplanation(question, modeKey, selectedLanguage);
          setAnswers(prev => ({ ...prev, [modeKey]: response }));
        } catch (error) {
          console.error(`Error for ${modeKey}:`, error);
          setAnswers(prev => ({ ...prev, [modeKey]: 'Sorry, something went wrong. Please try again.' }));
        } finally {
          setLoadingModes(prev => ({ ...prev, [modeKey]: false }));
        }
      })
    );
    
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
    toast.promise(
      AIService.getOneWordAnswer(question || 'general topic', selectedLanguage),
      {
        loading: 'Getting summary...',
        success: (data) => `One-word summary: ${data}`,
        error: 'Failed to get summary',
      }
    );
  }, [question, selectedLanguage]);
  
  // Chat submit handler
  const handleChatSubmit = useCallback((message: string, mode: string) => {
    toast.info(`Continuing chat in ${mode} mode...`);
    setChatInputs(prev => ({ ...prev, [mode as ModeKey]: '' }));
  }, []);
  
  // Update chat input
  const handleChatInputChange = useCallback((mode: string, value: string) => {
    setChatInputs(prev => ({ ...prev, [mode as ModeKey]: value }));
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
        {currentPage === 'home' && (
          <div className="space-y-4">
            {/* Mode Cards - Always visible with default or actual answers */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
          </div>
        )}
        
        {/* Other Pages */}
        {currentPage === 'progress' && (
          <div className="py-8 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-xl font-heading font-semibold mb-2">Progress</h2>
            <p className="text-muted-foreground text-sm">Track your learning journey</p>
          </div>
        )}
        
        {currentPage === 'oneword' && (
          <div className="py-8 text-center">
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="text-xl font-heading font-semibold mb-2">Ekakshar</h2>
            <p className="text-muted-foreground text-sm">Quick one-word answers</p>
          </div>
        )}
        
        {currentPage === 'history' && (
          <div className="py-8 text-center">
            <div className="text-5xl mb-4">📜</div>
            <h2 className="text-xl font-heading font-semibold mb-2">History</h2>
            <p className="text-muted-foreground text-sm">Your past questions</p>
          </div>
        )}
        
        {currentPage === 'settings' && (
          <div className="py-8 text-center">
            <div className="text-5xl mb-4">⚙️</div>
            <h2 className="text-xl font-heading font-semibold mb-2">Settings</h2>
            <p className="text-muted-foreground text-sm">Customize your experience</p>
          </div>
        )}
      </main>
      
      {/* Bottom Input Bar - only on home */}
      {currentPage === 'home' && (
        <BottomInputBar
          value={question}
          onChange={setQuestion}
          onSubmit={handleSubmit}
          onVoiceInput={handleVoiceInput}
          placeholder="Ask anything... MiniMind explains it 4 ways!"
          isLoading={isAnyLoading}
        />
      )}
    </div>
  );
};

export default Index;
