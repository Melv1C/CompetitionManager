import { Box, Button, Drawer, Grid, Typography } from '@mui/material';
import { Attempt$ } from '@repo/core/schemas';
import { ArrowRight, Circle, Delete, Flag, Minus, X } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { z } from 'zod';

type AttemptValue = z.infer<typeof Attempt$>;

/**
 * Check if more attempts can be added after the last attempt value
 */
export const canAddMoreAttempts = (attempts: AttemptValue[] | undefined): boolean => {
  if (!attempts || attempts.length === 0) {
    return true; // No attempts yet, can add
  }

  const lastAttempt = attempts[attempts.length - 1];

  // Cannot add after O (success), - (pass), or r (retired)
  return !(
    lastAttempt === Attempt$.enum.O ||
    lastAttempt === Attempt$.enum['-'] ||
    lastAttempt === Attempt$.enum.r
  );
};

interface HeightKeyboardProps {
  open: boolean;
  inputValue: string;
  onKeyboardInput: (value: string) => void;
  onEnterPressed?: () => void;
  onClose: () => void;
}

export const HeightKeyboard: React.FC<HeightKeyboardProps> = ({
  open,
  inputValue,
  onKeyboardInput,
  onEnterPressed,
  onClose,
}) => {
  const keyboardContainerRef = useRef<HTMLDivElement>(null);

  // Check if we can add more attempts
  const canAddMore = canAddMoreAttempts(inputValue.split('') as AttemptValue[]);

  // Handle NEXT button press with clearer execution flow
  const handleKeyPress = useCallback(
    (value: string) => {
      if (value === 'NEXT') {
        // Call the onEnterPressed callback and then let the parent component
        // handle all subsequent navigation logic
        if (onEnterPressed) {
          onEnterPressed();
        }
      } else if (value === 'BKSP') {
        // Handle backspace
        const newValue = inputValue.slice(0, -1);
        onKeyboardInput(newValue);
      } else {
        // For attempting to add X, O, -, or r - check if allowed
        if ((value === 'X' || value === 'O' || value === '-' || value === 'r') && !canAddMore) {
          return; // Don't add the input if not allowed
        }
        // For normal inputs, append to current value but limit to 3 characters
        const newValue = inputValue + value;
        const limitedValue = newValue.length > 3 ? newValue.slice(0, 3) : newValue;
        onKeyboardInput(limitedValue);
      }
    },
    [inputValue, onKeyboardInput, onEnterPressed, canAddMore],
  );

  // Capture physical keyboard events when the virtual keyboard is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process keyboard events when the keyboard is open
      if (!open) return;

      // Prevent default behavior for these keys to avoid scrolling or other browser actions
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

      // Map physical keyboard input to virtual keyboard actions
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
        default:
          // Ignore other keys
          break;
      }
    };

    // Add event listener for physical keyboard input
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyPress, canAddMore]);

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
        onClose(); // Close the keyboard if clicked outside
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  return (
    <Drawer
      anchor={'bottom'}
      variant="persistent"
      open={open}
      onClose={onClose}
      slotProps={{
        transition: {
          onMouseDown: e => {
            // Prevent input blur when clicking on the drawer
            e.stopPropagation();
          },
        },
      }}
    >
      <Box
        ref={keyboardContainerRef}
        sx={{
          padding: '6px',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e0e0e0',
          boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
        }}
        onMouseDown={e => {
          e.preventDefault();
        }}
      >
        <Grid container spacing={0.5}>
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              disabled={!canAddMore}
              onClick={() => {
                handleKeyPress('O');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '1.2rem',
              }}
            >
              <Circle />
            </Button>
          </Grid>
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              disabled={!canAddMore}
              onClick={() => {
                handleKeyPress('X');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '1.2rem',
              }}
            >
              <X />
            </Button>
          </Grid>
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="info"
              disabled={!canAddMore}
              onClick={() => {
                handleKeyPress('-');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '1.2rem',
              }}
            >
              <Minus />
            </Button>
          </Grid>
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="warning"
              disabled={!canAddMore}
              onClick={() => {
                handleKeyPress('r');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '1.2rem',
                textTransform: 'none',
              }}
            >
              <Flag />
            </Button>
          </Grid>

          {/* Make the suppression key very prominent */}
          <Grid size={6}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={() => {
                handleKeyPress('BKSP');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                mt: 0.5,
              }}
            >
              <Delete />
            </Button>
          </Grid>

          <Grid size={6}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => {
                handleKeyPress('NEXT');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                mt: 0.5,
              }}
            >
              <Typography variant="button" fontSize="0.8rem" fontWeight="bold">
                Next
              </Typography>
              <ArrowRight />
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Drawer>
  );
};
