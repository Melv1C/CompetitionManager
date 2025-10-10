import { Button } from '@/components/ui/button';
import { CreateCompetitionDialog } from '@/features/competitions/components/create-competition-dialog';
import { useOrganizationCompetitions } from '@/features/competitions/hooks/use-organization-competitions';
import { formatDate } from '@repo/core/utils';
import { Calendar, ChevronRight, Plus, TrendingUp, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export function OrganizationDashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: competitions = [], isLoading } = useOrganizationCompetitions();

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const upcomingCompetitions = competitions.filter(c => new Date(c.startDate) >= now);
    const pastCompetitions = competitions.filter(c => new Date(c.endDate) < now);
    const activeCompetitions = competitions.filter(
      c => new Date(c.startDate) <= now && new Date(c.endDate) >= now,
    );

    // Find next competition
    const nextCompetition = upcomingCompetitions.sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )[0];

    // Calculate total events across all competitions
    const totalEvents = competitions.reduce((acc, comp) => acc + comp.events.length, 0);

    // Mock data for participants (TODO: Connect to actual inscription data)
    const totalParticipants = competitions.length * 45; // Mock: ~45 participants per competition
    const activeRegistrations = upcomingCompetitions.filter(
      c => new Date(c.inscriptionStartDate) <= now && new Date(c.inscriptionEndDate) >= now,
    ).length;

    return {
      totalCompetitions: competitions.length,
      upcomingCompetitions: upcomingCompetitions.length,
      pastCompetitions: pastCompetitions.length,
      activeCompetitions: activeCompetitions.length,
      nextCompetition,
      totalEvents,
      totalParticipants,
      activeRegistrations,
    };
  }, [competitions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your organization, competitions, and members.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 size-4" />
          New Competition
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Total Competitions</h3>
            <Calendar className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold">{isLoading ? '-' : stats.totalCompetitions}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.activeCompetitions} active, {stats.upcomingCompetitions} upcoming
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Total Events</h3>
            <TrendingUp className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold">{isLoading ? '-' : stats.totalEvents}</p>
            <p className="mt-1 text-xs text-muted-foreground">Across all competitions</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Total Participants</h3>
            <Users className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold">{isLoading ? '-' : stats.totalParticipants}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Mock data - TODO: Connect to inscriptions
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Open Registrations</h3>
            <Users className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold">{isLoading ? '-' : stats.activeRegistrations}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Competitions accepting registrations
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Next Competition */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Next Competition</h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : stats.nextCompetition ? (
            <div className="space-y-3">
              <div>
                <Link
                  to={`/organization/competitions/${stats.nextCompetition.eid}`}
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  {stats.nextCompetition.name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDate(stats.nextCompetition.startDate)}
                  {stats.nextCompetition.location && ` • ${stats.nextCompetition.location}`}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Events:</span>{' '}
                  <span className="font-medium">{stats.nextCompetition.events.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Registration:</span>{' '}
                  <span className="font-medium">
                    {new Date() < new Date(stats.nextCompetition.inscriptionStartDate)
                      ? 'Opens soon'
                      : new Date() > new Date(stats.nextCompetition.inscriptionEndDate)
                        ? 'Closed'
                        : 'Open'}
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/organization/competitions/${stats.nextCompetition.eid}`}>
                  View Details
                  <ChevronRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-3 text-sm text-muted-foreground">
                No upcoming competitions scheduled
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
                <Plus className="mr-2 size-4" />
                Create Competition
              </Button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-3">
              <span className="text-sm text-muted-foreground">Past Competitions</span>
              <span className="font-medium">{stats.pastCompetitions}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-sm text-muted-foreground">Active Competitions</span>
              <span className="font-medium">{stats.activeCompetitions}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-sm text-muted-foreground">Upcoming Competitions</span>
              <span className="font-medium">{stats.upcomingCompetitions}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-sm text-muted-foreground">Avg Events per Competition</span>
              <span className="font-medium">
                {stats.totalCompetitions > 0
                  ? Math.round((stats.totalEvents / stats.totalCompetitions) * 10) / 10
                  : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Avg Participants per Competition
              </span>
              <span className="text-muted-foreground">~45 (mock)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Mock Sections */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity (Mock) */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 border-b pb-3">
              <div className="mt-1 size-2 rounded-full bg-blue-500" />
              <div className="flex-1">
                <p className="font-medium">New registration for Spring Championship</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-b pb-3">
              <div className="mt-1 size-2 rounded-full bg-green-500" />
              <div className="flex-1">
                <p className="font-medium">Winter Cup results published</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 size-2 rounded-full bg-amber-500" />
              <div className="flex-1">
                <p className="font-medium">Youth Tournament created</p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
            <p className="pt-2 text-xs text-muted-foreground">
              Mock data - TODO: Connect to activity log
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="mr-2 size-4" />
              Create New Competition
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/organization/competitions">
                <Calendar className="mr-2 size-4" />
                View All Competitions
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" disabled>
              <Users className="mr-2 size-4" />
              Manage Members (Coming Soon)
            </Button>
            <Button className="w-full justify-start" variant="outline" disabled>
              <TrendingUp className="mr-2 size-4" />
              View Analytics (Coming Soon)
            </Button>
          </div>
        </div>
      </div>

      {/* Create Competition Dialog */}
      <CreateCompetitionDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}
