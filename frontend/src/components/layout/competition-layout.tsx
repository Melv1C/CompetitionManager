import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompetition } from '@/features/competitions';
import { CalendarIcon, UsersIcon } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/formatters';
import { useCompetitionEid } from '@/hooks';

export function CompetitionLayout() {
  const eid = useCompetitionEid();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('navigation');

  const competition = useCompetition(eid);

  const isRegistrationOpen = () => {
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

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Competition Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{competition.data.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>{formatDate(competition.data.startDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <UsersIcon className="h-4 w-4" />
                <span>{competition.data.organization.name}</span>
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
        <Outlet />
      </div>
    </div>
  );
}
