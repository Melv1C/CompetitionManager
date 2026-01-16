import { useIsMobile } from '@/hooks/use-mobile';
import type { Event, EventGroup } from '@repo/core/schemas';
import {
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useEvents } from '../hooks/use-events';

interface EventSelectorProps {
  events?: Event[];
  value?: number;
  onValueChange: (value: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  excludeCombinedEvents?: boolean;
}

export function EventSelector({
  events: externalEvents,
  value,
  onValueChange,
  placeholder = 'Select an event',
  disabled = false,
  excludeCombinedEvents = false,
}: EventSelectorProps) {
  const eventsFromHook = useEvents(); // Fetch events from hook
  const isMobile = useIsMobile();

  // Use external events if provided, otherwise use hook data
  const events = externalEvents || eventsFromHook.data || [];

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');

  const selectedEvent = events.find(event => event.id === value);

  // Filter out combined events if excludeCombinedEvents is true
  const filteredEvents = excludeCombinedEvents
    ? events.filter(event => event.group !== 'combined')
    : events;

  // Group events by their group property
  const groupedEvents = filteredEvents.reduce(
    (acc, event) => {
      if (!acc[event.group]) {
        acc[event.group] = [];
      }
      acc[event.group].push(event);
      return acc;
    },
    {} as Record<EventGroup, Event[]>,
  );

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

  // Trigger button component
  const TriggerButton = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className="w-full justify-between"
      disabled={disabled}
    >
      {selectedEvent ? (
        <span className="truncate">{selectedEvent.name}</span>
      ) : (
        <span className="text-muted-foreground">{placeholder}</span>
      )}
      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  // Content component
  const ContentComponent = (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <TabsList
          className={cn('grid w-full h-auto p-1 shrink-0', isMobile ? 'grid-cols-3 gap-1' : '')}
          style={
            !isMobile
              ? {
                  gridTemplateColumns: `repeat(${availableGroups.length}, 1fr)`,
                }
              : {}
          }
        >
          {availableGroups.map(group => (
            <TabsTrigger
              key={group}
              value={group}
              className={cn(
                'data-[state=active]:bg-background',
                isMobile ? 'text-xs px-2 py-1.5 min-w-0' : 'text-xs px-2 py-1.5',
              )}
            >
              <span className={isMobile ? 'truncate' : ''}>
                {group.charAt(0).toUpperCase() + group.slice(1)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-hidden">
          {availableGroups.map(group => (
            <TabsContent
              key={group}
              value={group}
              className="h-full m-0 data-[state=inactive]:hidden"
            >
              <ScrollArea className="h-full">
                <div
                  className={cn('space-y-1', isMobile ? 'p-4' : 'p-2')}
                  tabIndex={0}
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {groupedEvents[group]
                    ?.sort((a, b) => a.id - b.id)
                    .map(event => (
                      <Button
                        key={event.id}
                        variant="ghost"
                        className={cn(
                          'w-full justify-start text-left font-normal h-auto',
                          isMobile ? 'px-4 py-3' : 'px-3 py-2',
                          value === event.id && 'bg-accent text-accent-foreground',
                        )}
                        onClick={() => handleSelect(event.id)}
                      >
                        <Check
                          className={cn(
                            'shrink-0',
                            isMobile ? 'mr-3 h-5 w-5' : 'mr-2 h-4 w-4',
                            value === event.id ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        <div className="flex flex-col items-start min-w-0">
                          <span className={cn('truncate w-full', isMobile ? 'text-base' : '')}>
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
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>{TriggerButton}</SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] max-h-[600px] p-0">
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle>Select an Event</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">{ContentComponent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={true}>
      <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
      <PopoverContent
        className="w-[600px] h-[450px] p-0"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        {ContentComponent}
      </PopoverContent>
    </Popover>
  );
}
