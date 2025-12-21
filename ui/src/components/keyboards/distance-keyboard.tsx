import { cn } from '@/lib/utils';
import { ArrowRight, Delete, Flag, Minus, X } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { Button } from '../shadcn/button';

interface DistanceKeyboardProps {
  open: boolean;
  inputValue: string;
  onKeyboardInput: (value: string) => void;
  onEnterPressed: () => void;
  onClose: () => void;
}

type SpecialCode = 'X' | '-' | 'r';

export function DistanceKeyboard({
  open,
  inputValue,
  onKeyboardInput,
  onEnterPressed,
  onClose,
}: DistanceKeyboardProps) {
  const keyboardContainerRef = useRef<HTMLDivElement>(null);

  const handleKeyPress = useCallback(
    (value: string) => {
      if (value === 'ENTER') {
        onEnterPressed();
      } else if (value === 'BKSP') {
        // For special codes (X, -, r), clear entirely
        if (inputValue === 'X' || inputValue === '-' || inputValue === 'r') {
          onKeyboardInput('');
          return;
        }
        onKeyboardInput(inputValue.slice(0, -1));
      } else if (value === 'X' || value === '-' || value === 'r') {
        // Special characters replace the entire input
        onKeyboardInput(value);
      } else {
        // Regular key press - append the character
        const currentValue = ['X', '-', 'r'].includes(inputValue) ? '' : inputValue;
        onKeyboardInput(currentValue + value);
      }
    },
    [inputValue, onKeyboardInput, onEnterPressed],
  );

  const handleSpecialCode = useCallback(
    (code: SpecialCode) => {
      handleKeyPress(code);
    },
    [handleKeyPress],
  );

  // Capture physical keyboard events when the virtual keyboard is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (
        e.key === 'Enter' ||
        e.key === 'Backspace' ||
        e.key.match(/^[0-9.]$/) ||
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
          handleKeyPress('ENTER');
          break;
        case 'Backspace':
          handleKeyPress('BKSP');
          break;
        case 'x':
        case 'X':
          handleKeyPress('X');
          break;
        case '-':
          handleKeyPress('-');
          break;
        case 'r':
        case 'R':
          handleKeyPress('r');
          break;
        case '.':
        case ',': // Allow comma as decimal separator
          handleKeyPress('.');
          break;
        case 'Escape':
          onClose();
          break;
        default:
          if (e.key.match(/^[0-9]$/)) {
            handleKeyPress(e.key);
          }
          break;
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyPress, onClose]);

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
        {/* Row 1 */}
        <Button
          variant="default"
          className={buttonClass}
          onClick={() => {
            handleKeyPress('7');
          }}
        >
          7
        </Button>
        <Button
          variant="default"
          className={buttonClass}
          onClick={() => {
            handleKeyPress('8');
          }}
        >
          8
        </Button>
        <Button
          variant="default"
          className={buttonClass}
          onClick={() => {
            handleKeyPress('9');
          }}
        >
          9
        </Button>
        <Button
          variant="destructive"
          className={buttonClass}
          onClick={() => {
            handleKeyPress('BKSP');
          }}
        >
          <Delete className="h-5 w-5" />
        </Button>

        {/* Row 2 */}
        <Button
          variant="default"
          className={buttonClass}
          onClick={() => {
            handleKeyPress('4');
          }}
        >
          4
        </Button>
        <Button
          variant="default"
          className={buttonClass}
          onClick={() => {
            handleKeyPress('5');
          }}
        >
          5
        </Button>
        <Button
          variant="default"
          className={buttonClass}
          onClick={() => {
            handleKeyPress('6');
          }}
        >
          6
        </Button>
        <Button
          variant="secondary"
          className={cn(buttonClass, 'text-destructive')}
          onClick={() => {
            handleSpecialCode('X');
          }}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Row 3 */}
        <Button
          variant="default"
          className={buttonClass}
          onClick={() => {
            handleKeyPress('1');
          }}
        >
          1
        </Button>
        <Button
          variant="default"
          className={buttonClass}
          onClick={() => {
            handleKeyPress('2');
          }}
        >
          2
        </Button>
        <Button
          variant="default"
          className={buttonClass}
          onClick={() => {
            handleKeyPress('3');
          }}
        >
          3
        </Button>
        <Button
          variant="secondary"
          className={buttonClass}
          onClick={() => {
            handleSpecialCode('-');
          }}
        >
          <Minus className="h-5 w-5" />
        </Button>

        {/* Row 4 */}
        <Button
          variant="default"
          className={buttonClass}
          onClick={() => {
            handleKeyPress('0');
          }}
        >
          0
        </Button>
        <Button
          variant="default"
          className={buttonClass}
          onClick={() => {
            handleKeyPress('.');
          }}
        >
          .
        </Button>
        <Button
          variant="secondary"
          className={cn(buttonClass, 'text-amber-600')}
          onClick={() => {
            handleSpecialCode('r');
          }}
        >
          <Flag className="h-5 w-5" />
        </Button>
        <Button
          variant="default"
          className={cn(buttonClass, 'bg-green-600 hover:bg-green-700')}
          onClick={() => {
            handleKeyPress('ENTER');
          }}
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
