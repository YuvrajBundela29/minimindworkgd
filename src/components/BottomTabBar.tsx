import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Home, GraduationCap, Zap, BarChart3, User } from 'lucide-react';
import { NavigationId } from '@/config/minimind';

type TabId = 'home' | 'learningpath' | 'ekakshar' | 'profile' | 'account';

interface Tab {
  id: TabId;
  label: string;
  navId: NavigationId | 'settings';
  icon: React.FC<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'home', label: 'Home', navId: 'home', icon: Home },
  { id: 'learningpath', label: 'Learn', navId: 'learningpath', icon: GraduationCap },
  { id: 'ekakshar', label: 'Practice', navId: 'ekakshar', icon: Zap },
  { id: 'profile', label: 'Progress', navId: 'profile', icon: BarChart3 },
  { id: 'account', label: 'Account', navId: 'settings', icon: User },
];

interface BottomTabBarProps {
  currentPage: string;
  onNavigate: (page: NavigationId | 'settings') => void;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({ currentPage, onNavigate }) => {
  const rippleRef = useRef<HTMLDivElement>(null);

  const getActiveTab = (): TabId => {
    if (currentPage === 'home') return 'home';
    if (currentPage === 'learningpath') return 'learningpath';
    if (currentPage === 'ekakshar' || currentPage === 'explainback') return 'ekakshar';
    if (currentPage === 'profile' || currentPage === 'history' || currentPage === 'notes') return 'profile';
    if (currentPage === 'settings' || currentPage === 'subscription' || currentPage === 'purposelens') return 'account';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleTabClick = useCallback((tab: Tab, e: React.MouseEvent<HTMLButtonElement>) => {
    // Ripple effect
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement('span');
    ripple.className = 'tab-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 400);

    onNavigate(tab.navId as NavigationId);
  }, [onNavigate]);

  return (
    <nav className="bottom-tab-bar" role="tablist" aria-label="Main navigation">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
            className={`tab-item ${isActive ? 'tab-item-active' : 'tab-item-inactive'}`}
            onClick={(e) => handleTabClick(tab, e)}
          >
            {isActive && (
              <motion.div
                className="tab-indicator"
                layoutId="tab-indicator"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <motion.div
              animate={{ scale: isActive ? 1.1 : 1 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomTabBar;
