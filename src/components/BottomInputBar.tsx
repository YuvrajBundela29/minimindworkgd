import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Wand2, Paperclip, X, FileText, Image } from 'lucide-react';
import { toast } from 'sonner';

interface FileInfo {
  name: string;
  size: number;
  type: string;
  content?: string;
}

interface BottomInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onVoiceInput: () => void;
  onRefinePrompt?: () => void;
  onFileSelect?: (file: FileInfo) => void;
  selectedFile?: FileInfo | null;
  onClearFile?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  isRefining?: boolean;
  showFileUpload?: boolean;
}

const SUPPORTED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf', 'text/plain', 'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const BottomInputBar: React.FC<BottomInputBarProps> = ({
  value,
  onChange,
  onSubmit,
  onVoiceInput,
  onRefinePrompt,
  onFileSelect,
  selectedFile,
  onClearFile,
  placeholder = "Ask anything...",
  isLoading = false,
  isRefining = false,
  showFileUpload = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((value.trim() || selectedFile) && !isLoading) {
      onSubmit();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    if (!SUPPORTED_TYPES.includes(file.type)) {
      toast.error('Unsupported file type');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onFileSelect?.({
        name: file.name,
        size: file.size,
        type: file.type,
        content: file.type.startsWith('image/') 
          ? content.split(',')[1] 
          : content,
      });
      toast.success('File attached!');
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bottom-input-bar">
      {/* File Preview */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl bg-primary/10 border border-primary/20"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            {selectedFile.type.startsWith('image/') ? (
              <Image className="w-4 h-4 text-primary" />
            ) : (
              <FileText className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
          </div>
          <motion.button
            type="button"
            onClick={onClearFile}
            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Voice Input Button */}
        <motion.button
          type="button"
          className="icon-btn icon-btn-ghost flex-shrink-0"
          onClick={onVoiceInput}
          whileTap={{ scale: 0.95 }}
          aria-label="Voice input"
          disabled={isLoading}
        >
          <Mic className="w-5 h-5 text-muted-foreground" />
        </motion.button>

        {/* File Upload Button */}
        {showFileUpload && (
          <>
            <motion.button
              type="button"
              className="icon-btn icon-btn-ghost flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              whileTap={{ scale: 0.95 }}
              aria-label="Attach file"
              disabled={isLoading}
            >
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.csv,.docx,.xlsx"
              onChange={handleFileChange}
            />
          </>
        )}
        
        {/* Input Container */}
        <div className="input-container flex-1 min-w-0">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={selectedFile ? "Ask about this file..." : placeholder}
            className="w-full bg-transparent border-none outline-none text-foreground text-sm py-1"
            disabled={isLoading}
          />
        </div>
        
        {/* Refine Prompt Button */}
        {onRefinePrompt && value.trim() && !selectedFile && (
          <motion.button
            type="button"
            className="icon-btn icon-btn-ghost flex-shrink-0"
            onClick={onRefinePrompt}
            whileTap={{ scale: 0.95 }}
            aria-label="Refine prompt"
            disabled={isLoading || isRefining}
            title="Refine your prompt with AI"
          >
            <Wand2 className={`w-5 h-5 ${isRefining ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
          </motion.button>
        )}
        
        {/* Send Button */}
        <motion.button
          type="submit"
          className="icon-btn icon-btn-primary flex-shrink-0"
          whileTap={{ scale: 0.95 }}
          disabled={(!value.trim() && !selectedFile) || isLoading}
          aria-label="Send message"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default BottomInputBar;
