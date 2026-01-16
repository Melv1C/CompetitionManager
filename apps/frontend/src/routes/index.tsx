import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@melv1c/ui-kit';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Calendar, Trophy, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Calendar,
      title: t('home:features.schedule.title'),
      description: t('home:features.schedule.description'),
    },
    {
      icon: UserPlus,
      title: t('home:features.registration.title'),
      description: t('home:features.registration.description'),
    },
    {
      icon: Trophy,
      title: t('home:features.results.title'),
      description: t('home:features.results.description'),
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section (top) */}
      <section className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              {t('home:title')}
            </h1>
            <p className="mt-5 text-pretty text-base sm:text-lg md:text-xl text-muted-foreground">
              {t('home:description')}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/competitions">{t('home:cta.calendar')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link to="/results">{t('home:cta.results')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-col items-center text-center">
                    <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Icon className="size-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent />
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
