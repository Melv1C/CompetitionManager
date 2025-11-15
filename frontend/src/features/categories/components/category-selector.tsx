import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { FullCategory } from '@repo/core/schemas';
import {
  Badge,
  Button,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useCategories } from '../hooks/use-categories';

interface CategorySelectorProps {
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Quick selection configurations
interface QuickSelection {
  id: string;
  label: string;
  description: string;
  filter: (cat: FullCategory) => boolean;
}

const QUICK_SELECTIONS: QuickSelection[] = [
  {
    id: 'all',
    label: 'All',
    description: 'Select all categories',
    filter: () => true,
  },
  {
    id: 'tc-m',
    label: 'TC M',
    description: 'All men categories',
    filter: (cat: FullCategory) => cat.gender === 'M',
  },
  {
    id: 'tc-f',
    label: 'TC F',
    description: 'All women categories',
    filter: (cat: FullCategory) => cat.gender === 'F',
  },
  {
    id: 'mas-m',
    label: 'MAS M',
    description: 'Master men categories',
    filter: (cat: FullCategory) => cat.gender === 'M' && cat.baseCategory === 'Master',
  },
  {
    id: 'mas-f',
    label: 'MAS F',
    description: 'Master women categories',
    filter: (cat: FullCategory) => cat.gender === 'F' && cat.baseCategory === 'Master',
  },
  {
    id: 'jsm-m',
    label: 'JSM M',
    description: 'Junior, Senior, Master men',
    filter: (cat: FullCategory) =>
      cat.gender === 'M' && ['Junior', 'Senior', 'Master'].includes(cat.baseCategory),
  },
  {
    id: 'jsm-f',
    label: 'JSM F',
    description: 'Junior, Senior, Master women',
    filter: (cat: FullCategory) =>
      cat.gender === 'F' && ['Junior', 'Senior', 'Master'].includes(cat.baseCategory),
  },
];

export function CategorySelector({
  selectedIds,
  onSelectionChange,
  disabled = false,
  placeholder = 'Select categories...',
}: CategorySelectorProps) {
  const categories = useCategories(); // Assuming useCategories is a hook that fetches categories
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (categories.isPending) {
    return <div className="text-center py-4">Loading categories...</div>;
  }

  if (categories.isError) {
    return <div className="text-center py-4">Failed to load categories</div>;
  }

  const selectedCategories = categories.data.filter(cat => selectedIds.includes(cat.id));

  // Group categories by different criteria
  const categoriesByGender = categories.data.reduce(
    (acc, cat) => {
      if (!acc[cat.gender]) acc[cat.gender] = [];
      acc[cat.gender].push(cat);
      return acc;
    },
    {} as Record<string, FullCategory[]>,
  );

  const handleToggleCategory = (categoryId: number) => {
    const isSelected = selectedIds.includes(categoryId);
    if (isSelected) {
      onSelectionChange(selectedIds.filter(id => id !== categoryId));
    } else {
      onSelectionChange([...selectedIds, categoryId]);
    }
  };

  const handleQuickSelection = (selection: QuickSelection) => {
    const matchingCategories = categories.data.filter(selection.filter);
    const matchingIds = matchingCategories.map(cat => cat.id);

    // If all matching categories are already selected, deselect them
    const allSelected = matchingIds.every(id => selectedIds.includes(id));

    if (allSelected) {
      onSelectionChange(selectedIds.filter(id => !matchingIds.includes(id)));
    } else {
      // Add all matching categories to selection
      const newSelection = [...new Set([...selectedIds, ...matchingIds])];
      onSelectionChange(newSelection);
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  // Trigger button component
  const TriggerButton = (
    <Button
      variant="outline"
      className="w-full justify-between min-h-10 h-auto py-2"
      disabled={disabled}
      type="button"
    >
      <div className="flex flex-1 items-center gap-2 overflow-hidden">
        {selectedCategories.length > 0 ? (
          <div className="flex flex-wrap gap-1 flex-1 overflow-hidden">
            {selectedCategories
              .sort((a, b) => a.order - b.order)
              .slice(0, isMobile ? 5 : 10) // Show fewer badges on mobile
              .map(category => (
                <Badge key={category.id} variant="secondary" className="gap-1 pr-1 text-xs">
                  {category.abbr}
                </Badge>
              ))}
            {selectedCategories.length > (isMobile ? 5 : 10) && (
              <Badge variant="secondary" className="text-xs">
                +{selectedCategories.length - (isMobile ? 5 : 10)} more
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </div>
      <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
    </Button>
  );

  // Content component
  const ContentComponent = (
    <div className="flex flex-col h-full">
      {/* Quick selection buttons */}
      <div className={cn('border-b', isMobile ? 'p-4' : 'p-3')}>
        <div className="space-y-2">
          <h4 className={cn('font-medium', isMobile ? 'text-base' : 'text-sm')}>Quick Selection</h4>
          <div className={cn('flex flex-wrap gap-1', isMobile ? 'gap-2' : '')}>
            {QUICK_SELECTIONS.map(selection => {
              const matchingCategories = categories.data.filter(selection.filter);
              const matchingIds = matchingCategories.map(cat => cat.id);
              const allSelected = matchingIds.every(id => selectedIds.includes(id));

              return (
                <Button
                  key={selection.id}
                  size={isMobile ? 'default' : 'sm'}
                  variant={allSelected ? 'default' : 'outline'}
                  className={cn(isMobile ? 'h-9 px-3 text-sm' : 'h-7 px-2 text-xs')}
                  onClick={() => handleQuickSelection(selection)}
                  title={selection.description}
                  type="button"
                >
                  {selection.label}
                </Button>
              );
            })}
          </div>
          <div className="flex gap-1">
            <Button
              size={isMobile ? 'default' : 'sm'}
              variant="outline"
              className={cn(isMobile ? 'h-9 px-3 text-sm' : 'h-7 px-2 text-xs')}
              onClick={handleClearAll}
              type="button"
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Categories layout */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className={cn(isMobile ? 'p-4' : 'p-2')}>
            <div className={cn('gap-4', isMobile ? 'space-y-6' : 'grid grid-cols-2')}>
              {Object.entries(categoriesByGender).map(([gender, cats]) => (
                <div key={gender} className="space-y-2">
                  <h5
                    className={cn(
                      'font-medium text-muted-foreground border-b pb-1',
                      isMobile ? 'text-base' : 'text-sm',
                    )}
                  >
                    {gender === 'M' ? 'Men' : 'Women'}
                  </h5>
                  <div className="space-y-1">
                    {cats
                      .sort((a, b) => a.order - b.order)
                      .map(category => {
                        const isSelected = selectedIds.includes(category.id);
                        return (
                          <div
                            key={category.id}
                            className={cn(
                              'flex items-center space-x-2 rounded-sm text-sm hover:bg-accent cursor-pointer',
                              isMobile ? 'px-3 py-2.5' : 'px-2 py-1.5',
                            )}
                            onClick={() => handleToggleCategory(category.id)}
                          >
                            <Checkbox checked={isSelected} className={isMobile ? 'h-5 w-5' : ''} />
                            <div className="flex-1 min-w-0">
                              <div
                                className={cn('font-medium truncate', isMobile ? 'text-base' : '')}
                              >
                                {category.name}
                              </div>
                              <div
                                className={cn(
                                  'text-muted-foreground',
                                  isMobile ? 'text-sm' : 'text-xs',
                                )}
                              >
                                {category.abbr} • {category.abbrBaseCategory}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className={cn('shrink-0', isMobile ? 'h-5 w-5' : 'h-4 w-4')} />
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div>
        <Sheet open={open} onOpenChange={setOpen} modal={true}>
          <SheetTrigger asChild>{TriggerButton}</SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] max-h-[700px] p-0">
            <SheetHeader className="px-4 py-3 border-b">
              <SheetTitle>Select Categories</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-hidden">{ContentComponent}</div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div>
      {/* Category selector popover */}
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
        <PopoverContent className="w-[500px] h-[450px] p-0" align="start">
          {ContentComponent}
        </PopoverContent>
      </Popover>
    </div>
  );
}
