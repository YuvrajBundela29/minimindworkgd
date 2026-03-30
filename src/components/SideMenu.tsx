import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SquarePen, Sun, Moon, HelpCircle, MessageSquareHeart, Zap, Clock, User, Settings, BookOpen, Crown, FileText, Compass } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface HistoryEntry {
  id: string;
  question: string;
  timestamp: Date;
}

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onShowGuide?: () => void;
  onNewChat?: () => void;
  history?: HistoryEntry[];
  onLoadHistoryItem?: (item: HistoryEntry) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
  theme,
  onToggleTheme,
  onShowGuide,
  onNewChat,
  history = [],
  onLoadHistoryItem,
}) => {
  const { tier, getCredits } = useSubscription();
  const credits = getCredits();

  // Group history by date
  const today = new Date();
  const todayStr = today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const grouped: { label: string; items: HistoryEntry[] }[] = [];
  const todayItems: HistoryEntry[] = [];
  const yesterdayItems: HistoryEntry[] = [];
  const olderItems: HistoryEntry[] = [];

  history.forEach(h => {
    const d = new Date(h.timestamp).toDateString();
    if (d === todayStr) todayItems.push(h);
    else if (d === yesterdayStr) yesterdayItems.push(h);
    else olderItems.push(h);
  });

  if (todayItems.length > 0) grouped.push({ label: 'Today', items: todayItems });
  if (yesterdayItems.length > 0) grouped.push({ label: 'Yesterday', items: yesterdayItems });
  if (olderItems.length > 0) grouped.push({ label: 'Previous', items: olderItems.slice(0, 20) });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-card flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Top: New Chat + Close */}
            <div className="p-3 border-b border-border flex items-center gap-2">
              {onNewChat && (
                <motion.button
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors"
                  onClick={() => { onNewChat(); onClose(); }}
                  whileTap={{ scale: 0.98 }}
                >
                  <SquarePen className="w-4 h-4" />
                  <span>New Chat</span>
                </motion.button>
              )}
              <motion.button
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={onClose}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Explore button */}
            <div className="px-3 pt-3 pb-1">
              <motion.button
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  currentPage === 'explore' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted text-foreground'
                }`}
                onClick={() => { onNavigate('explore'); onClose(); }}
                whileTap={{ scale: 0.98 }}
              >
                <Compass className="w-4 h-4" />
                <span>Explore</span>
              </motion.button>
            </div>

            {/* Chat History - scrollable middle */}
            <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
              {grouped.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Your chat history will appear here</p>
                </div>
              ) : (
                grouped.map(group => (
                  <div key={group.label} className="mb-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                      {group.label}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map(item => (
                        <motion.button
                          key={item.id}
                          className="w-full text-left px-2.5 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors truncate"
                          onClick={() => {
                            onLoadHistoryItem?.(item);
                            onClose();
                          }}
                          whileTap={{ scale: 0.98 }}
                          title={item.question}
                        >
                          {item.question.length > 40 ? item.question.slice(0, 40) + '…' : item.question}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom: Account section */}
            <div className="border-t border-border p-2 space-y-0.5">
              {/* Credits */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 mb-1">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    {tier === 'free' ? 'Free' : tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{credits.total} credits</span>
              </div>

              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'history', label: 'History', icon: Clock },
                { id: 'notes', label: 'Saved Notes', icon: FileText },
                { id: 'subscription', label: 'Subscription', icon: Crown },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map(item => (
                <motion.button
                  key={item.id}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentPage === item.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted text-foreground'
                  }`}
                  onClick={() => { onNavigate(item.id); onClose(); }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </motion.button>
              ))}

              {/* Theme + Guide */}
              <div className="flex gap-1 pt-1">
                <motion.button
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg hover:bg-muted text-muted-foreground text-xs transition-colors"
                  onClick={onToggleTheme}
                  whileTap={{ scale: 0.98 }}
                >
                  {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
                </motion.button>
                {onShowGuide && (
                  <motion.button
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg hover:bg-muted text-muted-foreground text-xs transition-colors"
                    onClick={() => { onShowGuide(); onClose(); }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Guide</span>
                  </motion.button>
                )}
                <motion.a
                  href="mailto:feedback@minimind.app?subject=MiniMind Feedback"
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg hover:bg-muted text-muted-foreground text-xs transition-colors"
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageSquareHeart className="w-3.5 h-3.5" />
                  <span>Feedback</span>
                </motion.a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideMenu;
