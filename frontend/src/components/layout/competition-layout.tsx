import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompetition } from '@/features/competitions';
import { CalendarIcon, MapPinIcon, UsersIcon } from 'lucide-react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function CompetitionLayout() {
  const { eid } = useParams<{ eid: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  if (!eid) {
    throw new Error('Competition ID (eid) is required');
  }

  const competition = useCompetition(eid);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));

  const isRegistrationOpen = () => {
    if (!competition.data) return false;
    const now = new Date();
    const startDate = new Date(competition.data.inscriptionStartDate);
    const endDate = new Date(competition.data.inscriptionEndDate);
    return (
      now >= startDate &&
      now <= endDate &&
      competition.data.isInscriptionVisible
    );
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

  if (competition.isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-10 bg-muted rounded w-full"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!competition.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">
            Competition not found
          </h1>
          <p className="mt-2 text-muted-foreground">
            The competition you're looking for doesn't exist or is not
            published.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Competition Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {competition.data.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>{formatDate(competition.data.startDate)}</span>
              </div>
              {competition.data.location && (
                <div className="flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{competition.data.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <UsersIcon className="h-4 w-4" />
                <span>{competition.data.organization.name}</span>
              </div>
            </div>
          </div>

          {/* Registration CTA */}
          {isRegistrationOpen() && (
            <Button size="lg" className="w-full md:w-auto">
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
        <Outlet />
      </div>
    </div>
  );
}
