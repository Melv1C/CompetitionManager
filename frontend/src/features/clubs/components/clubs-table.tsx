import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Club } from '@competition-manager/core/schemas';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useDeleteClub } from '../hooks/use-clubs';
import { ClubFormDialog } from './club-form-dialog';

interface ClubsTableProps {
  clubs: Club[];
  isLoading: boolean;
}

export function ClubsTable({ clubs, isLoading }: ClubsTableProps) {
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const deleteMutation = useDeleteClub();

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this club?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getProvinceColor = (province?: string | null) => {
    if (!province) return 'bg-gray-100 text-gray-800';

    const colors: Record<string, string> = {
      Antwerp: 'bg-red-100 text-red-800',
      'East Flanders': 'bg-blue-100 text-blue-800',
      'West Flanders': 'bg-green-100 text-green-800',
      Limburg: 'bg-yellow-100 text-yellow-800',
      'Flemish Brabant': 'bg-purple-100 text-purple-800',
      'Walloon Brabant': 'bg-pink-100 text-pink-800',
      Hainaut: 'bg-orange-100 text-orange-800',
      Liege: 'bg-cyan-100 text-cyan-800',
      Luxembourg: 'bg-emerald-100 text-emerald-800',
      Namur: 'bg-teal-100 text-teal-800',
      Brussels: 'bg-indigo-100 text-indigo-800',
    };
    return colors[province] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading clubs...</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Abbreviation</TableHead>
            <TableHead>Province</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Fed Number</TableHead>
            <TableHead>Fed Abbr</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clubs.map((club) => (
            <TableRow key={club.id}>
              <TableCell className="font-medium">{club.name}</TableCell>
              <TableCell>{club.abbr}</TableCell>
              <TableCell>
                {club.province ? (
                  <Badge
                    className={getProvinceColor(club.province)}
                    variant="secondary"
                  >
                    {club.province}
                  </Badge>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>{club.country || '-'}</TableCell>
              <TableCell>{club.fedNumber || '-'}</TableCell>
              <TableCell>{club.fedAbbr || '-'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingClub(club)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(club.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!!editingClub && (
        <ClubFormDialog
          open={!!editingClub}
          onOpenChange={(open) => !open && setEditingClub(null)}
          club={editingClub}
        />
      )}
    </>
  );
}
