import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Competition } from '@repo/core/schemas';

interface CompetitionsTableProps {
  competitions: Competition[];
  isLoading?: boolean;
}

export function CompetitionsTable({
  competitions,
  isLoading,
}: CompetitionsTableProps) {
  if (isLoading) {
    return <div className="py-4 text-center">Loading competitions...</div>;
  }

  if (competitions.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No competitions found
      </div>
    );
  }

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {competitions.map((comp) => (
          <TableRow key={comp.id}>
            <TableCell className="font-medium">{comp.name}</TableCell>
            <TableCell>{formatDate(comp.startDate)}</TableCell>
            <TableCell>
              <Button size="sm" variant="outline">
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
