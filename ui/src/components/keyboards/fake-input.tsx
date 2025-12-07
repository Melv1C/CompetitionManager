import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface FakeInputProps {
  value: string;
  isActive?: boolean;
  className?: string;
  placeholder?: string;
}

export function FakeInput({ value, isActive = false, className, placeholder }: FakeInputProps) {
  const [caretBlink, setCaretBlink] = useState(false);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const interval = setInterval(() => {
      setCaretBlink(prev => !prev);
    }, 530);

    return () => {
      clearInterval(interval);
    };
  }, [isActive]);

  const showCaret = isActive && !caretBlink;

  const isEmpty = value === '';
  const showPlaceholder = isEmpty && placeholder && !isActive;

  return (
    <div
      className={cn(
        'flex h-9 w-full items-center rounded-md border bg-transparent px-3 py-1 text-base shadow-xs md:text-sm',
        isActive && 'border-ring ring-ring/50 ring-[3px]',
        className,
      )}
    >
      <span className="flex-1 truncate font-mono">
        {showPlaceholder ? <span className="text-muted-foreground">{placeholder}</span> : value}
      </span>
      {isActive && (
        <span
          className={cn(
            'ml-0.5 inline-block h-5 w-0.5 bg-foreground transition-opacity',
            showCaret ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  );
}
