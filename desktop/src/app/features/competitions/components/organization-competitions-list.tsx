import { Switch } from '@/components/ui/switch';
import { useOrganizations } from '@/features/organization';
import type { Competition } from '@repo/core/schemas';
import { TrophyIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrganizationCompetitions } from '../hooks/use-organization-competitions';
import { CompetitionCard } from './competition-card';
import { CompetitionsSkeleton } from './competitions-skeleton';

interface OrganizationCompetitionsListProps {
  className?: string;
}

export function OrganizationCompetitionsList({ className }: OrganizationCompetitionsListProps) {
  const { t } = useTranslation('common');
  const [showPastCompetitions, setShowPastCompetitions] = useState(false);
  const { activeOrganization } = useOrganizations();

  const competitions = useOrganizationCompetitions();

  const { upcomingCompetitions, pastCompetitions } = useMemo(() => {
    const now = new Date();
    const upcoming: Competition[] = [];
    const past: Competition[] = [];

    competitions.data?.forEach(competition => {
      const competitionEndDate = new Date(competition.endDate);
      if (competitionEndDate >= now) {
        upcoming.push(competition);
      } else {
        past.push(competition);
      }
    });

    // Sort upcoming competitions by start date (earliest first)
    upcoming.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    // Sort past competitions by end date (most recent first)
    past.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

    return { upcomingCompetitions: upcoming, pastCompetitions: past };
  }, [competitions]);

  if (competitions.isPending) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{t('competitions')}</h2>
            <p className="text-sm text-muted-foreground mt-1">Loading competitions...</p>
          </div>
          <div className="flex items-center space-x-3">
            <Switch disabled />
            <span className="text-sm text-muted-foreground">Show past competitions</span>
          </div>
        </div>
        <CompetitionsSkeleton count={6} />
      </div>
    );
  }

  if (competitions.isError) {
    return (
      <div className={className}>
        <div className="text-center py-8">
          <div className="text-destructive mb-2">Error loading competitions</div>
          <p className="text-sm text-muted-foreground">
            Please try refreshing the page or contact support if the problem persists.
          </p>
        </div>
      </div>
    );
  }

  const displayedCompetitions = showPastCompetitions ? pastCompetitions : upcomingCompetitions;

  return (
    <div className={className}>
      {/* Competitions Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t('competitions')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {activeOrganization
              ? `Showing ${showPastCompetitions ? 'past' : 'upcoming'} competitions for ${activeOrganization.name}`
              : 'Select an organization to view competitions'}
          </p>
        </div>
        {activeOrganization && (upcomingCompetitions.length > 0 || pastCompetitions.length > 0) && (
          <div className="flex items-center space-x-3">
            <Switch
              id="show-past-competitions"
              checked={showPastCompetitions}
              onCheckedChange={setShowPastCompetitions}
            />
            <label
              htmlFor="show-past-competitions"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Show past competitions
            </label>
          </div>
        )}
      </div>

      {!activeOrganization ? (
        <div className="text-center py-12">
          <TrophyIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No organization selected
          </h3>
          <p className="text-sm text-muted-foreground">
            Please select an organization above to view competitions.
          </p>
        </div>
      ) : displayedCompetitions.length === 0 ? (
        <div className="text-center py-12">
          <TrophyIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            {showPastCompetitions ? 'No past competitions' : 'No upcoming competitions'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {showPastCompetitions
              ? "This organization hasn't organized any competitions yet."
              : 'No competitions are currently scheduled for this organization.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {displayedCompetitions.length} {showPastCompetitions ? 'past' : 'upcoming'}{' '}
              competition{displayedCompetitions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayedCompetitions.map(competition => (
              <CompetitionCard key={competition.id} competition={competition} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
