import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail, Phone, Plus } from 'lucide-react';

export function AdminParticipants() {
  const participants = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      competitions: ['Spring Championship 2025', 'Summer League 2025'],
      status: 'active',
      joinDate: '2024-01-15',
      avatar: null,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567891',
      competitions: ['Winter Cup Finals'],
      status: 'active',
      joinDate: '2024-02-20',
      avatar: null,
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1234567892',
      competitions: ['Spring Championship 2025'],
      status: 'inactive',
      joinDate: '2023-11-10',
      avatar: null,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Participants</h1>
          <p className="text-muted-foreground">
            Manage all participants across your competitions
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Participant
        </Button>
      </div>

      <div className="grid gap-4">
        {participants.map((participant) => (
          <Card key={participant.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage
                      src={participant.avatar || ''}
                      alt={participant.name}
                    />
                    <AvatarFallback>
                      {participant.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {participant.name}
                    </CardTitle>
                    <CardDescription>
                      Member since{' '}
                      {new Date(participant.joinDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(participant.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {participant.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {participant.phone}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">
                    Active Competitions:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {participant.competitions.map((comp, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
