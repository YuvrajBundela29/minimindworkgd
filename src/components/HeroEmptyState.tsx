import React, { useState } from 'react';
import { ChevronDown, EyeOff, Eye } from 'lucide-react';
import logo from '@/assets/minimind-logo.png';

interface HeroEmptyStateProps {
  onPromptClick: (prompt: string) => void;
  /** Composer rendered under the suggestion grid, ChatGPT-style */
  composer?: React.ReactNode;
}

const SUGGESTED_PROMPTS = [
  'What if we discovered a new color humans can see?',
  'How would civilization change if we lived 500 years instead of 80?',
  'What would happen if we could control the weather?',
  'What if humans could photosynthesize like plants?',
  'Can AI truly understand emotions or just simulate them?',
  'What if Earth had two moons instead of one?',
];

const MODE_CHIPS = [
  { icon: '🌱', label: 'Beginner' },
  { icon: '🧠', label: 'Thinker' },
  { icon: '📖', label: 'Story' },
  { icon: '🎓', label: 'Mastery' },
];

const HeroEmptyState: React.FC<HeroEmptyStateProps> = ({ onPromptClick, composer }) => {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showModes, setShowModes] = useState(false);

  return (
    <div className="hero-centered flex flex-col items-center justify-center animate-in fade-in duration-300 max-w-3xl mx-auto w-full">
      {/* Brand */}
      <div className="flex items-center justify-center gap-3 mb-3 animate-in slide-in-from-bottom-4 duration-500">
        <img src={logo} alt="MiniMind logo" className="w-11 h-11 rounded-xl" loading="eager" />
        <h1 className="text-3xl sm:text-4xl font-heading font-bold gradient-text tracking-tight">
          MiniMind
        </h1>
      </div>
      <p className="text-muted-foreground font-semibold text-sm sm:text-base mb-7 text-center">
        AI-Powered Learning Revolution
      </p>

      {/* Suggestion pill grid */}
      {showSuggestions && (
        <div className="w-full flex flex-col items-center gap-2.5 mb-4 animate-in slide-in-from-bottom-4 duration-500">
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={prompt}
              onClick={() => onPromptClick(prompt)}
              style={{ marginLeft: `${(i % 3 - 1) * 6}%` }}
              className="max-w-full px-5 py-3 rounded-full bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 active:scale-[0.98] text-sm font-semibold text-foreground/90 text-center min-h-[44px]"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Controls row */}
      <div className="w-full flex items-center justify-between gap-2 mb-3">
        <button
          onClick={() => setShowSuggestions((v) => !v)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border/60 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[40px]"
        >
          {showSuggestions ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showSuggestions ? 'Hide Suggestions' : 'Show Suggestions'}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowModes((v) => !v)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-card border border-border/60 text-xs font-medium text-foreground hover:border-primary/40 transition-colors min-h-[40px]"
          >
            Modes
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showModes ? 'rotate-180' : ''}`} />
          </button>
          {showModes && (
            <div className="absolute right-0 bottom-full mb-2 w-48 p-2 rounded-2xl bg-card border border-border shadow-lg z-40 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {MODE_CHIPS.map((m) => (
                <div key={m.label} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-foreground">
                  <span aria-hidden="true">{m.icon}</span>
                  {m.label}
                </div>
              ))}
              <p className="px-3 pt-1 pb-1 text-[10px] text-muted-foreground">
                Every question is answered in all 4 modes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      {composer && (
        <div className="w-full animate-in slide-in-from-bottom-4 duration-500 delay-75">
          {composer}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/50 mt-5 text-center tracking-wide">
        Trusted by 10,000+ students • Beginner → Thinker → Story → Mastery
      </p>
    </div>
  );
};

export default HeroEmptyState;
