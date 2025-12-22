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

// All Indian languages (22 Scheduled Languages) + Popular International + Roman modes
export const languages = {
  // Major Indian Languages
  en: { name: 'English', flag: '🇺🇸', nativeName: 'English' },
  hi: { name: 'Hindi', flag: '🇮🇳', nativeName: 'हिंदी' },
  hinglish: { name: 'Hinglish', flag: '🇮🇳', nativeName: 'Hinglish (Hindi-English Mix)' },
  bn: { name: 'Bengali', flag: '🇮🇳', nativeName: 'বাংলা' },
  te: { name: 'Telugu', flag: '🇮🇳', nativeName: 'తెలుగు' },
  mr: { name: 'Marathi', flag: '🇮🇳', nativeName: 'मराठी' },
  ta: { name: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்' },
  gu: { name: 'Gujarati', flag: '🇮🇳', nativeName: 'ગુજરાતી' },
  kn: { name: 'Kannada', flag: '🇮🇳', nativeName: 'ಕನ್ನಡ' },
  ml: { name: 'Malayalam', flag: '🇮🇳', nativeName: 'മലയാളം' },
  or: { name: 'Odia', flag: '🇮🇳', nativeName: 'ଓଡ଼ିଆ' },
  pa: { name: 'Punjabi', flag: '🇮🇳', nativeName: 'ਪੰਜਾਬੀ' },
  as: { name: 'Assamese', flag: '🇮🇳', nativeName: 'অসমীয়া' },
  mai: { name: 'Maithili', flag: '🇮🇳', nativeName: 'मैथिली' },
  ur: { name: 'Urdu', flag: '🇮🇳', nativeName: 'اردو' },
  sa: { name: 'Sanskrit', flag: '🇮🇳', nativeName: 'संस्कृतम्' },
  ne: { name: 'Nepali', flag: '🇳🇵', nativeName: 'नेपाली' },
  sd: { name: 'Sindhi', flag: '🇮🇳', nativeName: 'سنڌي' },
  ks: { name: 'Kashmiri', flag: '🇮🇳', nativeName: 'कॉशुर' },
  kok: { name: 'Konkani', flag: '🇮🇳', nativeName: 'कोंकणी' },
  mni: { name: 'Manipuri', flag: '🇮🇳', nativeName: 'মৈতৈলোন্' },
  doi: { name: 'Dogri', flag: '🇮🇳', nativeName: 'डोगरी' },
  sat: { name: 'Santali', flag: '🇮🇳', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  bho: { name: 'Bhojpuri', flag: '🇮🇳', nativeName: 'भोजपुरी' },
  raj: { name: 'Rajasthani', flag: '🇮🇳', nativeName: 'राजस्थानी' },
  // International Languages
  es: { name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  fr: { name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  // Roman script modes (transliteration)
  'hi-roman': { name: 'Hindi (Roman)', flag: '🔤', nativeName: 'Hindi in English' },
  'ta-roman': { name: 'Tamil (Roman)', flag: '🔤', nativeName: 'Tamil in English' },
  'te-roman': { name: 'Telugu (Roman)', flag: '🔤', nativeName: 'Telugu in English' },
  'bn-roman': { name: 'Bengali (Roman)', flag: '🔤', nativeName: 'Bengali in English' },
  'gu-roman': { name: 'Gujarati (Roman)', flag: '🔤', nativeName: 'Gujarati in English' },
  'kn-roman': { name: 'Kannada (Roman)', flag: '🔤', nativeName: 'Kannada in English' },
  'ml-roman': { name: 'Malayalam (Roman)', flag: '🔤', nativeName: 'Malayalam in English' },
  'mr-roman': { name: 'Marathi (Roman)', flag: '🔤', nativeName: 'Marathi in English' },
  'pa-roman': { name: 'Punjabi (Roman)', flag: '🔤', nativeName: 'Punjabi in English' },
  'ur-roman': { name: 'Urdu (Roman)', flag: '🔤', nativeName: 'Urdu in English' },
  'sa-roman': { name: 'Sanskrit (Roman)', flag: '🔤', nativeName: 'Sanskrit in English' },
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
  { id: 'profile', label: 'Profile', icon: 'User' },
  { id: 'subscription', label: 'Subscription', icon: 'CreditCard' },
  { id: 'progress', label: 'Progress', icon: 'BarChart3' },
  { id: 'oneword', label: 'Ekakshar', icon: 'Zap' },
  { id: 'history', label: 'History', icon: 'History' },
  { id: 'settings', label: 'Settings', icon: 'Cog' },
] as const;

export type NavigationId = typeof navigationItems[number]['id'];
