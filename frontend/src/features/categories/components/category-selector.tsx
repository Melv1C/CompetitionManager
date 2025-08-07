import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Category } from '@repo/core/schemas';
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
  filter: (cat: Category) => boolean;
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
    filter: (cat: Category) => cat.gender === 'M',
  },
  {
    id: 'tc-f',
    label: 'TC F',
    description: 'All women categories',
    filter: (cat: Category) => cat.gender === 'F',
  },
  {
    id: 'mas-m',
    label: 'MAS M',
    description: 'Master men categories',
    filter: (cat: Category) =>
      cat.gender === 'M' && cat.baseCategory === 'Master',
  },
  {
    id: 'mas-f',
    label: 'MAS F',
    description: 'Master women categories',
    filter: (cat: Category) =>
      cat.gender === 'F' && cat.baseCategory === 'Master',
  },
  {
    id: 'jsm-m',
    label: 'JSM M',
    description: 'Junior, Senior, Master men',
    filter: (cat: Category) =>
      cat.gender === 'M' &&
      ['Junior', 'Senior', 'Master'].includes(cat.baseCategory),
  },
  {
    id: 'jsm-f',
    label: 'JSM F',
    description: 'Junior, Senior, Master women',
    filter: (cat: Category) =>
      cat.gender === 'F' &&
      ['Junior', 'Senior', 'Master'].includes(cat.baseCategory),
  },
];

export function CategorySelector({
  selectedIds,
  onSelectionChange,
  disabled = false,
  placeholder = 'Select categories...',
}: CategorySelectorProps) {
  const { data: categories } = useCategories(); // Assuming useCategories is a hook that fetches categories
  const [open, setOpen] = useState(false);

  const selectedCategories = categories.filter((cat) =>
    selectedIds.includes(cat.id)
  );

  // Group categories by different criteria
  const categoriesByGender = categories.reduce((acc, cat) => {
    if (!acc[cat.gender]) acc[cat.gender] = [];
    acc[cat.gender].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  const handleToggleCategory = (categoryId: number) => {
    const isSelected = selectedIds.includes(categoryId);
    if (isSelected) {
      onSelectionChange(selectedIds.filter((id) => id !== categoryId));
    } else {
      onSelectionChange([...selectedIds, categoryId]);
    }
  };

  const handleQuickSelection = (selection: QuickSelection) => {
    const matchingCategories = categories.filter(selection.filter);
    const matchingIds = matchingCategories.map((cat) => cat.id);

    // If all matching categories are already selected, deselect them
    const allSelected = matchingIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      onSelectionChange(selectedIds.filter((id) => !matchingIds.includes(id)));
    } else {
      // Add all matching categories to selection
      const newSelection = [...new Set([...selectedIds, ...matchingIds])];
      onSelectionChange(newSelection);
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  return (
    <div>
      {/* Category selector popover */}
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
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
                    .slice(0, 10) // Show max 10 badges
                    .map((category) => (
                      <Badge
                        key={category.id}
                        variant="secondary"
                        className="gap-1 pr-1 text-xs"
                      >
                        {category.abbr}
                      </Badge>
                    ))}
                  {selectedCategories.length > 10 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedCategories.length - 10} more
                    </Badge>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] h-[450px] p-0" align="start">
          <div className="flex flex-col h-full">
            {/* Quick selection buttons */}
            <div className="p-3 border-b">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Quick Selection</h4>
                <div className="flex flex-wrap gap-1">
                  {QUICK_SELECTIONS.map((selection) => {
                    const matchingCategories = categories.filter(
                      selection.filter
                    );
                    const matchingIds = matchingCategories.map((cat) => cat.id);
                    const allSelected = matchingIds.every((id) =>
                      selectedIds.includes(id)
                    );

                    return (
                      <Button
                        key={selection.id}
                        size="sm"
                        variant={allSelected ? 'default' : 'outline'}
                        className="h-7 px-2 text-xs"
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
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={handleClearAll}
                    type="button"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </div>

            {/* Categories in 2-column layout by gender */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-2">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(categoriesByGender).map(
                      ([gender, cats]) => (
                        <div key={gender} className="space-y-2">
                          <h5 className="text-sm font-medium text-muted-foreground border-b pb-1">
                            {gender === 'M' ? 'Men' : 'Women'}
                          </h5>
                          <div className="space-y-1">
                            {cats
                              .sort((a, b) => a.order - b.order)
                              .map((category) => {
                                const isSelected = selectedIds.includes(
                                  category.id
                                );
                                return (
                                  <div
                                    key={category.id}
                                    className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
                                    onClick={() =>
                                      handleToggleCategory(category.id)
                                    }
                                  >
                                    <Checkbox checked={isSelected} />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate">
                                        {category.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {category.abbr} •{' '}
                                        {category.abbrBaseCategory}
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <Check className="h-4 w-4 shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
