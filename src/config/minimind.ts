// MiniMind Configuration
export const modes = {
  beginner: {
    name: 'Beginner',
    icon: '🌱',
    color: 'emerald',
    badge: 'ACTIVE',
    badgeClass: 'mode-badge-active',
    tagline: 'Simple explanations with fun examples',
  },
  thinker: {
    name: 'Thinker',
    icon: '🧠',
    color: 'purple',
    badge: 'LOGIC',
    badgeClass: 'mode-badge-logic',
    tagline: 'Logical step-by-step reasoning',
  },
  story: {
    name: 'Story',
    icon: '📖',
    color: 'amber',
    badge: 'NARRATIVE',
    badgeClass: 'mode-badge-narrative',
    tagline: 'Learn through engaging stories',
  },
  mastery: {
    name: 'Mastery',
    icon: '🎓',
    color: 'blue',
    badge: 'ACADEMIC',
    badgeClass: 'mode-badge-academic',
    tagline: 'Deep dive with exam-ready insights',
  },
} as const;

export type ModeKey = keyof typeof modes;

// All Indian languages (22 Scheduled Languages) + Popular International + Roman modes
export const languages = {
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
  es: { name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  fr: { name: 'French', flag: '🇫🇷', nativeName: 'Français' },
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

// Purpose Lens configuration - adapts all 4 modes to user's learning context
export const purposeLenses = {
  general: {
    id: 'general',
    name: 'General',
    icon: '🌐',
    description: 'Exploratory, curiosity-led learning',
    promptAdapter: {
      context: 'General knowledge exploration',
      examples: 'Real-world examples from various domains',
      tone: 'Exploratory, curious, engaging',
      relevance: 'Focus on understanding and curiosity'
    }
  },
  jee: {
    id: 'jee',
    name: 'JEE Prep',
    icon: '🎯',
    description: 'JEE Main/Advanced focused',
    promptAdapter: {
      context: 'JEE Main/Advanced competitive exam preparation',
      examples: 'IIT-level physics, chemistry, maths problems with JEE patterns',
      tone: 'Precise, exam-oriented, no fluff, focus on problem-solving',
      relevance: 'Connect to JEE syllabus, question patterns, and scoring strategies'
    }
  },
  neet: {
    id: 'neet',
    name: 'NEET Prep',
    icon: '🩺',
    description: 'NEET medical entrance focused',
    promptAdapter: {
      context: 'NEET medical entrance exam preparation',
      examples: 'NCERT Biology, Physics, Chemistry concepts with medical applications',
      tone: 'Clinical precision, NCERT-aligned, systematic',
      relevance: 'Focus on NEET-specific topics, weightage, and common questions'
    }
  },
  student: {
    id: 'student',
    name: 'School Student',
    icon: '📚',
    description: 'Generic school curriculum',
    promptAdapter: {
      context: 'School education and curriculum learning',
      examples: 'Textbook concepts, classroom examples, age-appropriate scenarios',
      tone: 'Educational, supportive, building foundations',
      relevance: 'Connect to school syllabus and exam preparation'
    }
  },
  parent: {
    id: 'parent',
    name: 'Parent',
    icon: '👨‍👩‍👧',
    description: 'Helping your child learn',
    promptAdapter: {
      context: 'Parent helping their child understand concepts',
      examples: 'Household activities, family situations, everyday scenarios',
      tone: 'Calm, reassuring, patience-focused, no jargon',
      relevance: 'How to explain this to a child at home simply'
    }
  },
  teacher: {
    id: 'teacher',
    name: 'Teacher',
    icon: '👩‍🏫',
    description: 'Teaching methodology focused',
    promptAdapter: {
      context: 'Educator preparing lessons and teaching',
      examples: 'Classroom activities, teaching demonstrations, student engagement',
      tone: 'Structured, pedagogical, question-driven',
      relevance: 'How to teach this concept effectively to students'
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    icon: '💼',
    description: 'Workplace/career context',
    promptAdapter: {
      context: 'Professional development and workplace application',
      examples: 'Business scenarios, industry applications, career relevance',
      tone: 'Professional, practical, results-oriented',
      relevance: 'How this applies in professional settings'
    }
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    icon: '✨',
    description: 'Your own learning purpose',
    promptAdapter: {
      context: '', // Will use custom_lens_prompt
      examples: '',
      tone: 'Adapt naturally to the user\'s stated purpose',
      relevance: ''
    }
  }
} as const;

export type PurposeLensKey = keyof typeof purposeLenses;

// Navigation with clearer labels for Indian students
export const navigationItems = [
  { id: 'home', label: 'Ask AI 🎓', icon: 'Home', description: 'Get explanations in 4 styles' },
  { id: 'learningpath', label: 'Study Plans 📚', icon: 'BookOpen', description: 'Structured learning paths' },
  { id: 'ekakshar', label: 'Quick Recall ⚡', icon: 'Zap', description: 'Flashcard-style summaries' },
  { id: 'explainback', label: 'Test Yourself 🧠', icon: 'MessageCircle', description: 'Explain concepts to check understanding' },
  { id: 'purposelens', label: 'Learning Purpose 🎯', icon: 'Target', description: 'Set your learning context' },
  { id: 'profile', label: 'Profile', icon: 'User', description: 'Your account & stats' },
  { id: 'history', label: 'History', icon: 'History', description: 'Past questions & answers' },
  { id: 'subscription', label: 'Subscription', icon: 'Crown', description: 'Manage your plan' },
  { id: 'settings', label: 'Settings', icon: 'Cog', description: 'Language & preferences' },
] as const;

export type NavigationId = typeof navigationItems[number]['id'];
