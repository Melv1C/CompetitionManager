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
import { formatDate } from '@repo/core/utils';
import { Link } from 'react-router-dom';

interface CompetitionsTableProps {
  competitions: Competition[];
  isLoading?: boolean;
}

export function CompetitionsTable({ competitions, isLoading }: CompetitionsTableProps) {
  if (isLoading) {
    return <div className="py-4 text-center">Loading competitions...</div>;
  }

  if (competitions.length === 0) {
    return <div className="py-4 text-center text-muted-foreground">No competitions found</div>;
  }

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
        {competitions.map(comp => (
          <TableRow key={comp.id}>
            <TableCell className="font-medium">{comp.name}</TableCell>
            <TableCell>{formatDate(comp.startDate)}</TableCell>
            <TableCell>
              <Button size="sm" variant="outline" asChild>
                <Link to={`/organization/competitions/${comp.eid}`}>View</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
