// MiniMind AI Service - Connects to Lovable AI via Edge Function
import { supabase } from "@/integrations/supabase/client";

export class AIService {
  static async getExplanation(prompt: string, mode: string, language: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { prompt, mode, language, type: 'explain' }
      });

      if (error) {
        console.error('AI Service error:', error);
        throw new Error(error.message || 'Failed to get explanation');
      }

      return data?.response || 'Unable to generate response. Please try again.';
    } catch (error) {
      console.error('Error in getExplanation:', error);
      throw error;
    }
  }

  static async getOneWordAnswer(prompt: string, language: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { prompt, language, type: 'oneword' }
      });

      if (error) {
        console.error('AI Service error:', error);
        throw new Error(error.message || 'Failed to get one-word answer');
      }

      return data?.response || 'Unknown';
    } catch (error) {
      console.error('Error in getOneWordAnswer:', error);
      throw error;
    }
  }

  static async refinePrompt(prompt: string, language: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { prompt, language, type: 'refine' }
      });

      if (error) {
        console.error('AI Service error:', error);
        throw new Error(error.message || 'Failed to refine prompt');
      }

      return data?.response || prompt;
    } catch (error) {
      console.error('Error in refinePrompt:', error);
      throw error;
    }
  }

  static async continueConversation(
    messages: Array<{ role: string; content: string }>,
    mode: string,
    language: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages, mode, language, type: 'continue' }
      });

      if (error) {
        console.error('AI Service error:', error);
        throw new Error(error.message || 'Failed to continue conversation');
      }

      return data?.response || 'Unable to continue conversation. Please try again.';
    } catch (error) {
      console.error('Error in continueConversation:', error);
      throw error;
    }
  }
}

export default AIService;
