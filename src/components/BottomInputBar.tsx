import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Wand2, Paperclip, X, FileText, Image } from 'lucide-react';
import { toast } from 'sonner';

interface FileInfo {
  name: string;
  size: number;
  type: string;
  content?: string;
  preview?: string;
}

interface BottomInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onVoiceInput: () => void;
  onRefinePrompt?: () => void;
  onFileAnalysis?: (file: FileInfo) => void;
  placeholder?: string;
  isLoading?: boolean;
  isRefining?: boolean;
}

const SUPPORTED_TYPES: Record<string, { label: string }> = {
  'image/jpeg': { label: 'Image' },
  'image/png': { label: 'Image' },
  'image/webp': { label: 'Image' },
  'application/pdf': { label: 'PDF' },
  'text/plain': { label: 'Text' },
  'text/csv': { label: 'CSV' },
};

const BottomInputBar: React.FC<BottomInputBarProps> = ({
  value,
  onChange,
  onSubmit,
  onVoiceInput,
  onRefinePrompt,
  onFileAnalysis,
  placeholder = "Ask anything...",
  isLoading = false,
  isRefining = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<FileInfo | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (attachedFile && onFileAnalysis) {
      onFileAnalysis(attachedFile);
      setAttachedFile(null);
    } else if (value.trim() && !isLoading) {
      onSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const typeInfo = SUPPORTED_TYPES[file.type];
    if (!typeInfo) {
      toast.error('Unsupported file type. Use images, PDFs, or text files.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const fileInfo: FileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        content: content.includes(',') ? content.split(',')[1] : content,
      };
      
      if (file.type.startsWith('image/')) {
        fileInfo.preview = URL.createObjectURL(file);
      }
      
      setAttachedFile(fileInfo);
      toast.success('File attached! Press send to analyze.');
    };

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = () => {
    if (attachedFile?.preview) {
      URL.revokeObjectURL(attachedFile.preview);
    }
    setAttachedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bottom-input-bar">
      {/* Attached File Preview */}
      <AnimatePresence>
        {attachedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="mb-2"
          >
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
              {attachedFile.preview ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img src={attachedFile.preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{attachedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(attachedFile.size)}</p>
              </div>
              <motion.button
                type="button"
                onClick={removeFile}
                className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* File Upload Button - 44px touch target */}
        {onFileAnalysis && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.csv"
              onChange={handleFileSelect}
              aria-label="Select file to analyze"
            />
            <motion.button
              type="button"
              className="icon-btn icon-btn-ghost flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              whileTap={{ scale: 0.95 }}
              aria-label="Attach file for AI analysis"
              disabled={isLoading}
            >
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          </>
        )}

        {/* Voice Input Button - 44px touch target */}
        <motion.button
          type="button"
          className="icon-btn icon-btn-ghost flex-shrink-0"
          onClick={onVoiceInput}
          whileTap={{ scale: 0.95 }}
          aria-label="Use voice to ask a question"
          disabled={isLoading}
        >
          <Mic className="w-5 h-5 text-muted-foreground" />
        </motion.button>
        
        {/* Input Container */}
        <div className="input-container flex-1 min-w-0">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={attachedFile ? "Add a message or just send..." : placeholder}
            className="w-full bg-transparent border-none outline-none text-foreground text-sm py-1"
            disabled={isLoading}
          />
        </div>
        
        {/* Refine Prompt Button - 44px touch target */}
        {onRefinePrompt && value.trim() && !attachedFile && (
          <motion.button
            type="button"
            className="icon-btn icon-btn-ghost flex-shrink-0"
            onClick={onRefinePrompt}
            whileTap={{ scale: 0.95 }}
            aria-label="Improve your question with AI"
            disabled={isLoading || isRefining}
            title="Refine your prompt with AI"
          >
            <Wand2 className={`w-5 h-5 ${isRefining ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
          </motion.button>
        )}
        
        {/* Send Button - 44px touch target */}
        <motion.button
          type="submit"
          className="icon-btn icon-btn-primary flex-shrink-0"
          whileTap={{ scale: 0.95 }}
          disabled={(!value.trim() && !attachedFile) || isLoading}
          aria-label={attachedFile ? "Analyze attached file" : "Send question"}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default BottomInputBar;
