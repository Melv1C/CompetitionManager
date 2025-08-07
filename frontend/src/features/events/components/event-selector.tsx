import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Event, EventGroup } from '@repo/core/schemas';
import { useEvents } from '../hooks/use-events';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EventSelectorProps {
  events: Event[];
  value?: number;
  onValueChange: (value: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  excludeCombinedEvents?: boolean;
}

export function EventSelector({
  value,
  onValueChange,
  placeholder = 'Select an event',
  disabled = false,
  excludeCombinedEvents = false,
}: EventSelectorProps) {
  const events = useEvents(); // Assuming useEvents is a hook that fetches events

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');

  const selectedEvent = events.data.find((event) => event.id === value);

  // Filter out combined events if excludeCombinedEvents is true
  const filteredEvents = excludeCombinedEvents
    ? events.data.filter((event) => event.group !== 'combined')
    : events.data;

  // Group events by their group property
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    if (!acc[event.group]) {
      acc[event.group] = [];
    }
    acc[event.group].push(event);
    return acc;
  }, {} as Record<EventGroup, Event[]>);

  // Get available groups
  const availableGroups = Object.keys(groupedEvents) as EventGroup[];

  // Set initial tab when opening
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && availableGroups.length > 0 && !activeTab) {
      setActiveTab(availableGroups[0]);
    }
  };

  const handleSelect = (eventId: number) => {
    onValueChange(eventId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedEvent ? (
            <span>{selectedEvent.name}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[600px] h-[450px] p-0"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="flex flex-col h-full">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col h-full"
          >
            <TabsList
              className="grid w-full h-auto p-1 shrink-0"
              style={{
                gridTemplateColumns: `repeat(${availableGroups.length}, 1fr)`,
              }}
            >
              {availableGroups.map((group) => (
                <TabsTrigger
                  key={group}
                  value={group}
                  className="text-xs px-2 py-1.5 data-[state=active]:bg-background"
                >
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-hidden">
              {availableGroups.map((group) => (
                <TabsContent
                  key={group}
                  value={group}
                  className="h-full m-0 data-[state=inactive]:hidden"
                >
                  <ScrollArea className="h-full">
                    <div
                      className="p-2 space-y-1"
                      tabIndex={0}
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      {groupedEvents[group]
                        ?.sort((a, b) => a.id - b.id)
                        .map((event) => (
                          <Button
                            key={event.id}
                            variant="ghost"
                            className={cn(
                              'w-full justify-start px-3 py-2 text-left font-normal h-auto',
                              value === event.id &&
                                'bg-accent text-accent-foreground'
                            )}
                            onClick={() => handleSelect(event.id)}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4 shrink-0',
                                value === event.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div className="flex flex-col items-start min-w-0">
                              <span className="truncate w-full">
                                {event.name}
                              </span>
                            </div>
                          </Button>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}
