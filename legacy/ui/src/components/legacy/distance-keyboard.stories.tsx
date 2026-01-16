import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Badge } from '../shadcn/badge';
import { Input } from '../shadcn/input';
import { Label } from '../shadcn/label';
import { DistanceKeyboard } from './distance-keyboard';

const meta: Meta<typeof DistanceKeyboard> = {
  title: 'Legacy/DistanceKeyboard',
  component: DistanceKeyboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DistanceKeyboard>;

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
          <h1 className="text-2xl font-bold">Distance Input Demo</h1>

          <div className="space-y-2">
            <Label htmlFor="distance">Distance</Label>
            <Input
              id="distance"
              value={inputValue}
              onFocus={() => {
                setOpen(true);
              }}
              readOnly
              placeholder="Click to open keyboard"
              className="bg-white"
            />
            <p className="text-sm text-muted-foreground">
              Use keyboard shortcuts: 0-9, ., X, -, R, Enter, Backspace
            </p>
          </div>

          {history.length > 0 && (
            <div className="space-y-2">
              <Label>Entered Values</Label>
              <div className="flex flex-wrap gap-2">
                {history.map((value, index) => (
                  <Badge key={index} variant="secondary">
                    {value}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DistanceKeyboard
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
