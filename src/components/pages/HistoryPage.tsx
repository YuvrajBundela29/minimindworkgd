import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Trash2, Clock, ArrowRight, BookOpen, Zap, Brain } from 'lucide-react';
import { modes, ModeKey, languages, LanguageKey } from '@/config/minimind';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import type { HistoryItem } from '@/pages/Index';

interface LearningPathHistory {
  id: string;
  subject: string;
  level: string;
  icon?: string;
  topicsCount: number;
  completedCount: number;
  createdAt: Date;
}

interface EkaksharHistory {
  id: string;
  topic: string;
  oneWord?: string;
  timestamp: Date;
}

interface ExplainBackHistory {
  id: string;
  topic: string;
  score: number;
  timestamp: Date;
}

interface HistoryPageProps {
  history: HistoryItem[];
  onLoadItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ history, onLoadItem, onClearHistory }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [learningPaths, setLearningPaths] = useState<LearningPathHistory[]>([]);
  const [ekaksharHistory, setEkaksharHistory] = useState<EkaksharHistory[]>([]);
  const [explainBackHistory, setExplainBackHistory] = useState<ExplainBackHistory[]>([]);

  useEffect(() => {
    // Load learning paths from localStorage
    const savedPaths = localStorage.getItem('minimind-learning-paths');
    if (savedPaths) {
      try {
        const paths = JSON.parse(savedPaths);
        setLearningPaths(paths.map((p: any) => ({
          id: p.id,
          subject: p.subject,
          level: p.level,
          icon: p.icon,
          topicsCount: p.topics?.length || 0,
          completedCount: p.topics?.filter((t: any) => t.completed).length || 0,
          createdAt: new Date(p.createdAt),
        })));
      } catch (e) {
        console.error('Error parsing learning paths:', e);
      }
    }

    // Load ekakshar history
    const savedEkakshar = localStorage.getItem('minimind-ekakshar-history');
    if (savedEkakshar) {
      try {
        const items = JSON.parse(savedEkakshar);
        setEkaksharHistory(items.map((i: any) => ({
          ...i,
          timestamp: new Date(i.timestamp),
        })));
      } catch (e) {
        console.error('Error parsing ekakshar history:', e);
      }
    }

    // Load explain back history
    const savedExplainBack = localStorage.getItem('minimind-explainback-history');
    if (savedExplainBack) {
      try {
        const items = JSON.parse(savedExplainBack);
        setExplainBackHistory(items.map((i: any) => ({
          ...i,
          timestamp: new Date(i.timestamp),
        })));
      } catch (e) {
        console.error('Error parsing explain back history:', e);
      }
    }
  }, []);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const clearAllHistory = () => {
    onClearHistory();
    localStorage.removeItem('minimind-learning-paths');
    localStorage.removeItem('minimind-ekakshar-history');
    localStorage.removeItem('minimind-explainback-history');
    setLearningPaths([]);
    setEkaksharHistory([]);
    setExplainBackHistory([]);
  };

  const totalItems = history.length + learningPaths.length + ekaksharHistory.length + explainBackHistory.length;

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">📜</div>
        <h1 className="text-2xl font-heading font-bold text-foreground">History</h1>
        <p className="text-muted-foreground text-sm mt-1">Your learning journey across all features</p>
      </div>

      {/* Clear Button */}
      {totalItems > 0 && (
        <motion.button
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          onClick={clearAllHistory}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Trash2 className="w-4 h-4" />
          Clear All History
        </motion.button>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="home" className="rounded-lg text-xs">
            <span className="hidden sm:inline">Home</span>
            <span className="sm:hidden">🏠</span>
          </TabsTrigger>
          <TabsTrigger value="learning" className="rounded-lg text-xs">
            <span className="hidden sm:inline">Learning</span>
            <span className="sm:hidden">📚</span>
          </TabsTrigger>
          <TabsTrigger value="ekakshar" className="rounded-lg text-xs">
            <span className="hidden sm:inline">Ekakshar</span>
            <span className="sm:hidden">⚡</span>
          </TabsTrigger>
          <TabsTrigger value="explain" className="rounded-lg text-xs">
            <span className="hidden sm:inline">Explain</span>
            <span className="sm:hidden">🧠</span>
          </TabsTrigger>
        </TabsList>

        {/* Home History */}
        <TabsContent value="home" className="mt-4">
          {history.length === 0 ? (
            <EmptyState 
              icon={<History className="w-12 h-12" />} 
              title="No Home Questions Yet" 
              description="Questions you ask on the home page will appear here"
            />
          ) : (
            <div className="space-y-3">
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="mode-card cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onLoadItem(item)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-medium text-foreground line-clamp-2 flex-1">
                      {item.question}
                    </h3>
                    <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {(Object.keys(modes) as ModeKey[]).map((modeKey) => (
                      <span key={modeKey} className="text-lg" title={modes[modeKey].name}>
                        {modes[modeKey].icon}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(item.timestamp)} at {formatTime(item.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{languages[item.language]?.flag}</span>
                      <span>{languages[item.language]?.name}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Learning Paths History */}
        <TabsContent value="learning" className="mt-4">
          {learningPaths.length === 0 ? (
            <EmptyState 
              icon={<BookOpen className="w-12 h-12" />} 
              title="No Learning Paths Yet" 
              description="Learning paths you create will appear here"
            />
          ) : (
            <div className="space-y-3">
              {learningPaths.map((path, index) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 bg-card border-border hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{path.icon || '📚'}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{path.subject}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{path.level} Level</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{path.completedCount}/{path.topicsCount} topics completed</span>
                      <span>{formatDate(path.createdAt)}</span>
                    </div>

                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                        style={{ width: `${(path.completedCount / path.topicsCount) * 100}%` }}
                      />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Ekakshar History */}
        <TabsContent value="ekakshar" className="mt-4">
          {ekaksharHistory.length === 0 ? (
            <EmptyState 
              icon={<Zap className="w-12 h-12" />} 
              title="No Ekakshar Sessions Yet" 
              description="Topics you compress will appear here"
            />
          ) : (
            <div className="space-y-3">
              {ekaksharHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 bg-card border-amber-500/20 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-foreground">{item.topic}</h3>
                      <Zap className="w-4 h-4 text-amber-500" />
                    </div>
                    {item.oneWord && (
                      <p className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">
                        {item.oneWord}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{formatDate(item.timestamp)}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Explain Back History */}
        <TabsContent value="explain" className="mt-4">
          {explainBackHistory.length === 0 ? (
            <EmptyState 
              icon={<Brain className="w-12 h-12" />} 
              title="No Explain-Back Sessions Yet" 
              description="Your learning assessments will appear here"
            />
          ) : (
            <div className="space-y-3">
              {explainBackHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 bg-card border-emerald-500/20 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-foreground">{item.topic}</h3>
                      <span className={`text-lg font-bold ${
                        item.score >= 80 ? 'text-emerald-500' : 
                        item.score >= 60 ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {item.score}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(item.timestamp)}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Info */}
      {totalItems > 0 && (
        <div className="text-center text-xs text-muted-foreground">
          <p>Tap any session to view details • Maximum 50 items per category</p>
        </div>
      )}
    </div>
  );
};

// Empty state component
const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ 
  icon, title, description 
}) => (
  <motion.div
    className="mode-card text-center py-12"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="text-muted-foreground/30 mb-4 flex justify-center">
      {icon}
    </div>
    <h3 className="font-heading font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </motion.div>
);

export default HistoryPage;
