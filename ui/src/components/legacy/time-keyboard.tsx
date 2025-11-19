import { Box, Button, Drawer, Grid } from '@mui/material';
import { ResultCode } from '@repo/core/schemas';
import { ArrowRight, Delete } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

interface TimeKeyboardProps {
  open: boolean;
  inputValue: string;
  onKeyboardInput: (value: string) => void;
  onEnterPressed: () => void;
  onClose: () => void;
}

export const TimeKeyboard: React.FC<TimeKeyboardProps> = ({
  open,
  inputValue,
  onKeyboardInput,
  onEnterPressed,
  onClose,
}) => {
  const keyboardContainerRef = useRef<HTMLDivElement>(null);

  const handleKeyPress = useCallback(
    (value: string) => {
      if (value === 'ENTER') {
        // Call the onEnterPressed callback
        onEnterPressed();
      } else if (value === 'BKSP') {
        let correctedValue = inputValue;
        const numValue = parseFloat(correctedValue);
        if (!isNaN(numValue)) {
          if (numValue === (ResultCode.DNS as number)) {
            correctedValue = 'DNS';
          } else if (numValue === (ResultCode.DNF as number)) {
            correctedValue = 'DNF';
          } else if (numValue === (ResultCode.DQ as number)) {
            correctedValue = 'DQ';
          }
        }

        const newValue = correctedValue.slice(0, -1);
        onKeyboardInput(newValue);
      } else if (value === 'DNS' || value === 'DNF' || value === 'DQ') {
        // For special codes, replace the entire input
        onKeyboardInput(value);
      } else {
        // Regular key press - append the character
        const newValue = (isNaN(parseFloat(inputValue)) ? '' : inputValue) + value;
        onKeyboardInput(newValue);
      }
    },
    [inputValue, onKeyboardInput, onEnterPressed],
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
        e.key.match(/^[0-9.:]$/) ||
        e.key === 'd' ||
        e.key === 'D'
      ) {
        e.preventDefault();
      }

      // Map physical keyboard input to virtual keyboard actions
      switch (e.key) {
        case 'Enter':
          handleKeyPress('ENTER');
          break;
        case 'Backspace':
          handleKeyPress('BKSP');
          break;
        case '.':
        case ',': // Allow comma as decimal separator too
          handleKeyPress('.');
          break;
        case ':':
          handleKeyPress(':');
          break;
        default:
          // Handle numeric keys
          if (e.key.match(/^[0-9]$/)) {
            handleKeyPress(e.key);
          }
          break;
      }
    };

    if (open) {
      // Add global keyboard event listener
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyPress]);

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
        // Call onClose when keyboard is closed
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
          {/* Row 1 */}
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => {
                handleKeyPress('7');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '1.2rem',
              }}
            >
              7
            </Button>
          </Grid>
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => {
                handleKeyPress('8');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '1.2rem',
              }}
            >
              8
            </Button>
          </Grid>
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => {
                handleKeyPress('9');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '1.2rem',
              }}
            >
              9
            </Button>
          </Grid>
          <Grid size={3}>
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
              }}
            >
              <Delete />
            </Button>
          </Grid>

          {/* Row 2 */}
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => {
                handleKeyPress('4');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '1.2rem',
              }}
            >
              4
            </Button>
          </Grid>
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => {
                handleKeyPress('5');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '1.2rem',
              }}
            >
              5
            </Button>
          </Grid>
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => {
                handleKeyPress('6');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '1.2rem',
              }}
            >
              6
            </Button>
          </Grid>
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="warning"
              onClick={() => {
                handleKeyPress('DNF');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              DNF
            </Button>
          </Grid>

          {/* Row 3 */}
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => {
                handleKeyPress('1');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '1.2rem',
              }}
            >
              1
            </Button>
          </Grid>
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => {
                handleKeyPress('2');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '1.2rem',
              }}
            >
              2
            </Button>
          </Grid>
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => {
                handleKeyPress('3');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '1.2rem',
              }}
            >
              3
            </Button>
          </Grid>
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={() => {
                handleKeyPress('DQ');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              DQ
            </Button>
          </Grid>

          {/* Row 4 */}
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => {
                handleKeyPress('0');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '1.2rem',
              }}
            >
              0
            </Button>
          </Grid>
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => {
                handleKeyPress('.');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '1.2rem',
              }}
            >
              .
            </Button>
          </Grid>
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => {
                handleKeyPress(':');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '1.2rem',
              }}
            >
              :
            </Button>
          </Grid>
          <Grid size={3}>
            <Button
              fullWidth
              variant="contained"
              color="info"
              onClick={() => {
                handleKeyPress('DNS');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              DNS
            </Button>
          </Grid>

          {/* Row 5 - Enter button */}
          <Grid size={12}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={() => {
                handleKeyPress('ENTER');
              }}
              sx={{
                height: 42,
                borderRadius: 1,
                mt: 0.5,
              }}
            >
              <ArrowRight />
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Drawer>
  );
};
