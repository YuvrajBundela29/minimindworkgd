// MiniMind Configuration
export const modes = {
  beginner: {
    name: 'Beginner',
    icon: '🌱',
    color: 'emerald',
    badge: 'ACTIVE',
    badgeClass: 'mode-badge-active',
  },
  thinker: {
    name: 'Thinker',
    icon: '🧠',
    color: 'purple',
    badge: 'LOGIC',
    badgeClass: 'mode-badge-logic',
  },
  story: {
    name: 'Story',
    icon: '📖',
    color: 'amber',
    badge: 'NARRATIVE',
    badgeClass: 'mode-badge-narrative',
  },
  mastery: {
    name: 'Mastery',
    icon: '🎓',
    color: 'blue',
    badge: 'ACADEMIC',
    badgeClass: 'mode-badge-academic',
  },
} as const;

export type ModeKey = keyof typeof modes;

export const languages = {
  en: { name: 'English', flag: '🇺🇸', nativeName: 'English' },
  hi: { name: 'Hindi', flag: '🇮🇳', nativeName: 'हिंदी' },
  ta: { name: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்' },
  te: { name: 'Telugu', flag: '🇮🇳', nativeName: 'తెలుగు' },
  bn: { name: 'Bengali', flag: '🇧🇩', nativeName: 'বাংলা' },
  es: { name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  fr: { name: 'French', flag: '🇫🇷', nativeName: 'Français' },
} as const;

export type LanguageKey = keyof typeof languages;

export const suggestedPrompts = [
  "What would happen if humans could photosynthesize like plants?",
  "Can AI truly understand human emotions or just simulate them?",
  "What if Earth had two moons instead of one?",
  "How would society change if we didn't need to sleep?",
  "Why do we have different personalities and what shapes them?",
  "What would the world be like if the Internet was never invented?",
];

export const navigationItems = [
  { id: 'home', label: 'Learn', icon: 'Home' },
  { id: 'progress', label: 'Progress', icon: 'BarChart3' },
  { id: 'oneword', label: 'Ekakshar', icon: 'Brain' },
  { id: 'history', label: 'History', icon: 'History' },
  { id: 'settings', label: 'Settings', icon: 'Cog' },
] as const;

export type NavigationId = typeof navigationItems[number]['id'];
