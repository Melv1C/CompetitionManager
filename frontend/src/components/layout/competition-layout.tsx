import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompetition } from '@/features/competitions';
import { useCompetitionEid } from '@/hooks';
import { formatDate } from '@/lib/formatters';
import { CalendarIcon, UsersIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Skeleton } from '../ui/skeleton';

function CompetitionError({ message }: { message: string }) {
  const { t } = useTranslation('navigation');
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="text-destructive text-lg font-semibold">{t('competitionLoadError')}</div>
      <div className="text-muted-foreground">{message}</div>
      <Button variant="outline" onClick={() => window.location.reload()}>
        {t('retry')}
      </Button>
    </div>
  );
}

export function CompetitionLayout() {
  const eid = useCompetitionEid();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('navigation');

  const competition = useCompetition(eid);

  const isRegistrationOpen = () => {
    if (competition.isPending || competition.isError) return false;
    const now = new Date();
    const startDate = new Date(competition.data.inscriptionStartDate);
    const endDate = new Date(competition.data.inscriptionEndDate);
    return now >= startDate && now <= endDate;
  };

  const getCurrentTab = () => {
    const path = location.pathname.split('/').pop();
    if (path === eid) return 'home';
    return path || 'home';
  };

  const handleTabChange = (value: string) => {
    if (value === 'home') {
      navigate(`/competitions/${eid}`);
    } else {
      navigate(`/competitions/${eid}/${value}`);
    }
  };

  if (competition.isError) {
    return <CompetitionError message={competition.error?.message || t('unknownError')} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Competition Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            {competition.isPending ? (
              <Skeleton className="h-10 w-96" />
            ) : (
              <h1 className="text-3xl font-bold tracking-tight">{competition.data.name}</h1>
            )}
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {competition.isPending ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <span>{formatDate(competition.data.startDate)}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <UsersIcon className="h-4 w-4" />
                {competition.isPending ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <span>{competition.data.organization.name}</span>
                )}
              </div>
            </div>
          </div>

          {/* Registration CTA */}
          {isRegistrationOpen() && (
            <Button
              size="lg"
              className="w-full md:w-auto"
              onClick={() => navigate(`/competitions/${eid}/register`)}
            >
              {t('registerNow')}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={getCurrentTab()} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="home">{t('home')}</TabsTrigger>
          <TabsTrigger value="schedule">{t('schedule')}</TabsTrigger>
          <TabsTrigger value="participants">{t('participants')}</TabsTrigger>
          <TabsTrigger value="results">{t('results')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Page Content */}
      <div className="min-h-[400px]">
        {competition.isPending ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <Outlet context={{ competition }} />
        )}
      </div>
    </div>
  );
}
