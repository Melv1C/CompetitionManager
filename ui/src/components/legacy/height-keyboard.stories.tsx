import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Badge } from '../shadcn/badge';
import { Input } from '../shadcn/input';
import { Label } from '../shadcn/label';
import { HeightKeyboard } from './height-keyboard';

const meta: Meta<typeof HeightKeyboard> = {
  title: 'Legacy/HeightKeyboard',
  component: HeightKeyboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HeightKeyboard>;

const getBadgeVariant = (value: string) => {
  if (value.includes('O')) return 'default';
  if (value.includes('X')) return 'destructive';
  if (value.includes('r')) return 'outline';
  if (value.includes('-')) return 'secondary';
  return 'secondary';
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
          <h1 className="text-2xl font-bold">Height Attempts Demo</h1>

          <div className="space-y-2">
            <Label htmlFor="attempts">Attempts (max 3)</Label>
            <Input
              id="attempts"
              value={inputValue}
              onFocus={() => {
                setOpen(true);
              }}
              readOnly
              placeholder="Click to open keyboard"
              className="bg-white"
            />
            <p className="text-sm text-muted-foreground">
              Use keyboard shortcuts: O (success), X (fail), - (pass), R (retired)
            </p>
          </div>

          {history.length > 0 && (
            <div className="space-y-2">
              <Label>Recorded Attempts</Label>
              <div className="flex flex-wrap gap-2">
                {history.map((value, index) => (
                  <Badge key={index} variant={getBadgeVariant(value)}>
                    {value || 'Empty'}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <HeightKeyboard
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
