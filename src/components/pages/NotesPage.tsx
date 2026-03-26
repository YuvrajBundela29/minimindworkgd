import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trash2, Download, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface SavedNote {
  id: string;
  title: string | null;
  query_text: string | null;
  response_text: string | null;
  mode: string | null;
  language: string | null;
  created_at: string;
}

const NotesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: notes, isLoading } = useQuery({
    queryKey: ['saved-notes'],
    queryFn: async (): Promise<SavedNote[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('saved_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as SavedNote[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('saved_notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-notes'] });
      toast.success('Note deleted');
    },
    onError: () => toast.error('Failed to delete note'),
  });

  const handleDownloadPdf = async (note: SavedNote) => {
    const { downloadPDF } = await import('@/utils/pdfGenerator');
    const text = `Question:\n${note.query_text}\n\nAnswer (${note.mode} mode):\n${note.response_text}`;
    const modeKey = (['beginner', 'thinker', 'story', 'mastery'].includes(note.mode ?? '')
      ? note.mode
      : 'beginner') as 'beginner' | 'thinker' | 'story' | 'mastery';
    downloadPDF(text, modeKey, note.query_text ?? 'Saved Note');
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pb-24">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Saved Notes</h1>
        </div>
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-3">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Your Notes</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Saved Notes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {notes?.length ?? 0} note{notes?.length !== 1 ? 's' : ''} saved
        </p>
      </motion.div>

      {!notes || notes.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-medium">No saved notes yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Save an AI response to see it here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4 bg-card/80 backdrop-blur-sm">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-sm truncate">
                      {note.title || 'Untitled'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {note.mode && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {note.mode}
                        </Badge>
                      )}
                      {note.language && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {note.language}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setExpandedId(expandedId === note.id ? null : note.id)}
                    >
                      {expandedId === note.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownloadPdf(note)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete note?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(note.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedId === note.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 border-t border-border mt-2 space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Question</p>
                          <p className="text-sm text-foreground">{note.query_text}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Response</p>
                          <div className="text-sm max-h-64 overflow-y-auto custom-scrollbar">
                            <MarkdownRenderer content={note.response_text ?? ''} className="text-sm" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesPage;
