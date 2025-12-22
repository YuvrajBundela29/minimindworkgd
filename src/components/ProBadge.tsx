import React from 'react';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'glow';
}

const ProBadge: React.FC<ProBadgeProps> = ({ 
  className, 
  size = 'sm',
  variant = 'default' 
}) => {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-0.5',
    md: 'px-2 py-1 text-xs gap-1',
    lg: 'px-3 py-1.5 text-sm gap-1.5',
  };

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const variantClasses = {
    default: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    subtle: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    glow: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold uppercase tracking-wide',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <Crown className={iconSizes[size]} />
      PRO
    </span>
  );
};

export default ProBadge;
