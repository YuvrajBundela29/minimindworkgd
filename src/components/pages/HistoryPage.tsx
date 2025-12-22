import React from 'react';
import { motion } from 'framer-motion';
import { History, Trash2, Clock, ArrowRight } from 'lucide-react';
import { modes, ModeKey, languages, LanguageKey } from '@/config/minimind';
import type { HistoryItem } from '@/pages/Index';

interface HistoryPageProps {
  history: HistoryItem[];
  onLoadItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ history, onLoadItem, onClearHistory }) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">📜</div>
        <h1 className="text-2xl font-heading font-bold text-foreground">History</h1>
        <p className="text-muted-foreground text-sm mt-1">Your past learning sessions</p>
      </div>

      {/* Clear Button */}
      {history.length > 0 && (
        <motion.button
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          onClick={onClearHistory}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Trash2 className="w-4 h-4" />
          Clear All History
        </motion.button>
      )}

      {/* History List */}
      {history.length === 0 ? (
        <motion.div
          className="mode-card text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <History className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-heading font-semibold text-foreground mb-2">No History Yet</h3>
          <p className="text-sm text-muted-foreground">
            Your past questions will appear here
          </p>
        </motion.div>
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
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Question */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-medium text-foreground line-clamp-2 flex-1">
                  {item.question}
                </h3>
                <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              </div>

              {/* Mode Icons */}
              <div className="flex items-center gap-2 mb-3">
                {(Object.keys(modes) as ModeKey[]).map((modeKey) => (
                  <span
                    key={modeKey}
                    className="text-lg"
                    title={modes[modeKey].name}
                  >
                    {modes[modeKey].icon}
                  </span>
                ))}
              </div>

              {/* Meta */}
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

      {/* Info */}
      {history.length > 0 && (
        <div className="text-center text-xs text-muted-foreground">
          <p>Tap any session to reload it • Maximum 50 sessions stored</p>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
