import { cn } from '@/lib/utils';
import { Attempt$ } from '@repo/core/schemas';
import { ArrowRight, Circle, Delete, Flag, Minus, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { z } from 'zod';
import { Button } from '../shadcn/button';

type AttemptValue = z.infer<typeof Attempt$>;

/**
 * Check if more attempts can be added after the last attempt value
 */
export function canAddMoreAttempts(attempts: AttemptValue[] | undefined): boolean {
  if (!attempts || attempts.length === 0) {
    return true;
  }

  const lastAttempt = attempts[attempts.length - 1];

  // Cannot add after O (success), - (pass), or r (retired)
  return !(
    lastAttempt === Attempt$.enum.O ||
    lastAttempt === Attempt$.enum['-'] ||
    lastAttempt === Attempt$.enum.r
  );
}

interface HeightKeyboardProps {
  open: boolean;
  inputValue: string;
  onKeyboardInput: (value: string) => void;
  onEnterPressed?: () => void;
  onClose: () => void;
}

export function HeightKeyboard({
  open,
  inputValue,
  onKeyboardInput,
  onEnterPressed,
  onClose,
}: HeightKeyboardProps) {
  const keyboardContainerRef = useRef<HTMLDivElement>(null);

  // Check if we can add more attempts
  const canAddMore = useMemo(
    () => canAddMoreAttempts(inputValue.split('') as AttemptValue[]),
    [inputValue],
  );

  const handleKeyPress = useCallback(
    (value: string) => {
      if (value === 'NEXT') {
        onEnterPressed?.();
      } else if (value === 'BKSP') {
        onKeyboardInput(inputValue.slice(0, -1));
      } else {
        // For X, O, -, or r - check if allowed
        if ((value === 'X' || value === 'O' || value === '-' || value === 'r') && !canAddMore) {
          return;
        }
        // Append to current value but limit to 3 characters
        const newValue = inputValue + value;
        const limitedValue = newValue.length > 3 ? newValue.slice(0, 3) : newValue;
        onKeyboardInput(limitedValue);
      }
    },
    [inputValue, onKeyboardInput, onEnterPressed, canAddMore],
  );

  // Capture physical keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (
        e.key === 'Enter' ||
        e.key === 'Backspace' ||
        e.key === 'o' ||
        e.key === 'O' ||
        e.key === 'x' ||
        e.key === 'X' ||
        e.key === '-' ||
        e.key === 'r' ||
        e.key === 'R'
      ) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'Enter':
          handleKeyPress('NEXT');
          break;
        case 'Backspace':
          handleKeyPress('BKSP');
          break;
        case 'o':
        case 'O':
          if (canAddMore) handleKeyPress('O');
          break;
        case 'x':
        case 'X':
          if (canAddMore) handleKeyPress('X');
          break;
        case '-':
          if (canAddMore) handleKeyPress('-');
          break;
        case 'r':
        case 'R':
          if (canAddMore) handleKeyPress('r');
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyPress, canAddMore, onClose]);

  // Prevent losing focus when clicking on the keyboard
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (keyboardContainerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Close keyboard when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        keyboardContainerRef.current &&
        !keyboardContainerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  const buttonClass = 'h-11 rounded text-lg font-medium';
  const disabledClass = 'opacity-50 cursor-not-allowed';

  const handlePreventDefault = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div
      ref={keyboardContainerRef}
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-muted p-1.5 shadow-lg"
      onMouseDown={handlePreventDefault}
    >
      <div className="grid grid-cols-4 gap-1">
        {/* Row 1: O, X, -, r */}
        <Button
          variant="default"
          className={cn(
            buttonClass,
            'bg-green-600 hover:bg-green-700',
            !canAddMore && disabledClass,
          )}
          disabled={!canAddMore}
          onClick={() => {
            handleKeyPress('O');
          }}
        >
          <Circle className="h-5 w-5" />
        </Button>
        <Button
          variant="destructive"
          className={cn(buttonClass, !canAddMore && disabledClass)}
          disabled={!canAddMore}
          onClick={() => {
            handleKeyPress('X');
          }}
        >
          <X className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          className={cn(buttonClass, !canAddMore && disabledClass)}
          disabled={!canAddMore}
          onClick={() => {
            handleKeyPress('-');
          }}
        >
          <Minus className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          className={cn(buttonClass, 'text-amber-600', !canAddMore && disabledClass)}
          disabled={!canAddMore}
          onClick={() => {
            handleKeyPress('r');
          }}
        >
          <Flag className="h-5 w-5" />
        </Button>

        {/* Row 2: Backspace and Next */}
        <Button
          variant="destructive"
          className={cn(buttonClass, 'col-span-2')}
          onClick={() => {
            handleKeyPress('BKSP');
          }}
        >
          <Delete className="h-5 w-5" />
        </Button>
        <Button
          variant="default"
          className={cn(buttonClass, 'col-span-2 bg-primary hover:bg-primary/90')}
          onClick={() => {
            handleKeyPress('NEXT');
          }}
        >
          <span className="mr-1 text-sm font-bold">Next</span>
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
