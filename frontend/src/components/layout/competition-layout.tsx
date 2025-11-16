import { useCompetition } from '@/features/competitions';
import { useCompetitionInscriptions } from '@/features/inscriptions';
import { useResults } from '@/features/results';
import { useLiveResult } from '@/features/results/hooks/use-live-result';
import { useCompetitionEid } from '@/hooks';
import { formatDate } from '@/lib/formatters';
import { Button, Skeleton, Tabs, TabsList, TabsTrigger } from '@repo/ui';
import { CalendarIcon, UsersIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export function CompetitionLayout() {
  const eid = useCompetitionEid();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const competition = useCompetition(eid);
  const inscription = useCompetitionInscriptions(eid);
  const results = useResults(eid);

  const isPending = competition.isPending || inscription.isPending || results.isPending;
  const isError = competition.isError || inscription.isError || results.isError;
  const error = competition.error || inscription.error || results.error;

  const isRegistrationVisible = () => {
    if (competition.isPending || competition.isError) return false;

    if (location.pathname.includes('register')) return false;

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

  useLiveResult(eid);

  if (isError) throw new Error(error?.message || 'Error loading competition data');

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
          {isRegistrationVisible() && (
            <Button
              size="lg"
              className="w-full md:w-auto"
              onClick={() => navigate(`/competitions/${eid}/register`)}
            >
              {t('inscriptions:registerNow')}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={getCurrentTab()} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="home">{t('navigation:home')}</TabsTrigger>
          <TabsTrigger value="schedule">{t('schedule.title')}</TabsTrigger>
          <TabsTrigger value="participants">{t('participants.title')}</TabsTrigger>
          <TabsTrigger value="results">{t('results.title')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Page Content */}
      <div className="min-h-[400px]">
        {isPending ? <Skeleton className="h-96 w-full" /> : <Outlet />}
      </div>
    </div>
  );
}
