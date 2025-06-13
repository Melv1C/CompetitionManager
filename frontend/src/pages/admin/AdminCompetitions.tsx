import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Plus, Trophy, Users } from 'lucide-react';

export function AdminCompetitions() {
  const competitions = [
    {
      id: 1,
      name: 'Spring Championship 2025',
      status: 'ongoing',
      participants: 156,
      startDate: '2025-03-01',
      endDate: '2025-06-15',
    },
    {
      id: 2,
      name: 'Winter Cup Finals',
      status: 'completed',
      participants: 89,
      startDate: '2024-12-01',
      endDate: '2025-02-28',
    },
    {
      id: 3,
      name: 'Summer League 2025',
      status: 'upcoming',
      participants: 23,
      startDate: '2025-07-01',
      endDate: '2025-09-30',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <Badge className="bg-green-100 text-green-800">Ongoing</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
          <p className="text-muted-foreground">
            Manage all competitions in your organization
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Competition
        </Button>
      </div>

      <div className="grid gap-4">
        {competitions.map((competition) => (
          <Card key={competition.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <CardTitle className="text-lg">{competition.name}</CardTitle>
                </div>
                {getStatusBadge(competition.status)}
              </div>
              <CardDescription>
                {competition.startDate} - {competition.endDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {competition.participants} participants
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {Math.ceil(
                        (new Date(competition.endDate).getTime() -
                          new Date(competition.startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{' '}
                      days duration
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    View Details
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
