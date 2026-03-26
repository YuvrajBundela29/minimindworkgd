import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SaveNoteButtonProps {
  queryText: string;
  responseText: string;
  mode: string;
  language: string;
}

const SaveNoteButton: React.FC<SaveNoteButtonProps> = ({
  queryText,
  responseText,
  mode,
  language,
}) => {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Check if already saved on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data } = await supabase
        .from('saved_notes')
        .select('id')
        .eq('user_id', user.id)
        .eq('query_text', queryText)
        .eq('mode', mode)
        .limit(1);
      if (!cancelled && data && data.length > 0) setSaved(true);
    })();
    return () => { cancelled = true; };
  }, [queryText, mode]);

  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Sign in to save notes');
        return;
      }
      const title = queryText.slice(0, 60) + (queryText.length > 60 ? '...' : '');
      const { error } = await supabase.from('saved_notes').insert({
        user_id: user.id,
        title,
        query_text: queryText,
        response_text: responseText,
        mode,
        language,
      });
      if (error) throw error;
      setSaved(true);
      toast.success('Note saved');
    } catch (err) {
      console.error('Failed to save note:', err);
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={saving}
      className={`action-btn w-10 h-10 active:scale-95 transition-all ${
        saved
          ? 'bg-primary/20 text-primary'
          : 'bg-muted hover:bg-muted/80'
      }`}
      aria-label={saved ? 'Note saved' : 'Save note'}
    >
      {saved ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
      )}
    </button>
  );
};

export default SaveNoteButton;
