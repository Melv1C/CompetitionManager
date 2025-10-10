import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Competition } from '@repo/core/schemas';
import { formatDate } from '@repo/core/utils';
import { Calendar, Eye, Settings } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

interface CompetitionsTableProps {
  competitions: Competition[];
  isLoading?: boolean;
}

function CompetitionStatusBadge({ competition }: { competition: Competition }) {
  const now = new Date();
  const startDate = new Date(competition.startDate);
  const endDate = new Date(competition.endDate);
  const inscriptionStart = new Date(competition.inscriptionStartDate);
  const inscriptionEnd = new Date(competition.inscriptionEndDate);

  // Determine status
  if (!competition.isPublished) {
    return (
      <Badge variant="secondary" className="font-normal">
        Draft
      </Badge>
    );
  }

  if (now > endDate) {
    return (
      <Badge variant="outline" className="font-normal text-muted-foreground">
        Completed
      </Badge>
    );
  }

  if (now >= startDate) {
    return (
      <Badge variant="default" className="bg-green-600 font-normal hover:bg-green-700">
        In Progress
      </Badge>
    );
  }

  if (now >= inscriptionStart && now <= inscriptionEnd) {
    return (
      <Badge variant="default" className="bg-blue-600 font-normal hover:bg-blue-700">
        Registration Open
      </Badge>
    );
  }

  if (now < inscriptionStart) {
    return (
      <Badge variant="outline" className="font-normal">
        Upcoming
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="font-normal text-amber-600">
      Registration Closed
    </Badge>
  );
}

export function CompetitionsTable({ competitions, isLoading }: CompetitionsTableProps) {
  const [showPastOnly, setShowPastOnly] = useState(false);
  const now = new Date();

  // Filter and sort competitions
  const filteredCompetitions = useMemo(() => {
    let filtered = competitions;

    // Filter based on past/upcoming toggle
    if (showPastOnly) {
      filtered = filtered.filter(comp => new Date(comp.endDate) < now);
    } else {
      filtered = filtered.filter(comp => new Date(comp.endDate) >= now);
    }

    // Sort by start date (descending - most recent first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateB - dateA;
    });
  }, [competitions, showPastOnly, now]);

  // Helper function to check if dates are on different days
  const isDifferentDay = (date1: Date | string, date2: Date | string): boolean => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() !== d2.getFullYear() ||
      d1.getMonth() !== d2.getMonth() ||
      d1.getDate() !== d2.getDate()
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-2 text-muted-foreground">Loading competitions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-end gap-2">
        <label htmlFor="show-past" className="text-sm font-medium">
          Show past competitions only
        </label>
        <Switch id="show-past" checked={showPastOnly} onCheckedChange={setShowPastOnly} />
      </div>

      {/* Table */}
      {filteredCompetitions.length === 0 ? (
        <div className="flex items-center justify-center rounded-md border py-12">
          <div className="text-center">
            <Calendar className="mx-auto mb-4 size-12 text-muted-foreground/50" />
            <h3 className="mb-1 text-lg font-semibold">
              {showPastOnly ? 'No past competitions found' : 'No upcoming competitions found'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {showPastOnly
                ? 'There are no completed competitions yet'
                : 'Create your first competition to get started'}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Date</TableHead>
                <TableHead>Competition</TableHead>
                <TableHead className="w-[160px]">Status</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompetitions.map(comp => (
                <TableRow key={comp.id} className="group">
                  <TableCell className="w-[140px]">
                    <div className="flex flex-col gap-0.5 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        <span className="whitespace-nowrap">{formatDate(comp.startDate)}</span>
                      </div>
                      {isDifferentDay(comp.startDate, comp.endDate) && (
                        <span className="whitespace-nowrap text-xs text-muted-foreground">
                          to {formatDate(comp.endDate)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Link
                        to={`/organization/competitions/${comp.eid}`}
                        className="font-medium transition-colors hover:text-primary"
                      >
                        {comp.name}
                      </Link>
                      {comp.description && (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {comp.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="w-[160px]">
                    <CompetitionStatusBadge competition={comp} />
                  </TableCell>
                  <TableCell className="w-[100px] text-right">
                    <TooltipProvider>
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="size-8" asChild>
                              <Link to={`/organization/competitions/${comp.eid}`}>
                                <Eye className="size-4" />
                                <span className="sr-only">View competition</span>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View details</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="size-8" asChild>
                              <Link
                                to={`/organization/competitions/${comp.eid}/settings`}
                              >
                                <Settings className="size-4" />
                                <span className="sr-only">Edit competition settings</span>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit settings</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
