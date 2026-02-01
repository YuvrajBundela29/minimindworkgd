import React from 'react';
import { motion } from 'framer-motion';
import { Share2, MessageCircle, Mail, Link2, Download, Smartphone } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';

interface ShareMenuProps {
  onShare: (platform: 'whatsapp' | 'email' | 'copy' | 'native' | 'download') => void;
  disabled?: boolean;
}

const shareOptions = [
  {
    id: 'whatsapp' as const,
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 hover:bg-green-500/20',
  },
  {
    id: 'email' as const,
    name: 'Email',
    icon: Mail,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
  },
  {
    id: 'copy' as const,
    name: 'Copy Text',
    icon: Link2,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
  },
  {
    id: 'native' as const,
    name: 'More Apps',
    icon: Smartphone,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
  },
  {
    id: 'download' as const,
    name: 'Download PDF',
    icon: Download,
    color: 'text-primary',
    bgColor: 'bg-primary/10 hover:bg-primary/20',
  },
];

const ShareMenu: React.FC<ShareMenuProps> = ({ onShare, disabled }) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (platform: 'whatsapp' | 'email' | 'copy' | 'native' | 'download') => {
    setOpen(false);
    onShare(platform);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          className="action-btn bg-muted hover:bg-muted/80 w-10 h-10"
          whileTap={{ scale: 0.95 }}
          disabled={disabled}
          aria-label="Share explanation"
        >
          <Share2 className="w-4 h-4" />
        </motion.button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-48 p-2 bg-card border-border shadow-lg z-50" 
        align="end"
        sideOffset={8}
      >
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-2 py-1">
            Share via
          </p>
          {shareOptions.map((option) => (
            <motion.button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${option.bgColor}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <option.icon className={`w-4 h-4 ${option.color}`} />
              <span className="text-foreground">{option.name}</span>
            </motion.button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ShareMenu;
