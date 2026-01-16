import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { ArrowRight, Delete, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../shadcn/button';

interface TimeKeyboardProps {
  open: boolean;
  inputValue: string;
  onKeyboardInput: (value: string) => void;
  onEnterPressed: () => void;
  onClose: () => void;
}

type SpecialCode = 'DNS' | 'DNF' | 'DQ';

export function TimeKeyboard({
  open,
  inputValue,
  onKeyboardInput,
  onEnterPressed,
  onClose,
}: TimeKeyboardProps) {
  const keyboardContainerRef = useRef<HTMLDivElement>(null);
  const [isSpecialCodeOpenInternal, setIsSpecialCodeOpenInternal] = useState(false);

  // Derive popover state: close when keyboard is not open
  const isSpecialCodeOpen = useMemo(
    () => open && isSpecialCodeOpenInternal,
    [open, isSpecialCodeOpenInternal],
  );

  const handleSpecialCodeOpenChange = useCallback((newOpen: boolean) => {
    setIsSpecialCodeOpenInternal(newOpen);
  }, []);

  const handleKeyPress = useCallback(
    (value: string) => {
      if (value === 'ENTER') {
        onEnterPressed();
      } else if (value === 'BKSP') {
        if (!isNaN(parseFloat(inputValue))) {
          onKeyboardInput(inputValue.slice(0, -1));
          return;
        } else {
          onKeyboardInput('');
          return;
        }
      } else if (value === 'DNS' || value === 'DNF' || value === 'DQ') {
        onKeyboardInput(value);
        setIsSpecialCodeOpenInternal(false);
      } else {
        const newValue = (isNaN(parseFloat(inputValue)) ? '' : inputValue) + value;
        onKeyboardInput(newValue);
      }
    },
    [inputValue, onKeyboardInput, onEnterPressed],
  );

  const handleSpecialCodeSelect = useCallback(
    (code: SpecialCode) => {
      handleKeyPress(code);
    },
    [handleKeyPress],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'Enter' || e.key === 'Backspace' || e.key.match(/^[0-9.:]$/)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'Enter':
          handleKeyPress('ENTER');
          break;
        case 'Backspace':
          handleKeyPress('BKSP');
          break;
        case '.':
        case ',': // Allow comma as decimal separator
          handleKeyPress('.');
          break;
        case ':':
          handleKeyPress(':');
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
        <Popover open={isSpecialCodeOpen} onOpenChange={handleSpecialCodeOpenChange}>
          <PopoverTrigger asChild>
            <Button variant="secondary" className={cn(buttonClass, 'text-sm font-bold')}>
              <TriangleAlert className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
            side="top"
            align="end"
            onMouseDown={handlePreventDefault}
          >
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                className="h-10 font-bold"
                onClick={() => {
                  handleSpecialCodeSelect('DNF');
                }}
              >
                DNF
              </Button>
              <Button
                variant="ghost"
                className="h-10 font-bold"
                onClick={() => {
                  handleSpecialCodeSelect('DNS');
                }}
              >
                DNS
              </Button>
              <Button
                variant="ghost"
                className="h-10 font-bold"
                onClick={() => {
                  handleSpecialCodeSelect('DQ');
                }}
              >
                DQ
              </Button>
            </div>
          </PopoverContent>
        </Popover>

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
          variant="default"
          className={cn(buttonClass, 'row-span-2 h-full bg-green-600 hover:bg-green-700')}
          onClick={() => {
            handleKeyPress('ENTER');
          }}
        >
          <ArrowRight className="h-5 w-5" />
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
          variant="default"
          className={buttonClass}
          onClick={() => {
            handleKeyPress(':');
          }}
        >
          :
        </Button>
      </div>
    </div>
  );
}
