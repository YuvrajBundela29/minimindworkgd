import { useState, useCallback, useEffect } from 'react';

export interface CoachMarkState {
  hasSeenQuickRecall: boolean;
  hasSeenDownload: boolean;
  hasSeenLanguage: boolean;
  hasSeenChatContinue: boolean;
  hasSeenStudyPlans: boolean;
  questionCount: number;
}

const STORAGE_KEY = 'minimind-coach-marks';

const defaultState: CoachMarkState = {
  hasSeenQuickRecall: false,
  hasSeenDownload: false,
  hasSeenLanguage: false,
  hasSeenChatContinue: false,
  hasSeenStudyPlans: false,
  questionCount: 0,
};

export const useCoachMarks = () => {
  const [state, setState] = useState<CoachMarkState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch {
      return defaultState;
    }
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Dismiss a specific coach mark
  const dismissCoachMark = useCallback((markId: keyof CoachMarkState) => {
    setState(prev => ({ ...prev, [markId]: true }));
  }, []);

  // Increment question count
  const incrementQuestionCount = useCallback(() => {
    setState(prev => ({ ...prev, questionCount: prev.questionCount + 1 }));
  }, []);

  // Reset all coach marks (for testing)
  const resetCoachMarks = useCallback(() => {
    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Computed: Should show Quick Recall tip?
  const shouldShowQuickRecall = !state.hasSeenQuickRecall && state.questionCount >= 2;

  // Computed: Should show Download tip? (after first answer viewed)
  const shouldShowDownload = !state.hasSeenDownload && state.questionCount >= 1;

  // Computed: Should show Language tip? (after 5 questions in English)
  const shouldShowLanguage = !state.hasSeenLanguage && state.questionCount >= 5;

  // Computed: Should show Study Plans tip?
  const shouldShowStudyPlans = !state.hasSeenStudyPlans && state.questionCount >= 3;

  return {
    state,
    dismissCoachMark,
    incrementQuestionCount,
    resetCoachMarks,
    shouldShowQuickRecall,
    shouldShowDownload,
    shouldShowLanguage,
    shouldShowStudyPlans,
  };
};

export default useCoachMarks;
