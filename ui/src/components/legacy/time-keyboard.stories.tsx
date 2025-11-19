import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Badge } from '../shadcn/badge';
import { Input } from '../shadcn/input';
import { Label } from '../shadcn/label';
import { TimeKeyboard } from './time-keyboard';

const meta: Meta<typeof TimeKeyboard> = {
  title: 'Legacy/TimeKeyboard',
  component: TimeKeyboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TimeKeyboard>;

const getBadgeVariant = (value: string) => {
  if (value === 'DNS') return 'secondary';
  if (value === 'DNF') return 'outline';
  if (value === 'DQ') return 'destructive';
  return 'default';
};

export const Default: Story = {
  render: () => {
    const [inputValue, setInputValue] = useState('');
    const [open, setOpen] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    const handleKeyboardInput = (value: string) => {
      setInputValue(value);
    };

    const handleEnterPressed = () => {
      if (inputValue) {
        setHistory(prev => [...prev, inputValue]);
        setInputValue('');
      }
    };

    const handleClose = () => {
      setOpen(false);
    };

    return (
      <div className="bg-gray-50 p-4 min-h-150">
        <div className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-2xl font-bold">Time Input Demo</h1>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              value={inputValue}
              onFocus={() => {
                setOpen(true);
              }}
              readOnly
              placeholder="Click to open keyboard"
              className="bg-white"
            />
            <p className="text-sm text-muted-foreground">
              Use keyboard shortcuts: 0-9, ., :, Enter, Backspace. Special codes: DNS, DNF, DQ
            </p>
          </div>

          {history.length > 0 && (
            <div className="space-y-2">
              <Label>Entered Values</Label>
              <div className="flex flex-wrap gap-2">
                {history.map((value, index) => (
                  <Badge key={index} variant={getBadgeVariant(value)}>
                    {value}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <TimeKeyboard
          open={open}
          inputValue={inputValue}
          onKeyboardInput={handleKeyboardInput}
          onEnterPressed={handleEnterPressed}
          onClose={handleClose}
        />
      </div>
    );
  },
};
